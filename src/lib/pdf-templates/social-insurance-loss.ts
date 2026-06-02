import { TemplateContext, v } from "./_shared";
import { adminConfirmation } from "./generic";

// 健康保険・厚生年金保険 被保険者資格喪失届（社内確認用）
export function socialInsuranceLoss(ctx: TemplateContext): string {
  return adminConfirmation(
    ctx,
    "本書は社内確認用のひな形です。正式な届出は年金事務所または事務センター等へ所定様式での提出が必要になる可能性があります。社会保険の加入状況および手続きは社内担当者または専門家にご確認ください。",
    [
      ["記号・番号", v(ctx.data, "insuredNumber")],
      ["被扶養者の人数", v(ctx.data, "dependents")],
    ]
  );
}
