import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getWorkerTypeMap } from "@/lib/masters";
import PageHeader from "@/components/PageHeader";
import EmployeeList from "./EmployeeList";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const [employees, workerTypeMap] = await Promise.all([
    prisma.employee.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    getWorkerTypeMap(),
  ]);

  return (
    <div>
      <PageHeader
        title="従業員・契約者管理"
        description="手続き対象となる従業員・契約者を管理します。"
        action={
          <Link href="/employees/new" className="btn-primary">
            + 新規登録
          </Link>
        }
      />
      <EmployeeList
        employees={employees.map((e) => ({
          id: e.id,
          name: e.name,
          nameKana: e.nameKana,
          department: e.department,
          position: e.position,
          email: e.email,
          employmentType: e.employmentType,
        }))}
        workerTypeMap={workerTypeMap}
      />
    </div>
  );
}
