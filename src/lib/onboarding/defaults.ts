export const ONBOARDING_TOTAL_STEPS = 4;

export type OnboardingDraft = {
  profile: {
    schoolName: string;
    logoUrl: string;
    foundationYear: string;
    shortName: string;
    academicYear: string;
    academicYearStart: string;
  };
  academics: {
    classes: Array<{ code: string; name: string }>;
    sections: string[];
    subjects: Array<{ code: string; name: string }>;
    streams: Array<{ code: string; name: string; grade: string; capacity: number }>;
  };
  organization: {
    departments: Array<{ code: string; name: string; description: string }>;
    roles: string[];
    staff: Array<{ employeeCode: string; fullName: string; email: string; jobTitle: string; department: string }>;
  };
  operations: {
    library: { accessionPrefix: string; lendingDays: number };
    payroll: { cycle: string; payoutDay: number };
    houses: Array<{ name: string; color: string }>;
  };
};

export function createOnboardingDefaults(input?: {
  schoolName?: string;
  shortName?: string | null;
  logoUrl?: string | null;
  foundationYear?: number | null;
  academicYearStart?: string | null;
}): OnboardingDraft {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;

  return {
    profile: {
      schoolName: input?.schoolName ?? "",
      logoUrl: input?.logoUrl ?? "",
      foundationYear: input?.foundationYear ? String(input.foundationYear) : "",
      shortName: input?.shortName ?? "",
      academicYear: `${year}-${String(year + 1).slice(2)}`,
      academicYearStart: input?.academicYearStart ?? `${year}-04-01`,
    },
    academics: {
      classes: Array.from({ length: 12 }, (_, index) => {
        const grade = index + 1;
        return { code: `G${grade}`, name: `Grade ${grade}` };
      }),
      sections: ["A", "B", "C"],
      subjects: [
        { code: "MATH", name: "Mathematics" },
        { code: "SCI", name: "Science" },
        { code: "ENG", name: "English" },
        { code: "HINDI", name: "Hindi" },
        { code: "SANS", name: "Sanskrit" },
        { code: "HIST", name: "History" },
        { code: "GK", name: "General Knowledge" },
        { code: "GAMES", name: "Games" },
      ],
      streams: [
        { code: "SCI", name: "Science", grade: "XI-XII", capacity: 40 },
        { code: "COM", name: "Commerce", grade: "XI-XII", capacity: 40 },
        { code: "HUM", name: "Humanities", grade: "XI-XII", capacity: 40 },
      ],
    },
    organization: {
      departments: [
        { code: "ACAD", name: "Academics", description: "Teaching faculty and curriculum operations" },
        { code: "ADMIN", name: "Administration", description: "Administration and HR operations" },
        { code: "FIN", name: "Finance", description: "Accounts, fees, payroll, and budgeting" },
        { code: "IT", name: "IT", description: "Technology systems and support" },
        { code: "TRANS", name: "Transport", description: "Transport and facilities coordination" },
      ],
      roles: ["Superadmin", "Admin", "Teacher", "Accountant", "Librarian", "Staff"],
      staff: [],
    },
    operations: {
      library: { accessionPrefix: "LIB", lendingDays: 14 },
      payroll: { cycle: "monthly", payoutDay: 30 },
      houses: [
        { name: "Red", color: "Red" },
        { name: "Blue", color: "Blue" },
        { name: "Green", color: "Green" },
        { name: "Yellow", color: "Yellow" },
      ],
    },
  };
}

export function mergeOnboardingDraft(defaults: OnboardingDraft, draft: unknown): OnboardingDraft {
  if (!draft || typeof draft !== "object") return defaults;
  const source = draft as Partial<OnboardingDraft>;
  return {
    profile: { ...defaults.profile, ...(source.profile ?? {}) },
    academics: { ...defaults.academics, ...(source.academics ?? {}) },
    organization: { ...defaults.organization, ...(source.organization ?? {}) },
    operations: { ...defaults.operations, ...(source.operations ?? {}) },
  };
}
