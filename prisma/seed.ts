import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { username: "basudha",   password: "Basudha@123",   role: "manager",  fullName: "Basudha",   avatarColor: "#ff0000" },
    { username: "cbo",       password: "CBO@review2024", role: "cbo",  fullName: "Akhil", avatarColor: "#ff9500" },
    { username: "sayam",     password: "sayam2005",     role: "employee", fullName: "Sayam",     avatarColor: "#9c27b0" },
    { username: "sudhanshu", password: "Sudhanshu@123", role: "employee", fullName: "Sudhanshu", avatarColor: "#3f51b5" },
    { username: "adhishreya", password: "Adhishreya@123", role: "employee", fullName: "Adhishreya", avatarColor: "#009688" },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: { password: hash, role: u.role, fullName: u.fullName, avatarColor: u.avatarColor },
      create: { username: u.username, password: hash, role: u.role, fullName: u.fullName, avatarColor: u.avatarColor },
    });
  }
  console.log("Seeded users: basudha (manager), sayam/sudhanshu/adhishreya (employee)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
