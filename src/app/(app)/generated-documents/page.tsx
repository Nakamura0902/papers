import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getWorkerTypeMap } from "@/lib/masters";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function GeneratedDocumentsPage() {
  const [items, workerTypeMap] = await Promise.all([
    prisma.generatedDocument.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { document: true, employee: true, procedureType: true, workerType: true, createdBy: true },
    }),
    getWorkerTypeMap(),
  ]);

  return (
    <div>
      <PageHeader title="作成履歴" description="作成した書類の履歴です。再ダウンロードや再編集ができます。" />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">作成日</th>
              <th className="px-4 py-3 font-medium">書類名</th>
              <th className="px-4 py-3 font-medium">対象者</th>
              <th className="px-4 py-3 font-medium">手続き</th>
              <th className="px-4 py-3 font-medium">区分</th>
              <th className="px-4 py-3 font-medium">作成者</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  まだ書類は作成されていません。
                </td>
              </tr>
            ) : (
              items.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{g.createdAt.toLocaleDateString("ja-JP")}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{g.document.name}</td>
                  <td className="px-4 py-3 text-gray-600">{g.employee?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{g.procedureType?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {g.workerType ? workerTypeMap[g.workerType.key] ?? g.workerType.name : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{g.createdBy?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/generated-documents/${g.id}`} className="text-brand-600 hover:underline">
                      詳細
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
