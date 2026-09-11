import { getTranslations, setRequestLocale } from "next-intl/server";
import { PropertyForm } from "@/components/property-form";

type Props = { params: Promise<{ locale: string }> };

export default async function NewPropertyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("properties.form");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t("create")}</h1>
      <PropertyForm mode="create" />
    </div>
  );
}
