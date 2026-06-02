import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ procedureKey: string }> }
) {
  return withAuth(async () => {
    const { procedureKey } = await params;
    const procedure = await prisma.procedureType.findUnique({ where: { key: procedureKey } });
    if (!procedure) {
      return NextResponse.json({ error: "手続きが見つかりません" }, { status: 404 });
    }
    const workerTypes = await prisma.workerType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ procedure, workerTypes });
  });
}
