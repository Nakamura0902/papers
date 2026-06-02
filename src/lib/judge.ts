import type { RequiredLevel } from "@/types";

export interface JudgementRuleInput {
  conditionJson: string;
  resultRequiredLevel: string;
  resultMessage: string | null;
  sortOrder?: number;
}

interface Condition {
  questionKey: string;
  // いずれか1つを使用
  equals?: string;
  in?: string[];
  includes?: string; // checkbox の配列に含まれるか
}

function matches(condition: Condition, answers: Record<string, unknown>): boolean {
  const value = answers[condition.questionKey];
  if (value === undefined || value === null) return false;

  if (condition.equals !== undefined) {
    return String(value) === condition.equals;
  }
  if (condition.in !== undefined) {
    return condition.in.includes(String(value));
  }
  if (condition.includes !== undefined) {
    if (Array.isArray(value)) return value.map(String).includes(condition.includes);
    return String(value) === condition.includes;
  }
  return false;
}

// 回答 answers に対し、最初にマッチしたルールの結果を返す。
// マッチが無い場合は defaultRequiredLevel を返す。
export function judge(
  rules: JudgementRuleInput[],
  answers: Record<string, unknown>,
  defaultRequiredLevel: string
): { resultRequiredLevel: RequiredLevel; resultMessage: string } {
  const sorted = [...rules].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  for (const rule of sorted) {
    let condition: Condition;
    try {
      condition = JSON.parse(rule.conditionJson);
    } catch {
      continue;
    }
    if (matches(condition, answers)) {
      return {
        resultRequiredLevel: rule.resultRequiredLevel as RequiredLevel,
        resultMessage: rule.resultMessage ?? "",
      };
    }
  }

  return {
    resultRequiredLevel: defaultRequiredLevel as RequiredLevel,
    resultMessage: "確認質問に回答すると必要度の目安が表示されます。",
  };
}
