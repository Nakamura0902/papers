"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveFlow, singleFlow } from "@/lib/flow";

export default function HistoryActions({
  id,
  documentKey,
  documentName,
  formData,
  procedureKey,
  workerTypeKey,
  employeeId,
}: {
  id: string;
  documentKey: string;
  documentName: string;
  formData: Record<string, unknown>;
  procedureKey?: string;
  workerTypeKey?: string;
  employeeId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function reedit() {
    const flow = singleFlow(documentKey, documentName, {
      procedureKey,
      workerTypeKey,
      employeeId,
    });
    flow.items[0].formData = formData;
    saveFlow(flow);
    router.push(`/documents/${documentKey}/new`);
  }

  async function remove() {
    if (!confirm("この作成履歴を削除しますか？（論理削除されます）")) return;
    setLoading(true);
    const res = await fetch(`/api/generated-documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/generated-documents");
      router.refresh();
    } else {
      alert("削除に失敗しました");
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <a
        href={`/api/generated-documents/${id}/pdf?download=1`}
        target="_blank"
        rel="noreferrer"
        className="btn-secondary"
      >
        PDF再ダウンロード
      </a>
      <button onClick={reedit} className="btn-secondary">
        再編集
      </button>
      <button onClick={remove} className="btn-danger" disabled={loading}>
        {loading ? "削除中..." : "削除"}
      </button>
    </div>
  );
}
