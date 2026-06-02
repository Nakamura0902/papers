import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase Storage 用の管理クライアント（service_role）。
// 環境変数が未設定の場合は null を返し、ローカルではファイル保存にフォールバックする。
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export const PDF_BUCKET = process.env.SUPABASE_PDF_BUCKET ?? "pdfs";
