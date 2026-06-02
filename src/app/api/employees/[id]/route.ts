import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

function parseDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const employee = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });
    if (!employee) {
      return NextResponse.json({ error: "従業員が見つかりません" }, { status: 404 });
    }
    return NextResponse.json({ employee });
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const body = await req.json();
    const existing = await prisma.employee.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "従業員が見つかりません" }, { status: 404 });
    }
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        nameKana: body.nameKana || null,
        birthDate: parseDate(body.birthDate),
        postalCode: body.postalCode || null,
        address: body.address || null,
        phone: body.phone || null,
        email: body.email || null,
        employmentType: body.employmentType || null,
        department: body.department || null,
        position: body.position || null,
        startDate: parseDate(body.startDate),
        endDate: parseDate(body.endDate),
      },
    });
    return NextResponse.json({ employee });
  });
}

// 論理削除
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  });
}
