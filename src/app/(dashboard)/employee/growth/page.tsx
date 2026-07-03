import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { GrowthView } from "@/components/GrowthView";

export default async function EmployeeGrowth() {
  const session = await requireRole("employee");
  if (!session) redirect("/login");
  return (
    <>
      <div className="page-header"><h2>📈 Views & Growth by Date Range</h2></div>
      <GrowthView />
    </>
  );
}
