import { getCtx } from "@/lib/context";
import {
  db,
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
import AIExamCreator from "./ai-exam-creator";

export default async function TeacherHomePage({
  searchParams,
}: {
  searchParams: Promise<{ sectionId?: string; tab?: string }>;
}) {
  const ctx = await getCtx();
  if (ctx.role !== "teacher") {
    redirect("/login");
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
      <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-zinc-950">No staff profile found</h2>
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
  let enrolledStudents: any[] = [];
  let existingAssignments: any[] = [];
  let savedExams: any[] = [];

  const data = await withTenant(ctx.tenantId, async (tx) => {
    let enrolled: any[] = [];
    let existing: any[] = [];

    if (activeSection) {
      enrolled = await tx
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
        );

      existing = await tx
        .select()
        .from(assignments)
        .where(
          and(
            eq(assignments.sectionId, activeSection.sectionId),
            eq(assignments.tenantId, ctx.tenantId),
          ),
        )
        .orderBy(assignments.dueDate);
    }

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

  enrolledStudents = data.enrolled;
  existingAssignments = data.existing;
  savedExams = data.saved;

  // Attendance Save Action
  async function saveAttendance(formData: FormData) {
    "use server";
    const ctx = await getCtx();
    const dateStr = formData.get("date") as string;
    const classId = formData.get("classId") as string;
    const secId = formData.get("sectionId") as string;

    if (!dateStr || !classId || !secId) return;

    const records: any[] = [];
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

    revalidatePath(`/teacher/home`);
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

    revalidatePath(`/teacher/home`);
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="rounded-3xl bg-[linear-gradient(135deg,#075985_0%,#0369a1_55%,#38bdf8_100%)] px-6 py-8 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-sky-100">
          Teacher Portal
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          Welcome back, {teacher.fullName}!
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-sky-50">
          Department: {teacher.department || "General"} · Role:{" "}
          {teacher.jobTitle || "Instructor"}
        </p>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200">
        {[
          { id: "workspace", label: "Attendance & Assignments" },
          { id: "ai-exams", label: "AI Exam Creator" },
        ].map((tab) => (
          <a
            key={tab.id}
            href={`?tab=${tab.id}`}
            className={`border-b-2 px-6 py-3 text-sm font-medium transition ${
              currentTab === tab.id
                ? "border-sky-600 text-sky-700 font-semibold"
                : "border-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {currentTab === "workspace" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Classes Sidebar */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4 h-fit">
            <h2 className="text-lg font-semibold text-zinc-950">
              Assigned Classes
            </h2>
            {assigned.length === 0 ? (
              <p className="text-sm text-zinc-600">
                You are not assigned as homeroom teacher to any classes.
              </p>
            ) : (
              <div className="space-y-2">
                {assigned.map((sec) => (
                  <a
                    key={sec.sectionId}
                    href={`?tab=workspace&sectionId=${sec.sectionId}`}
                    className={`block rounded-xl border p-4 text-left transition ${
                      activeSectionId === sec.sectionId
                        ? "border-sky-500 bg-sky-50/50"
                        : "border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="font-semibold text-zinc-900">
                      {sec.className}
                    </div>
                    <div className="text-sm text-zinc-600">
                      Section: {sec.sectionName}
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
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
                <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-950">
                      Daily Attendance
                    </h2>
                    <p className="text-sm text-zinc-600">
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
                      <label className="text-sm font-medium text-zinc-700">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        defaultValue={todayStr}
                        className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm"
                        required
                      />
                    </div>

                    {enrolledStudents.length === 0 ? (
                      <p className="text-sm text-zinc-600 py-4 border border-dashed border-zinc-200 rounded-xl text-center">
                        No students enrolled in this section.
                      </p>
                    ) : (
                      <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto pr-1">
                        {enrolledStudents.map((student) => (
                          <div
                            key={student.studentId}
                            className="flex items-center justify-between py-3 gap-4"
                          >
                            <div>
                              <div className="font-medium text-zinc-900">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-xs text-zinc-500">
                                Adm: {student.admissionNumber}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                name={`status_${student.studentId}`}
                                className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium"
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
                                className="hidden sm:block rounded-lg border border-zinc-300 px-2 py-1.5 text-xs w-28"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {enrolledStudents.length > 0 && (
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
                      >
                        Save Attendance
                      </button>
                    )}
                  </form>
                </section>

                {/* Assignment Manager */}
                <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                  <h2 className="text-lg font-semibold text-zinc-950">
                    Assignments
                  </h2>

                  {/* Create form */}
                  <form
                    action={createAssignment}
                    className="space-y-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100"
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

                    <div className="text-sm font-semibold text-zinc-800">
                      Add New Assignment
                    </div>

                    <div>
                      <input
                        name="title"
                        placeholder="Assignment Title"
                        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <textarea
                        name="description"
                        placeholder="Instructions/Description"
                        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          name="dueDate"
                          defaultValue={todayStr}
                          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">
                          Attachment File Name
                        </label>
                        <input
                          name="filePath"
                          placeholder="assignment-sheet.pdf"
                          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 mt-2"
                    >
                      Post Assignment
                    </button>
                  </form>

                  {/* Assignment list */}
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-zinc-800">
                      Existing Assignments
                    </div>
                    {existingAssignments.length === 0 ? (
                      <p className="text-xs text-zinc-500">
                        No assignments posted yet for this class.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {existingAssignments.map((asn) => (
                          <div
                            key={asn.id}
                            className="rounded-xl border border-zinc-200 p-3.5 space-y-1"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="font-medium text-zinc-900">
                                {asn.title}
                              </div>
                              <div className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                Due: {String(asn.dueDate)}
                              </div>
                            </div>
                            {asn.description && (
                              <p className="text-xs text-zinc-600">
                                {asn.description}
                              </p>
                            )}
                            {asn.filePath && (
                              <div className="mt-1 text-[11px] font-mono text-sky-700">
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
              <p className="text-sm text-zinc-600">
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
