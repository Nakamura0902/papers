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
    const item = await prisma.documentCandidateRule.update({
      where: { id },
      data: {
        defaultRequiredLevel: b.defaultRequiredLevel || "確認が必要",
        displayReason: b.displayReason || null,
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
    await prisma.documentCandidateRule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
