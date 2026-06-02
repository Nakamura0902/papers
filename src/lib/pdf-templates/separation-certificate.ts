import { TemplateContext, v } from "./_shared";
import { adminConfirmation } from "./generic";

// 雇用保険被保険者離職証明書（社内確認用）
export function separationCertificate(ctx: TemplateContext): string {
  return adminConfirmation(
    ctx,
    "本書は社内確認用のひな形です。離職証明書（離職票）は管轄のハローワークへ所定様式での手続きが必要になる可能性があります。本人の離職票希望の有無を確認のうえ、社内担当者または専門家にご確認ください。",
    [
      ["被保険者番号", v(ctx.data, "insuredNumber")],
      ["離職票の希望", v(ctx.data, "wantsSlip")],
      ["離職理由", v(ctx.data, "separationReason")],
    ]
  );
}
