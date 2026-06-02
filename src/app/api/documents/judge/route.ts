import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { judge } from "@/lib/judge";

// 入力: procedureKey, workerTypeKey, documentKey, answers
// 出力: resultRequiredLevel, resultMessage
export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const { procedureKey, workerTypeKey, documentKey, answers } = await req.json();

    const [procedure, workerType, document] = await Promise.all([
      prisma.procedureType.findUnique({ where: { key: procedureKey } }),
      prisma.workerType.findUnique({ where: { key: workerTypeKey } }),
      prisma.document.findUnique({ where: { key: documentKey } }),
    ]);

    if (!procedure || !workerType || !document) {
      return NextResponse.json({ error: "対象が見つかりません" }, { status: 404 });
    }

    const rules = await prisma.documentJudgementRule.findMany({
      where: {
        documentId: document.id,
        procedureTypeId: procedure.id,
        workerTypeId: workerType.id,
      },
      orderBy: { sortOrder: "asc" },
    });

    const result = judge(rules, answers ?? {}, document.defaultRequiredLevel);
    return NextResponse.json(result);
  });
}
