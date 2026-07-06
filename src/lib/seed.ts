import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  
  const users = [
    { username: "basudha", password: "Basudha@123", role: "manager", fullName: "Basudha", avatarColor: "#ff0000" },
    { username: "cbo", password: "CBO@review2024", role: "manager", fullName: "CBO Review", avatarColor: "#ff9500" },
    { username: "sayam", password: "sayam2005", role: "employee", fullName: "Sayam", avatarColor: "#9c27b0" },
    { username: "sudhanshu", password: "Sudhanshu@123", role: "employee", fullName: "Sudhanshu", avatarColor: "#3f51b5" },
    { username: "adhishreya", password: "Adhishreya@123", role: "employee", fullName: "Adhishreya", avatarColor: "#009688" },
  ];

  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { username: u.username } });
    if (!exists) {
      await prisma.user.create({ data: { ...u, password: await bcrypt.hash(u.password, 10) } });
    }
  }
  seeded = true;
}
