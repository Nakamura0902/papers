import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWorkerTypeMap } from "@/lib/masters";
import PageHeader from "@/components/PageHeader";
import DeleteEmployeeButton from "./DeleteEmployeeButton";

export const dynamic = "force-dynamic";

function fmt(d: Date | null): string {
  return d ? d.toLocaleDateString("ja-JP") : "-";
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employee, workerTypeMap, generated] = await Promise.all([
    prisma.employee.findFirst({ where: { id, deletedAt: null } }),
    getWorkerTypeMap(),
    prisma.generatedDocument.findMany({
      where: { employeeId: id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { document: true },
    }),
  ]);

  if (!employee) notFound();

  const rows: [string, string][] = [
    ["フリガナ", employee.nameKana ?? "-"],
    ["対象者区分", employee.employmentType ? workerTypeMap[employee.employmentType] ?? "-" : "-"],
    ["生年月日", fmt(employee.birthDate)],
    ["部署", employee.department ?? "-"],
    ["役職", employee.position ?? "-"],
    ["郵便番号", employee.postalCode ?? "-"],
    ["住所", employee.address ?? "-"],
    ["電話番号", employee.phone ?? "-"],
    ["メール", employee.email ?? "-"],
    ["入社日", fmt(employee.startDate)],
    ["退職日", fmt(employee.endDate)],
  ];

  return (
    <div>
      <PageHeader
        title={employee.name}
        description="従業員詳細"
        action={
          <div className="flex gap-2">
            <Link href={`/employees/${employee.id}/edit`} className="btn-secondary">
              編集
            </Link>
            <DeleteEmployeeButton id={employee.id} />
          </div>
        }
      />

      <div className="card max-w-2xl overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {rows.map(([k, v]) => (
              <tr key={k}>
                <th className="w-1/3 bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">{k}</th>
                <td className="px-4 py-3 text-gray-900">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 card max-w-2xl p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">この従業員の作成書類</h2>
        {generated.length === 0 ? (
          <p className="text-sm text-gray-400">まだ書類は作成されていません。</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {generated.map((g) => (
              <li key={g.id} className="py-2">
                <Link href={`/generated-documents/${g.id}`} className="flex justify-between text-sm hover:text-brand-600">
                  <span>{g.title}</span>
                  <span className="text-xs text-gray-400">{g.createdAt.toLocaleDateString("ja-JP")}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
