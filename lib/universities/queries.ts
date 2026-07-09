import { prisma } from "@/lib/prisma";

export function getAllUniversities() {
  return prisma.university.findMany({ orderBy: { name: "asc" } });
}
