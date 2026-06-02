"use client";

import { useState } from "react";
import type { FormSchema, FormField } from "@/types";

export default function DynamicForm({
  schema,
  initial,
  onSubmit,
  submitLabel = "プレビューへ進む",
}: {
  schema: FormSchema;
  initial?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  submitLabel?: string;
}) {
  const [data, setData] = useState<Record<string, unknown>>(initial ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(name: string, value: unknown) {
    setData((d) => ({ ...d, [name]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const section of schema.sections) {
      for (const f of section.fields) {
        if (f.required) {
          const v = data[f.name];
          const empty =
            v === undefined ||
            v === null ||
            v === "" ||
            (Array.isArray(v) && v.length === 0);
          if (empty) next[f.name] = "必須項目です";
        }
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {schema.sections.map((section, si) => (
        <div key={si} className="card p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">{section.title}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div
                key={field.name}
                className={field.type === "textarea" ? "sm:col-span-2" : ""}
              >
                <FieldInput
                  field={field}
                  value={data[field.name]}
                  onChange={(v) => set(field.name, v)}
                />
                {errors[field.name] && (
                  <p className="mt-1 text-xs text-red-600">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="submit" className="btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = (
    <label className="label">
      {field.label}
      {field.required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
  const help = field.help && <p className="mb-1 text-xs text-gray-500">{field.help}</p>;

  switch (field.type) {
    case "textarea":
      return (
        <div>
          {label}
          {help}
          <textarea
            className="input min-h-[80px]"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "select":
      return (
        <div>
          {label}
          {help}
          <select
            className="input"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">選択してください</option>
            {(field.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );
    case "radio":
      return (
        <div>
          {label}
          {help}
          <div className="flex flex-wrap gap-3 pt-1">
            {(field.options ?? []).map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name={field.name}
                  value={o}
                  checked={value === o}
                  onChange={() => onChange(o)}
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      );
    case "checkbox": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          {label}
          {help}
          <div className="flex flex-wrap gap-3 pt-1">
            {(field.options ?? []).map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={arr.includes(o)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked ? [...arr, o] : arr.filter((x) => x !== o)
                    )
                  }
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      );
    }
    case "number":
      return (
        <div>
          {label}
          {help}
          <input
            type="number"
            className="input"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "date":
      return (
        <div>
          {label}
          {help}
          <input
            type="date"
            className="input"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    default:
      return (
        <div>
          {label}
          {help}
          <input
            type="text"
            className="input"
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}
