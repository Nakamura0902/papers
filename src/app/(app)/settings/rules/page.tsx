import { prisma } from "@/lib/prisma";
import RulesManager from "./RulesManager";

export const dynamic = "force-dynamic";

export default async function SettingsRulesPage() {
  const [procedures, workerTypes, documents, candidates, questions, judgementRules] =
    await Promise.all([
      prisma.procedureType.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.workerType.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.document.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
      prisma.documentCandidateRule.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.documentJudgementQuestion.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.documentJudgementRule.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

  return (
    <RulesManager
      procedures={procedures.map((p) => ({ id: p.id, key: p.key, name: p.name }))}
      workerTypes={workerTypes.map((w) => ({ id: w.id, key: w.key, name: w.name }))}
      documents={documents.map((d) => ({ id: d.id, key: d.key, name: d.name }))}
      candidates={candidates.map((c) => ({
        id: c.id,
        procedureTypeId: c.procedureTypeId,
        workerTypeId: c.workerTypeId,
        documentId: c.documentId,
        defaultRequiredLevel: c.defaultRequiredLevel,
        displayReason: c.displayReason,
        sortOrder: c.sortOrder,
      }))}
      questions={questions.map((q) => ({
        id: q.id,
        documentId: q.documentId,
        procedureTypeId: q.procedureTypeId,
        workerTypeId: q.workerTypeId,
        key: q.key,
        questionText: q.questionText,
        optionsJson: q.optionsJson,
        helpText: q.helpText,
        sortOrder: q.sortOrder,
      }))}
      judgementRules={judgementRules.map((r) => ({
        id: r.id,
        documentId: r.documentId,
        procedureTypeId: r.procedureTypeId,
        workerTypeId: r.workerTypeId,
        conditionJson: r.conditionJson,
        resultRequiredLevel: r.resultRequiredLevel,
        resultMessage: r.resultMessage,
        sortOrder: r.sortOrder,
      }))}
    />
  );
}
