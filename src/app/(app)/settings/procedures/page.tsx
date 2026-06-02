import { prisma } from "@/lib/prisma";
import SimpleMasterManager from "../SimpleMasterManager";

export const dynamic = "force-dynamic";

export default async function SettingsProceduresPage() {
  const procedures = await prisma.procedureType.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <SimpleMasterManager
      endpoint="/api/settings/procedures"
      label="手続き"
      hasDescription
      items={procedures.map((p) => ({
        id: p.id,
        key: p.key,
        name: p.name,
        description: p.description,
        sortOrder: p.sortOrder,
        isActive: p.isActive,
      }))}
    />
  );
}
