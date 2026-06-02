import { NextResponse } from "next/server";
import { getCurrentUser, type CurrentUser } from "./auth";

// API ルートで認証を要求する。未認証なら 401 Response を投げる。
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  return user;
}

// requireUser が投げる Response をハンドリングするためのラッパー
export async function withAuth(
  handler: (user: CurrentUser) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const user = await requireUser();
    return await handler(user);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error(err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
