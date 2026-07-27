import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ProfileEditor } from "@/components/ProfileEditor";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <ProfileEditor />;
}
