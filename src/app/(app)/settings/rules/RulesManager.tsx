"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import RequiredLevelBadge from "@/components/RequiredLevelBadge";
import { REQUIRED_LEVELS } from "@/types";

interface Ref {
  id: string;
  key: string;
  name: string;
}
interface Candidate {
  id: string;
  procedureTypeId: string;
  workerTypeId: string;
  documentId: string;
  defaultRequiredLevel: string;
  displayReason: string | null;
  sortOrder: number;
}
interface Question {
  id: string;
  documentId: string;
  procedureTypeId: string;
  workerTypeId: string;
  key: string;
  questionText: string;
  optionsJson: string | null;
  helpText: string | null;
  sortOrder: number;
}
interface JRule {
  id: string;
  documentId: string;
  procedureTypeId: string;
  workerTypeId: string;
  conditionJson: string;
  resultRequiredLevel: string;
  resultMessage: string | null;
  sortOrder: number;
}

export default function RulesManager({
  procedures,
  workerTypes,
  documents,
  candidates,
  questions,
  judgementRules,
}: {
  procedures: Ref[];
  workerTypes: Ref[];
  documents: Ref[];
  candidates: Candidate[];
  questions: Question[];
  judgementRules: JRule[];
}) {
  const router = useRouter();
  const pName = (id: string) => procedures.find((p) => p.id === id)?.name ?? "-";
  const wName = (id: string) => workerTypes.find((w) => w.id === id)?.name ?? "-";
  const dName = (id: string) => documents.find((d) => d.id === id)?.name ?? "-";

  // 共通の組み合わせ selecter（手続き/区分/書類）
  const scopeSelectors = (
    form: { procedureTypeId: string; workerTypeId: string; documentId: string },
    set: (k: "procedureTypeId" | "workerTypeId" | "documentId", v: string) => void,
    disabled = false
  ) => (
    <>
      <div>
        <label className="label">手続き</label>
        <select className="input" value={form.procedureTypeId} disabled={disabled} onChange={(e) => set("procedureTypeId", e.target.value)}>
          <option value="">選択</option>
          {procedures.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">対象者区分</label>
        <select className="input" value={form.workerTypeId} disabled={disabled} onChange={(e) => set("workerTypeId", e.target.value)}>
          <option value="">選択</option>
          {workerTypes.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">書類</label>
        <select className="input" value={form.documentId} disabled={disabled} onChange={(e) => set("documentId", e.target.value)}>
          <option value="">選択</option>
          {documents.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <div className="space-y-10">
      <CandidateSection
        items={candidates}
        pName={pName} wName={wName} dName={dName}
        scopeSelectors={scopeSelectors}
        onChanged={() => router.refresh()}
      />
      <QuestionSection
        items={questions}
        dName={dName} pName={pName} wName={wName}
        scopeSelectors={scopeSelectors}
        onChanged={() => router.refresh()}
      />
      <JudgementSection
        items={judgementRules}
        questions={questions}
        dName={dName} pName={pName} wName={wName}
        scopeSelectors={scopeSelectors}
        onChanged={() => router.refresh()}
      />
    </div>
  );
}

/* ---------------- 候補ルール ---------------- */
function CandidateSection({ items, pName, wName, dName, scopeSelectors, onChanged }: any) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [form, setForm] = useState({ procedureTypeId: "", workerTypeId: "", documentId: "", defaultRequiredLevel: "確認が必要", displayReason: "", sortOrder: "0" });
  const [error, setError] = useState("");

  const openNew = () => { setEditing(null); setForm({ procedureTypeId: "", workerTypeId: "", documentId: "", defaultRequiredLevel: "確認が必要", displayReason: "", sortOrder: "0" }); setError(""); setOpen(true); };
  const openEdit = (it: Candidate) => { setEditing(it); setForm({ procedureTypeId: it.procedureTypeId, workerTypeId: it.workerTypeId, documentId: it.documentId, defaultRequiredLevel: it.defaultRequiredLevel, displayReason: it.displayReason ?? "", sortOrder: String(it.sortOrder) }); setError(""); setOpen(true); };

  async function save() {
    const url = editing ? `/api/settings/candidate-rules/${editing.id}` : "/api/settings/candidate-rules";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "保存に失敗しました"); return; }
    setOpen(false); onChanged();
  }
  async function remove(it: Candidate) {
    if (!confirm("この候補ルールを削除しますか？")) return;
    await fetch(`/api/settings/candidate-rules/${it.id}`, { method: "DELETE" }); onChanged();
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">候補表示ルール</h2>
        <button onClick={openNew} className="btn-primary">+ 追加</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500"><tr>
            <th className="px-4 py-3 font-medium">手続き × 区分</th><th className="px-4 py-3 font-medium">書類</th><th className="px-4 py-3 font-medium">初期必要度</th><th className="px-4 py-3 font-medium">表示理由</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((c: Candidate) => (
              <tr key={c.id}>
                <td className="px-4 py-3 text-gray-600">{pName(c.procedureTypeId)} × {wName(c.workerTypeId)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{dName(c.documentId)}</td>
                <td className="px-4 py-3"><RequiredLevelBadge level={c.defaultRequiredLevel} /></td>
                <td className="px-4 py-3 text-xs text-gray-500">{c.displayReason ?? "-"}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => openEdit(c)} className="text-brand-600 hover:underline">編集</button>
                  <button onClick={() => remove(c)} className="ml-3 text-red-600 hover:underline">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal title={editing ? "候補ルールの編集" : "候補ルールの追加"} open={open} onClose={() => setOpen(false)}>
        {error && <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {scopeSelectors(form, (k: any, v: string) => setForm({ ...form, [k]: v }), !!editing)}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">初期必要度</label>
            <select className="input" value={form.defaultRequiredLevel} onChange={(e) => setForm({ ...form, defaultRequiredLevel: e.target.value })}>
              {REQUIRED_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">並び順</label>
            <input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">表示理由</label>
            <input className="input" value={form.displayReason} onChange={(e) => setForm({ ...form, displayReason: e.target.value })} />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={save} className="btn-primary">保存</button>
          <button onClick={() => setOpen(false)} className="btn-secondary">キャンセル</button>
        </div>
      </Modal>
    </section>
  );
}

/* ---------------- 判定質問 ---------------- */
function QuestionSection({ items, dName, pName, wName, scopeSelectors, onChanged }: any) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState({ documentId: "", procedureTypeId: "", workerTypeId: "", key: "", questionText: "", options: "", helpText: "", sortOrder: "0" });
  const [error, setError] = useState("");

  const optsToText = (json: string | null) => { if (!json) return ""; try { return (JSON.parse(json) as string[]).join("\n"); } catch { return ""; } };

  const openNew = () => { setEditing(null); setForm({ documentId: "", procedureTypeId: "", workerTypeId: "", key: "", questionText: "", options: "", helpText: "", sortOrder: "0" }); setError(""); setOpen(true); };
  const openEdit = (it: Question) => { setEditing(it); setForm({ documentId: it.documentId, procedureTypeId: it.procedureTypeId, workerTypeId: it.workerTypeId, key: it.key, questionText: it.questionText, options: optsToText(it.optionsJson), helpText: it.helpText ?? "", sortOrder: String(it.sortOrder) }); setError(""); setOpen(true); };

  async function save() {
    const url = editing ? `/api/settings/questions/${editing.id}` : "/api/settings/questions";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, optionsJson: form.options }) });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "保存に失敗しました"); return; }
    setOpen(false); onChanged();
  }
  async function remove(it: Question) { if (!confirm("この質問を削除しますか？")) return; await fetch(`/api/settings/questions/${it.id}`, { method: "DELETE" }); onChanged(); }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">判定質問</h2>
        <button onClick={openNew} className="btn-primary">+ 追加</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500"><tr>
            <th className="px-4 py-3 font-medium">書類</th><th className="px-4 py-3 font-medium">key</th><th className="px-4 py-3 font-medium">質問</th><th className="px-4 py-3 font-medium">選択肢</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((q: Question) => (
              <tr key={q.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{dName(q.documentId)}<div className="text-xs font-normal text-gray-400">{pName(q.procedureTypeId)}×{wName(q.workerTypeId)}</div></td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{q.key}</td>
                <td className="px-4 py-3 text-gray-600">{q.questionText}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{optsToText(q.optionsJson).split("\n").join(" / ")}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => openEdit(q)} className="text-brand-600 hover:underline">編集</button>
                  <button onClick={() => remove(q)} className="ml-3 text-red-600 hover:underline">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal title={editing ? "判定質問の編集" : "判定質問の追加"} open={open} onClose={() => setOpen(false)}>
        {error && <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {scopeSelectors(form, (k: any, v: string) => setForm({ ...form, [k]: v }), !!editing)}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><label className="label">質問 key</label><input className="input" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} /></div>
          <div><label className="label">並び順</label><input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">質問文</label><input className="input" value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">選択肢（1行に1つ）</label><textarea className="input min-h-[90px]" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">補足</label><input className="input" value={form.helpText} onChange={(e) => setForm({ ...form, helpText: e.target.value })} /></div>
        </div>
        <div className="mt-5 flex gap-2"><button onClick={save} className="btn-primary">保存</button><button onClick={() => setOpen(false)} className="btn-secondary">キャンセル</button></div>
      </Modal>
    </section>
  );
}

/* ---------------- 判定ルール ---------------- */
function JudgementSection({ items, questions, dName, pName, wName, scopeSelectors, onChanged }: any) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JRule | null>(null);
  const [form, setForm] = useState({ documentId: "", procedureTypeId: "", workerTypeId: "", questionKey: "", equals: "", resultRequiredLevel: "確認が必要", resultMessage: "", sortOrder: "0" });
  const [error, setError] = useState("");

  const parseCond = (json: string) => { try { return JSON.parse(json) as { questionKey?: string; equals?: string }; } catch { return {}; } };

  const openNew = () => { setEditing(null); setForm({ documentId: "", procedureTypeId: "", workerTypeId: "", questionKey: "", equals: "", resultRequiredLevel: "確認が必要", resultMessage: "", sortOrder: "0" }); setError(""); setOpen(true); };
  const openEdit = (it: JRule) => { const c = parseCond(it.conditionJson); setEditing(it); setForm({ documentId: it.documentId, procedureTypeId: it.procedureTypeId, workerTypeId: it.workerTypeId, questionKey: c.questionKey ?? "", equals: c.equals ?? "", resultRequiredLevel: it.resultRequiredLevel, resultMessage: it.resultMessage ?? "", sortOrder: String(it.sortOrder) }); setError(""); setOpen(true); };

  async function save() {
    const url = editing ? `/api/settings/judgement-rules/${editing.id}` : "/api/settings/judgement-rules";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "保存に失敗しました"); return; }
    setOpen(false); onChanged();
  }
  async function remove(it: JRule) { if (!confirm("この判定ルールを削除しますか？")) return; await fetch(`/api/settings/judgement-rules/${it.id}`, { method: "DELETE" }); onChanged(); }

  // 選択中の書類に紐づく質問キーの候補
  const keyOptions: string[] = Array.from(new Set((questions as Question[]).filter((q) => !form.documentId || q.documentId === form.documentId).map((q) => q.key)));

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">判定ルール</h2>
        <button onClick={openNew} className="btn-primary">+ 追加</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500"><tr>
            <th className="px-4 py-3 font-medium">書類</th><th className="px-4 py-3 font-medium">条件</th><th className="px-4 py-3 font-medium">判定</th><th className="px-4 py-3 font-medium">メッセージ</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((r: JRule) => { const c = parseCond(r.conditionJson); return (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{dName(r.documentId)}<div className="text-xs font-normal text-gray-400">{pName(r.procedureTypeId)}×{wName(r.workerTypeId)}</div></td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.questionKey} = {c.equals}</td>
                <td className="px-4 py-3"><RequiredLevelBadge level={r.resultRequiredLevel} /></td>
                <td className="px-4 py-3 text-xs text-gray-500">{r.resultMessage ?? "-"}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => openEdit(r)} className="text-brand-600 hover:underline">編集</button>
                  <button onClick={() => remove(r)} className="ml-3 text-red-600 hover:underline">削除</button>
                </td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
      <Modal title={editing ? "判定ルールの編集" : "判定ルールの追加"} open={open} onClose={() => setOpen(false)}>
        {error && <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {scopeSelectors(form, (k: any, v: string) => setForm({ ...form, [k]: v }), !!editing)}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">質問 key</label>
            <input className="input" list="qkeys" value={form.questionKey} onChange={(e) => setForm({ ...form, questionKey: e.target.value })} />
            <datalist id="qkeys">{keyOptions.map((k) => <option key={k} value={k} />)}</datalist>
          </div>
          <div><label className="label">回答（equals）</label><input className="input" value={form.equals} onChange={(e) => setForm({ ...form, equals: e.target.value })} /></div>
          <div>
            <label className="label">判定結果（必要度）</label>
            <select className="input" value={form.resultRequiredLevel} onChange={(e) => setForm({ ...form, resultRequiredLevel: e.target.value })}>
              {REQUIRED_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div><label className="label">並び順</label><input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">メッセージ</label><input className="input" value={form.resultMessage} onChange={(e) => setForm({ ...form, resultMessage: e.target.value })} /></div>
        </div>
        <div className="mt-5 flex gap-2"><button onClick={save} className="btn-primary">保存</button><button onClick={() => setOpen(false)} className="btn-secondary">キャンセル</button></div>
      </Modal>
    </section>
  );
}
