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

// 有給休暇残日数確認書
export function paidLeaveConfirmation(ctx: TemplateContext): string {
  const { data, createdAt } = ctx;
  const days = (key: string) => {
    const val = v(data, key);
    return val ? `${val} 日` : "";
  };

  return `
${docTitle("有給休暇残日数確認書")}
${issuedDate(data, createdAt)}
${recipientBlock(data)}
${section(
    "対象者",
    kvTable([
      ["氏名", v(data, "employeeName", "（氏名）")],
      ["所属", v(data, "department")],
      ["社員番号", v(data, "employeeNo")],
      ["基準日", jpDate(v(data, "baseDate"))],
    ])
  )}
${section(
    "有給休暇の状況",
    kvTable([
      ["付与日数", days("grantedDays")],
      ["取得済日数", days("usedDays")],
      ["残日数", days("remainingDays")],
      ["時効消滅予定", days("expiringDays")],
      ["退職日までの取得予定", days("plannedDays")],
      ["買い取りの有無", v(data, "buyback")],
      ["買い取り日数", days("buybackDays")],
      ["備考", v(data, "remarks")],
    ])
  )}
${section(
    "確認事項",
    `<div class="body-text">退職時点の有給休暇残日数および消化予定について、上記のとおり確認しました。</div>`
  )}
${submitterBlock(data, false)}
${noteLine(
    "残日数は勤怠管理情報に基づきます。相違がある場合は勤怠担当者にご確認ください。有給休暇の買い取りの可否は会社の運用・法令によります。"
  )}
`;
}
