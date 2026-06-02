import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const b = await req.json();
    const conditionJson = normalizeCondition(b.conditionJson, b.questionKey, b.equals);
    if (!conditionJson) {
      return NextResponse.json({ error: "条件（questionKey と equals）を指定してください" }, { status: 400 });
    }
    const item = await prisma.documentJudgementRule.update({
      where: { id },
      data: {
        conditionJson,
        resultRequiredLevel: b.resultRequiredLevel,
        resultMessage: b.resultMessage || null,
        sortOrder: Number(b.sortOrder) || 0,
      },
    });
    return NextResponse.json({ item });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    await prisma.documentJudgementRule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
