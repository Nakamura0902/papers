import { COMPANY } from "../company";
import type { FormSchema } from "@/types";

export interface TemplateContext {
  documentName: string;
  data: Record<string, unknown>;
  createdAt: Date;
  schema?: FormSchema | null;
}

export function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function v(data: Record<string, unknown>, key: string, fallback = ""): string {
  const raw = data[key];
  if (raw === null || raw === undefined || raw === "") return fallback;
  if (Array.isArray(raw)) return raw.map((x) => esc(x)).join("、");
  return esc(raw);
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// "YYYY-MM-DD" 等の文字列を「○年○月○日」に整形（無効値はそのまま/空）
export function jpDate(value: unknown, fallback = ""): string {
  if (value === null || value === undefined || value === "") return fallback;
  const s = String(value);
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${Number(m[1])}年${Number(m[2])}月${Number(m[3])}日`;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return formatDate(d);
  return esc(s);
}

export function docTitle(name: string): string {
  return `<h1 class="doc-title">${esc(name)}</h1>`;
}

export function kvTable(rows: [string, string][]): string {
  const body = rows
    .map(([k, val]) => `<tr><th>${esc(k)}</th><td>${val || "&nbsp;"}</td></tr>`)
    .join("");
  return `<table class="kv">${body}</table>`;
}

export function section(title: string, inner: string): string {
  return `<div class="section"><div class="section-title">${esc(
    title
  )}</div>${inner}</div>`;
}

export function bodyText(text: string): string {
  return `<div class="body-text">${esc(text)}</div>`;
}

// 作成日（右上）
export function dateTopRight(d: Date): string {
  return `<div class="right" style="margin-bottom:8px;">${formatDate(d)}</div>`;
}

// 任意の作成日（文字列優先）
export function issuedDate(data: Record<string, unknown>, fallback: Date): string {
  const s = v(data, "submitDate") || v(data, "issueDate") || v(data, "agreementDate");
  return `<div class="right" style="margin-bottom:8px;">${s ? jpDate(s) : formatDate(fallback)}</div>`;
}

// 宛先（会社・代表者）— 退職届などの届出書類の冒頭に置く
export function recipientBlock(data: Record<string, unknown>): string {
  const company = v(data, "addresseeCompany", COMPANY.name);
  const name = v(data, "addresseeName", COMPANY.representative);
  return `<div class="recipient">
    <div>${esc(company)}</div>
    <div>${esc(name)}&nbsp;殿</div>
  </div>`;
}

// 提出者（右寄せ・所属/氏名＋押印）
export function submitterBlock(data: Record<string, unknown>, withSeal = true): string {
  const dept = v(data, "department");
  const no = v(data, "employeeNo");
  const name = v(data, "employeeName", "（氏名）");
  return `<div class="submitter">
    ${dept ? `<div>所属：${esc(dept)}</div>` : ""}
    ${no ? `<div>社員番号：${esc(no)}</div>` : ""}
    <div>氏名：${esc(name)}${withSeal ? '<span class="seal">印</span>' : ""}</div>
  </div>`;
}

// 会社情報欄
export function companyBlock(): string {
  return kvTable([
    ["会社名", esc(COMPANY.name)],
    ["所在地", esc(COMPANY.address)],
    ["電話番号", esc(COMPANY.phone)],
    ["代表者", esc(COMPANY.representative)],
  ]);
}

// 署名欄
export function signArea(needSignature: boolean, label = "上記のとおり相違ありません。"): string {
  if (!needSignature) return "";
  return `<div class="sign-area">
    <div>${esc(label)}</div>
    <div style="margin-top:18px;">日付：<span class="sign-line"></span></div>
    <div style="margin-top:12px;">氏名（自署）：<span class="sign-line"></span><span class="seal">印</span></div>
  </div>`;
}

// 甲乙の署名欄（合意書向け）
export function dualSignArea(): string {
  return `<div class="sign-area" style="display:flex; gap:32px;">
    <div style="flex:1;">
      <div>（甲）会社</div>
      <div style="margin-top:14px;">会社名：<span class="sign-line short"></span></div>
      <div style="margin-top:10px;">代表者：<span class="sign-line short"></span><span class="seal">印</span></div>
    </div>
    <div style="flex:1;">
      <div>（乙）本人</div>
      <div style="margin-top:14px;">住所：<span class="sign-line short"></span></div>
      <div style="margin-top:10px;">氏名：<span class="sign-line short"></span><span class="seal">印</span></div>
    </div>
  </div>`;
}

export function noteLine(text: string): string {
  return `<div class="note">${esc(text)}</div>`;
}

// 記書き（記 … 以上）
export function kakiBlock(inner: string): string {
  return `<div class="center" style="margin:12px 0 4px;">記</div>
    ${inner}
    <div class="right" style="margin-top:8px;">以上</div>`;
}
