import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { TopShortsView } from "@/components/TopShortsView";

export default async function ShortsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <TopShortsView />;
}
