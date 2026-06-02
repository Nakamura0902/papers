import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

function validateSchema(schemaJson: unknown): string | null {
  if (schemaJson === undefined || schemaJson === null || schemaJson === "") return null;
  try {
    const parsed = JSON.parse(String(schemaJson));
    if (!parsed || !Array.isArray(parsed.sections)) {
      return "schemaJson は { sections: [...] } 形式にしてください";
    }
    return null;
  } catch {
    return "schemaJson が正しい JSON ではありません";
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const b = await req.json();
    const schemaErr = validateSchema(b.schemaJson);
    if (schemaErr) return NextResponse.json({ error: schemaErr }, { status: 400 });

    const item = await prisma.document.update({
      where: { id },
      data: {
        name: b.name,
        category: b.category || "retirement",
        purpose: b.purpose || null,
        defaultRequiredLevel: b.defaultRequiredLevel || "確認が必要",
        whenRequired: b.whenRequired || null,
        whenNotRequired: b.whenNotRequired || null,
        submissionTo: b.submissionTo || null,
        storageLocation: b.storageLocation || null,
        requiresSignature: !!b.requiresSignature,
        requiresCompanySeal: !!b.requiresCompanySeal,
        notes: b.notes || null,
        isActive: b.isActive ?? true,
      },
    });

    // フォーム定義の更新（指定があれば置き換え）
    if (b.schemaJson !== undefined) {
      await prisma.documentForm.deleteMany({ where: { documentId: id } });
      if (b.schemaJson) {
        await prisma.documentForm.create({
          data: { documentId: id, schemaJson: String(b.schemaJson) },
        });
      }
    }
    return NextResponse.json({ item });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    try {
      await prisma.document.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json(
        { error: "作成履歴などの関連データがあるため削除できません。無効化をご利用ください。" },
        { status: 409 }
      );
    }
  });
}
