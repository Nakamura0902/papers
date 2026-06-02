import {
  TemplateContext,
  docTitle,
  issuedDate,
  recipientBlock,
  submitterBlock,
  v,
  jpDate,
  kvTable,
  section,
  noteLine,
} from "./_shared";

// 最終給与確認書
export function finalSalaryConfirmation(ctx: TemplateContext): string {
  const { data, createdAt } = ctx;
  const yen = (key: string) => {
    const val = v(data, key);
    return val ? `${val} 円` : "";
  };

  return `
${docTitle("最終給与確認書")}
${issuedDate(data, createdAt)}
${recipientBlock(data)}
${section(
    "対象者",
    kvTable([
      ["氏名", v(data, "employeeName", "（氏名）")],
      ["所属", v(data, "department")],
      ["社員番号", v(data, "employeeNo")],
      ["対象期間", v(data, "period")],
    ])
  )}
${section(
    "支給",
    kvTable([
      ["基本給", yen("baseSalary")],
      ["残業手当", yen("overtime")],
      ["各種手当", yen("allowance")],
      ["交通費", yen("transport")],
      ["総支給額", yen("grossAmount")],
    ])
  )}
${section(
    "控除",
    kvTable([
      ["社会保険料", yen("socialInsurance")],
      ["所得税", yen("incomeTax")],
      ["住民税", yen("residentTax")],
      ["その他控除", yen("otherDeduction")],
      ["控除合計", yen("deductionTotal")],
    ])
  )}
${section(
    "差引支給",
    kvTable([
      ["差引支給額", yen("netAmount")],
      ["未払い分の有無", v(data, "unpaid")],
      ["未払い分の内容", v(data, "unpaidDetail")],
      ["支給方法", v(data, "payMethod")],
      ["支給予定日", jpDate(v(data, "payDate"))],
      ["備考", v(data, "remarks")],
    ])
  )}
${section(
    "確認事項",
    `<div class="body-text">上記の最終給与の内容を確認しました。内容に相違がある場合は、支給予定日前に会社へお申し出ください。</div>`
  )}
${submitterBlock(data, false)}
${noteLine(
    "金額は給与計算の確定値ではない場合があります。最終的な支給額は給与明細をご確認ください。"
  )}
`;
}
