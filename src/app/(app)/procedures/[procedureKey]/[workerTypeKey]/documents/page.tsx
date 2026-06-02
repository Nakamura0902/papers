import Link from "next/link";
import { notFound } from "next/navigation";
import { getCandidateDocuments } from "@/lib/candidates";
import PageHeader from "@/components/PageHeader";
import NoticeBox from "@/components/NoticeBox";
import DocumentsClient from "./DocumentsClient";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ procedureKey: string; workerTypeKey: string }>;
}) {
  const { procedureKey, workerTypeKey } = await params;
  const result = await getCandidateDocuments(procedureKey, workerTypeKey);
  if (!result || !result.procedure || !result.workerType) notFound();

  return (
    <div>
      <PageHeader
        title="必要書類の確認"
        description="各書類の説明と確認質問に答えると、必要度の目安が表示されます。作成する書類を選んでください。"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <Link href="/procedures" className="text-brand-600 hover:underline">
          手続きナビ
        </Link>
        <span className="text-gray-400">/</span>
        <Link href={`/procedures/${procedureKey}/worker-types`} className="text-brand-600 hover:underline">
          {result.procedure.name}
        </Link>
        <span className="text-gray-400">/</span>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
          {result.procedure.name} × {result.workerType.name}
        </span>
      </div>

      {result.documents.length === 0 ? (
        <NoticeBox variant="info">
          この「{result.procedure.name} × {result.workerType.name}」の組み合わせには、まだ書類候補ルールが登録されていません。
          現在は「退職 × アルバイト・パート」の候補が登録されています。マスタ管理から候補ルールを追加できます。
        </NoticeBox>
      ) : (
        <DocumentsClient
          procedureKey={result.procedure.key}
          procedureName={result.procedure.name}
          workerTypeKey={result.workerType.key}
          workerTypeName={result.workerType.name}
          documents={result.documents}
        />
      )}
    </div>
  );
}
