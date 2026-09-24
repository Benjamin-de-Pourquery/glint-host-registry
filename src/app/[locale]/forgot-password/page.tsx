import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { isMailerConfigured } from "@/lib/email/send-email";

type Props = { params: Promise<{ locale: string }> };

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;

  if (!isMailerConfigured()) {
    redirect(`/${locale}/login`);
  }

  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
