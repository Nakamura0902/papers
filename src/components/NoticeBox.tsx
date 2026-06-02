export default function NoticeBox({
  variant = "warning",
  children,
}: {
  variant?: "warning" | "danger" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    warning: "border-amber-300 bg-amber-50 text-amber-800",
    danger: "border-red-300 bg-red-50 text-red-700",
    info: "border-blue-300 bg-blue-50 text-blue-800",
  }[variant];
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>
      {children}
    </div>
  );
}
