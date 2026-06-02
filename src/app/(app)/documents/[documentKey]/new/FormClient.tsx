"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import NoticeBox from "@/components/NoticeBox";
import DynamicForm from "@/components/DynamicForm";
import { loadFlow, saveFlow, singleFlow, type DocFlow } from "@/lib/flow";
import type { FormSchema } from "@/types";

interface FormMeta {
  document: {
    key: string;
    name: string;
    purpose: string | null;
    notes: string | null;
    requiresSignature: boolean;
    requiresCompanySeal: boolean;
  };
  schema: FormSchema;
}

export default function FormClient({ documentKey }: { documentKey: string }) {
  const router = useRouter();
  const [meta, setMeta] = useState<FormMeta | null>(null);
  const [flow, setFlow] = useState<DocFlow | null>(null);
  const [initial, setInitial] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/documents/${documentKey}/form`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: FormMeta) => setMeta(d))
      .catch(() => setError("フォームの読み込みに失敗しました"));

    const f = loadFlow();
    setFlow(f);
    const item = f?.items.find((i) => i.documentKey === documentKey);
    if (item?.formData) setInitial(item.formData);
  }, [documentKey]);

  function handleSubmit(data: Record<string, unknown>) {
    // フローへ保存（無ければ単一フローを生成）
    let f = flow;
    if (!f || !f.items.some((i) => i.documentKey === documentKey)) {
      f = singleFlow(documentKey, meta?.document.name ?? documentKey);
      f.current = 0;
    }
    const idx = f.items.findIndex((i) => i.documentKey === documentKey);
    f.items[idx] = { ...f.items[idx], documentName: meta?.document.name ?? documentKey, formData: data };
    f.current = idx;
    saveFlow(f);
    router.push("/documents/preview");
  }

  if (error) return <NoticeBox variant="danger">{error}</NoticeBox>;
  if (!meta) return <div className="text-sm text-gray-400">読み込み中...</div>;

  const total = flow?.items.length ?? 1;
  const pos = flow ? flow.items.findIndex((i) => i.documentKey === documentKey) + 1 : 1;

  return (
    <div>
      <PageHeader
        title={meta.document.name}
        description={meta.document.purpose ?? "入力フォーム"}
      />
      {total > 1 && (
        <div className="mb-4 text-sm text-gray-500">
          書類 {pos} / {total} 件目
        </div>
      )}
      {meta.document.notes && (
        <div className="mb-4">
          <NoticeBox variant="warning">{meta.document.notes}</NoticeBox>
        </div>
      )}
      <DynamicForm schema={meta.schema} initial={initial} onSubmit={handleSubmit} />
    </div>
  );
}
