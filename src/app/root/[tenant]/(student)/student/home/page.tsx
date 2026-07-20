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
    // Wrong role, but still authenticated — route back through "/" so they land
    // on their own role's home, not the login page.
    redirect("/");
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
      <section className="rounded-md border border-[#e3e5e9] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(23,30,44,.04)]">
        <p className="text-[11px] font-medium uppercase text-[#626874]">
          Student Portal
        </p>
        {studentInfo ? (
          <>
            <h1 className="mt-2 text-xl font-semibold text-[#2d3442]">
              Hello, {studentInfo.firstName} {studentInfo.lastName}!
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-5 text-[#626874]">
              Class: {studentInfo.className} · Section: {studentInfo.sectionName} · Admission: {studentInfo.admissionNumber}
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-2 text-xl font-semibold text-[#2d3442]">Welcome student</h1>
            <p className="mt-1 text-xs text-[#626874]">
              No registry profile found. Contact administration to complete your enrollment.
            </p>
          </>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="space-y-4 rounded-md border p-4 shadow-[0_1px_2px_rgba(23,30,44,.04)]" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
            <h2 className="text-sm font-semibold text-primary">Campus news and notices</h2>
            <div className="space-y-3">
              {dailyNews.map((news) => (
                <div 
                  key={news.id} 
                  className="space-y-2 rounded-md border p-3"
                  style={{ backgroundColor: "var(--bg-surface-2)", borderColor: "var(--border-default)" }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="inline-flex rounded-sm border border-[#d9e0f6] bg-[#edf1fd] px-1.5 py-0.5 text-[10px] font-semibold text-[#31477f]">
                      {news.tag}
                    </span>
                    <span className="text-xs text-muted">{news.date}</span>
                  </div>
                  <h3 className="font-semibold text-primary">{news.title}</h3>
                  <p className="text-xs leading-relaxed text-secondary">{news.content}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-md border p-4 shadow-[0_1px_2px_rgba(23,30,44,.04)]" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
            <h2 className="text-sm font-semibold text-primary">Upcoming assignments</h2>
            {studentAssignments.length === 0 ? (
              <p className="rounded-md border border-dashed py-4 text-center text-sm text-muted" style={{ borderColor: "var(--border-default)" }}>
                No upcoming assignments posted for your class section.
              </p>
            ) : (
              <div className="space-y-3">
                {studentAssignments.map((asn) => (
                  <div 
                    key={asn.id} 
                    className="space-y-2 rounded-md border p-3 transition hover:border-[#b9c5e8]"
                    style={{ borderColor: "var(--border-default)" }}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <h3 className="font-semibold text-primary">{asn.title}</h3>
                      <span className="rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        Due: {String(asn.dueDate)}
                      </span>
                    </div>
                    {asn.description && <p className="text-xs text-secondary">{asn.description}</p>}
                    {asn.filePath && (
                      <div className="flex items-center gap-1.5 font-mono text-xs text-[#3f5ca8]">
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

        <section className="h-fit space-y-4 rounded-md border p-4 shadow-[0_1px_2px_rgba(23,30,44,.04)]" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
          <div>
            <h2 className="text-sm font-semibold text-primary">Academic progress</h2>
            <p className="text-xs text-muted">{reportCard.term}</p>
          </div>

          <div className="rounded-md border border-[#d9e0f6] bg-[#edf1fd] p-4 text-center">
            <div className="text-xs font-semibold uppercase text-[#31477f]">Cumulative GPA</div>
            <div className="mt-1 text-2xl font-bold text-[#24355f]">{reportCard.gpa}</div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-primary">Subject grades</div>
            <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
              {reportCard.subjects.map((subj) => (
                <div key={subj.name} className="flex justify-between items-center py-2.5">
                  <div>
                    <div className="text-sm font-medium text-primary">{subj.name}</div>
                    <div className="text-[10px] text-muted">{subj.marks}</div>
                  </div>
                  <span className="text-sm font-bold text-[#3f5ca8]">{subj.grade}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
