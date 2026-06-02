"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import NoticeBox from "@/components/NoticeBox";
import { loadFlow, saveFlow, clearFlow, type DocFlow } from "@/lib/flow";

export default function PreviewPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [flow, setFlow] = useState<DocFlow | null>(null);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const f = loadFlow();
    if (!f || f.items.length === 0) {
      setError("プレビュー対象がありません。手続きナビから書類を選んでください。");
      setLoading(false);
      return;
    }
    setFlow(f);
    const item = f.items[f.current] ?? f.items[0];
    fetch("/api/documents/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentKey: item.documentKey, formData: item.formData ?? {} }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setHtml(d.html))
      .catch(() => setError("プレビューの生成に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  const current = flow?.items[flow.current];
  const hasNext = flow ? flow.current + 1 < flow.items.length : false;

  async function handleGenerate() {
    if (!flow || !current) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentKey: current.documentKey,
          procedureKey: flow.procedureKey,
          workerTypeKey: flow.workerTypeKey,
          employeeId: flow.employeeId,
          formData: current.formData ?? {},
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "PDF生成に失敗しました");
        return;
      }
      const d = await res.json();
      setGeneratedId(d.id);
      // 自動ダウンロード
      window.open(`/api/generated-documents/${d.id}/pdf?download=1`, "_blank");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setGenerating(false);
    }
  }

  function handlePrint() {
    iframeRef.current?.contentWindow?.print();
  }

  function goNext() {
    if (!flow) return;
    const next = { ...flow, current: flow.current + 1 };
    saveFlow(next);
    router.push(`/documents/${next.items[next.current].documentKey}/new`);
  }

  function finish() {
    clearFlow();
    router.push("/generated-documents");
  }

  return (
    <div>
      <PageHeader
        title="PDFプレビュー"
        description={current ? current.documentName : "プレビュー"}
        action={
          <button className="btn-secondary" onClick={() => router.back()}>
            入力に戻る
          </button>
        }
      />

      {error && (
        <div className="mb-4">
          <NoticeBox variant="danger">{error}</NoticeBox>
        </div>
      )}

      {flow && flow.items.length > 1 && (
        <div className="mb-4 text-sm text-gray-500">
          書類 {flow.current + 1} / {flow.items.length} 件目
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]">
        {/* A4プレビュー */}
        <div className="flex justify-center">
          {loading ? (
            <div className="py-20 text-sm text-gray-400">読み込み中...</div>
          ) : (
            <iframe
              ref={iframeRef}
              srcDoc={html}
              title="preview"
              className="h-[842px] w-[595px] max-w-full rounded-lg border border-gray-300 bg-white shadow"
            />
          )}
        </div>

        {/* 操作パネル */}
        <div className="space-y-3">
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">操作</h3>
            <div className="space-y-2">
              <button
                className="btn-primary w-full"
                onClick={handleGenerate}
                disabled={generating || !current}
              >
                {generating ? "生成中..." : "PDFを生成して保存"}
              </button>
              <button className="btn-secondary w-full" onClick={handlePrint} disabled={loading}>
                印刷
              </button>
              {generatedId && (
                <a
                  className="btn-secondary w-full"
                  href={`/api/generated-documents/${generatedId}/pdf?download=1`}
                  target="_blank"
                  rel="noreferrer"
                >
                  ダウンロード
                </a>
              )}
            </div>
          </div>

          {generatedId && (
            <div className="card p-4">
              <NoticeBox variant="info">PDFを保存し、作成履歴に追加しました。</NoticeBox>
              <div className="mt-3 space-y-2">
                {hasNext ? (
                  <button className="btn-primary w-full" onClick={goNext}>
                    次の書類へ
                  </button>
                ) : null}
                <button className="btn-secondary w-full" onClick={finish}>
                  作成履歴を見る
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
