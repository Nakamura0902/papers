import "server-only";
import { prisma } from "./prisma";
import { wrapHtml } from "./pdf";
import { renderTemplate } from "./pdf-templates";
import type { FormSchema } from "@/types";

// 書類 key + フォームデータから、PDF/プレビュー用の完全な HTML を生成する。
export async function renderDocumentHtml(
  documentKey: string,
  formData: Record<string, unknown>
): Promise<{ html: string; documentName: string } | null> {
  const document = await prisma.document.findUnique({
    where: { key: documentKey },
    include: { forms: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!document) return null;

  let schema: FormSchema | null = null;
  if (document.forms[0]) {
    try {
      schema = JSON.parse(document.forms[0].schemaJson) as FormSchema;
    } catch {
      schema = null;
    }
  }

  const body = renderTemplate(documentKey, {
    documentName: document.name,
    data: formData ?? {},
    createdAt: new Date(),
    schema,
  });

  return { html: wrapHtml(body), documentName: document.name };
}
