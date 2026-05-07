export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkSubmission } from "@/lib/claude";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { sessionId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const { lessonId, content } = await req.json();

  if (!lessonId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { tool: true } } },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const result = await checkSubmission(lesson.title, lesson.checkCriteria, content);

  const submission = await prisma.exerciseSubmission.create({
    data: {
      userId: user.id,
      lessonId,
      content,
      feedback: result.feedback,
      score: result.score,
      passed: result.passed,
    },
  });

  if (result.passed) {
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: {
        status: "COMPLETED",
        xpEarned: lesson.xp,
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        lessonId,
        status: "COMPLETED",
        xpEarned: lesson.xp,
        completedAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { totalXp: { increment: lesson.xp } },
    });

    if (lesson.type === "PROJECT") {
      await prisma.projectArtifact.create({
        data: {
          userId: user.id,
          title: lesson.title,
          description: `Р—Р°РІРµСЂС€С‘РЅ РїСЂРѕРµРєС‚РЅС‹Р№ СѓСЂРѕРє: ${lesson.title}`,
          content: content.slice(0, 500),
          tool: lesson.module.tool ?? "multi",
          lessonId,
        },
      });
    }
  } else {
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: { status: "IN_PROGRESS" },
      create: {
        userId: user.id,
        lessonId,
        status: "IN_PROGRESS",
      },
    });
  }

  return NextResponse.json(result);
}

