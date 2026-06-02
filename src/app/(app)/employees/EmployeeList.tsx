"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface Row {
  id: string;
  name: string;
  nameKana: string | null;
  department: string | null;
  position: string | null;
  email: string | null;
  employmentType: string | null;
}

export default function EmployeeList({
  employees,
  workerTypeMap,
}: {
  employees: Row[];
  workerTypeMap: Record<string, string>;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return employees;
    return employees.filter((e) =>
      [e.name, e.nameKana, e.department, e.email]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(key))
    );
  }, [q, employees]);

  return (
    <div>
      <div className="mb-4">
        <input
          className="input max-w-sm"
          placeholder="氏名・フリガナ・部署・メールで検索"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">氏名</th>
              <th className="px-4 py-3 font-medium">区分</th>
              <th className="px-4 py-3 font-medium">部署</th>
              <th className="px-4 py-3 font-medium">メール</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  該当する従業員がいません。
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{e.name}</div>
                    {e.nameKana && <div className="text-xs text-gray-400">{e.nameKana}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {e.employmentType ? workerTypeMap[e.employmentType] ?? "-" : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{e.department ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{e.email ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/employees/${e.id}`} className="text-brand-600 hover:underline">
                      詳細
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
