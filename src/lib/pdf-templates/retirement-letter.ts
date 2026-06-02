import {
  TemplateContext,
  docTitle,
  issuedDate,
  recipientBlock,
  submitterBlock,
  v,
  jpDate,
  noteLine,
} from "./_shared";

// 退職届（一般的な書式：表題・宛先・私儀・退職日・提出者押印）
export function retirementLetter(ctx: TemplateContext): string {
  const { data, createdAt } = ctx;
  const reason = v(data, "retirementReason", "一身上の都合");
  const retireDate = jpDate(v(data, "retirementDate"), "（退職日）");
  // 「一身上の都合」は理由を本文に織り込み、それ以外は理由を明記
  const reasonClause =
    reason === "一身上の都合"
      ? "このたび、一身上の都合により、"
      : `このたび、${reason}により、`;

  return `
${docTitle("退　職　届")}
${issuedDate(data, createdAt)}
${recipientBlock(data)}
<div class="body-text" style="margin-top:8px;">
私儀

${reasonClause}来る ${retireDate} をもって退職いたしたく、ここにお届け申し上げます。
</div>
${data.remarks ? `<div class="section">備考：${v(data, "remarks")}</div>` : ""}
${submitterBlock(data, true)}
${noteLine(
    "本様式は社内管理用のひな形です。会社都合退職・契約期間満了等の場合は、退職届ではなく退職合意書等が適切な場合があります。取り扱いは社内担当者にご確認ください。"
  )}
`;
}
