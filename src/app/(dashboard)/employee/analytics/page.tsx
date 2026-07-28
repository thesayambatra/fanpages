import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export default async function EmployeeAnalyticsPage() {
  const session = await requireRole("employee");
  if (!session) redirect("/login");
  return <AnalyticsDashboard />;
}
