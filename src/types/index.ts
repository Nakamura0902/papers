// 必要度ステータス
export const REQUIRED_LEVELS = [
  "必須",
  "必須の場合あり",
  "推奨",
  "場合による",
  "不要",
  "確認が必要",
] as const;

export type RequiredLevel = (typeof REQUIRED_LEVELS)[number];

// 必要度ごとのバッジ配色（Tailwind クラス）
export const REQUIRED_LEVEL_STYLES: Record<RequiredLevel, string> = {
  必須: "bg-red-100 text-red-800 border-red-300",
  必須の場合あり: "bg-orange-100 text-orange-800 border-orange-300",
  推奨: "bg-blue-100 text-blue-800 border-blue-300",
  場合による: "bg-amber-100 text-amber-800 border-amber-300",
  不要: "bg-gray-100 text-gray-600 border-gray-300",
  確認が必要: "bg-purple-100 text-purple-800 border-purple-300",
};

// フォーム項目タイプ
export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "number"
  | "select"
  | "checkbox"
  | "radio";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export interface FormSchema {
  sections: FormSection[];
}

// 作成意思
export type CreationChoice = "create" | "skip" | "undecided";

// 判定結果
export interface JudgementResult {
  resultRequiredLevel: RequiredLevel;
  resultMessage: string;
}
