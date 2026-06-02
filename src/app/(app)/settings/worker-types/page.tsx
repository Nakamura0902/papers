import { prisma } from "@/lib/prisma";
import SimpleMasterManager from "../SimpleMasterManager";

export const dynamic = "force-dynamic";

export default async function SettingsWorkerTypesPage() {
  const workerTypes = await prisma.workerType.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <SimpleMasterManager
      endpoint="/api/settings/worker-types"
      label="対象者区分"
      hasDescription
      items={workerTypes.map((w) => ({
        id: w.id,
        key: w.key,
        name: w.name,
        description: w.description,
        sortOrder: w.sortOrder,
        isActive: w.isActive,
      }))}
    />
  );
}
