import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

/** Legacy URL from PR #58; password recovery is handled via support email on login. */
export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/login`);
}
