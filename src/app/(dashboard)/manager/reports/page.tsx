import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Reports() {
  const session = await requireRole("manager");
  if (!session) redirect("/login");

  const employees = await prisma.user.findMany({ where: { role: "employee" } });

  return (
    <>
      <div className="page-header"><h2>Reports</h2></div>
      <div className="card">
        <div className="card-header"><h3>Download Reports</h3></div>
        <div className="flex flex-col gap-3">
          <Link href="/api/export" className="btn-green inline-block w-fit">⬇ Export All Channels (Excel)</Link>
          <p className="text-xs text-[var(--muted)]">Download a full Excel report of all tracked channels across all employees and interns.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Employees</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Employee</th><th>Actions</th></tr></thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar" style={{ background: emp.avatarColor, width: 28, height: 28, fontSize: 11 }}>{emp.fullName[0]}</div>
                      <span>{emp.fullName}</span>
                    </div>
                  </td>
                  <td>
                    <Link href={`/manager/channels?employee_id=${emp.id}`} className="btn-outline btn-sm">View Channels</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
