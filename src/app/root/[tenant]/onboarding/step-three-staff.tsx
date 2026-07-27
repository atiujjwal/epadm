"use client";

import { useOnboarding } from "./onboarding-provider";
import { ObjectListEditor, TextListEditor } from "./list-editors";

export function StepThreeStaff() {
  const { draft, setDraft } = useOnboarding();
  const organization = draft.organization;
  const update = (next: typeof organization) => setDraft({ ...draft, organization: next });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-primary">Staff & Departments</h2>
        <p className="mt-1 text-xs text-muted-foreground">Optional setup for departments, roles, and starter staff records.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <ObjectListEditor
          title="Departments"
          values={organization.departments}
          empty={{ code: "", name: "", description: "" }}
          fields={[
            { key: "code", label: "Code", placeholder: "ACAD" },
            { key: "name", label: "Name", placeholder: "Academics" },
            { key: "description", label: "Description", placeholder: "Department purpose" },
          ]}
          onChange={(departments) => update({ ...organization, departments })}
        />
        <TextListEditor title="Roles" values={organization.roles} placeholder="Teacher" onChange={(roles) => update({ ...organization, roles })} />
        <div className="lg:col-span-2">
          <ObjectListEditor
            title="Initial staff"
            values={organization.staff}
            empty={{ employeeCode: "", fullName: "", email: "", jobTitle: "", department: "" }}
            fields={[
              { key: "employeeCode", label: "Employee Code", placeholder: "EMP-001" },
              { key: "fullName", label: "Full Name", placeholder: "Anita Sharma" },
              { key: "email", label: "Email", placeholder: "anita@school.edu" },
              { key: "jobTitle", label: "Job Title", placeholder: "Teacher" },
              { key: "department", label: "Department", placeholder: "Academics" },
            ]}
            onChange={(staff) => update({ ...organization, staff })}
          />
        </div>
      </div>
    </div>
  );
}
