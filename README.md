# 手続きナビ付き 書類作成・PDF出力ツール

社内手続き（入社・退職など）の担当者が、必要書類を知らなくても
**手続き目的 → 対象者区分 → 必要書類の判定 → 入力 → PDF出力 → 履歴**
の流れで書類を作成できる社内向け Web ツールです。

書類名を最初に選ばせず、「何の手続きか」「対象者は誰か」を起点に
関係する書類候補を提示し、各書類について「何を記すものか」「必要になる条件」
「不要になる条件」などを確認しながら、必要な書類だけを作成できます。

> 本ツールは法務・労務判断を代替するものではありません。判定はあくまで目安です。
> 「確認が必要」と表示された場合や判断が難しい場合は、社内担当者・社労士・税理士等の
> 専門家にご確認ください。

## 技術構成

- Next.js 15（App Router）/ TypeScript
- Tailwind CSS v3
- Prisma + SQLite
- 認証: 自前 Cookie セッション（bcrypt でパスワードハッシュ化）
- PDF 生成: Puppeteer（HTML → PDF）

## セットアップ

```bash
npm install
```

> ローカルの PDF 生成には `puppeteer`（開発依存）を使い、初回に Chromium をダウンロードします。
> 失敗した場合は `npx puppeteer browsers install chrome` を再実行してください。
> 本番（Vercel など）では `puppeteer-core` + `@sparticuz/chromium` に自動で切り替わります。

## 環境変数（.env）

`.env.example` をコピーして `.env` を作成し、Supabase の値を入れてください。

- `DATABASE_URL` … Supabase トランザクションプーラー（ポート6543）
- `DIRECT_URL` … Supabase セッションプーラー（ポート5432・マイグレーション用）
- `SESSION_SECRET` … 長いランダム文字列
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` … PDF を Supabase Storage に保存するため
- `COMPANY_*` … PDF に印字する会社情報（任意）

> ローカル開発で `SUPABASE_URL` を設定しない場合、PDF はローカルの `storage/pdfs/` に保存されます（フォールバック）。

## データベース（Prisma + Supabase Postgres）

```bash
# 初回：スキーマを本番DBへ適用（DIRECT_URL を使用）
npx prisma migrate deploy

# シード投入（マスタ・候補ルール・判定ルール・フォーム・管理者ユーザー）
npx prisma db seed
```

## 開発サーバー

```bash
npm run dev
# http://localhost:3000
```

## ログイン情報

- メール: `admin@example.com`
- パスワード: `password123`

## 使い方（推奨フロー）

1. ログイン
2. （任意）従業員・契約者を登録
3. 「手続きナビ」→ **退職** を選択
4. 対象者区分から **アルバイト・パート** を選択
5. 退職時に関係する書類候補一覧が表示される
6. 各書類カードの確認質問に回答すると、必要度の目安が変わる
7. 「作成する」を選んだ書類について「作成へ進む」
8. 書類フォームに入力 → PDFプレビュー
9. PDF を生成・ダウンロード・印刷
10. 「作成履歴」に保存される

## PDF 生成に関する注意

- PDF は Puppeteer（Chromium）で HTML から生成します。サーバー側でのみ実行されます。
- 日本語フォントは OS 標準フォント（Yu Gothic / Meiryo 等）を使用します。
  環境にこれらが無い場合、表示が崩れることがあります。
- 生成した PDF は `氏名_書類名_作成日.pdf` 形式で **Supabase Storage（バケット `pdfs`）** に保存されます
  （`SUPABASE_URL` 未設定時はローカル `storage/pdfs/`）。
  ファイルへのアクセスは認証必須の API（`/api/generated-documents/[id]/pdf`）経由のみです。

## Vercel + Supabase へのデプロイ

1. **Supabase**：プロジェクト作成 → Settings → Database で DB パスワードを設定 → 「Connect → ORMs → Prisma」で
   `DATABASE_URL`（6543）と `DIRECT_URL`（5432）を取得。Storage に private バケット **`pdfs`** を作成。
2. **Vercel**：本リポジトリを Import し、環境変数を登録：
   - `DATABASE_URL` / `DIRECT_URL` / `SESSION_SECRET`
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
   - `PUPPETEER_SKIP_DOWNLOAD=true`（ビルド時の不要な Chromium DL を防止）
   - 任意：`COMPANY_*`
3. **DBテーブル作成＋初期データ投入（初回のみ・手元PCから）**：本番の `DATABASE_URL`/`DIRECT_URL` を
   手元の `.env` に入れて以下を実行（Vercelビルドはネットワーク制約でDB接続が固まりやすいため、
   マイグレーションは手元から流す方式）：
   ```bash
   npx prisma migrate deploy   # テーブル作成
   npx prisma db seed          # マスタ・候補ルール・管理者ユーザー投入
   ```
4. **Deploy**：環境変数を登録後に Vercel で Redeploy → `admin@example.com / password123` でログイン
   （**本番ではパスワード変更推奨**）。

## セキュリティ

- 全管理画面・API はログイン必須（middleware + サーバー側で二重ガード）。
- パスワードは bcrypt でハッシュ化。
- 従業員・作成履歴の削除は論理削除。
- マイナンバーは保存しません。
- PDF ファイルへの直接アクセスも認証が必要です。

## 実装済みの主な書類・ルール

- 書類マスタ: 退職関連 9 種、入社関連 10 種
- 候補・判定ルール: **退職・入社 × 6 対象者区分（全12組み合わせ）** を実装
  （区分ごとの必要度・確認質問・回答別判定）
- 専用 PDF テンプレート: 退職関連 9 種（行政系は社内確認用の簡易様式）
- 入力フォーム: 退職届 / 退職合意書 / 貸与物返却確認書 / 最終給与確認書 /
  有給休暇残日数確認書（詳細）、その他は簡易確認フォーム

## マスタ管理（GUI で編集可能）

`/settings` から以下を追加・編集・削除できます。変更は書類候補一覧・必要度判定に即時反映されます。

- 書類マスタ（入力フォーム定義 schemaJson も編集可）
- 手続きマスタ／対象者区分マスタ
- 候補表示ルール／判定質問／判定ルール

## 今後の拡張予定

- 入社など他の手続き × 対象者区分の候補ルール拡充
- 行政提出系書類の正式様式対応
- ユーザー管理・権限（role）の活用
- 会社情報の設定マスタ化（現在は環境変数 / `src/lib/company.ts`）
