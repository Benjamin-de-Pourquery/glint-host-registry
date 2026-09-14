import { prisma } from "@/lib/prisma";
import { resolvePlaybook } from "@/lib/playbooks";
import { allChannelsPresent } from "./channels";
import { updateListingsStepKey } from "./platforms";

/** Auto-complete update-listings playbook step when all listing channels show PRESENT */
export async function syncUpdateListingsPlaybookStep(propertyId: string): Promise<void> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      listingChannels: true,
      registration: true,
    },
  });

  if (!property?.registration?.registrationNumber?.trim()) return;

  const channels = property.listingChannels.map((c) => ({
    displayStatus: c.displayStatus,
    listingUrl: c.listingUrl,
  }));

  if (channels.length === 0) return;
  if (!allChannelsPresent(channels)) return;

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
