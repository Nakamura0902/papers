import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { readPdf } from "@/lib/pdf";

// 認証必須で PDF ファイルを配信する
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const item = await prisma.generatedDocument.findFirst({
    where: { id, deletedAt: null },
  });
  if (!item || !item.pdfFilePath) {
    return NextResponse.json({ error: "PDF が見つかりません" }, { status: 404 });
  }

  let buffer: Buffer;
  try {
    buffer = await readPdf(item.pdfFilePath);
  } catch {
    return NextResponse.json({ error: "PDF ファイルを読み込めません" }, { status: 404 });
  }

  const download = req.nextUrl.searchParams.get("download") === "1";
  // 保存パス（ローカルパス or "supabase:<timestamp>_氏名_書類_日付.pdf"）から表示用ファイル名を作る
  const raw = item.pdfFilePath.startsWith("supabase:")
    ? item.pdfFilePath.slice("supabase:".length)
    : path.basename(item.pdfFilePath);
  const fileName = raw.replace(/^\d+_/, ""); // 先頭のタイムスタンプを除去
  const encoded = encodeURIComponent(fileName);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${encoded}`,
    },
  });
}
