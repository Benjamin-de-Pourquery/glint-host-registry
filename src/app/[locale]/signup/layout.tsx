import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "signup");
}

export default function SignupLayout({ children }: Props) {
  return children;
}
