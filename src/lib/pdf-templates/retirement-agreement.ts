import {
  TemplateContext,
  docTitle,
  issuedDate,
  v,
  jpDate,
  dualSignArea,
  noteLine,
} from "./_shared";
import { COMPANY } from "../company";

// 退職合意書（一般的な条項構成：合意退職・退職日・金銭・貸与物・守秘・清算）
export function retirementAgreement(ctx: TemplateContext): string {
  const { data, createdAt } = ctx;
  const company = v(data, "companyName", COMPANY.name);
  const employee = v(data, "employeeName", "（本人氏名）");
  const retireDate = jpDate(v(data, "retirementDate"), "（退職日）");
  const lastWork = jpDate(v(data, "lastWorkDate"));
  const severance = v(data, "severancePay");
  const unpaid = v(data, "unpaidWages");
  const property = v(data, "propertyReturn", "本人は、会社から貸与された物品を退職日までにすべて返却する。");
  const confidentiality = v(
    data,
    "confidentiality",
    "本人は、在職中に知り得た会社の秘密情報を、退職後においても第三者に開示・漏洩しない。"
  );
  const nonDisclosure = v(
    data,
    "nonDisclosure",
    "甲乙は、本合意の内容および退職の経緯について、正当な理由なく第三者に口外しない。"
  );
  const settlement = v(
    data,
    "settlement",
    "甲乙は、本合意書に定めるもののほか、雇用契約に関し、何らの債権債務がないことを相互に確認する。"
  );

  const clauses = [
    `<b>（合意退職）</b> 甲（${company}、以下「甲」）と乙（${employee}、以下「乙」）は、乙が ${retireDate} をもって甲を退職することを合意した。`,
    lastWork ? `<b>（最終出勤日）</b> 乙の最終出勤日は ${lastWork} とする。` : "",
    severance || unpaid
      ? `<b>（金銭の精算）</b> ${[
          severance ? `退職金 ${severance} を所定の方法により支払う。` : "",
          unpaid ? `未払賃金等 ${unpaid} を精算する。` : "",
        ]
          .filter(Boolean)
          .join("")}`
      : `<b>（金銭の精算）</b> 最終給与その他の金銭は、給与規程に基づき所定の支給日に支払う。`,
    `<b>（貸与物の返却）</b> ${property}`,
    `<b>（守秘義務）</b> ${confidentiality}`,
    `<b>（口外禁止）</b> ${nonDisclosure}`,
    `<b>（清算条項）</b> ${settlement}`,
    v(data, "others") ? `<b>（その他）</b> ${v(data, "others")}` : "",
  ].filter(Boolean);

  return `
${docTitle("退 職 合 意 書")}
${issuedDate(data, createdAt)}
<div class="body-text">${company}（以下「甲」という。）と ${employee}（以下「乙」という。）とは、乙の退職に関し、以下のとおり合意した。</div>
<ol class="clauses">
  ${clauses.map((c) => `<li>${c}</li>`).join("")}
</ol>
<div class="body-text" style="margin-top:8px;">本合意の成立を証するため、本書二通を作成し、甲乙記名押印のうえ、各自一通を保有する。</div>
${dualSignArea()}
${noteLine(
    "本書はトラブル防止のための社内ひな形です。記載内容により法的効果が異なるため、必要に応じて社労士・弁護士等の専門家にご確認ください。"
  )}
`;
}
