import { REQUIRED_LEVEL_STYLES, type RequiredLevel } from "@/types";

export default function RequiredLevelBadge({ level }: { level: string }) {
  const style =
    REQUIRED_LEVEL_STYLES[level as RequiredLevel] ??
    "bg-gray-100 text-gray-600 border-gray-300";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {level}
    </span>
  );
}
