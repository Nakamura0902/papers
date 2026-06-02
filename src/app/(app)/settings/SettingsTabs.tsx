"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/settings/documents", label: "書類マスタ" },
  { href: "/settings/procedures", label: "手続きマスタ" },
  { href: "/settings/worker-types", label: "対象者区分" },
  { href: "/settings/rules", label: "候補・判定ルール" },
];

export default function SettingsTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex gap-1 border-b border-gray-200">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${
              active
                ? "border-brand-600 font-medium text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
