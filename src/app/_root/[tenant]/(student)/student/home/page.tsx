import { getCtx } from "@/lib/context";
import {
  students,
  studentEnrollments,
  academicClasses,
  classSections,
  assignments,
  tenantUsers,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function StudentHomePage() {
  const ctx = await getCtx();
  if (ctx.role !== "student") {
    redirect("/login");
  }

  // 1. Resolve student enrollment details
  const studentInfo = await withTenant(ctx.tenantId, async (tx) => {
    const enrollment = await tx
      .select({
        studentId: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        admissionNumber: students.admissionNumber,
        classId: studentEnrollments.classId,
        className: academicClasses.name,
        sectionId: studentEnrollments.sectionId,
        sectionName: classSections.name,
      })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .innerJoin(tenantUsers, eq(students.tenantUserId, tenantUsers.id))
      .innerJoin(academicClasses, eq(studentEnrollments.classId, academicClasses.id))
      .innerJoin(classSections, eq(studentEnrollments.sectionId, classSections.id))
      .where(
        and(
          eq(tenantUsers.userId, ctx.userId),
          eq(tenantUsers.tenantId, ctx.tenantId),
        ),
      )
      .limit(1);

    return enrollment[0];
  });

  // 2. Fetch assignments for this student's class/section
  const activeSectionId = studentInfo?.sectionId;
  const studentAssignments = activeSectionId
    ? await withTenant(ctx.tenantId, async (tx) => {
        return tx
          .select()
          .from(assignments)
          .where(
            and(
              eq(assignments.sectionId, activeSectionId),
              eq(assignments.tenantId, ctx.tenantId),
            ),
          )
          .orderBy(assignments.dueDate);
      })
    : [];


  // Daily News / Announcements Mock Data
  const dailyNews = [
    {
      id: 1,
      title: "Science Fair 2026 Registration Open",
      content: "Register before Friday to participate in the Annual Science Fair exhibition.",
      tag: "Academic",
      date: "Today",
    },
    {
      id: 2,
      title: "Annual Sports Day Next Week",
      content: "All classes will follow a modified schedule for athletic practices starting Monday.",
      tag: "Campus Life",
      date: "Yesterday",
    },
    {
      id: 3,
      title: "Library Extended Hours",
      content: "The main campus library will remain open until 7:00 PM for semester preparations.",
      tag: "Resources",
      date: "2 days ago",
    },
  ];

  // Mock Report Card Data
  const reportCard = {
    gpa: "3.85 / 4.0",
    term: "Term 1 Final Grades",
    subjects: [
      { name: "Mathematics", grade: "A+", marks: "98/100" },
      { name: "Science", grade: "A", marks: "92/100" },
      { name: "English Literature", grade: "B+", marks: "87/100" },
      { name: "History", grade: "A-", marks: "90/100" },
      { name: "Computer Science", grade: "A+", marks: "99/100" },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <section className="rounded-3xl bg-[linear-gradient(135deg,#701a75_0%,#86198f_55%,#d946ef_100%)] px-6 py-8 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-fuchsia-100">
          Student Portal
        </p>
        {studentInfo ? (
          <>
            <h1 className="mt-3 text-3xl font-semibold">
              Hello, {studentInfo.firstName} {studentInfo.lastName}!
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-fuchsia-50">
              Class: {studentInfo.className} · Section: {studentInfo.sectionName} · Admission: {studentInfo.admissionNumber}
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-3xl font-semibold">Welcome Student!</h1>
            <p className="mt-2 text-sm text-fuchsia-50">
              No registry profile found. Contact administration to complete your enrollment.
            </p>
          </>
        )}
      </section>

      {/* Portal content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: News & Announcements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily News */}
          <section className="rounded-2xl border p-5 shadow-sm space-y-4" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
            <h2 className="text-lg font-semibold text-primary">Campus News & Notices</h2>
            <div className="space-y-3">
              {dailyNews.map((news) => (
                <div 
                  key={news.id} 
                  className="rounded-xl border p-4 space-y-2"
                  style={{ backgroundColor: "var(--bg-surface-2)", borderColor: "var(--border-default)" }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="inline-flex rounded-full bg-fuchsia-50 border border-fuchsia-200 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-700">
                      {news.tag}
                    </span>
                    <span className="text-xs text-muted">{news.date}</span>
                  </div>
                  <h3 className="font-semibold text-primary">{news.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{news.content}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Assignments */}
          <section className="rounded-2xl border p-5 shadow-sm space-y-4" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
            <h2 className="text-lg font-semibold text-primary">Upcoming Assignments</h2>
            {studentAssignments.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center border border-dashed rounded-xl" style={{ borderColor: "var(--border-default)" }}>
                No upcoming assignments posted for your class section.
              </p>
            ) : (
              <div className="space-y-3">
                {studentAssignments.map((asn) => (
                  <div 
                    key={asn.id} 
                    className="rounded-xl border p-4 space-y-2 hover:border-fuchsia-300 transition"
                    style={{ borderColor: "var(--border-default)" }}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <h3 className="font-semibold text-primary">{asn.title}</h3>
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                        Due: {String(asn.dueDate)}
                      </span>
                    </div>
                    {asn.description && <p className="text-xs text-secondary">{asn.description}</p>}
                    {asn.filePath && (
                      <div className="flex items-center gap-1.5 text-xs text-fuchsia-700 font-mono">
                        <span>📎</span>
                        <a href="#" className="hover:underline">{asn.filePath}</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column: Report Card */}
        <section className="rounded-2xl border p-5 shadow-sm space-y-4 h-fit" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
          <div>
            <h2 className="text-lg font-semibold text-primary">Academic Progress</h2>
            <p className="text-xs text-muted">{reportCard.term}</p>
          </div>

          <div className="rounded-xl bg-fuchsia-50/50 border border-fuchsia-100 p-4 text-center">
            <div className="text-xs uppercase tracking-[0.14em] text-fuchsia-800 font-semibold">Cumulative GPA</div>
            <div className="mt-1 text-3xl font-bold text-fuchsia-950">{reportCard.gpa}</div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-primary">Subject Grades</div>
            <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
              {reportCard.subjects.map((subj) => (
                <div key={subj.name} className="flex justify-between items-center py-2.5">
                  <div>
                    <div className="text-sm font-medium text-primary">{subj.name}</div>
                    <div className="text-[10px] text-muted">{subj.marks}</div>
                  </div>
                  <span className="text-sm font-bold text-fuchsia-800">{subj.grade}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
