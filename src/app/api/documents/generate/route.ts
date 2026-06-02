import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { renderDocumentHtml } from "@/lib/render";
import { htmlToPdf, savePdf, buildPdfFileName } from "@/lib/pdf";

// PDF生成はヘッドレスChromiumを使うため Node ランタイム＋長めの実行時間が必要
export const runtime = "nodejs";
export const maxDuration = 60;

// 入力: documentKey, procedureKey, workerTypeKey, employeeId, formData
// 処理: 入力保存 → PDF生成 → 履歴保存 → パス返却
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const { documentKey, procedureKey, workerTypeKey, employeeId, formData } =
      await req.json();

    const document = await prisma.document.findUnique({ where: { key: documentKey } });
    if (!document) {
      return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
    }

    const [procedure, workerType, employee] = await Promise.all([
      procedureKey ? prisma.procedureType.findUnique({ where: { key: procedureKey } }) : null,
      workerTypeKey ? prisma.workerType.findUnique({ where: { key: workerTypeKey } }) : null,
      employeeId ? prisma.employee.findUnique({ where: { id: employeeId } }) : null,
    ]);

    const rendered = await renderDocumentHtml(documentKey, formData ?? {});
    if (!rendered) {
      return NextResponse.json({ error: "書類の生成に失敗しました" }, { status: 500 });
    }

    const employeeName =
      (formData?.employeeName as string) || employee?.name || "無記名";
    const fileName = buildPdfFileName(employeeName, document.name);

    const pdf = await htmlToPdf(rendered.html);
    const filePath = await savePdf(fileName, pdf);

    const generated = await prisma.generatedDocument.create({
      data: {
        documentId: document.id,
        procedureTypeId: procedure?.id ?? null,
        workerTypeId: workerType?.id ?? null,
        employeeId: employee?.id ?? null,
        title: `${employeeName}：${document.name}`,
        formDataJson: JSON.stringify(formData ?? {}),
        pdfFilePath: filePath,
        createdById: user.id,
      },
    });

    return NextResponse.json({ id: generated.id, fileName });
  });
}
