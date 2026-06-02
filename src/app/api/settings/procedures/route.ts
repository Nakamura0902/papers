import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const b = await req.json();
    if (!b.key || !b.name) {
      return NextResponse.json({ error: "key と名称は必須です" }, { status: 400 });
    }
    const exists = await prisma.procedureType.findUnique({ where: { key: b.key } });
    if (exists) {
      return NextResponse.json({ error: "同じ key が既に存在します" }, { status: 409 });
    }
    const item = await prisma.procedureType.create({
      data: {
        key: b.key,
        name: b.name,
        description: b.description || null,
        sortOrder: Number(b.sortOrder) || 0,
        isActive: b.isActive ?? true,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  });
}
