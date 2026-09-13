import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { CheckInForm } from "@/components/check-in-form";

type Props = { params: Promise<{ locale: string; token: string }> };

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function CheckInPage({ params }: Props) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const tokenRecord = await prisma.guestRegisterToken.findFirst({
    where: { token, enabled: true },
    include: { property: { select: { name: true, country: true, city: true } } },
  });

  if (!tokenRecord) notFound();

  if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-emerald-700">Glint Host Registry</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {locale === "fr" ? "Fiche de police" : "Guest registration form"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {locale === "fr"
              ? "Veuillez remplir ce formulaire à votre arrivée."
              : "Please complete this form on arrival."}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <CheckInForm
            token={token}
            propertyName={tokenRecord.property.name}
            propertyCountry={tokenRecord.property.country}
            propertyCity={tokenRecord.property.city}
          />
        </div>
      </div>
    </div>
  );
}
