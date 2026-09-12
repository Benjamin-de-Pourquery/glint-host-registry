import { NextResponse } from "next/server";
import { syncAllEnabledCalendarFeeds } from "@/lib/calendar/sync";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  const headerSecret = request.headers.get("x-cron-secret");
  const providedSecret = bearerToken ?? headerSecret;

  if (!providedSecret || providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { feedCount, results } = await syncAllEnabledCalendarFeeds();

  const errors = results.filter((result) => result.error);
  return NextResponse.json({
    feedCount,
    synced: results.length,
    errors: errors.length,
    results,
  });
}
