import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/activity";

const COLORS = ["#ff9800","#795548","#607d8b","#e91e63","#00bcd4","#8bc34a","#673ab7"];

// GET /api/interns — list interns under current employee (or all for manager)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  let interns;
  if (user.role === "manager") {
    interns = await prisma.user.findMany({ where: { role: "intern" }, include: { createdBy: true } });
  } else if (user.role === "employee") {
    interns = await prisma.user.findMany({ where: { role: "intern", createdById: Number(user.id) } });
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(interns);
}

// POST /api/interns — create intern (employee only)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "employee") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { username, password, fullName } = await req.json();
  if (!username || !password || !fullName) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return NextResponse.json({ error: "Username taken" }, { status: 409 });

  const count = await prisma.user.count({ where: { createdById: Number(user.id) } });
  const intern = await prisma.user.create({
    data: {
      username,
      password: await bcrypt.hash(password, 10),
      role: "intern",
      fullName,
      createdById: Number(user.id),
      avatarColor: COLORS[count % COLORS.length],
    },
  });
  await logActivity(Number(user.id), "intern_created", `Created intern: ${fullName} (@${username})`);
  return NextResponse.json({ ok: true, id: intern.id });
}
