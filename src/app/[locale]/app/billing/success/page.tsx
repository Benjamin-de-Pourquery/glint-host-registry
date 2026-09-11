import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

export default async function BillingSuccessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("billing.success");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <CardTitle className="mt-4">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={`/${locale}/app`}>
            <Button className="w-full">{t("cta")}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
