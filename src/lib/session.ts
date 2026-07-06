import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireRole(...roles: string[]) {
  const session = await getSession();
  if (!session) return null;
  const user = session.user as any;
  // CBO has same access as manager
  const effectiveRole = user.role === "cbo" ? "manager" : user.role;
  if (!roles.includes(effectiveRole) && !roles.includes(user.role)) return null;
  return session;
}
