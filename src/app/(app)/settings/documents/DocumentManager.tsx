"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import RequiredLevelBadge from "@/components/RequiredLevelBadge";
import { REQUIRED_LEVELS } from "@/types";

interface DocItem {
  id: string;
  key: string;
  name: string;
  category: string;
  defaultRequiredLevel: string;
  purpose: string | null;
  whenRequired: string | null;
  whenNotRequired: string | null;
  submissionTo: string | null;
  storageLocation: string | null;
  requiresSignature: boolean;
  requiresCompanySeal: boolean;
  notes: string | null;
  isActive: boolean;
  schemaJson: string;
}

interface DocForm {
  key: string;
  name: string;
  category: string;
  defaultRequiredLevel: string;
  purpose: string;
  whenRequired: string;
  whenNotRequired: string;
  submissionTo: string;
  storageLocation: string;
  requiresSignature: boolean;
  requiresCompanySeal: boolean;
  notes: string;
  isActive: boolean;
  schemaJson: string;
}

const empty: DocForm = {
  key: "",
  name: "",
  category: "retirement",
  defaultRequiredLevel: "確認が必要",
  purpose: "",
  whenRequired: "",
  whenNotRequired: "",
  submissionTo: "",
  storageLocation: "",
  requiresSignature: false,
  requiresCompanySeal: false,
  notes: "",
  isActive: true,
  schemaJson: '{\n  "sections": [\n    { "title": "基本情報", "fields": [\n      { "name": "employeeName", "label": "氏名", "type": "text", "required": true }\n    ] }\n  ]\n}',
};

export default function DocumentManager({ items }: { items: DocItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DocItem | null>(null);
  const [form, setForm] = useState<DocForm>(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function openNew() {
    setEditing(null);
    setForm(empty);
    setError("");
    setOpen(true);
  }
  function openEdit(it: DocItem) {
    setEditing(it);
    const { id: _id, ...rest } = it;
    void _id;
    setForm({ ...rest, purpose: it.purpose ?? "", whenRequired: it.whenRequired ?? "", whenNotRequired: it.whenNotRequired ?? "", submissionTo: it.submissionTo ?? "", storageLocation: it.storageLocation ?? "", notes: it.notes ?? "", schemaJson: it.schemaJson || empty.schemaJson });
    setError("");
    setOpen(true);
  }

  async function save() {
    if (!form.key || !form.name) {
      setError("key と名称は必須です");
      return;
    }
    setBusy(true);
    setError("");
    const url = editing ? `/api/settings/documents/${editing.id}` : "/api/settings/documents";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "保存に失敗しました");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function remove(it: DocItem) {
    if (!confirm(`「${it.name}」を削除しますか？`)) return;
    const res = await fetch(`/api/settings/documents/${it.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "削除に失敗しました");
      return;
    }
    router.refresh();
  }

  const inputRow = (label: string, key: keyof typeof form, type = "text") => (
    <div>
      <label className="label">{label}</label>
      <input type={type} className="input" value={form[key] as string} onChange={(e) => set(key, e.target.value as never)} />
    </div>
  );

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={openNew} className="btn-primary">+ 書類を追加</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">書類名</th>
              <th className="px-4 py-3 font-medium">key</th>
              <th className="px-4 py-3 font-medium">カテゴリ</th>
              <th className="px-4 py-3 font-medium">初期必要度</th>
              <th className="px-4 py-3 font-medium">有効</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{it.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{it.key}</td>
                <td className="px-4 py-3 text-gray-600">{it.category === "retirement" ? "退職" : it.category === "onboarding" ? "入社" : it.category}</td>
                <td className="px-4 py-3"><RequiredLevelBadge level={it.defaultRequiredLevel} /></td>
                <td className="px-4 py-3 text-gray-600">{it.isActive ? "○" : "×"}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => openEdit(it)} className="text-brand-600 hover:underline">編集</button>
                  <button onClick={() => remove(it)} className="ml-3 text-red-600 hover:underline">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal title={editing ? "書類の編集" : "書類の追加"} open={open} onClose={() => setOpen(false)}>
        {error && <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">key（英数字）</label>
            <input className="input" value={form.key} disabled={!!editing} onChange={(e) => set("key", e.target.value)} />
          </div>
          {inputRow("書類名", "name")}
          <div>
            <label className="label">カテゴリ</label>
            <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="retirement">退職</option>
              <option value="onboarding">入社</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div>
            <label className="label">初期必要度</label>
            <select className="input" value={form.defaultRequiredLevel} onChange={(e) => set("defaultRequiredLevel", e.target.value)}>
              {REQUIRED_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">何を記すものか</label>
            <textarea className="input" value={form.purpose} onChange={(e) => set("purpose", e.target.value)} />
          </div>
          {inputRow("必要になる条件", "whenRequired")}
          {inputRow("不要になる条件", "whenNotRequired")}
          {inputRow("提出先", "submissionTo")}
          {inputRow("社内保存先", "storageLocation")}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.requiresSignature} onChange={(e) => set("requiresSignature", e.target.checked)} />
            本人署名が必要
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.requiresCompanySeal} onChange={(e) => set("requiresCompanySeal", e.target.checked)} />
            会社印が必要
          </label>
          <div className="sm:col-span-2">
            <label className="label">注意事項</label>
            <textarea className="input" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">入力フォーム定義（schemaJson）</label>
            <textarea className="input font-mono text-xs min-h-[160px]" value={form.schemaJson} onChange={(e) => set("schemaJson", e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">{`{ "sections": [ { "title": "...", "fields": [ { "name", "label", "type", "required", "options" } ] } ] }`}</p>
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            有効にする
          </label>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={save} className="btn-primary" disabled={busy}>{busy ? "保存中..." : "保存"}</button>
          <button onClick={() => setOpen(false)} className="btn-secondary">キャンセル</button>
        </div>
      </Modal>
    </div>
  );
}
