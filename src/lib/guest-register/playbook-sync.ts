import { prisma } from "@/lib/prisma";
import { resolvePlaybook } from "@/lib/playbooks";
import { guestRegisterStepKey } from "./index";

/** Auto-complete guest-register playbook step when check-in link is enabled */
export async function syncGuestRegisterPlaybookStep(propertyId: string): Promise<void> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { guestRegisterToken: true },
  });

  if (!property?.guestRegisterToken?.enabled) return;

  const playbook = resolvePlaybook(property.country, property.city);
  if (!playbook) return;

  const stepKey = guestRegisterStepKey(property.city);
  const stepExists = playbook.steps.some((s) => s.key === stepKey);
  if (!stepExists) return;

  await prisma.playbookStepProgress.upsert({
    where: {
      propertyId_stepKey: { propertyId, stepKey },
    },
    create: {
      propertyId,
      stepKey,
      status: "done",
      completedAt: new Date(),
    },
    update: {
      status: "done",
      completedAt: new Date(),
    },
  });
}
