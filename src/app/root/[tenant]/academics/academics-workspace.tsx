"use client";

import { PageHeader } from "@/components/workspace/app-shell";
import { ExportMenu } from "@/components/workspace/export-menu";
import { AcademicsControlPlane } from "./academics-control-plane";
import {
  AcademicsProvider,
  createInitialAcademicState,
  type AcademicClassRecord,
  type AcademicYearRecord,
  type EnrollmentRecord,
  type SectionRecord,
  type StaffOption,
  type StudentOption,
  type SubjectRecord,
} from "./academics-state";

type Props = {
  classes: AcademicClassRecord[];
  sections: SectionRecord[];
  enrollments: EnrollmentRecord[];
  staffOptions: StaffOption[];
  teacherOptions: StaffOption[];
  studentOptions: StudentOption[];
  subjects: SubjectRecord[];
  academicYears: AcademicYearRecord[];
  summary: {
    classCount: number;
    sectionCount: number;
    enrollmentCount: number;
    subjectCount: number;
  };
};

export function AcademicsWorkspace(props: Props) {
  const initialState = createInitialAcademicState({
    classes: props.classes,
    sections: props.sections,
    enrollments: props.enrollments,
    subjects: props.subjects,
    staff: props.staffOptions,
    teachers: props.teacherOptions,
    students: props.studentOptions,
    academicYears: props.academicYears,
  });

  return (
    <AcademicsProvider initialState={initialState}>
      <PageHeader
        title="Academics Setup"
        subtitle={`${props.summary.classCount} classes · ${props.summary.sectionCount} sections · ${props.summary.subjectCount} subjects`}
        actions={<ExportMenu />}
      />
      <AcademicsControlPlane />
    </AcademicsProvider>
  );
}
