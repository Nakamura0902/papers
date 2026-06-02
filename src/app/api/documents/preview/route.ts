import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { renderDocumentHtml } from "@/lib/render";

// 入力内容から A4 プレビュー用 HTML を返す（PDF は生成しない）
export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const { documentKey, formData } = await req.json();
    const rendered = await renderDocumentHtml(documentKey, formData ?? {});
    if (!rendered) {
      return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
    }
    return NextResponse.json({ html: rendered.html, documentName: rendered.documentName });
  });
}
