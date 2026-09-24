import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/login-form";
import { isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "login");
}

async function LoginFallback() {
  const t = await getTranslations("auth.login");
  return (
    <AuthPageShell title={t("title")} description={t("subtitle")}>
      <div
        className="h-44 animate-pulse rounded-lg bg-slate-100/80"
        aria-hidden
      />
    </AuthPageShell>
  );
}

export default function LoginPage() {
  const showGoogle = isGoogleOAuthConfigured();

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm showGoogle={showGoogle} />
    </Suspense>
  );
}
