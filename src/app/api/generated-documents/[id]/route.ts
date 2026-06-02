import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { renderDocumentHtml } from "@/lib/render";
import { htmlToPdf, savePdf, buildPdfFileName } from "@/lib/pdf";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const item = await prisma.generatedDocument.findFirst({
      where: { id, deletedAt: null },
      include: { document: true, employee: true, procedureType: true, workerType: true, createdBy: true },
    });
    if (!item) {
      return NextResponse.json({ error: "見つかりません" }, { status: 404 });
    }
    return NextResponse.json({ item });
  });
}

// 再編集（入力内容を更新し PDF を再生成）
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const body = await req.json();
    const item = await prisma.generatedDocument.findFirst({
      where: { id, deletedAt: null },
      include: { document: true, employee: true },
    });
    if (!item) {
      return NextResponse.json({ error: "見つかりません" }, { status: 404 });
    }

    const formData = body.formData ?? JSON.parse(item.formDataJson);
    const rendered = await renderDocumentHtml(item.document.key, formData);
    if (!rendered) {
      return NextResponse.json({ error: "再生成に失敗しました" }, { status: 500 });
    }

    const employeeName =
      (formData?.employeeName as string) || item.employee?.name || "無記名";
    const fileName = buildPdfFileName(employeeName, item.document.name);
    const pdf = await htmlToPdf(rendered.html);
    const filePath = await savePdf(fileName, pdf);

    const updated = await prisma.generatedDocument.update({
      where: { id },
      data: {
        formDataJson: JSON.stringify(formData),
        pdfFilePath: filePath,
        title: `${employeeName}：${item.document.name}`,
      },
    });
    return NextResponse.json({ item: updated });
  });
}

// 論理削除
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    await prisma.generatedDocument.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  });
}
