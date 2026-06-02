import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWorkerTypes } from "@/lib/masters";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function WorkerTypesPage({
  params,
}: {
  params: Promise<{ procedureKey: string }>;
}) {
  const { procedureKey } = await params;
  const [procedure, workerTypes] = await Promise.all([
    prisma.procedureType.findUnique({ where: { key: procedureKey } }),
    getWorkerTypes(),
  ]);
  if (!procedure) notFound();

  return (
    <div>
      <PageHeader
        title={`${procedure.name}：対象者区分を選ぶ`}
        description="手続きの対象者区分を選んでください。区分により必要な書類が変わります。"
      />
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/procedures" className="text-brand-600 hover:underline">
          手続きナビ
        </Link>
        <span className="mx-1">/</span>
        <span>{procedure.name}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workerTypes.map((w) => (
          <Link
            key={w.key}
            href={`/procedures/${procedure.key}/${w.key}/documents`}
            className="card p-5 transition-shadow hover:shadow-md"
          >
            <div className="text-lg font-semibold text-gray-900">{w.name}</div>
            <div className="mt-3 text-xs text-brand-600">書類候補を見る →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
