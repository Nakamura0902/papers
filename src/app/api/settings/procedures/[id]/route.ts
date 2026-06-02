import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const b = await req.json();
    const item = await prisma.procedureType.update({
      where: { id },
      data: {
        name: b.name,
        description: b.description || null,
        sortOrder: Number(b.sortOrder) || 0,
        isActive: b.isActive ?? true,
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
    try {
      await prisma.procedureType.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json(
        { error: "関連データがあるため削除できません。無効化をご利用ください。" },
        { status: 409 }
      );
    }
  });
}
