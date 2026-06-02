import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "メールとパスワードを入力してください" }, { status: 400 });
    }
    const user = await login(email, password);
    if (!user) {
      return NextResponse.json({ error: "メールまたはパスワードが正しくありません" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
