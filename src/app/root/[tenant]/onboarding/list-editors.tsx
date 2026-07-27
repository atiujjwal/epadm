"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TextListEditor({
  title,
  values,
  onChange,
  placeholder,
}: {
  title: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      {values.map((value, index) => (
        <div key={`${title}-${index}`} className="flex gap-2">
          <Input value={value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={placeholder} />
          <Button type="button" variant="secondary" iconOnly aria-label="Remove" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => onChange([...values, ""])}>Add</Button>
    </div>
  );
}

export function ObjectListEditor<T extends Record<string, string | number>>({
  title,
  values,
  fields,
  empty,
  onChange,
}: {
  title: string;
  values: T[];
  fields: Array<{ key: keyof T; label: string; placeholder?: string; type?: "text" | "number" }>;
  empty: T;
  onChange: (values: T[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <div className="space-y-2">
        {values.map((row, index) => (
          <div key={`${title}-${index}`} className="grid gap-2 rounded-md border p-2 lg:grid-cols-[1fr_1fr_auto]">
            {fields.map((field) => (
              <Input
                key={String(field.key)}
                type={field.type ?? "text"}
                value={String(row[field.key] ?? "")}
                onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? { ...item, [field.key]: field.type === "number" ? Number(event.target.value) : event.target.value } : item))}
                placeholder={field.placeholder ?? field.label}
              />
            ))}
            <Button type="button" variant="secondary" iconOnly aria-label="Remove" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} />
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => onChange([...values, empty])}>Add</Button>
    </div>
  );
}
