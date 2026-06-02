// 書類作成フローの状態を sessionStorage で持ち回るためのヘルパー（クライアント専用）。

export interface FlowItem {
  documentKey: string;
  documentName: string;
  formData?: Record<string, unknown>;
}

export interface DocFlow {
  procedureKey?: string;
  procedureName?: string;
  workerTypeKey?: string;
  workerTypeName?: string;
  employeeId?: string;
  items: FlowItem[];
  current: number;
}

const KEY = "docFlow";

export function saveFlow(flow: DocFlow) {
  sessionStorage.setItem(KEY, JSON.stringify(flow));
}

export function loadFlow(): DocFlow | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DocFlow;
  } catch {
    return null;
  }
}

export function clearFlow() {
  sessionStorage.removeItem(KEY);
}

// 単一書類のフローを作る（履歴からの再編集や直接アクセス用）
export function singleFlow(
  documentKey: string,
  documentName: string,
  ctx?: Partial<DocFlow>
): DocFlow {
  return {
    items: [{ documentKey, documentName }],
    current: 0,
    ...ctx,
  };
}
