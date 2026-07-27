"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

export type AcademicClassRecord = {
  id: string;
  code: string;
  name: string;
  academicYear: string;
  academicYearId: string | null;
  academicYearName: string | null;
  status: string;
  homeroomStaffId: string | null;
  homeroomStaffName: string | null;
  classTeacherId: string | null;
  classTeacherName: string | null;
  createdAt: string | Date;
};

export type SectionRecord = {
  id: string;
  classId: string;
  className: string;
  classCode: string;
  name: string;
  capacity: number | null;
  status: string;
  room?: string | null;
  createdAt: string | Date;
};

export type EnrollmentRecord = {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  sectionId: string | null;
  sectionName: string | null;
  academicYear: string;
  rollNumber: string | null;
  status: string;
  enrolledOn: string | null;
  houseId?: string | null;
  streamId?: string | null;
  createdAt: string | Date;
};

export type SubjectRecord = {
  id: string;
  name: string;
  code: string;
  status: string;
  createdAt: string | Date;
};

export type StaffOption = { id: string; label: string };
export type StudentOption = { id: string; label: string; admissionNumber: string };
export type AcademicYearRecord = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string | Date;
};

export type ClassSubjectAssignment = {
  id: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  weeklyPeriods: number;
  plannedUnits: number;
  completedUnits: number;
};

export type StreamRecord = {
  id: string;
  code: string;
  name: string;
  grade: string;
  subjectIds: string[];
  capacity: number;
  status: string;
};

export type HouseRecord = {
  id: string;
  name: string;
  color: string;
  captain: string;
  viceCaptain: string;
  sportsPoints: number;
  academicPoints: number;
  culturalPoints: number;
};

export type CalendarTerm = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  workingDays: number;
  holidays: number;
  hoursPerDay: number;
};

export type AcademicState = {
  classes: AcademicClassRecord[];
  sections: SectionRecord[];
  enrollments: EnrollmentRecord[];
  subjects: SubjectRecord[];
  staff: StaffOption[];
  teachers: StaffOption[];
  students: StudentOption[];
  academicYears: AcademicYearRecord[];
  assignments: ClassSubjectAssignment[];
  streams: StreamRecord[];
  houses: HouseRecord[];
  terms: CalendarTerm[];
};

type AcademicAction =
  | { type: "class/upsert"; record: AcademicClassRecord }
  | { type: "class/delete"; id: string }
  | { type: "section/upsert"; record: SectionRecord }
  | { type: "section/delete"; id: string }
  | { type: "enrollment/upsert"; record: EnrollmentRecord }
  | { type: "enrollment/delete"; id: string }
  | { type: "subject/upsert"; record: SubjectRecord }
  | { type: "subject/delete"; id: string }
  | { type: "assignment/upsert"; record: ClassSubjectAssignment }
  | { type: "assignment/delete"; id: string }
  | { type: "stream/upsert"; record: StreamRecord }
  | { type: "stream/delete"; id: string }
  | { type: "house/upsert"; record: HouseRecord }
  | { type: "house/delete"; id: string }
  | { type: "term/upsert"; record: CalendarTerm }
  | { type: "term/delete"; id: string };

const AcademicContext = createContext<
  { state: AcademicState; dispatch: Dispatch<AcademicAction> } | undefined
>(undefined);

function upsert<T extends { id: string }>(items: T[], record: T) {
  const index = items.findIndex((item) => item.id === record.id);
  if (index === -1) return [record, ...items];
  return items.map((item) => (item.id === record.id ? record : item));
}

function academicReducer(state: AcademicState, action: AcademicAction): AcademicState {
  switch (action.type) {
    case "class/upsert":
      return { ...state, classes: upsert(state.classes, action.record) };
    case "class/delete":
      return { ...state, classes: state.classes.filter((item) => item.id !== action.id) };
    case "section/upsert":
      return { ...state, sections: upsert(state.sections, action.record) };
    case "section/delete":
      return { ...state, sections: state.sections.filter((item) => item.id !== action.id) };
    case "enrollment/upsert":
      return { ...state, enrollments: upsert(state.enrollments, action.record) };
    case "enrollment/delete":
      return { ...state, enrollments: state.enrollments.filter((item) => item.id !== action.id) };
    case "subject/upsert":
      return { ...state, subjects: upsert(state.subjects, action.record) };
    case "subject/delete":
      return { ...state, subjects: state.subjects.filter((item) => item.id !== action.id) };
    case "assignment/upsert":
      return { ...state, assignments: upsert(state.assignments, action.record) };
    case "assignment/delete":
      return { ...state, assignments: state.assignments.filter((item) => item.id !== action.id) };
    case "stream/upsert":
      return { ...state, streams: upsert(state.streams, action.record) };
    case "stream/delete":
      return { ...state, streams: state.streams.filter((item) => item.id !== action.id) };
    case "house/upsert":
      return { ...state, houses: upsert(state.houses, action.record) };
    case "house/delete":
      return { ...state, houses: state.houses.filter((item) => item.id !== action.id) };
    case "term/upsert":
      return { ...state, terms: upsert(state.terms, action.record) };
    case "term/delete":
      return { ...state, terms: state.terms.filter((item) => item.id !== action.id) };
    default:
      return state;
  }
}

export function createLocalId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function displaySection(section: SectionRecord) {
  return `${section.classCode}-${section.name}`;
}

export function createInitialAcademicState(input: {
  classes: AcademicClassRecord[];
  sections: SectionRecord[];
  enrollments: EnrollmentRecord[];
  subjects: SubjectRecord[];
  staff: StaffOption[];
  teachers: StaffOption[];
  students: StudentOption[];
  academicYears: AcademicYearRecord[];
}): AcademicState {
  const houses: HouseRecord[] = [
    { id: "house-ganga", name: "Ganga", color: "Blue", captain: "", viceCaptain: "", sportsPoints: 420, academicPoints: 480, culturalPoints: 340 },
    { id: "house-yamuna", name: "Yamuna", color: "Red", captain: "", viceCaptain: "", sportsPoints: 380, academicPoints: 460, culturalPoints: 340 },
    { id: "house-kaveri", name: "Kaveri", color: "Green", captain: "", viceCaptain: "", sportsPoints: 360, academicPoints: 395, culturalPoints: 340 },
    { id: "house-narmada", name: "Narmada", color: "Yellow", captain: "", viceCaptain: "", sportsPoints: 320, academicPoints: 340, culturalPoints: 320 },
  ];

  const streamSubjects = input.subjects.slice(0, 5).map((subject) => subject.id);
  const streams: StreamRecord[] = [
    { id: "stream-pcm", code: "PCM", name: "Science (PCM)", grade: "XI-XII", subjectIds: streamSubjects, capacity: 60, status: "active" },
    { id: "stream-pcb", code: "PCB", name: "Science (PCB)", grade: "XI-XII", subjectIds: streamSubjects, capacity: 40, status: "active" },
    { id: "stream-commerce", code: "COM", name: "Commerce", grade: "XI-XII", subjectIds: streamSubjects, capacity: 60, status: "active" },
    { id: "stream-humanities", code: "HUM", name: "Humanities", grade: "XI-XII", subjectIds: streamSubjects, capacity: 40, status: "active" },
  ];

  const terms: CalendarTerm[] = [
    { id: "term-1", name: "Term 1", startDate: "2026-04-01", endDate: "2026-09-30", workingDays: 118, holidays: 14, hoursPerDay: 5 },
    { id: "term-2", name: "Term 2", startDate: "2026-10-01", endDate: "2027-03-31", workingDays: 122, holidays: 22, hoursPerDay: 5 },
  ];

  return {
    ...input,
    enrollments: input.enrollments.map((enrollment, index) => ({
      ...enrollment,
      houseId: houses[index % houses.length]?.id ?? null,
      streamId: null,
    })),
    assignments: seedAssignments(input.sections, input.subjects, input.teachers),
    streams,
    houses,
    terms,
  };
}

function seedAssignments(
  sections: SectionRecord[],
  subjects: SubjectRecord[],
  staff: StaffOption[],
): ClassSubjectAssignment[] {
  if (sections.length === 0 || subjects.length === 0 || staff.length === 0) return [];
  return sections.flatMap((section, sectionIndex) =>
    subjects.slice(0, 4).map((subject, subjectIndex) => ({
      id: `as-${section.id}-${subject.id}`,
      sectionId: section.id,
      subjectId: subject.id,
      teacherId: staff[(sectionIndex + subjectIndex) % staff.length]?.id ?? "",
      weeklyPeriods: subjectIndex === 0 ? 6 : 5,
      plannedUnits: 12,
      completedUnits: Math.max(1, 10 - subjectIndex),
    })),
  );
}

export function AcademicsProvider({
  initialState,
  children,
}: {
  initialState: AcademicState;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(academicReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>;
}

export function useAcademics() {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error("useAcademics must be used inside AcademicsProvider");
  }
  return context;
}

export function getTeacherName(state: AcademicState, teacherId: string) {
  return state.staff.find((teacher) => teacher.id === teacherId)?.label ?? "Unassigned";
}

export function getSubjectName(state: AcademicState, subjectId: string) {
  return state.subjects.find((subject) => subject.id === subjectId)?.name ?? "Unknown subject";
}

export function getSectionLabel(state: AcademicState, sectionId: string) {
  const section = state.sections.find((item) => item.id === sectionId);
  return section ? displaySection(section) : "Unknown section";
}
