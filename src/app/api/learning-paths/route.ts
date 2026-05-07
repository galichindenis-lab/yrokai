import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const paths = await prisma.learningPath.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: {
      modules: {
        where: { published: true },
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { published: true },
            orderBy: { order: "asc" },
            select: { id: true, title: true, xp: true, type: true },
          },
        },
      },
    },
  });

  return NextResponse.json(paths);
}
