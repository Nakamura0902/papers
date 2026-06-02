import { TemplateContext } from "./_shared";
import { genericConfirmation } from "./generic";
import { retirementLetter } from "./retirement-letter";
import { retirementAgreement } from "./retirement-agreement";
import { propertyReturnChecklist } from "./property-return-checklist";
import { finalSalaryConfirmation } from "./final-salary-confirmation";
import { paidLeaveConfirmation } from "./paid-leave-confirmation";
import { employmentInsuranceLoss } from "./employment-insurance-loss";
import { separationCertificate } from "./separation-certificate";
import { socialInsuranceLoss } from "./social-insurance-loss";
import { withholdingSlip } from "./withholding-slip";

export type TemplateFn = (ctx: TemplateContext) => string;

// 書類 key → テンプレート関数
const registry: Record<string, TemplateFn> = {
  retirement_letter: retirementLetter,
  retirement_agreement: retirementAgreement,
  property_return_checklist: propertyReturnChecklist,
  final_salary_confirmation: finalSalaryConfirmation,
  paid_leave_confirmation: paidLeaveConfirmation,
  employment_insurance_loss: employmentInsuranceLoss,
  separation_certificate: separationCertificate,
  social_insurance_loss: socialInsuranceLoss,
  withholding_slip: withholdingSlip,
};

// 専用テンプレートが無い書類は汎用テンプレートにフォールバック
export function renderTemplate(documentKey: string, ctx: TemplateContext): string {
  const fn = registry[documentKey] ?? genericConfirmation;
  return fn(ctx);
}

export type { TemplateContext };
