import { prisma } from "./prisma";

export interface CandidateDocument {
  document: {
    id: string;
    key: string;
    name: string;
    category: string;
    purpose: string | null;
    whenRequired: string | null;
    whenNotRequired: string | null;
    submissionTo: string | null;
    storageLocation: string | null;
    requiresSignature: boolean;
    requiresCompanySeal: boolean;
    notes: string | null;
  };
  displayReason: string | null;
  initialRequiredLevel: string;
  questions: {
    key: string;
    questionText: string;
    inputType: string;
    options: string[];
    helpText: string | null;
  }[];
  rules: {
    conditionJson: string;
    resultRequiredLevel: string;
    resultMessage: string | null;
    sortOrder: number;
  }[];
}

export interface CandidateResult {
  procedure: { key: string; name: string } | null;
  workerType: { key: string; name: string } | null;
  documents: CandidateDocument[];
}

export async function getCandidateDocuments(
  procedureKey: string,
  workerTypeKey: string
): Promise<CandidateResult | null> {
  const [procedure, workerType] = await Promise.all([
    prisma.procedureType.findUnique({ where: { key: procedureKey } }),
    prisma.workerType.findUnique({ where: { key: workerTypeKey } }),
  ]);
  if (!procedure || !workerType) return null;

  const candidates = await prisma.documentCandidateRule.findMany({
    where: { procedureTypeId: procedure.id, workerTypeId: workerType.id },
    orderBy: { sortOrder: "asc" },
    include: {
      document: {
        include: {
          judgementQuestions: {
            where: { procedureTypeId: procedure.id, workerTypeId: workerType.id },
            orderBy: { sortOrder: "asc" },
          },
          judgementRules: {
            where: { procedureTypeId: procedure.id, workerTypeId: workerType.id },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  const documents: CandidateDocument[] = candidates.map((c) => ({
    document: {
      id: c.document.id,
      key: c.document.key,
      name: c.document.name,
      category: c.document.category,
      purpose: c.document.purpose,
      whenRequired: c.document.whenRequired,
      whenNotRequired: c.document.whenNotRequired,
      submissionTo: c.document.submissionTo,
      storageLocation: c.document.storageLocation,
      requiresSignature: c.document.requiresSignature,
      requiresCompanySeal: c.document.requiresCompanySeal,
      notes: c.document.notes,
    },
    displayReason: c.displayReason,
    initialRequiredLevel: c.defaultRequiredLevel,
    questions: c.document.judgementQuestions.map((q) => ({
      key: q.key,
      questionText: q.questionText,
      inputType: q.inputType,
      options: q.optionsJson ? (JSON.parse(q.optionsJson) as string[]) : [],
      helpText: q.helpText,
    })),
    rules: c.document.judgementRules.map((r) => ({
      conditionJson: r.conditionJson,
      resultRequiredLevel: r.resultRequiredLevel,
      resultMessage: r.resultMessage,
      sortOrder: r.sortOrder,
    })),
  }));

  return {
    procedure: { key: procedure.key, name: procedure.name },
    workerType: { key: workerType.key, name: workerType.name },
    documents,
  };
}
