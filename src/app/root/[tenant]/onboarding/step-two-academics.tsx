"use client";

import { useOnboarding } from "./onboarding-provider";
import { ObjectListEditor, TextListEditor } from "./list-editors";

export function StepTwoAcademics() {
  const { draft, setDraft } = useOnboarding();
  const academics = draft.academics;
  const update = (next: typeof academics) => setDraft({ ...draft, academics: next });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-primary">Academic Infrastructure</h2>
        <p className="mt-1 text-xs text-muted-foreground">Review defaults, remove what you do not need, and add school-specific structure.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <ObjectListEditor
          title="Classes"
          values={academics.classes}
          empty={{ code: "", name: "" }}
          fields={[{ key: "code", label: "Code", placeholder: "G1" }, { key: "name", label: "Name", placeholder: "Grade 1" }]}
          onChange={(classes) => update({ ...academics, classes })}
        />
        <TextListEditor
          title="Sections"
          values={academics.sections}
          placeholder="A"
          onChange={(sections) => update({ ...academics, sections })}
        />
        <ObjectListEditor
          title="Subjects"
          values={academics.subjects}
          empty={{ code: "", name: "" }}
          fields={[{ key: "code", label: "Code", placeholder: "MATH" }, { key: "name", label: "Name", placeholder: "Mathematics" }]}
          onChange={(subjects) => update({ ...academics, subjects })}
        />
        <ObjectListEditor
          title="Streams"
          values={academics.streams}
          empty={{ code: "", name: "", grade: "", capacity: 40 }}
          fields={[
            { key: "code", label: "Code", placeholder: "SCI" },
            { key: "name", label: "Name", placeholder: "Science" },
            { key: "grade", label: "Grade", placeholder: "XI-XII" },
            { key: "capacity", label: "Capacity", type: "number" },
          ]}
          onChange={(streams) => update({ ...academics, streams })}
        />
      </div>
    </div>
  );
}
