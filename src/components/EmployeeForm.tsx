"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface WorkerTypeOption {
  key: string;
  name: string;
}

export interface EmployeeInput {
  id?: string;
  name: string;
  nameKana?: string | null;
  birthDate?: string | null;
  postalCode?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  employmentType?: string | null;
  department?: string | null;
  position?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

function toDateInput(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function EmployeeForm({
  workerTypes,
  initial,
}: {
  workerTypes: WorkerTypeOption[];
  initial?: EmployeeInput;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<EmployeeInput>({
    name: initial?.name ?? "",
    nameKana: initial?.nameKana ?? "",
    birthDate: toDateInput(initial?.birthDate),
    postalCode: initial?.postalCode ?? "",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    employmentType: initial?.employmentType ?? "",
    department: initial?.department ?? "",
    position: initial?.position ?? "",
    startDate: toDateInput(initial?.startDate),
    endDate: toDateInput(initial?.endDate),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof EmployeeInput>(key: K, value: EmployeeInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("氏名は必須です");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const url = isEdit ? `/api/employees/${initial!.id}` : "/api/employees";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "保存に失敗しました");
        return;
      }
      const data = await res.json();
      router.push(`/employees/${data.employee.id}`);
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  const field = (
    label: string,
    key: keyof EmployeeInput,
    type = "text"
  ) => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className="input"
        value={(form[key] as string) ?? ""}
        onChange={(e) => set(key, e.target.value)}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl p-6">
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">氏名 *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        {field("フリガナ", "nameKana")}
        <div>
          <label className="label">対象者区分</label>
          <select
            className="input"
            value={form.employmentType ?? ""}
            onChange={(e) => set("employmentType", e.target.value)}
          >
            <option value="">選択してください</option>
            {workerTypes.map((w) => (
              <option key={w.key} value={w.key}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        {field("生年月日", "birthDate", "date")}
        {field("部署", "department")}
        {field("役職", "position")}
        {field("郵便番号", "postalCode")}
        {field("電話番号", "phone")}
        <div className="sm:col-span-2">{field("住所", "address")}</div>
        <div className="sm:col-span-2">{field("メールアドレス", "email", "email")}</div>
        {field("入社日", "startDate", "date")}
        {field("退職日", "endDate", "date")}
      </div>
      <div className="mt-6 flex gap-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "保存中..." : "保存"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          キャンセル
        </button>
      </div>
    </form>
  );
}
