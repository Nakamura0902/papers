import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import type { FormSchema } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ documentKey: string }> }
) {
  return withAuth(async () => {
    const { documentKey } = await params;
    const document = await prisma.document.findUnique({
      where: { key: documentKey },
      include: { forms: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!document) {
      return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
    }

    let schema: FormSchema = { sections: [] };
    if (document.forms[0]) {
      try {
        schema = JSON.parse(document.forms[0].schemaJson) as FormSchema;
      } catch {
        schema = { sections: [] };
      }
    }

    return NextResponse.json({
      document: {
        key: document.key,
        name: document.name,
        purpose: document.purpose,
        notes: document.notes,
        requiresSignature: document.requiresSignature,
        requiresCompanySeal: document.requiresCompanySeal,
      },
      schema,
    });
  });
}
