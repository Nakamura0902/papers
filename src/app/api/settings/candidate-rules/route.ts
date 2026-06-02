import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const b = await req.json();
    if (!b.procedureTypeId || !b.workerTypeId || !b.documentId) {
      return NextResponse.json({ error: "手続き・対象者区分・書類は必須です" }, { status: 400 });
    }
    try {
      const item = await prisma.documentCandidateRule.create({
        data: {
          procedureTypeId: b.procedureTypeId,
          workerTypeId: b.workerTypeId,
          documentId: b.documentId,
          defaultRequiredLevel: b.defaultRequiredLevel || "確認が必要",
          displayReason: b.displayReason || null,
          sortOrder: Number(b.sortOrder) || 0,
        },
      });
      return NextResponse.json({ item }, { status: 201 });
    } catch {
      return NextResponse.json(
        { error: "同じ手続き×区分×書類の候補ルールが既に存在します" },
        { status: 409 }
      );
    }
  });
}
