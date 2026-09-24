import { NextResponse } from "next/server";
import { z } from "zod";
import { isMailerConfigured } from "@/lib/email/send-email";
import { requestPasswordReset } from "@/lib/auth/password-reset/service";
import { getRequestClientIp } from "@/lib/auth/request-meta";

const schema = z.object({
  email: z.string().email(),
  locale: z.enum(["en", "fr"]).optional(),
});

export async function POST(request: Request) {
  if (!isMailerConfigured()) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);
    const locale = data.locale === "fr" ? "fr" : "en";

    await requestPasswordReset({
      email: data.email,
      locale,
      requestIp: getRequestClientIp(request),
      request,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
