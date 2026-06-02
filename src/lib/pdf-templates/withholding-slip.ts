import { TemplateContext, v, jpDate } from "./_shared";
import { adminConfirmation } from "./generic";

// 源泉徴収票（社内確認用）
export function withholdingSlip(ctx: TemplateContext): string {
  const yen = (key: string) => {
    const val = v(ctx.data, key);
    return val ? `${val} 円` : "";
  };
  return adminConfirmation(
    ctx,
    "本書は社内確認用のひな形です。源泉徴収票は所定様式により作成し退職者本人へ交付する必要があります。給与計算・税務処理に基づく正式な様式をご利用ください。詳細は社内担当者または税理士にご確認ください。",
    [
      ["対象年", v(ctx.data, "targetYear")],
      ["支払金額", yen("totalPayment")],
      ["源泉徴収税額", yen("withholdingTax")],
      ["社会保険料等", yen("socialInsurance")],
      ["交付日", jpDate(v(ctx.data, "deliveryDate"))],
    ]
  );
}
