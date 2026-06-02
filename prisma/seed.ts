import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// マスタ定義
// ---------------------------------------------------------------------------

const PROCEDURES = [
  { key: "onboarding", name: "入社", description: "新たに人を迎え入れる手続き" },
  { key: "retirement", name: "退職", description: "退職に伴う手続き" },
  { key: "contract_renewal", name: "契約更新", description: "契約期間の更新手続き" },
  { key: "employment_condition_change", name: "雇用条件変更", description: "労働条件の変更手続き" },
  { key: "outsourcing_contract", name: "業務委託契約", description: "業務委託に関する契約手続き" },
  { key: "address_change", name: "住所変更", description: "住所変更に伴う手続き" },
  { key: "bank_account_change", name: "給与口座変更", description: "給与振込口座の変更手続き" },
  { key: "leave_of_absence", name: "休職", description: "休職に伴う手続き" },
  { key: "reinstatement", name: "復職", description: "復職に伴う手続き" },
];

const WORKER_TYPES = [
  { key: "full_time_employee", name: "正社員" },
  { key: "contract_employee", name: "契約社員" },
  { key: "part_time", name: "アルバイト・パート" },
  { key: "temporary_staff", name: "派遣社員" },
  { key: "contractor", name: "業務委託" },
  { key: "executive", name: "役員" },
];

// 退職関連書類マスタ
const RETIREMENT_DOCS = [
  {
    key: "retirement_letter",
    name: "退職届",
    defaultRequiredLevel: "場合による",
    purpose: "本人が退職の意思、退職希望日、提出日などを会社に届け出る書類。",
    whenRequired: "自己都合退職で、会社が退職意思を書面で残したい場合。",
    whenNotRequired: "会社都合退職や、別途退職合意書で退職日・退職条件を確認する場合。",
    submissionTo: "会社",
    storageLocation: "人事・労務管理ファイル",
    requiresSignature: true,
    requiresCompanySeal: false,
    notes: "会社都合退職・契約期間満了の場合は退職届ではなく退職合意書等が適切な場合があります。",
  },
  {
    key: "retirement_agreement",
    name: "退職合意書",
    defaultRequiredLevel: "推奨",
    purpose: "会社と本人が、退職日、退職理由、最終給与、貸与物返却、秘密保持などの退職条件に合意したことを記録する書類。",
    whenRequired: "退職条件を明確にしてトラブルを防ぎたい場合。",
    whenNotRequired: "簡易な自己都合退職で、退職届や社内記録で十分な場合。",
    submissionTo: "会社",
    storageLocation: "人事・労務管理ファイル",
    requiresSignature: true,
    requiresCompanySeal: false,
    notes: "記載内容により法的効果が異なるため、必要に応じて社労士・弁護士等の専門家に確認してください。",
  },
  {
    key: "property_return_checklist",
    name: "貸与物返却確認書",
    defaultRequiredLevel: "場合による",
    purpose: "制服、鍵、社員証、PC、スマホ、備品など、会社から貸与した物の返却状況を記録する書類。",
    whenRequired: "会社から貸与している物がある場合。",
    whenNotRequired: "貸与物が一切ない場合。",
    submissionTo: "会社",
    storageLocation: "備品管理ファイル / 人事管理ファイル",
    requiresSignature: true,
    requiresCompanySeal: false,
    notes: "貸与物の有無が不明な場合は、店舗責任者や管理者に確認してください。",
  },
  {
    key: "final_salary_confirmation",
    name: "最終給与確認書",
    defaultRequiredLevel: "場合による",
    purpose: "退職時の最終給与、交通費、控除、未払い分、支給予定日などを確認する書類。",
    whenRequired: "最終給与の精算内容を本人と確認しておきたい場合。",
    whenNotRequired: "給与明細や社内給与処理で十分に確認できる場合。",
    submissionTo: "会社",
    storageLocation: "給与管理ファイル",
    requiresSignature: false,
    requiresCompanySeal: false,
    notes: "金額は給与計算の確定値ではない場合があります。最終的な支給額は給与明細で確認してください。",
  },
  {
    key: "paid_leave_confirmation",
    name: "有給休暇残日数確認書",
    defaultRequiredLevel: "場合による",
    purpose: "退職時点の有給休暇残日数、取得予定、消化状況などを確認する書類。",
    whenRequired: "有給休暇の残日数がある場合。",
    whenNotRequired: "有給休暇がない、または残日数がない場合。",
    submissionTo: "会社",
    storageLocation: "勤怠管理ファイル / 人事管理ファイル",
    requiresSignature: false,
    requiresCompanySeal: false,
    notes: "残日数は勤怠管理情報に基づきます。相違がある場合は勤怠担当者に確認してください。",
  },
  {
    key: "employment_insurance_loss",
    name: "雇用保険被保険者資格喪失届",
    defaultRequiredLevel: "必須の場合あり",
    purpose: "雇用保険の被保険者資格を喪失したことをハローワークに届け出るための書類。",
    whenRequired: "退職者が雇用保険に加入している場合。",
    whenNotRequired: "雇用保険に加入していない場合。",
    submissionTo: "管轄のハローワーク",
    storageLocation: "労務手続きファイル",
    requiresSignature: false,
    requiresCompanySeal: false,
    notes: "正式な届出は所定様式での提出が必要になる可能性があります。加入状況・手続きは社内担当者または専門家に確認してください。",
  },
  {
    key: "separation_certificate",
    name: "雇用保険被保険者離職証明書",
    defaultRequiredLevel: "場合による",
    purpose: "離職票を発行するために、退職日、賃金、離職理由などを記す書類。",
    whenRequired: "退職者が離職票を希望する場合、または雇用保険手続き上必要な場合。",
    whenNotRequired: "離職票を希望していない、かつ手続き上不要な場合。",
    submissionTo: "管轄のハローワーク",
    storageLocation: "労務手続きファイル",
    requiresSignature: false,
    requiresCompanySeal: false,
    notes: "本人の離職票希望の有無を確認のうえ、社内担当者または専門家に確認してください。",
  },
  {
    key: "social_insurance_loss",
    name: "健康保険・厚生年金保険 被保険者資格喪失届",
    defaultRequiredLevel: "必須の場合あり",
    purpose: "健康保険・厚生年金保険の被保険者資格を喪失したことを届け出る書類。",
    whenRequired: "退職者が社会保険に加入している場合。",
    whenNotRequired: "社会保険に加入していない場合。",
    submissionTo: "年金事務所または事務センター等",
    storageLocation: "社会保険手続きファイル",
    requiresSignature: false,
    requiresCompanySeal: false,
    notes: "正式な届出は所定様式での提出が必要になる可能性があります。加入状況・手続きは社内担当者または専門家に確認してください。",
  },
  {
    key: "withholding_slip",
    name: "源泉徴収票",
    defaultRequiredLevel: "必須",
    purpose: "その年に支払った給与額、源泉徴収税額、社会保険料等を記載し、本人に交付する書類。",
    whenRequired: "給与を支払った従業員が退職する場合。",
    whenNotRequired: "給与支払いがない場合。",
    submissionTo: "本人",
    storageLocation: "給与・税務関係ファイル",
    requiresSignature: false,
    requiresCompanySeal: false,
    notes: "所定様式により作成し退職者本人へ交付する必要があります。詳細は社内担当者または税理士に確認してください。",
  },
];

// 入社関連書類マスタ
const ONBOARDING_DOCS = [
  { key: "working_conditions_notice", name: "労働条件通知書", defaultRequiredLevel: "必須", purpose: "賃金・労働時間・就業場所など労働条件を本人に明示する書類。", submissionTo: "本人", storageLocation: "人事・労務管理ファイル", requiresSignature: false, requiresCompanySeal: true },
  { key: "employment_contract", name: "雇用契約書", defaultRequiredLevel: "推奨", purpose: "会社と本人が雇用契約の内容に合意したことを記録する書類。", submissionTo: "会社", storageLocation: "人事・労務管理ファイル", requiresSignature: true, requiresCompanySeal: true },
  { key: "onboarding_pledge", name: "入社誓約書", defaultRequiredLevel: "推奨", purpose: "就業規則の遵守などを本人が誓約する書類。", submissionTo: "会社", storageLocation: "人事管理ファイル", requiresSignature: true, requiresCompanySeal: false },
  { key: "nda_pledge", name: "秘密保持誓約書", defaultRequiredLevel: "推奨", purpose: "業務上知り得た秘密情報の取扱いを本人が誓約する書類。", submissionTo: "会社", storageLocation: "人事管理ファイル", requiresSignature: true, requiresCompanySeal: false },
  { key: "dependent_deduction_guide", name: "扶養控除等申告書案内", defaultRequiredLevel: "場合による", purpose: "扶養控除等申告書の提出を案内する書類。", submissionTo: "本人", storageLocation: "給与・税務関係ファイル", requiresSignature: false, requiresCompanySeal: false },
  { key: "salary_account_application", name: "給与振込口座申請書", defaultRequiredLevel: "推奨", purpose: "給与の振込先口座を申請する書類。", submissionTo: "会社", storageLocation: "給与管理ファイル", requiresSignature: true, requiresCompanySeal: false },
  { key: "emergency_contact", name: "緊急連絡先届", defaultRequiredLevel: "推奨", purpose: "緊急時の連絡先を届け出る書類。", submissionTo: "会社", storageLocation: "人事管理ファイル", requiresSignature: false, requiresCompanySeal: false },
  { key: "commute_route_application", name: "通勤経路申請書", defaultRequiredLevel: "場合による", purpose: "通勤経路・通勤手当の算定のための申請書類。", submissionTo: "会社", storageLocation: "人事・給与管理ファイル", requiresSignature: true, requiresCompanySeal: false },
  { key: "social_insurance_enrollment", name: "社会保険加入手続き確認書", defaultRequiredLevel: "必須の場合あり", purpose: "社会保険の加入手続きに必要な情報を確認する書類。", submissionTo: "年金事務所等", storageLocation: "社会保険手続きファイル", requiresSignature: false, requiresCompanySeal: false },
  { key: "employment_insurance_enrollment", name: "雇用保険加入手続き確認書", defaultRequiredLevel: "必須の場合あり", purpose: "雇用保険の加入手続きに必要な情報を確認する書類。", submissionTo: "管轄のハローワーク", storageLocation: "労務手続きファイル", requiresSignature: false, requiresCompanySeal: false },
];

// 判定質問とルールのライブラリ（書類 key ごと。手続き×区分を問わず共通利用）
interface JudgeDef {
  docKey: string;
  question: { key: string; text: string; options: string[]; help?: string };
  rules: { equals: string; level: string; message: string }[];
}

const JUDGEMENTS: JudgeDef[] = [
  {
    docKey: "retirement_letter",
    question: { key: "retirement_reason", text: "退職理由は何ですか？", options: ["自己都合", "会社都合", "契約期間満了", "その他", "わからない"] },
    rules: [
      { equals: "自己都合", level: "場合による", message: "退職意思を書面で残すため、作成を推奨します。" },
      { equals: "会社都合", level: "確認が必要", message: "退職届ではなく退職合意書等が適切な場合があります。" },
      { equals: "契約期間満了", level: "確認が必要", message: "契約内容を確認してください。" },
      { equals: "その他", level: "確認が必要", message: "社内担当者に確認してください。" },
      { equals: "わからない", level: "確認が必要", message: "社内担当者に確認してください。" },
    ],
  },
  {
    docKey: "retirement_agreement",
    question: { key: "agreement_needed", text: "退職条件について、本人と会社の間で確認・合意しておきたい事項がありますか？", options: ["ある", "ない", "わからない"] },
    rules: [
      { equals: "ある", level: "推奨", message: "退職条件を明確に残すため作成を推奨します。" },
      { equals: "ない", level: "場合による", message: "退職届や社内記録で足りる場合があります。" },
      { equals: "わからない", level: "確認が必要", message: "社内担当者に確認してください。" },
    ],
  },
  {
    docKey: "property_return_checklist",
    question: { key: "has_property", text: "会社から貸与している物はありますか？", options: ["ある", "ない", "わからない"] },
    rules: [
      { equals: "ある", level: "推奨", message: "返却状況を記録するため作成を推奨します。" },
      { equals: "ない", level: "不要", message: "貸与物がない場合は不要です。" },
      { equals: "わからない", level: "確認が必要", message: "店舗責任者や管理者に確認してください。" },
    ],
  },
  {
    docKey: "final_salary_confirmation",
    question: { key: "final_salary_check", text: "最終給与や未払い分について、本人と確認しておきたい事項がありますか？", options: ["ある", "ない", "わからない"] },
    rules: [
      { equals: "ある", level: "推奨", message: "最終精算の認識違いを防ぐため作成を推奨します。" },
      { equals: "ない", level: "場合による", message: "給与明細や社内処理で確認できる場合があります。" },
      { equals: "わからない", level: "確認が必要", message: "社内担当者に確認してください。" },
    ],
  },
  {
    docKey: "paid_leave_confirmation",
    question: { key: "has_paid_leave", text: "有給休暇の残日数はありますか？", options: ["ある", "ない", "わからない"] },
    rules: [
      { equals: "ある", level: "推奨", message: "退職時の有給消化状況を確認するため作成を推奨します。" },
      { equals: "ない", level: "不要", message: "有給残日数がない場合は不要です。" },
      { equals: "わからない", level: "確認が必要", message: "勤怠管理情報を確認してください。" },
    ],
  },
  {
    docKey: "employment_insurance_loss",
    question: { key: "has_employment_insurance", text: "この人は雇用保険に加入していますか？", options: ["はい", "いいえ", "わからない"] },
    rules: [
      { equals: "はい", level: "必須の場合あり", message: "雇用保険の資格喪失手続きが必要になる可能性があります。" },
      { equals: "いいえ", level: "不要", message: "雇用保険に加入していない場合は不要です。" },
      { equals: "わからない", level: "確認が必要", message: "雇用保険の加入状況を確認してください。" },
    ],
  },
  {
    docKey: "separation_certificate",
    question: { key: "wants_separation_slip", text: "退職者は離職票を希望していますか？", options: ["希望している", "希望していない", "未確認"] },
    rules: [
      { equals: "希望している", level: "必須の場合あり", message: "離職票発行のために必要になる可能性があります。" },
      { equals: "希望していない", level: "場合による", message: "状況により不要な場合があります。" },
      { equals: "未確認", level: "確認が必要", message: "本人に確認してください。" },
    ],
  },
  {
    docKey: "social_insurance_loss",
    question: { key: "has_social_insurance", text: "この人は社会保険に加入していますか？", options: ["はい", "いいえ", "わからない"] },
    rules: [
      { equals: "はい", level: "必須の場合あり", message: "社会保険の資格喪失手続きが必要になる可能性があります。" },
      { equals: "いいえ", level: "不要", message: "社会保険に加入していない場合は不要です。" },
      { equals: "わからない", level: "確認が必要", message: "社会保険の加入状況を確認してください。" },
    ],
  },
  {
    docKey: "withholding_slip",
    question: { key: "has_salary_payment", text: "この人に給与の支払いはありますか？", options: ["ある", "ない", "わからない"] },
    rules: [
      { equals: "ある", level: "必須", message: "退職者本人に交付する必要があります。" },
      { equals: "ない", level: "確認が必要", message: "給与支払いがない場合でも状況を確認してください。" },
      { equals: "わからない", level: "確認が必要", message: "給与支払状況を確認してください。" },
    ],
  },
  // --- 入社系 ---
  {
    docKey: "social_insurance_enrollment",
    question: { key: "meets_social_insurance", text: "この方は社会保険（健康保険・厚生年金）の加入要件を満たしますか？", options: ["満たす", "満たさない", "わからない"] },
    rules: [
      { equals: "満たす", level: "必須の場合あり", message: "社会保険の加入手続きが必要になる可能性があります。" },
      { equals: "満たさない", level: "不要", message: "加入要件を満たさない場合は不要です。" },
      { equals: "わからない", level: "確認が必要", message: "労働時間・契約内容から加入要件を確認してください。" },
    ],
  },
  {
    docKey: "employment_insurance_enrollment",
    question: { key: "meets_employment_insurance", text: "この方は雇用保険の加入要件（週20時間以上など）を満たしますか？", options: ["満たす", "満たさない", "わからない"] },
    rules: [
      { equals: "満たす", level: "必須の場合あり", message: "雇用保険の加入手続きが必要になる可能性があります。" },
      { equals: "満たさない", level: "不要", message: "加入要件を満たさない場合は不要です。" },
      { equals: "わからない", level: "確認が必要", message: "所定労働時間などから加入要件を確認してください。" },
    ],
  },
  {
    docKey: "commute_route_application",
    question: { key: "commute_allowance", text: "通勤手当の支給対象ですか？", options: ["対象", "対象外", "未定"] },
    rules: [
      { equals: "対象", level: "推奨", message: "通勤経路・手当の算定のため作成を推奨します。" },
      { equals: "対象外", level: "不要", message: "通勤手当の支給対象でない場合は不要です。" },
      { equals: "未定", level: "確認が必要", message: "通勤手当の運用を確認してください。" },
    ],
  },
  {
    docKey: "dependent_deduction_guide",
    question: { key: "needs_dependent_guide", text: "扶養控除等申告書の提出・年末調整の対象になりますか？", options: ["対象", "対象外", "わからない"] },
    rules: [
      { equals: "対象", level: "場合による", message: "提出の案内を行うと手続きが円滑になります。" },
      { equals: "対象外", level: "不要", message: "対象外の場合は不要です。" },
      { equals: "わからない", level: "確認が必要", message: "税務処理の運用を確認してください。" },
    ],
  },
  {
    docKey: "salary_account_application",
    question: { key: "needs_salary_account", text: "給与（報酬）の振込先口座の届出が必要ですか？", options: ["必要", "不要", "未定"] },
    rules: [
      { equals: "必要", level: "推奨", message: "振込先の登録のため作成を推奨します。" },
      { equals: "不要", level: "不要", message: "既に登録済みなど不要な場合があります。" },
      { equals: "未定", level: "確認が必要", message: "支払方法を確認してください。" },
    ],
  },
];

// 候補ルール（手続き × 対象者区分 → 書類と初期必要度）
interface CandidacyDoc {
  key: string;
  level: string;
  reason: string;
}
interface Candidacy {
  procedureKey: string;
  workerTypeKey: string;
  docs: CandidacyDoc[];
}

// 退職：標準的な被用者（正社員・契約社員・アルバイト/パート）
const RETIREMENT_STANDARD: CandidacyDoc[] = [
  { key: "retirement_letter", level: "場合による", reason: "退職の意思を書面で残すため候補に表示しています。" },
  { key: "retirement_agreement", level: "推奨", reason: "退職条件のトラブル防止のため候補に表示しています。" },
  { key: "property_return_checklist", level: "場合による", reason: "貸与物がある場合に返却状況を記録するため候補に表示しています。" },
  { key: "final_salary_confirmation", level: "場合による", reason: "最終給与の精算内容を確認するため候補に表示しています。" },
  { key: "paid_leave_confirmation", level: "場合による", reason: "有給休暇の残日数がある場合に確認するため候補に表示しています。" },
  { key: "employment_insurance_loss", level: "必須の場合あり", reason: "雇用保険に加入している場合に手続きが必要になるため候補に表示しています。" },
  { key: "separation_certificate", level: "場合による", reason: "離職票を希望する場合に必要になるため候補に表示しています。" },
  { key: "social_insurance_loss", level: "必須の場合あり", reason: "社会保険に加入している場合に手続きが必要になるため候補に表示しています。" },
  { key: "withholding_slip", level: "必須", reason: "給与を支払った退職者へ交付が必要になるため候補に表示しています。" },
];

// 退職：派遣社員（多くの手続きは派遣元が実施）
const RETIREMENT_TEMP: CandidacyDoc[] = [
  { key: "retirement_letter", level: "確認が必要", reason: "派遣契約の終了手続きは派遣元にご確認ください。" },
  { key: "property_return_checklist", level: "場合による", reason: "受け入れ先からの貸与物がある場合に記録します。" },
  { key: "final_salary_confirmation", level: "確認が必要", reason: "給与の支払いは派遣元が行うため、派遣元にご確認ください。" },
  { key: "employment_insurance_loss", level: "確認が必要", reason: "雇用保険の手続きは派遣元が行う場合があります。" },
  { key: "social_insurance_loss", level: "確認が必要", reason: "社会保険の手続きは派遣元が行う場合があります。" },
  { key: "separation_certificate", level: "確認が必要", reason: "離職票の手続きは派遣元にご確認ください。" },
  { key: "withholding_slip", level: "確認が必要", reason: "源泉徴収票は給与支払者（派遣元）が交付する場合があります。" },
];

// 退職：業務委託（契約終了。被用者向けの手続きは原則対象外）
const RETIREMENT_CONTRACTOR: CandidacyDoc[] = [
  { key: "retirement_agreement", level: "場合による", reason: "業務委託契約の終了条件を確認・合意するため候補に表示しています。" },
  { key: "property_return_checklist", level: "場合による", reason: "貸与物がある場合に返却状況を記録するため候補に表示しています。" },
  { key: "withholding_slip", level: "確認が必要", reason: "業務委託は給与でなく報酬のため、支払調書等の要否を確認してください。" },
  { key: "employment_insurance_loss", level: "不要", reason: "業務委託は雇用保険の対象外です。" },
  { key: "social_insurance_loss", level: "不要", reason: "業務委託は会社の社会保険の対象外です。" },
  { key: "paid_leave_confirmation", level: "不要", reason: "業務委託は労働基準法上の有給休暇の対象外です。" },
];

// 退職：役員（退任）
const RETIREMENT_EXECUTIVE: CandidacyDoc[] = [
  { key: "retirement_letter", level: "確認が必要", reason: "役員は「辞任届」等が適切な場合があります。" },
  { key: "retirement_agreement", level: "場合による", reason: "退任条件を確認・合意するため候補に表示しています。" },
  { key: "property_return_checklist", level: "場合による", reason: "貸与物がある場合に返却状況を記録するため候補に表示しています。" },
  { key: "final_salary_confirmation", level: "場合による", reason: "最終の役員報酬の精算内容を確認するため候補に表示しています。" },
  { key: "social_insurance_loss", level: "必須の場合あり", reason: "役員報酬で社会保険に加入している場合に手続きが必要になります。" },
  { key: "withholding_slip", level: "必須", reason: "役員報酬の源泉徴収票を交付するため候補に表示しています。" },
  { key: "employment_insurance_loss", level: "不要", reason: "役員は原則として雇用保険の対象外です。" },
  { key: "separation_certificate", level: "不要", reason: "役員は原則として雇用保険の対象外です。" },
  { key: "paid_leave_confirmation", level: "不要", reason: "役員は労働基準法上の有給休暇の対象外です。" },
];

// 入社：標準的な被用者（正社員・契約社員）
const ONBOARDING_STANDARD: CandidacyDoc[] = [
  { key: "working_conditions_notice", level: "必須", reason: "労働条件の明示は法令上必要なため候補に表示しています。" },
  { key: "employment_contract", level: "推奨", reason: "契約内容を明確にするため作成を推奨します。" },
  { key: "onboarding_pledge", level: "推奨", reason: "服務規律の確認のため候補に表示しています。" },
  { key: "nda_pledge", level: "推奨", reason: "秘密情報の保護のため候補に表示しています。" },
  { key: "dependent_deduction_guide", level: "場合による", reason: "年末調整・扶養の状況により案内します。" },
  { key: "salary_account_application", level: "推奨", reason: "給与振込先の届出のため候補に表示しています。" },
  { key: "emergency_contact", level: "推奨", reason: "緊急時の連絡先把握のため候補に表示しています。" },
  { key: "commute_route_application", level: "場合による", reason: "通勤手当の支給対象の場合に必要です。" },
  { key: "social_insurance_enrollment", level: "必須の場合あり", reason: "加入要件を満たす場合に手続きが必要になります。" },
  { key: "employment_insurance_enrollment", level: "必須の場合あり", reason: "加入要件を満たす場合に手続きが必要になります。" },
];

// 入社：アルバイト・パート（加入要件は労働時間等により変動）
const ONBOARDING_PARTTIME: CandidacyDoc[] = [
  { key: "working_conditions_notice", level: "必須", reason: "労働条件の明示は法令上必要なため候補に表示しています。" },
  { key: "employment_contract", level: "推奨", reason: "契約内容を明確にするため作成を推奨します。" },
  { key: "onboarding_pledge", level: "場合による", reason: "会社の運用により提出を求める場合があります。" },
  { key: "nda_pledge", level: "場合による", reason: "業務内容により秘密保持を求める場合があります。" },
  { key: "dependent_deduction_guide", level: "場合による", reason: "年末調整・扶養の状況により案内します。" },
  { key: "salary_account_application", level: "推奨", reason: "給与振込先の届出のため候補に表示しています。" },
  { key: "emergency_contact", level: "推奨", reason: "緊急時の連絡先把握のため候補に表示しています。" },
  { key: "commute_route_application", level: "場合による", reason: "通勤手当の支給対象の場合に必要です。" },
  { key: "social_insurance_enrollment", level: "場合による", reason: "労働時間等により加入要件を満たす場合があります。" },
  { key: "employment_insurance_enrollment", level: "場合による", reason: "週20時間以上など加入要件を満たす場合があります。" },
];

// 入社：派遣社員（受け入れ。雇用関係の手続きは派遣元）
const ONBOARDING_TEMP: CandidacyDoc[] = [
  { key: "nda_pledge", level: "推奨", reason: "受け入れ先での秘密保持のため候補に表示しています。" },
  { key: "emergency_contact", level: "場合による", reason: "受け入れ先での緊急連絡先把握のため候補に表示しています。" },
  { key: "working_conditions_notice", level: "確認が必要", reason: "労働条件の明示は派遣元が行います。" },
  { key: "social_insurance_enrollment", level: "確認が必要", reason: "社会保険の手続きは派遣元が行います。" },
  { key: "employment_insurance_enrollment", level: "確認が必要", reason: "雇用保険の手続きは派遣元が行います。" },
];

// 入社：業務委託（契約開始。被用者向け書類は原則対象外）
const ONBOARDING_CONTRACTOR: CandidacyDoc[] = [
  { key: "nda_pledge", level: "推奨", reason: "秘密情報の保護のため候補に表示しています。" },
  { key: "salary_account_application", level: "場合による", reason: "報酬の振込先の届出が必要な場合に作成します。" },
  { key: "emergency_contact", level: "場合による", reason: "連絡体制の把握のため候補に表示しています。" },
  { key: "employment_contract", level: "不要", reason: "業務委託は雇用契約ではないため、業務委託契約書を別途締結してください。" },
  { key: "working_conditions_notice", level: "不要", reason: "業務委託は労働条件通知書の対象外です。" },
  { key: "social_insurance_enrollment", level: "不要", reason: "業務委託は会社の社会保険の対象外です。" },
  { key: "employment_insurance_enrollment", level: "不要", reason: "業務委託は雇用保険の対象外です。" },
];

// 入社：役員（就任。委任契約）
const ONBOARDING_EXECUTIVE: CandidacyDoc[] = [
  { key: "onboarding_pledge", level: "場合による", reason: "就任にあたっての誓約を求める場合があります。" },
  { key: "nda_pledge", level: "推奨", reason: "秘密情報の保護のため候補に表示しています。" },
  { key: "emergency_contact", level: "推奨", reason: "緊急時の連絡先把握のため候補に表示しています。" },
  { key: "salary_account_application", level: "推奨", reason: "役員報酬の振込先の届出のため候補に表示しています。" },
  { key: "dependent_deduction_guide", level: "場合による", reason: "年末調整・扶養の状況により案内します。" },
  { key: "social_insurance_enrollment", level: "必須の場合あり", reason: "役員報酬で加入要件を満たす場合に手続きが必要になります。" },
  { key: "employment_insurance_enrollment", level: "不要", reason: "役員は原則として雇用保険の対象外です。" },
  { key: "working_conditions_notice", level: "不要", reason: "役員は委任契約のため労働条件通知書の対象外です。" },
  { key: "employment_contract", level: "不要", reason: "役員は委任契約のため雇用契約書の対象外です。" },
];

const CANDIDACY: Candidacy[] = [
  // 退職
  { procedureKey: "retirement", workerTypeKey: "full_time_employee", docs: RETIREMENT_STANDARD },
  { procedureKey: "retirement", workerTypeKey: "contract_employee", docs: RETIREMENT_STANDARD },
  { procedureKey: "retirement", workerTypeKey: "part_time", docs: RETIREMENT_STANDARD },
  { procedureKey: "retirement", workerTypeKey: "temporary_staff", docs: RETIREMENT_TEMP },
  { procedureKey: "retirement", workerTypeKey: "contractor", docs: RETIREMENT_CONTRACTOR },
  { procedureKey: "retirement", workerTypeKey: "executive", docs: RETIREMENT_EXECUTIVE },
  // 入社
  { procedureKey: "onboarding", workerTypeKey: "full_time_employee", docs: ONBOARDING_STANDARD },
  { procedureKey: "onboarding", workerTypeKey: "contract_employee", docs: ONBOARDING_STANDARD },
  { procedureKey: "onboarding", workerTypeKey: "part_time", docs: ONBOARDING_PARTTIME },
  { procedureKey: "onboarding", workerTypeKey: "temporary_staff", docs: ONBOARDING_TEMP },
  { procedureKey: "onboarding", workerTypeKey: "contractor", docs: ONBOARDING_CONTRACTOR },
  { procedureKey: "onboarding", workerTypeKey: "executive", docs: ONBOARDING_EXECUTIVE },
];

// フォーム定義（schemaJson）。PDFテンプレートの参照項目に合わせて項目を用意する。
const RECIPIENT_FIELDS = [
  { name: "addresseeCompany", label: "宛先（会社名）", type: "text", help: "未入力時は会社設定を使用します" },
  { name: "addresseeName", label: "宛先（代表者名）", type: "text", help: "例：代表取締役 ○○ ○○（未入力時は会社設定を使用）" },
];

const FORMS: Record<string, unknown> = {
  retirement_letter: {
    sections: [
      { title: "提出情報", fields: [
        { name: "submitDate", label: "提出日", type: "date" },
        ...RECIPIENT_FIELDS,
      ] },
      { title: "提出者", fields: [
        { name: "department", label: "所属", type: "text" },
        { name: "employeeNo", label: "社員番号", type: "text" },
        { name: "employeeName", label: "氏名", type: "text", required: true },
      ] },
      { title: "退職内容", fields: [
        { name: "retirementReason", label: "退職理由", type: "select", required: true, options: ["一身上の都合", "契約期間満了", "会社都合", "定年", "その他"] },
        { name: "retirementDate", label: "退職日", type: "date", required: true },
        { name: "remarks", label: "備考", type: "textarea" },
      ] },
    ],
  },
  retirement_agreement: {
    sections: [
      { title: "当事者", fields: [
        { name: "companyName", label: "会社名（甲）", type: "text", help: "未入力時は会社設定を使用します" },
        { name: "companyRep", label: "会社代表者", type: "text" },
        { name: "employeeName", label: "本人氏名（乙）", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
      ] },
      { title: "退職条件", fields: [
        { name: "retirementDate", label: "退職日", type: "date", required: true },
        { name: "lastWorkDate", label: "最終出勤日", type: "date" },
        { name: "retirementReason", label: "退職理由", type: "text" },
      ] },
      { title: "金銭・物品", fields: [
        { name: "severancePay", label: "退職金", type: "text", help: "支給する場合は金額・支払時期を記載" },
        { name: "unpaidWages", label: "未払賃金等", type: "text" },
        { name: "propertyReturn", label: "貸与物の返却", type: "textarea", help: "未入力時は定型文を記載します" },
      ] },
      { title: "守秘・清算", fields: [
        { name: "confidentiality", label: "守秘義務", type: "textarea", help: "未入力時は定型文を記載します" },
        { name: "nonDisclosure", label: "口外禁止", type: "textarea", help: "未入力時は定型文を記載します" },
        { name: "settlement", label: "清算条項", type: "textarea", help: "未入力時は定型文を記載します" },
        { name: "others", label: "その他", type: "textarea" },
        { name: "agreementDate", label: "合意日", type: "date" },
      ] },
    ],
  },
  property_return_checklist: {
    sections: [
      { title: "基本情報", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
        { name: "employeeNo", label: "社員番号", type: "text" },
        { name: "returnDate", label: "返却日", type: "date" },
        ...RECIPIENT_FIELDS,
      ] },
      { title: "返却対象", fields: [
        { name: "returnedItems", label: "返却した貸与物", type: "checkbox", options: ["社員証", "制服", "鍵", "ロッカー鍵", "PC", "スマートフォン", "名刺", "健康保険証", "書類・データ", "その他"] },
        { name: "items", label: "その他・詳細", type: "textarea", help: "上記以外の貸与物や型番など" },
        { name: "returnStatus", label: "返却状況", type: "select", options: ["全て返却済み", "一部未返却", "未返却"] },
        { name: "remarks", label: "未返却・備考", type: "textarea" },
      ] },
    ],
  },
  final_salary_confirmation: {
    sections: [
      { title: "基本情報", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
        { name: "employeeNo", label: "社員番号", type: "text" },
        { name: "period", label: "対象期間", type: "text", help: "例：2026年6月分" },
      ] },
      { title: "支給", fields: [
        { name: "baseSalary", label: "基本給", type: "number" },
        { name: "overtime", label: "残業手当", type: "number" },
        { name: "allowance", label: "各種手当", type: "number" },
        { name: "transport", label: "交通費", type: "number" },
        { name: "grossAmount", label: "総支給額", type: "number" },
      ] },
      { title: "控除", fields: [
        { name: "socialInsurance", label: "社会保険料", type: "number" },
        { name: "incomeTax", label: "所得税", type: "number" },
        { name: "residentTax", label: "住民税", type: "number" },
        { name: "otherDeduction", label: "その他控除", type: "number" },
        { name: "deductionTotal", label: "控除合計", type: "number" },
      ] },
      { title: "差引支給", fields: [
        { name: "netAmount", label: "差引支給額", type: "number" },
        { name: "unpaid", label: "未払い分の有無", type: "select", options: ["なし", "あり"] },
        { name: "unpaidDetail", label: "未払い分の内容", type: "text" },
        { name: "payMethod", label: "支給方法", type: "select", options: ["銀行振込", "現金", "その他"] },
        { name: "payDate", label: "支給予定日", type: "date" },
        { name: "remarks", label: "備考", type: "textarea" },
      ] },
    ],
  },
  paid_leave_confirmation: {
    sections: [
      { title: "基本情報", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
        { name: "employeeNo", label: "社員番号", type: "text" },
        { name: "baseDate", label: "基準日", type: "date" },
      ] },
      { title: "有給休暇の状況", fields: [
        { name: "grantedDays", label: "付与日数", type: "number" },
        { name: "usedDays", label: "取得済日数", type: "number" },
        { name: "remainingDays", label: "残日数", type: "number" },
        { name: "expiringDays", label: "時効消滅予定", type: "number" },
        { name: "plannedDays", label: "退職日までの取得予定", type: "number" },
        { name: "buyback", label: "買い取りの有無", type: "select", options: ["なし", "あり"] },
        { name: "buybackDays", label: "買い取り日数", type: "number" },
        { name: "remarks", label: "備考", type: "textarea" },
      ] },
    ],
  },

  // 退職・行政系
  employment_insurance_loss: {
    sections: [
      { title: "対象者", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "nameKana", label: "フリガナ", type: "text" },
        { name: "employeeNo", label: "社員番号", type: "text" },
        { name: "department", label: "所属", type: "text" },
        { name: "birthDate", label: "生年月日", type: "date" },
      ] },
      { title: "雇用保険", fields: [
        { name: "insuredNumber", label: "被保険者番号", type: "text" },
        { name: "retirementDate", label: "退職日／資格喪失日", type: "date" },
        { name: "lossReason", label: "喪失理由", type: "select", options: ["自己都合", "会社都合", "契約期間満了", "定年", "その他"] },
        { name: "remarks", label: "備考", type: "textarea" },
      ] },
    ],
  },
  separation_certificate: {
    sections: [
      { title: "対象者", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "nameKana", label: "フリガナ", type: "text" },
        { name: "employeeNo", label: "社員番号", type: "text" },
        { name: "department", label: "所属", type: "text" },
        { name: "birthDate", label: "生年月日", type: "date" },
      ] },
      { title: "離職証明", fields: [
        { name: "insuredNumber", label: "被保険者番号", type: "text" },
        { name: "retirementDate", label: "退職日", type: "date" },
        { name: "wantsSlip", label: "離職票の希望", type: "select", options: ["希望する", "希望しない", "未確認"] },
        { name: "separationReason", label: "離職理由", type: "text" },
        { name: "remarks", label: "備考", type: "textarea" },
      ] },
    ],
  },
  social_insurance_loss: {
    sections: [
      { title: "対象者", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "nameKana", label: "フリガナ", type: "text" },
        { name: "employeeNo", label: "社員番号", type: "text" },
        { name: "department", label: "所属", type: "text" },
        { name: "birthDate", label: "生年月日", type: "date" },
      ] },
      { title: "社会保険", fields: [
        { name: "insuredNumber", label: "記号・番号", type: "text" },
        { name: "lossDate", label: "資格喪失日", type: "date" },
        { name: "dependents", label: "被扶養者の人数", type: "number" },
        { name: "remarks", label: "備考", type: "textarea" },
      ] },
    ],
  },
  withholding_slip: {
    sections: [
      { title: "対象者", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "nameKana", label: "フリガナ", type: "text" },
        { name: "employeeNo", label: "社員番号", type: "text" },
        { name: "department", label: "所属", type: "text" },
      ] },
      { title: "源泉徴収", fields: [
        { name: "targetYear", label: "対象年", type: "number", help: "例：2026" },
        { name: "totalPayment", label: "支払金額", type: "number" },
        { name: "withholdingTax", label: "源泉徴収税額", type: "number" },
        { name: "socialInsurance", label: "社会保険料等", type: "number" },
        { name: "deliveryDate", label: "交付日", type: "date" },
        { name: "remarks", label: "備考", type: "textarea" },
      ] },
    ],
  },

  // 入社系
  working_conditions_notice: {
    sections: [
      { title: "基本情報", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
        { name: "position", label: "役職", type: "text" },
        { name: "contractType", label: "雇用区分", type: "select", options: ["正社員", "契約社員", "パート・アルバイト", "その他"] },
        { name: "startDate", label: "雇入れ日", type: "date" },
      ] },
      { title: "就業条件", fields: [
        { name: "workplace", label: "就業の場所", type: "text" },
        { name: "jobDescription", label: "業務の内容", type: "textarea" },
        { name: "workHours", label: "始業・終業時刻", type: "text", help: "例：9:00〜18:00" },
        { name: "breakTime", label: "休憩時間", type: "text" },
        { name: "holidays", label: "休日", type: "textarea" },
      ] },
      { title: "賃金・退職", fields: [
        { name: "wage", label: "賃金", type: "text" },
        { name: "wagePaymentDate", label: "賃金締切・支払日", type: "text" },
        { name: "retirementPolicy", label: "退職に関する事項", type: "textarea" },
        { name: "socialInsurance", label: "加入保険", type: "checkbox", options: ["健康保険", "厚生年金", "雇用保険", "労災保険"] },
        { name: "remarks", label: "備考", type: "textarea" },
      ] },
    ],
  },
  employment_contract: {
    sections: [
      { title: "当事者", fields: [
        { name: "companyName", label: "会社名", type: "text", help: "未入力時は会社設定を使用します" },
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
        { name: "position", label: "役職", type: "text" },
      ] },
      { title: "契約内容", fields: [
        { name: "contractType", label: "雇用区分", type: "select", options: ["正社員", "契約社員", "パート・アルバイト", "その他"] },
        { name: "contractPeriod", label: "契約期間", type: "text", help: "期間の定めの有無・期間" },
        { name: "startDate", label: "雇入れ日", type: "date" },
        { name: "workplace", label: "就業の場所", type: "text" },
        { name: "jobDescription", label: "業務の内容", type: "textarea" },
        { name: "workHours", label: "労働時間", type: "text" },
        { name: "wage", label: "賃金", type: "text" },
        { name: "remarks", label: "特記事項", type: "textarea" },
      ] },
    ],
  },
  onboarding_pledge: {
    sections: [
      { title: "基本情報", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
        { name: "startDate", label: "入社日", type: "date" },
      ] },
      { title: "誓約", fields: [
        { name: "pledgeItems", label: "誓約事項", type: "textarea", help: "就業規則の遵守、職務専念 等" },
        { name: "pledgeDate", label: "誓約日", type: "date" },
      ] },
    ],
  },
  nda_pledge: {
    sections: [
      { title: "基本情報", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
      ] },
      { title: "秘密保持", fields: [
        { name: "scope", label: "秘密情報の範囲", type: "textarea" },
        { name: "term", label: "有効期間", type: "text", help: "例：在職中および退職後3年間" },
        { name: "pledgeDate", label: "誓約日", type: "date" },
      ] },
    ],
  },
  dependent_deduction_guide: {
    sections: [
      { title: "案内", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "targetYear", label: "対象年", type: "number", help: "例：2026" },
        { name: "submitDeadline", label: "提出期限", type: "date" },
        { name: "guideNote", label: "案内文", type: "textarea" },
      ] },
    ],
  },
  salary_account_application: {
    sections: [
      { title: "申請者", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
      ] },
      { title: "口座情報", fields: [
        { name: "bankName", label: "銀行名", type: "text" },
        { name: "branchName", label: "支店名", type: "text" },
        { name: "accountType", label: "預金種別", type: "select", options: ["普通", "当座"] },
        { name: "accountNumber", label: "口座番号", type: "text" },
        { name: "accountHolder", label: "口座名義（カナ）", type: "text" },
      ] },
    ],
  },
  emergency_contact: {
    sections: [
      { title: "本人", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
      ] },
      { title: "緊急連絡先①", fields: [
        { name: "contactName1", label: "氏名", type: "text" },
        { name: "relationship1", label: "続柄", type: "text" },
        { name: "phone1", label: "電話番号", type: "text" },
      ] },
      { title: "緊急連絡先②", fields: [
        { name: "contactName2", label: "氏名", type: "text" },
        { name: "relationship2", label: "続柄", type: "text" },
        { name: "phone2", label: "電話番号", type: "text" },
      ] },
      { title: "住所", fields: [
        { name: "address", label: "現住所", type: "textarea" },
      ] },
    ],
  },
  commute_route_application: {
    sections: [
      { title: "申請者", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
      ] },
      { title: "通勤情報", fields: [
        { name: "homeAddress", label: "自宅住所", type: "text" },
        { name: "transportType", label: "通勤手段", type: "select", options: ["電車", "バス", "電車・バス", "自動車", "自転車", "徒歩"] },
        { name: "route", label: "経路", type: "textarea", help: "出発駅〜到着駅、乗換 等" },
        { name: "distanceKm", label: "片道距離（km）", type: "number" },
        { name: "monthlyFare", label: "1か月の通勤費", type: "number" },
        { name: "remarks", label: "備考", type: "textarea" },
      ] },
    ],
  },
  social_insurance_enrollment: {
    sections: [
      { title: "対象者", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "nameKana", label: "フリガナ", type: "text" },
        { name: "birthDate", label: "生年月日", type: "date" },
        { name: "startDate", label: "資格取得日", type: "date" },
      ] },
      { title: "確認", fields: [
        { name: "dependents", label: "被扶養者の人数", type: "number" },
        { name: "basicPensionConfirmed", label: "基礎年金番号の確認", type: "select", options: ["確認済", "未確認"] },
        { name: "remarks", label: "備考", type: "textarea", help: "マイナンバーは本システムに保存しません" },
      ] },
    ],
  },
  employment_insurance_enrollment: {
    sections: [
      { title: "対象者", fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "nameKana", label: "フリガナ", type: "text" },
        { name: "birthDate", label: "生年月日", type: "date" },
        { name: "startDate", label: "資格取得日", type: "date" },
      ] },
      { title: "確認", fields: [
        { name: "previousInsuredNumber", label: "前職の被保険者番号", type: "text" },
        { name: "weeklyHours", label: "週所定労働時間", type: "number" },
        { name: "remarks", label: "備考", type: "textarea" },
      ] },
    ],
  },
};

// 専用定義が無い場合のフォールバック
const SIMPLE_FORM = {
  sections: [
    {
      title: "対象者情報",
      fields: [
        { name: "employeeName", label: "氏名", type: "text", required: true },
        { name: "department", label: "所属", type: "text" },
        { name: "retirementDate", label: "退職日／対象日", type: "date" },
        { name: "remarks", label: "備考", type: "textarea" },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 投入処理
// ---------------------------------------------------------------------------

async function main() {
  // 管理者ユーザー
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { name: "管理者", passwordHash, role: "admin" },
    create: { name: "管理者", email: "admin@example.com", passwordHash, role: "admin" },
  });

  // 手続き目的
  for (let i = 0; i < PROCEDURES.length; i++) {
    const p = PROCEDURES[i];
    await prisma.procedureType.upsert({
      where: { key: p.key },
      update: { name: p.name, description: p.description, sortOrder: i },
      create: { key: p.key, name: p.name, description: p.description, sortOrder: i },
    });
  }

  // 対象者区分
  for (let i = 0; i < WORKER_TYPES.length; i++) {
    const w = WORKER_TYPES[i];
    await prisma.workerType.upsert({
      where: { key: w.key },
      update: { name: w.name, sortOrder: i },
      create: { key: w.key, name: w.name, sortOrder: i },
    });
  }

  // 書類マスタ
  const allDocs = [
    ...RETIREMENT_DOCS.map((d) => ({ ...d, category: "retirement" })),
    ...ONBOARDING_DOCS.map((d) => ({ ...d, category: "onboarding" })),
  ];
  for (const d of allDocs) {
    const data = {
      name: d.name,
      category: d.category,
      purpose: d.purpose ?? null,
      defaultRequiredLevel: d.defaultRequiredLevel,
      whenRequired: (d as { whenRequired?: string }).whenRequired ?? null,
      whenNotRequired: (d as { whenNotRequired?: string }).whenNotRequired ?? null,
      submissionTo: d.submissionTo ?? null,
      storageLocation: d.storageLocation ?? null,
      requiresSignature: d.requiresSignature ?? false,
      requiresCompanySeal: d.requiresCompanySeal ?? false,
      notes: (d as { notes?: string }).notes ?? null,
    };
    await prisma.document.upsert({
      where: { key: d.key },
      update: data,
      create: { key: d.key, ...data },
    });
  }

  // ID 解決
  const procedures = await prisma.procedureType.findMany();
  const workerTypes = await prisma.workerType.findMany();
  const docs = await prisma.document.findMany();
  const procByKey = Object.fromEntries(procedures.map((p) => [p.key, p]));
  const wtByKey = Object.fromEntries(workerTypes.map((w) => [w.key, w]));
  const docByKey = Object.fromEntries(docs.map((d) => [d.key, d]));
  const judgeByDoc = Object.fromEntries(JUDGEMENTS.map((j) => [j.docKey, j]));

  // スコープデータをクリアして再投入
  await prisma.documentJudgementRule.deleteMany();
  await prisma.documentJudgementQuestion.deleteMany();
  await prisma.documentCandidateRule.deleteMany();
  await prisma.documentForm.deleteMany();

  // 候補ルール + 判定質問 + 判定ルール（全 手続き×区分）
  for (const combo of CANDIDACY) {
    const proc = procByKey[combo.procedureKey];
    const wt = wtByKey[combo.workerTypeKey];
    if (!proc || !wt) continue;

    for (let i = 0; i < combo.docs.length; i++) {
      const c = combo.docs[i];
      const doc = docByKey[c.key];
      if (!doc) continue;

      await prisma.documentCandidateRule.create({
        data: {
          procedureTypeId: proc.id,
          workerTypeId: wt.id,
          documentId: doc.id,
          defaultRequiredLevel: c.level,
          displayReason: c.reason,
          sortOrder: i,
        },
      });

      // 判定質問は、ライブラリに定義があり、かつ初期必要度が確定的でない場合のみ付与する
      const j = judgeByDoc[c.key];
      const fixed = c.level === "不要" || c.level === "確認が必要";
      if (!j || fixed) continue;

      await prisma.documentJudgementQuestion.create({
        data: {
          documentId: doc.id,
          procedureTypeId: proc.id,
          workerTypeId: wt.id,
          key: j.question.key,
          questionText: j.question.text,
          inputType: "radio",
          optionsJson: JSON.stringify(j.question.options),
          helpText: j.question.help ?? null,
          sortOrder: 0,
        },
      });
      for (let k = 0; k < j.rules.length; k++) {
        const r = j.rules[k];
        await prisma.documentJudgementRule.create({
          data: {
            documentId: doc.id,
            procedureTypeId: proc.id,
            workerTypeId: wt.id,
            conditionJson: JSON.stringify({ questionKey: j.question.key, equals: r.equals }),
            resultRequiredLevel: r.level,
            resultMessage: r.message,
            sortOrder: k,
          },
        });
      }
    }
  }

  // フォーム定義（全書類に用意。専用が無いものは簡易フォーム）
  for (const doc of docs) {
    const schema = FORMS[doc.key] ?? SIMPLE_FORM;
    await prisma.documentForm.create({
      data: { documentId: doc.id, schemaJson: JSON.stringify(schema) },
    });
  }

  // サンプル従業員
  const employeeCount = await prisma.employee.count();
  if (employeeCount === 0) {
    await prisma.employee.create({
      data: {
        name: "山田 太郎",
        nameKana: "ヤマダ タロウ",
        employmentType: "part_time",
        department: "店舗運営部",
        position: "スタッフ",
        email: "taro@example.com",
      },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
