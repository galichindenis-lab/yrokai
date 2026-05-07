import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const module = await prisma.module.findUnique({
    where: { id: params.id },
    include: {
      lessons: { orderBy: { order: "asc" } },
      learningPath: { select: { title: true } },
    },
  });

  if (!module) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(module);
}
