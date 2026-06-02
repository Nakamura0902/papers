import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 px-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">手続きナビ</h1>
          <p className="mt-1 text-sm text-gray-500">書類作成・PDF出力ツール</p>
        </div>
        <LoginForm />
        <p className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          初期ログイン: admin@example.com / password123
        </p>
      </div>
    </div>
  );
}
