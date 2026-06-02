import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

// optionsJson は配列でも文字列(JSON)でも受け付ける
function normalizeOptions(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) return JSON.stringify(value);
  try {
    JSON.parse(String(value));
    return String(value);
  } catch {
    // 改行/カンマ区切りの素テキストを配列化
    const arr = String(value)
      .split(/[\n,、]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return JSON.stringify(arr);
  }
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const b = await req.json();
    if (!b.documentId || !b.procedureTypeId || !b.workerTypeId || !b.key || !b.questionText) {
      return NextResponse.json({ error: "書類・手続き・区分・key・質問文は必須です" }, { status: 400 });
    }
    const item = await prisma.documentJudgementQuestion.create({
      data: {
        documentId: b.documentId,
        procedureTypeId: b.procedureTypeId,
        workerTypeId: b.workerTypeId,
        key: b.key,
        questionText: b.questionText,
        inputType: b.inputType || "radio",
        optionsJson: normalizeOptions(b.optionsJson ?? b.options),
        helpText: b.helpText || null,
        sortOrder: Number(b.sortOrder) || 0,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  });
}
