import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

// conditionJson は {questionKey, equals} のオブジェクトでも文字列でも受け付ける
function normalizeCondition(value: unknown, questionKey?: string, equals?: string): string | null {
  if (value && typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string" && value.trim()) {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return null;
    }
  }
  if (questionKey && equals !== undefined) {
    return JSON.stringify({ questionKey, equals });
  }
  return null;
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const b = await req.json();
    if (!b.documentId || !b.procedureTypeId || !b.workerTypeId) {
      return NextResponse.json({ error: "書類・手続き・区分は必須です" }, { status: 400 });
    }
    const conditionJson = normalizeCondition(b.conditionJson, b.questionKey, b.equals);
    if (!conditionJson) {
      return NextResponse.json({ error: "条件（questionKey と equals）を指定してください" }, { status: 400 });
    }
    if (!b.resultRequiredLevel) {
      return NextResponse.json({ error: "判定結果（必要度）は必須です" }, { status: 400 });
    }
    const item = await prisma.documentJudgementRule.create({
      data: {
        documentId: b.documentId,
        procedureTypeId: b.procedureTypeId,
        workerTypeId: b.workerTypeId,
        conditionJson,
        resultRequiredLevel: b.resultRequiredLevel,
        resultMessage: b.resultMessage || null,
        sortOrder: Number(b.sortOrder) || 0,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  });
}
