import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { KTContent } from "@/components/KTContent";

export default async function KTPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <KTContent />;
}
