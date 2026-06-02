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
  kakiBlock,
  noteLine,
} from "./_shared";

// 貸与物返却確認書
export function propertyReturnChecklist(ctx: TemplateContext): string {
  const { data, createdAt } = ctx;
  const checked = Array.isArray(data.returnedItems)
    ? (data.returnedItems as string[])
    : [];
  const itemsLine = checked.length > 0 ? checked.join("、") : "";
  const others = v(data, "items");

  return `
${docTitle("貸与物返却確認書")}
${issuedDate(data, createdAt)}
${recipientBlock(data)}
<div class="body-text">下記のとおり、会社から貸与された物品を返却したことを確認いたします。</div>
${kakiBlock(
    kvTable([
      ["返却日", jpDate(v(data, "returnDate"))],
      ["返却した貸与物", [itemsLine, others].filter(Boolean).join("、") || "（記載）"],
      ["返却状況", v(data, "returnStatus", "全て返却済み")],
      ["未返却・備考", v(data, "remarks")],
    ])
  )}
${section(
    "確認事項",
    `<div class="body-text">未返却の物がある場合は、別途返却または相当額の精算の対象とすることに同意します。</div>`
  )}
${submitterBlock(data, true)}
${noteLine("貸与物の有無が不明な場合は、店舗責任者や管理者にご確認ください。")}
`;
}
