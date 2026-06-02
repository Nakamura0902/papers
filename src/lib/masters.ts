import { prisma } from "./prisma";

// 対象者区分 key → 名称 のマップ
export async function getWorkerTypeMap(): Promise<Record<string, string>> {
  const types = await prisma.workerType.findMany();
  return Object.fromEntries(types.map((t) => [t.key, t.name]));
}

export async function getWorkerTypes() {
  return prisma.workerType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProcedureTypes() {
  return prisma.procedureType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}
