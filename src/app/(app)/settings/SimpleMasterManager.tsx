"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

interface Item {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function SimpleMasterManager({
  endpoint,
  items,
  hasDescription = true,
  label,
}: {
  endpoint: string;
  items: Item[];
  hasDescription?: boolean;
  label: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({ key: "", name: "", description: "", sortOrder: "0", isActive: true });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function openNew() {
    setEditing(null);
    setForm({ key: "", name: "", description: "", sortOrder: String(items.length), isActive: true });
    setError("");
    setOpen(true);
  }

  function openEdit(it: Item) {
    setEditing(it);
    setForm({
      key: it.key,
      name: it.name,
      description: it.description ?? "",
      sortOrder: String(it.sortOrder),
      isActive: it.isActive,
    });
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
    const url = editing ? `${endpoint}/${editing.id}` : endpoint;
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

  async function remove(it: Item) {
    if (!confirm(`「${it.name}」を削除しますか？`)) return;
    const res = await fetch(`${endpoint}/${it.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "削除に失敗しました");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={openNew} className="btn-primary">+ {label}を追加</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">名称</th>
              <th className="px-4 py-3 font-medium">key</th>
              {hasDescription && <th className="px-4 py-3 font-medium">説明</th>}
              <th className="px-4 py-3 font-medium">並び順</th>
              <th className="px-4 py-3 font-medium">有効</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{it.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{it.key}</td>
                {hasDescription && <td className="px-4 py-3 text-gray-600">{it.description ?? "-"}</td>}
                <td className="px-4 py-3 text-gray-600">{it.sortOrder}</td>
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

      <Modal title={editing ? `${label}の編集` : `${label}の追加`} open={open} onClose={() => setOpen(false)}>
        {error && <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="space-y-3">
          <div>
            <label className="label">key（英数字）</label>
            <input className="input" value={form.key} disabled={!!editing}
              onChange={(e) => setForm({ ...form, key: e.target.value })} />
          </div>
          <div>
            <label className="label">名称</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          {hasDescription && (
            <div>
              <label className="label">説明</label>
              <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          )}
          <div>
            <label className="label">並び順</label>
            <input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
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
