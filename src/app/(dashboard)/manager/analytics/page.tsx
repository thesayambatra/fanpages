import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const session = await requireRole("manager");
  if (!session) redirect("/login");
  return <AnalyticsDashboard />;
}
