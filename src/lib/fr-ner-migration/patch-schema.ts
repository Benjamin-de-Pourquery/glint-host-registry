import { z } from "zod";
import { FR_NER_MIGRATION_STATUSES, FR_NER_WIZARD_STEPS } from "./types";

const checklistItemSchema = z.object({
  key: z.string(),
  done: z.boolean(),
});

const calendarDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(`${v}T00:00:00.000Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
  }, "Invalid date");

/** ISO datetime or YYYY-MM-DD date strings from forms. */
export const optionalMigrationDateString = z
  .union([z.string().datetime(), calendarDateString])
  .nullable()
  .optional();

export const frNerMigrationPatchSchema = z.object({
  status: z.enum(FR_NER_MIGRATION_STATUSES).optional(),
  localRegistrationNumber: z.string().nullable().optional(),
  localIssuingCommune: z.string().nullable().optional(),
  nerNumber: z.string().nullable().optional(),
  nerIssuedAt: optionalMigrationDateString,
  transitionEndsAt: optionalMigrationDateString,
  documentsChecklist: z.array(checklistItemSchema).optional(),
  channelUpdatesChecklist: z.array(checklistItemSchema).optional(),
  notifyOnPortalOpen: z.boolean().optional(),
  wizardStep: z.enum(FR_NER_WIZARD_STEPS).nullable().optional(),
});

export type FrNerMigrationPatchInput = z.infer<typeof frNerMigrationPatchSchema>;
