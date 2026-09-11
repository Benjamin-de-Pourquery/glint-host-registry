import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  resolvePlaybook,
  getNextPendingStep,
  getPlaybookProgressSummary,
} from "@/lib/playbooks";
import { z } from "zod";

const updateSchema = z.object({
  stepKey: z.string().min(1),
  status: z.enum(["pending", "done", "skipped"]),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { playbookProgress: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const playbook = resolvePlaybook(property.country, property.city);

  if (!playbook) {
    return NextResponse.json({
      playbook: null,
      progress: [],
      nextStepKey: null,
      summary: { completed: 0, total: 0, skipped: 0 },
    });
  }

  const progress = property.playbookProgress.map((p) => ({
    stepKey: p.stepKey,
    status: p.status,
    completedAt: p.completedAt?.toISOString() ?? null,
  }));

  const nextStep = getNextPendingStep(playbook, progress);
  const summary = getPlaybookProgressSummary(playbook, progress);

  return NextResponse.json({
    playbook,
    progress,
    nextStepKey: nextStep?.key ?? null,
    summary,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const playbook = resolvePlaybook(property.country, property.city);
  if (!playbook) {
    return NextResponse.json({ error: "No playbook for property" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const validStep = playbook.steps.some((s) => s.key === data.stepKey);
    if (!validStep) {
      return NextResponse.json({ error: "Invalid step key" }, { status: 400 });
    }

    const updated = await prisma.playbookStepProgress.upsert({
      where: {
        propertyId_stepKey: {
          propertyId: id,
          stepKey: data.stepKey,
        },
      },
      create: {
        propertyId: id,
        stepKey: data.stepKey,
        status: data.status,
        completedAt: data.status === "done" ? new Date() : null,
      },
      update: {
        status: data.status,
        completedAt: data.status === "done" ? new Date() : null,
      },
    });

    return NextResponse.json({
      stepKey: updated.stepKey,
      status: updated.status,
      completedAt: updated.completedAt?.toISOString() ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
