import { z } from "zod";

export const passwordSchema = z.string().min(8);

export function isValidPassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}
