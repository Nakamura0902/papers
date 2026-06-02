import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { getCandidateDocuments } from "@/lib/candidates";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ procedureKey: string; workerTypeKey: string }> }
) {
  return withAuth(async () => {
    const { procedureKey, workerTypeKey } = await params;
    const result = await getCandidateDocuments(procedureKey, workerTypeKey);
    if (!result) {
      return NextResponse.json({ error: "手続きまたは対象者区分が見つかりません" }, { status: 404 });
    }
    return NextResponse.json(result);
  });
}
