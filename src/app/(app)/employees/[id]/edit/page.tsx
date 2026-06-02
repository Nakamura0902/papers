import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWorkerTypes } from "@/lib/masters";
import PageHeader from "@/components/PageHeader";
import EmployeeForm from "@/components/EmployeeForm";

export const dynamic = "force-dynamic";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employee, workerTypes] = await Promise.all([
    prisma.employee.findFirst({ where: { id, deletedAt: null } }),
    getWorkerTypes(),
  ]);
  if (!employee) notFound();

  return (
    <div>
      <PageHeader title={`${employee.name} の編集`} />
      <EmployeeForm
        workerTypes={workerTypes.map((w) => ({ key: w.key, name: w.name }))}
        initial={{
          id: employee.id,
          name: employee.name,
          nameKana: employee.nameKana,
          birthDate: employee.birthDate?.toISOString() ?? null,
          postalCode: employee.postalCode,
          address: employee.address,
          phone: employee.phone,
          email: employee.email,
          employmentType: employee.employmentType,
          department: employee.department,
          position: employee.position,
          startDate: employee.startDate?.toISOString() ?? null,
          endDate: employee.endDate?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
