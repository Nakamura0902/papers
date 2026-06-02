import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

function normalizeOptions(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) return JSON.stringify(value);
  try {
    JSON.parse(String(value));
    return String(value);
  } catch {
    const arr = String(value)
      .split(/[\n,、]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return JSON.stringify(arr);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const b = await req.json();
    const item = await prisma.documentJudgementQuestion.update({
      where: { id },
      data: {
        key: b.key,
        questionText: b.questionText,
        inputType: b.inputType || "radio",
        optionsJson: normalizeOptions(b.optionsJson ?? b.options),
        helpText: b.helpText || null,
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
    await prisma.documentJudgementQuestion.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
