"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteEmployeeButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("この従業員を削除しますか？（論理削除されます）")) return;
    setLoading(true);
    const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/employees");
      router.refresh();
    } else {
      alert("削除に失敗しました");
      setLoading(false);
    }
  }

  return (
    <button onClick={handleDelete} className="btn-danger" disabled={loading}>
      {loading ? "削除中..." : "削除"}
    </button>
  );
}
