import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { GalleryView } from "@/components/GalleryView";

export default async function GalleryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <GalleryView />;
}
