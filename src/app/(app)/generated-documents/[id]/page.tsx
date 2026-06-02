import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import HistoryActions from "./HistoryActions";

export const dynamic = "force-dynamic";

export default async function GeneratedDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.generatedDocument.findFirst({
    where: { id, deletedAt: null },
    include: { document: true, employee: true, procedureType: true, workerType: true, createdBy: true },
  });
  if (!item) notFound();

  let formData: Record<string, unknown> = {};
  try {
    formData = JSON.parse(item.formDataJson);
  } catch {
    formData = {};
  }

  const meta: [string, string][] = [
    ["書類名", item.document.name],
    ["対象者", item.employee?.name ?? "-"],
    ["手続き", item.procedureType?.name ?? "-"],
    ["対象者区分", item.workerType?.name ?? "-"],
    ["作成者", item.createdBy?.name ?? "-"],
    ["作成日", item.createdAt.toLocaleString("ja-JP")],
  ];

  return (
    <div>
      <PageHeader
        title={item.title}
        description="作成履歴の詳細"
        action={
          <HistoryActions
            id={item.id}
            documentKey={item.document.key}
            documentName={item.document.name}
            formData={formData}
            procedureKey={item.procedureType?.key}
            workerTypeKey={item.workerType?.key}
            employeeId={item.employeeId ?? undefined}
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {meta.map(([k, v]) => (
                <tr key={k}>
                  <th className="w-1/3 bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">{k}</th>
                  <td className="px-4 py-3 text-gray-900">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">入力内容</h2>
          {Object.keys(formData).length === 0 ? (
            <p className="text-sm text-gray-400">入力内容がありません。</p>
          ) : (
            <dl className="space-y-1.5 text-sm">
              {Object.entries(formData).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="shrink-0 text-gray-400">{k}：</dt>
                  <dd className="text-gray-700">
                    {Array.isArray(v) ? v.join("、") : String(v ?? "-") || "-"}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">PDFプレビュー</h2>
        <iframe
          src={`/api/generated-documents/${item.id}/pdf`}
          title="pdf"
          className="h-[600px] w-full rounded-lg border border-gray-300 bg-white"
        />
      </div>
    </div>
  );
}
