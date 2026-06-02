/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDF 生成系はサーバー側のみで使う重い依存のため外部化（バンドルしない）
  serverExternalPackages: ["puppeteer", "puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
