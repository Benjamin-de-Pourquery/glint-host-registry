import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { validatePasswordResetToken } from "@/lib/auth/password-reset/service";
import { isMailerConfigured } from "@/lib/email/send-email";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "resetPassword");
}

async function ResetPasswordFallback() {
  const t = await getTranslations("auth.resetPassword");
  return (
    <AuthPageShell title={t("title")} description={t("subtitle")}>
      <div
        className="h-44 animate-pulse rounded-lg bg-slate-100/80"
        aria-hidden
      />
    </AuthPageShell>
  );
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { locale } = await params;

  if (!isMailerConfigured()) {
    redirect(`/${locale}/login`);
  }

  const { token = "" } = await searchParams;
  const tokenStatus = await validatePasswordResetToken(token);

  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm tokenStatus={tokenStatus.status} />
    </Suspense>
  );
}
