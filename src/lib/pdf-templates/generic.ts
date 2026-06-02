import {
  TemplateContext,
  docTitle,
  issuedDate,
  recipientBlock,
  v,
  kvTable,
  section,
  companyBlock,
  signArea,
  noteLine,
  esc,
  jpDate,
} from "./_shared";

// 値を見やすく整形（日付っぽい文字列は和暦表記に）
function display(name: string, value: unknown): string {
  if (Array.isArray(value)) return value.map((x) => esc(x)).join("、");
  const s = String(value ?? "");
  if (/date|日|date$/i.test(name) && /^\d{4}-\d{1,2}-\d{1,2}/.test(s)) return jpDate(s);
  return esc(s);
}

// フォーム schema を使って入力内容を表形式で描画する汎用テンプレート。
// 専用テンプレートが無い書類（入社系など）で使用する。
export function genericConfirmation(ctx: TemplateContext): string {
  const { documentName, data, createdAt, schema } = ctx;

  let detail: string;
  if (schema && schema.sections.length > 0) {
    detail = schema.sections
      .map((sec) =>
        section(
          sec.title,
          kvTable(sec.fields.map((f) => [f.label, display(f.name, data[f.name])]))
        )
      )
      .join("");
  } else {
    const rows = Object.entries(data).map(
      ([k, val]) => [k, display(k, val)] as [string, string]
    );
    detail = section("入力内容", kvTable(rows));
  }

  return `
${docTitle(documentName)}
${issuedDate(data, createdAt)}
${recipientBlock(data)}
${detail}
${section("会社情報", companyBlock())}
${signArea(true)}
${noteLine(
    "本書は社内確認用のひな形です。正式な様式・提出物が別途定められている場合は、そちらを優先してください。"
  )}
`;
}

// 行政提出系の簡易確認シート（提出はこのPDFでは完結しない旨を明記）
export function adminConfirmation(
  ctx: TemplateContext,
  notice: string,
  extraRows: [string, string][] = []
): string {
  const { documentName, data, createdAt } = ctx;
  return `
${docTitle(documentName)}
${issuedDate(data, createdAt)}
${section(
    "対象者情報",
    kvTable([
      ["氏名", v(data, "employeeName", "（氏名）")],
      ["フリガナ", v(data, "nameKana")],
      ["生年月日", jpDate(v(data, "birthDate"))],
      ["社員番号", v(data, "employeeNo")],
      ["所属", v(data, "department")],
      ["退職日／資格喪失日", jpDate(v(data, "lossDate") || v(data, "retirementDate"))],
      ...extraRows,
      ["備考", v(data, "remarks")],
    ])
  )}
${section("会社情報", companyBlock())}
${noteLine(notice)}
`;
}
