/** @type {import('next').NextConfig} */
const nextConfig = {
  // puppeteer はサーバー側のみで使用する重い依存のため外部化
  serverExternalPackages: ["puppeteer"],
};

export default nextConfig;
