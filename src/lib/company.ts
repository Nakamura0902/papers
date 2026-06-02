// 会社情報（本番では環境変数や設定マスタに移行する想定）
export const COMPANY = {
  name: process.env.COMPANY_NAME ?? "株式会社サンプル",
  address: process.env.COMPANY_ADDRESS ?? "東京都千代田区サンプル1-2-3",
  phone: process.env.COMPANY_PHONE ?? "03-0000-0000",
  representative: process.env.COMPANY_REP ?? "代表取締役 山田 花子",
};
