import type { Session } from "next-auth";

export function canAccessRuleRadarConsole(session: Session | null): boolean {
  if (!session?.user?.email) return false;

  if (process.env.RULE_RADAR_CONSOLE === "1") {
    return true;
  }

  const allowlist = process.env.RULE_RADAR_STAFF_EMAILS;
  if (!allowlist) return false;

  const emails = allowlist
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return emails.includes(session.user.email.toLowerCase());
}
