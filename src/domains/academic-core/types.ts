import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { academicYears, classes, sections, subjects, students } from "./schema";

export type SubjectType = "THEORY" | "PRACTICAL" | "BOTH";
export type StudentStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ALUMNI";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export type AcademicYear = InferSelectModel<typeof academicYears>;
export type Class = InferSelectModel<typeof classes>;
export type Section = InferSelectModel<typeof sections>;
export type Subject = InferSelectModel<typeof subjects>;
export type Student = InferSelectModel<typeof students>;


// --- Academic Year ---
export interface CreateAcademicYearInput {
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  isCurrent?: boolean;
  isActive?: boolean;
}

export interface UpdateAcademicYearInput
  extends Partial<CreateAcademicYearInput> {
  id: string;
}

// --- Class & Section ---
export interface CreateClassInput {
  name: string;
  academicYearId: string;
  order?: number;
  classTeacherId?: string;
  config?: Record<string, any>;
}

export interface CreateSectionInput {
  classId: string;
  name: string; // e.g., "A", "Blue", "Rose"
  classTeacherId?: string;
}

// --- Subject ---
export interface CreateSubjectInput {
  name: string;
  code: string; // e.g., "PHY101"
  type: SubjectType;
  credits?: number;
}

// --- Student ---
export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  rollNumber?: string;

  // Relationships
  academicYearId: string;
  sectionId: string;
  parentId?: string; // Linkage to Guardian/User

  // Demographics
  gender: Gender;
  dob: string | Date;
  attributes?: Record<string, any>; // JSONB for dynamic fields (blood group, etc.)
}

export interface UpdateStudentInput
  extends Partial<Omit<CreateStudentInput, "admissionNumber">> {
  id: string;
  status?: StudentStatus;
}

export interface StudentFilters {
  sectionId?: string;
  classId?: string; // Requires join in service
  academicYearId?: string;
  status?: StudentStatus;
  search?: string; // For name/admission number search
  limit?: number;
  offset?: number;
}

export interface ClassFilters {
  academicYearId?: string;
}
