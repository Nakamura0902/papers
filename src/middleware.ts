import { NextRequest, NextResponse } from "next/server";

// Cookie の有無のみで素早くリダイレクト判定する（DB 検証は各ページ/APIで実施）。
const PUBLIC_PATHS = ["/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("session_token");

  // ログイン画面は未認証でも許可
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 認証 API はスキップ
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!hasSession) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // 静的アセット等を除外
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
