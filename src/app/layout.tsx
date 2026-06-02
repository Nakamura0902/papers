import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "手続きナビ｜書類作成ツール",
  description: "社内手続きの必要書類を確認しながらPDFを作成する社内ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
