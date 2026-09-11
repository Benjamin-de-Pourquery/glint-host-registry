import { prisma } from "@/lib/prisma";
import { resolvePlaybook } from "@/lib/playbooks";
import {
  allLinkedPlatformsComplete,
  getLinkedPlatforms,
  updateListingsStepKey,
  type ListingPlatform,
} from "./platforms";

/** Auto-complete update-listings playbook step when all linked platforms are checked */
export async function syncUpdateListingsPlaybookStep(propertyId: string): Promise<void> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      listingPlatformProgress: true,
      registration: true,
    },
  });

  if (!property?.registration?.registrationNumber?.trim()) return;

  const linkedPlatforms = getLinkedPlatforms(property);
  if (linkedPlatforms.length === 0) return;

  const progress = property.listingPlatformProgress.map((p) => ({
    platform: p.platform as ListingPlatform,
    completed: p.completed,
    completedAt: p.completedAt?.toISOString() ?? null,
  }));

  if (!allLinkedPlatformsComplete(linkedPlatforms, progress)) return;

  const playbook = resolvePlaybook(property.country, property.city);
  if (!playbook) return;

  const stepKey = updateListingsStepKey(property.city);
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
