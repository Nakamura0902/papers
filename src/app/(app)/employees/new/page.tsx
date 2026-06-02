import { getWorkerTypes } from "@/lib/masters";
import PageHeader from "@/components/PageHeader";
import EmployeeForm from "@/components/EmployeeForm";

export const dynamic = "force-dynamic";

export default async function NewEmployeePage() {
  const workerTypes = await getWorkerTypes();
  return (
    <div>
      <PageHeader title="従業員の新規登録" />
      <EmployeeForm workerTypes={workerTypes.map((w) => ({ key: w.key, name: w.name }))} />
    </div>
  );
}
