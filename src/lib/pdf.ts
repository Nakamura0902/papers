import "server-only";
import path from "path";
import { promises as fs } from "fs";
import puppeteer from "puppeteer";

const PDF_DIR = path.join(process.cwd(), "storage", "pdfs");

// 完全な HTML 文書を組み立てる（A4 / 日本語フォント / 印刷向け余白）
export function wrapHtml(bodyHtml: string): string {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Yu Gothic", "Meiryo", "Hiragino Kaku Gothic ProN", sans-serif;
    color: #111;
    background: #fff;
    font-size: 11pt;
    line-height: 1.7;
    margin: 0;
  }
  h1.doc-title {
    text-align: center;
    font-size: 18pt;
    letter-spacing: 0.3em;
    margin: 0 0 24px;
    padding-bottom: 8px;
    border-bottom: 2px solid #111;
  }
  .meta-row { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 10pt; }
  table.kv { width: 100%; border-collapse: collapse; margin: 12px 0; }
  table.kv th, table.kv td { border: 1px solid #999; padding: 6px 10px; text-align: left; vertical-align: top; }
  table.kv th { background: #f3f4f6; width: 30%; font-weight: 600; white-space: nowrap; }
  .section { margin: 18px 0; }
  .section-title { font-weight: 700; border-left: 4px solid #2f5bb8; padding-left: 8px; margin-bottom: 8px; }
  .body-text { white-space: pre-wrap; line-height: 1.9; }
  .recipient { margin: 8px 0 20px; line-height: 1.8; }
  .submitter { margin: 24px 0 8px; text-align: right; line-height: 1.9; }
  .seal { display: inline-block; margin-left: 8px; padding: 0 4px; border: 1px solid #c0392b; border-radius: 3px; color: #c0392b; font-size: 8pt; }
  .sign-area { margin-top: 36px; }
  .sign-line { display: inline-block; border-bottom: 1px solid #111; min-width: 220px; height: 1.6em; }
  .sign-line.short { min-width: 120px; }
  .note { font-size: 9pt; color: #555; margin-top: 24px; border-top: 1px dashed #bbb; padding-top: 8px; }
  .right { text-align: right; }
  .center { text-align: center; }
  ol.clauses { margin: 4px 0; padding-left: 1.4em; }
  ol.clauses > li { margin-bottom: 6px; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

// HTML 文字列から PDF Buffer を生成
export async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// ファイル名: 氏名_書類名_作成日.pdf （安全化）
export function buildPdfFileName(
  employeeName: string,
  documentName: string,
  date = new Date()
): string {
  const d = date.toISOString().slice(0, 10);
  const safe = (s: string) => (s || "").replace(/[\\/:*?"<>|\s]/g, "_");
  return `${safe(employeeName) || "無記名"}_${safe(documentName)}_${d}.pdf`;
}

// PDF を storage/pdfs に保存し、保存パスを返す
export async function savePdf(fileName: string, buffer: Buffer): Promise<string> {
  await fs.mkdir(PDF_DIR, { recursive: true });
  const filePath = path.join(PDF_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

export async function readPdf(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}
