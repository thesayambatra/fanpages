import { Navbar } from "@/components/Navbar";
import { CommandPalette } from "@/components/CommandPalette";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CommandPalette />
      <div className="page-wrap">{children}</div>
    </>
  );
}
