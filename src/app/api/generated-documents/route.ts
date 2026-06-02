import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function GET() {
  return withAuth(async () => {
    const items = await prisma.generatedDocument.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        document: true,
        employee: true,
        procedureType: true,
        workerType: true,
        createdBy: true,
      },
    });
    return NextResponse.json({ items });
  });
}
