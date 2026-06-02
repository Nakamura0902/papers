import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";

// 一覧（検索対応）
export async function GET(req: NextRequest) {
  return withAuth(async () => {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    const employees = await prisma.employee.findMany({
      where: {
        deletedAt: null,
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { nameKana: { contains: q } },
                { department: { contains: q } },
                { email: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ employees });
  });
}

function parseDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// 新規登録
export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "氏名は必須です" }, { status: 400 });
    }
    const employee = await prisma.employee.create({
      data: {
        name: body.name,
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
    return NextResponse.json({ employee }, { status: 201 });
  });
}
