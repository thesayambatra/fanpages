import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { SavedReelsView } from "@/components/SavedReelsView";

export default async function SavedPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <SavedReelsView />;
}
