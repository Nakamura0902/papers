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

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const b = await req.json();
    if (!b.key || !b.name) {
      return NextResponse.json({ error: "key と名称は必須です" }, { status: 400 });
    }
    const exists = await prisma.document.findUnique({ where: { key: b.key } });
    if (exists) {
      return NextResponse.json({ error: "同じ key が既に存在します" }, { status: 409 });
    }
    const schemaErr = validateSchema(b.schemaJson);
    if (schemaErr) return NextResponse.json({ error: schemaErr }, { status: 400 });

    const item = await prisma.document.create({
      data: {
        key: b.key,
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
    if (b.schemaJson) {
      await prisma.documentForm.create({
        data: { documentId: item.id, schemaJson: String(b.schemaJson) },
      });
    }
    return NextResponse.json({ item }, { status: 201 });
  });
}
