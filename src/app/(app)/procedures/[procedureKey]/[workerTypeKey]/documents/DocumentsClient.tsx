"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RequiredLevelBadge from "@/components/RequiredLevelBadge";
import NoticeBox from "@/components/NoticeBox";
import { saveFlow, type DocFlow } from "@/lib/flow";
import type { CandidateDocument } from "@/lib/candidates";
import type { CreationChoice } from "@/types";

interface Props {
  procedureKey: string;
  procedureName: string;
  workerTypeKey: string;
  workerTypeName: string;
  documents: CandidateDocument[];
}

interface Condition {
  questionKey: string;
  equals?: string;
  in?: string[];
  includes?: string;
}

// クライアント側の即時判定（lib/judge と同じ評価ロジック）
function clientJudge(
  doc: CandidateDocument,
  answers: Record<string, string>
): { level: string; message: string } | null {
  for (const rule of doc.rules) {
    let cond: Condition;
    try {
      cond = JSON.parse(rule.conditionJson);
    } catch {
      continue;
    }
    const value = answers[cond.questionKey];
    if (value === undefined || value === "") continue;
    const hit =
      (cond.equals !== undefined && value === cond.equals) ||
      (cond.in !== undefined && cond.in.includes(value)) ||
      (cond.includes !== undefined && value === cond.includes);
    if (hit) {
      return { level: rule.resultRequiredLevel, message: rule.resultMessage ?? "" };
    }
  }
  return null;
}

const CHOICE_LABELS: Record<CreationChoice, string> = {
  create: "作成する",
  skip: "作成しない",
  undecided: "未定",
};

export default function DocumentsClient({
  procedureKey,
  procedureName,
  workerTypeKey,
  workerTypeName,
  documents,
}: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [choices, setChoices] = useState<Record<string, CreationChoice>>({});
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [employeeId, setEmployeeId] = useState("");

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => (r.ok ? r.json() : { employees: [] }))
      .then((d) => setEmployees(d.employees ?? []))
      .catch(() => setEmployees([]));
  }, []);

  function setAnswer(docKey: string, qKey: string, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [docKey]: { ...prev[docKey], [qKey]: value },
    }));
  }

  function setChoice(docKey: string, choice: CreationChoice) {
    setChoices((prev) => ({ ...prev, [docKey]: choice }));
  }

  const selected = useMemo(
    () => documents.filter((d) => choices[d.document.key] === "create"),
    [choices, documents]
  );

  function proceed() {
    if (selected.length === 0) return;
    const flow: DocFlow = {
      procedureKey,
      procedureName,
      workerTypeKey,
      workerTypeName,
      employeeId: employeeId || undefined,
      items: selected.map((d) => ({
        documentKey: d.document.key,
        documentName: d.document.name,
        // 区分・回答からプリセットできる値を入れておく
        formData: {
          employeeName: employees.find((e) => e.id === employeeId)?.name ?? "",
        },
      })),
      current: 0,
    };
    saveFlow(flow);
    router.push(`/documents/${flow.items[0].documentKey}/new`);
  }

  return (
    <div>
      <NoticeBox variant="warning">
        判定結果はあくまで目安です。「確認が必要」と表示された場合や判断が難しい場合は、社内担当者・社労士・税理士等の専門家にご確認ください。
      </NoticeBox>

      <div className="mt-4 space-y-4">
        {documents.map((d) => {
          const docKey = d.document.key;
          const docAnswers = answers[docKey] ?? {};
          const judged = clientJudge(d, docAnswers);
          const currentLevel = judged?.level ?? d.initialRequiredLevel;
          const choice = choices[docKey] ?? "undecided";

          return (
            <div key={docKey} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{d.document.name}</h3>
                  {d.displayReason && (
                    <p className="mt-0.5 text-xs text-gray-400">{d.displayReason}</p>
                  )}
                </div>
                <RequiredLevelBadge level={currentLevel} />
              </div>

              {d.document.purpose && (
                <p className="mt-3 text-sm text-gray-700">{d.document.purpose}</p>
              )}

              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                <Detail label="必要になる条件" value={d.document.whenRequired} />
                <Detail label="不要になる条件" value={d.document.whenNotRequired} />
                <Detail label="提出先" value={d.document.submissionTo} />
                <Detail label="社内保存先" value={d.document.storageLocation} />
                <Detail label="本人署名" value={d.document.requiresSignature ? "必要" : "不要"} />
                <Detail label="会社印" value={d.document.requiresCompanySeal ? "必要" : "不要"} />
              </dl>

              {d.document.notes && (
                <div className="mt-3">
                  <NoticeBox variant="warning">{d.document.notes}</NoticeBox>
                </div>
              )}

              {/* 確認質問 */}
              {d.questions.map((q) => (
                <div key={q.key} className="mt-4 rounded-lg bg-gray-50 p-3">
                  <div className="text-sm font-medium text-gray-800">{q.questionText}</div>
                  {q.helpText && <div className="mt-0.5 text-xs text-gray-500">{q.helpText}</div>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                          docAnswers[q.key] === opt
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`${docKey}-${q.key}`}
                          value={opt}
                          checked={docAnswers[q.key] === opt}
                          onChange={() => setAnswer(docKey, q.key, opt)}
                          className="hidden"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* 判定結果 */}
              {judged && (
                <div className="mt-3 flex items-start gap-2 text-sm">
                  <RequiredLevelBadge level={judged.level} />
                  <span className="text-gray-600">{judged.message}</span>
                </div>
              )}

              {/* 作成意思 */}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                {(["create", "skip", "undecided"] as CreationChoice[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setChoice(docKey, c)}
                    className={`rounded-lg border px-4 py-1.5 text-sm font-medium ${
                      choice === c
                        ? c === "create"
                          ? "border-brand-500 bg-brand-600 text-white"
                          : "border-gray-400 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {CHOICE_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* フッター操作 */}
      <div className="sticky bottom-0 mt-6 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">対象者</label>
            <select
              className="input max-w-xs"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">（任意）従業員を選択</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">選択中: {selected.length} 件</span>
            <button onClick={proceed} className="btn-primary" disabled={selected.length === 0}>
              選択した書類の作成へ進む
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-gray-400">{label}：</dt>
      <dd className="text-gray-700">{value ?? "-"}</dd>
    </div>
  );
}
