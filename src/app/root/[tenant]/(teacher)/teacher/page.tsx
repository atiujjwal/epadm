import { getCtx } from "@/lib/context";
import {
  staffProfiles,
  academicClasses,
  classSections,
  studentEnrollments,
  students,
  attendance,
  assignments,
  tenantUsers,
  exams,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { and, eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AIExamCreator from "./home/ai-exam-creator";

export default async function TeacherHomePage({
  searchParams,
}: {
  searchParams: Promise<{ sectionId?: string; tab?: string }>;
}) {
  const ctx = await getCtx();
  if (ctx.role !== "teacher") {
    // Wrong role, but still authenticated — route back through "/" so they land
    // on their own role's home, not the login page.
    redirect("/");
  }

  const params = await searchParams;
  const currentTab = params.tab || "workspace";

  // 1. Resolve staff profile
  const teacher = await withTenant(ctx.tenantId, async (tx) => {
    const staff = await tx
      .select()
      .from(staffProfiles)
      .innerJoin(tenantUsers, eq(staffProfiles.tenantUserId, tenantUsers.id))
      .where(
        and(
          eq(tenantUsers.userId, ctx.userId),
          eq(tenantUsers.tenantId, ctx.tenantId),
        ),
      )
      .limit(1);
    return staff[0]?.staff_profiles;
  });

  if (!teacher) {
    return (
      <div className="rounded-md border border-dashed border-[#dfe2e8] bg-white p-6 text-center">
        <h2 className="text-sm font-semibold text-[#2d3442]">No staff profile found</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Your user account is not linked to a teacher/staff profile. Contact your school administrator.
        </p>
      </div>
    );
  }

  // 2. Resolve assigned classes & sections
  const assigned = await withTenant(ctx.tenantId, async (tx) => {
    return tx
      .select({
        classId: academicClasses.id,
        className: academicClasses.name,
        sectionId: classSections.id,
        sectionName: classSections.name,
        capacity: classSections.capacity,
      })
      .from(classSections)
      .innerJoin(academicClasses, eq(classSections.classId, academicClasses.id))
      .where(
        and(
          eq(academicClasses.homeroomStaffId, teacher.id),
          eq(academicClasses.tenantId, ctx.tenantId),
        ),
      );
  });

  // Active section for marking attendance / assignments
  const activeSectionId = params.sectionId || assigned[0]?.sectionId;
  const activeSection = assigned.find((s) => s.sectionId === activeSectionId);

  // Get enrolled students for the active section & saved exams
  const data = await withTenant(ctx.tenantId, async (tx) => {
    const enrolled = activeSection
      ? await tx
          .select({
            studentId: students.id,
            firstName: students.firstName,
            lastName: students.lastName,
            admissionNumber: students.admissionNumber,
          })
          .from(studentEnrollments)
          .innerJoin(students, eq(studentEnrollments.studentId, students.id))
          .where(
            and(
              eq(studentEnrollments.sectionId, activeSection.sectionId),
              eq(studentEnrollments.tenantId, ctx.tenantId),
            ),
          )
      : [];

    const existing = activeSection
      ? await tx
          .select()
          .from(assignments)
          .where(
            and(
              eq(assignments.sectionId, activeSection.sectionId),
              eq(assignments.tenantId, ctx.tenantId),
            ),
          )
          .orderBy(assignments.dueDate)
      : [];

    const saved = await tx
      .select({
        id: exams.id,
        title: exams.title,
        subject: exams.subject,
        gradeLevel: exams.gradeLevel,
        difficulty: exams.difficulty,
        format: exams.format,
        className: academicClasses.name,
        createdAt: exams.createdAt,
      })
      .from(exams)
      .innerJoin(academicClasses, eq(exams.classId, academicClasses.id))
      .where(
        and(
          eq(exams.createdById, ctx.userId),
          eq(exams.tenantId, ctx.tenantId),
        ),
      )
      .orderBy(desc(exams.createdAt));

    return { enrolled, existing, saved };
  });

  const enrolledStudents = data.enrolled;
  const existingAssignments = data.existing;
  const savedExams = data.saved;

  // Attendance Save Action
  async function saveAttendance(formData: FormData) {
    "use server";
    const ctx = await getCtx();
    const dateStr = formData.get("date") as string;
    const classId = formData.get("classId") as string;
    const secId = formData.get("sectionId") as string;

    if (!dateStr || !classId || !secId) return;

    const records: (typeof attendance.$inferInsert)[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("status_")) {
        const studentId = key.substring(7);
        const status = value as string;
        const notes = (formData.get(`notes_${studentId}`) as string) || "";

        records.push({
          tenantId: ctx.tenantId,
          studentId,
          classId,
          sectionId: secId,
          date: dateStr,
          status,
          notes,
          markedById: ctx.userId,
        });
      }
    }

    if (records.length > 0) {
      await withTenant(ctx.tenantId, async (tx) => {
        for (const record of records) {
          await tx
            .insert(attendance)
            .values(record)
            .onConflictDoUpdate({
              target: [
                attendance.tenantId,
                attendance.studentId,
                attendance.date,
              ],
              set: {
                status: record.status,
                notes: record.notes,
                markedById: record.markedById,
                updatedAt: new Date(),
              },
            });
        }
      });
    }

    revalidatePath("/teacher");
  }

  // Create Assignment Action
  async function createAssignment(formData: FormData) {
    "use server";
    const ctx = await getCtx();
    const classId = formData.get("classId") as string;
    const secId = formData.get("sectionId") as string;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const dueDate = formData.get("dueDate") as string;
    const filePath = (formData.get("filePath") as string) || "";

    if (!classId || !secId || !title || !dueDate) return;

    await withTenant(ctx.tenantId, async (tx) => {
      await tx.insert(assignments).values({
        tenantId: ctx.tenantId,
        classId,
        sectionId: secId,
        title,
        description,
        dueDate,
        filePath,
        createdById: ctx.userId,
      });
    });

    revalidatePath("/teacher");
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="rounded-md border border-[#e3e5e9] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(23,30,44,.04)]">
        <p className="text-[11px] font-medium uppercase text-[#626874]">
          Teacher Portal
        </p>
        <h1 className="mt-2 text-xl font-semibold text-[#2d3442]">
          Welcome back, {teacher.fullName}!
        </h1>
        <p className="mt-1 max-w-xl text-xs leading-5 text-[#626874]">
          Department: {teacher.department || "General"} · Role:{" "}
          {teacher.jobTitle || "Instructor"}
        </p>
      </section>

      {/* Tabs */}
      <div className="sticky top-14 z-20 flex gap-1 overflow-x-auto border-b border-[#dfe2e8] bg-[#f5f6f8]/95 px-1 py-2 backdrop-blur">
        {[
          { id: "workspace", label: "Attendance & assignments" },
          { id: "ai-exams", label: "AI exam creator" },
        ].map((tab) => (
          <a
            key={tab.id}
            href={`?tab=${tab.id}`}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              currentTab === tab.id
                ? "bg-white text-[#2d3442] shadow-[0_1px_2px_rgba(23,30,44,.08)]"
                : "text-[#626874] hover:bg-white/70 hover:text-[#2d3442]"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {currentTab === "workspace" && (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Classes Sidebar */}
          <section className="h-fit space-y-3 rounded-md border p-4 shadow-[0_1px_2px_rgba(23,30,44,.04)]" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
            <h2 className="text-sm font-semibold text-primary">
              Assigned classes
            </h2>
            {assigned.length === 0 ? (
              <p className="text-sm text-secondary">
                You are not assigned as homeroom teacher to any classes.
              </p>
            ) : (
              <div className="space-y-2">
                {assigned.map((sec) => (
                  <a
                    key={sec.sectionId}
                    href={`?tab=workspace&sectionId=${sec.sectionId}`}
                    className={`block rounded-md border p-3 text-left transition ${
                      activeSectionId === sec.sectionId
                        ? "border-sky-500 bg-sky-50/50"
                        : "hover:bg-zinc-50"
                    }`}
                    style={{ 
                      borderColor: activeSectionId === sec.sectionId ? "var(--color-sky-500)" : "var(--border-default)",
                      backgroundColor: activeSectionId === sec.sectionId ? "var(--color-sky-50)" : "var(--bg-surface)"
                    }}
                  >
                    <div className="text-sm font-semibold text-primary">
                      {sec.className}
                    </div>
                    <div className="text-xs text-secondary">
                      Section: {sec.sectionName}
                    </div>
                    <div className="mt-2 text-xs text-muted">
                      Max Capacity: {sec.capacity ?? "N/A"} students
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Workspace Area */}
          <div className="lg:col-span-2 space-y-6">
            {activeSection ? (
              <>
                {/* Attendance Marker */}
                <section className="space-y-4 rounded-md border p-4 shadow-[0_1px_2px_rgba(23,30,44,.04)]" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
                  <div>
                    <h2 className="text-sm font-semibold text-primary">
                      Daily attendance
                    </h2>
                    <p className="text-sm text-secondary">
                      Mark student attendance for {activeSection.className} -{" "}
                      {activeSection.sectionName}
                    </p>
                  </div>

                  <form action={saveAttendance} className="space-y-4">
                    <input
                      type="hidden"
                      name="classId"
                      value={activeSection.classId}
                    />
                    <input
                      type="hidden"
                      name="sectionId"
                      value={activeSection.sectionId}
                    />

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
                      <label className="text-sm font-medium text-secondary">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        defaultValue={todayStr}
                        className="rounded-md border px-3 py-1.5 text-xs"
                        style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)" }}
                        required
                      />
                    </div>

                    {enrolledStudents.length === 0 ? (
                      <p className="rounded-md border border-dashed py-4 text-center text-sm text-secondary" style={{ borderColor: "var(--border-default)" }}>
                        No students enrolled in this section.
                      </p>
                    ) : (
                      <div className="divide-y max-h-80 overflow-y-auto pr-1" style={{ borderColor: "var(--border-default)" }}>
                        {enrolledStudents.map((student) => (
                          <div
                            key={student.studentId}
                            className="flex items-center justify-between py-3 gap-4"
                          >
                            <div>
                              <div className="font-medium text-primary">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-xs text-muted">
                                Adm: {student.admissionNumber}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                name={`status_${student.studentId}`}
                                className="rounded-lg border px-2.5 py-1.5 text-xs font-medium"
                                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)" }}
                                required
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                              </select>
                              <input
                                type="text"
                                name={`notes_${student.studentId}`}
                                placeholder="Notes (optional)"
                                className="hidden sm:block rounded-lg border px-2 py-1.5 text-xs w-28"
                                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {enrolledStudents.length > 0 && (
                      <button
                        type="submit"
                        className="w-full rounded-md bg-[#3f5ca8] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#344e91]"
                      >
                        Save attendance
                      </button>
                    )}
                  </form>
                </section>

                {/* Assignment Manager */}
                <section className="space-y-4 rounded-md border p-4 shadow-[0_1px_2px_rgba(23,30,44,.04)]" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
                  <h2 className="text-sm font-semibold text-primary">
                    Assignments
                  </h2>

                  {/* Create form */}
                  <form
                    action={createAssignment}
                    className="space-y-3 rounded-md border p-3"
                    style={{ backgroundColor: "var(--bg-surface-2)", borderColor: "var(--border-default)" }}
                  >
                    <input
                      type="hidden"
                      name="classId"
                      value={activeSection.classId}
                    />
                    <input
                      type="hidden"
                      name="sectionId"
                      value={activeSection.sectionId}
                    />

                    <div className="text-sm font-semibold text-primary">
                      Add new assignment
                    </div>

                    <div>
                      <input
                        name="title"
                        placeholder="Assignment title"
                        className="w-full rounded-md border bg-white px-3 py-2 text-xs"
                        style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)" }}
                        required
                      />
                    </div>

                    <div>
                      <textarea
                        name="description"
                        placeholder="Instructions"
                        className="w-full rounded-md border bg-white px-3 py-2 text-xs"
                        style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)" }}
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          name="dueDate"
                          defaultValue={todayStr}
                          className="w-full rounded-md border bg-white px-3 py-2 text-xs"
                          style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)" }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                          Attachment File Name
                        </label>
                        <input
                          name="filePath"
                          placeholder="assignment-sheet.pdf"
                          className="w-full rounded-md border bg-white px-3 py-2 text-xs"
                          style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)" }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-2 w-full rounded-md bg-[#3f5ca8] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#344e91]"
                    >
                      Post assignment
                    </button>
                  </form>

                  {/* Assignment list */}
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-primary">
                      Existing Assignments
                    </div>
                    {existingAssignments.length === 0 ? (
                      <p className="text-xs text-muted">
                        No assignments posted yet for this class.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {existingAssignments.map((asn) => (
                          <div
                            key={asn.id}
                            className="space-y-1 rounded-md border p-3"
                            style={{ borderColor: "var(--border-default)" }}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="font-medium text-primary">
                                {asn.title}
                              </div>
                              <div className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                Due: {String(asn.dueDate)}
                              </div>
                            </div>
                            {asn.description && (
                              <p className="text-xs text-secondary">
                                {asn.description}
                              </p>
                            )}
                            {asn.filePath && (
                              <div className="mt-1 font-mono text-[11px] text-[#3f5ca8]">
                                📎 {asn.filePath}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <p className="text-sm text-secondary">
                Select a class from the list to start marking attendance.
              </p>
            )}
          </div>
        </div>
      )}

      {currentTab === "ai-exams" && (
        <AIExamCreator
          classes={assigned.map((s) => ({
            classId: s.classId,
            className: s.className,
          }))}
          savedExams={savedExams}
        />
      )}
    </div>
  );
}
