import Link from "next/link";
import { getProcedureTypes } from "@/lib/masters";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function ProceduresPage() {
  const procedures = await getProcedureTypes();

  return (
    <div>
      <PageHeader
        title="手続きナビ"
        description="まず「何の手続きか」を選んでください。次に対象者区分を選ぶと、関係する書類候補が表示されます。"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {procedures.map((p) => (
          <Link
            key={p.key}
            href={`/procedures/${p.key}/worker-types`}
            className="card p-5 transition-shadow hover:shadow-md"
          >
            <div className="text-lg font-semibold text-gray-900">{p.name}</div>
            {p.description && (
              <p className="mt-1 text-sm text-gray-500">{p.description}</p>
            )}
            <div className="mt-3 text-xs text-brand-600">対象者区分を選ぶ →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
