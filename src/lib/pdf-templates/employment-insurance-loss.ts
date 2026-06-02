import { TemplateContext, v } from "./_shared";
import { adminConfirmation } from "./generic";

// 雇用保険被保険者資格喪失届（社内確認用）
export function employmentInsuranceLoss(ctx: TemplateContext): string {
  return adminConfirmation(
    ctx,
    "本書は社内確認用のひな形です。正式な届出は管轄のハローワークへ所定様式での提出が必要になる可能性があります。雇用保険の加入状況および手続きは社内担当者または専門家にご確認ください。",
    [
      ["被保険者番号", v(ctx.data, "insuredNumber")],
      ["喪失理由", v(ctx.data, "lossReason")],
    ]
  );
}
