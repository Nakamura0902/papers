import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import RequiredLevelBadge from "@/components/RequiredLevelBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [docCount, employeeCount, recent, procedures] = await Promise.all([
    prisma.generatedDocument.count({ where: { deletedAt: null } }),
    prisma.employee.count({ where: { deletedAt: null } }),
    prisma.generatedDocument.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { document: true, employee: true, procedureType: true },
    }),
    prisma.procedureType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
  ]);

  const stats = [
    { label: "作成した書類", value: docCount, unit: "件" },
    { label: "登録従業員", value: employeeCount, unit: "名" },
    { label: "手続き種別", value: procedures.length ? "9" : "0", unit: "種" },
  ];

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        description="社内手続きの必要書類を確認し、PDFを作成できます。"
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {s.value}
              <span className="ml-1 text-sm font-normal text-gray-500">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* よく使う手続き */}
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">手続きから始める</h2>
          <div className="grid grid-cols-2 gap-2">
            {procedures.map((p) => (
              <Link
                key={p.key}
                href={`/procedures/${p.key}/worker-types`}
                className="rounded-lg border border-gray-200 px-3 py-3 text-sm text-gray-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                {p.name}
              </Link>
            ))}
          </div>
          <Link href="/procedures" className="mt-3 inline-block text-xs text-brand-600 hover:underline">
            すべての手続きを見る →
          </Link>
        </div>

        {/* 最近作成した書類 */}
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">最近作成した書類</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400">まだ書類は作成されていません。</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent.map((g) => (
                <li key={g.id} className="py-2">
                  <Link
                    href={`/generated-documents/${g.id}`}
                    className="flex items-center justify-between text-sm hover:text-brand-600"
                  >
                    <span className="truncate">{g.title}</span>
                    <span className="ml-2 shrink-0 text-xs text-gray-400">
                      {g.createdAt.toLocaleDateString("ja-JP")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="flex items-center gap-2">
          <RequiredLevelBadge level="確認が必要" />
          <span className="text-sm text-gray-600">
            本ツールは法務・労務判断を代替するものではありません。判断が難しい書類は社内担当者や専門家にご確認ください。
          </span>
        </div>
      </div>
    </div>
  );
}
