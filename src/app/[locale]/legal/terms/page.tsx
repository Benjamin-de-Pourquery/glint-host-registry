import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingHeader } from "@/components/marketing-header";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "terms");
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.terms");
  const isFr = locale === "fr";

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 prose prose-slate">
        <h1>{t("title")}</h1>
        <p className="text-slate-500">{t("updated")}</p>

        {isFr ? (
          <>
            <h2>1. Objet</h2>
            <p>Les présentes conditions régissent l&apos;utilisation de Host Registry, service SaaS édité par Glint (micro-entreprise).</p>

            <h2>2. Service</h2>
            <p>Host Registry est un outil de gestion de conformité pour hôtes de location courte durée. Il ne remplace pas l&apos;enregistrement officiel auprès des autorités locales.</p>

            <h2>3. Abonnement</h2>
            <p>L&apos;accès aux fonctionnalités payantes nécessite un abonnement mensuel (Starter ou Pro). Un essai gratuit de 14 jours est offert. Les paiements sont traités par Stripe.</p>

            <h2>4. Responsabilité</h2>
            <p>Glint fournit un outil d&apos;organisation. La responsabilité de la conformité réglementaire incombe à l&apos;hôte. Glint ne garantit pas l&apos;acceptation des données par les plateformes ou autorités.</p>

            <h2>5. Résiliation</h2>
            <p>Vous pouvez annuler votre abonnement à tout moment via le portail de facturation Stripe. L&apos;accès reste actif jusqu&apos;à la fin de la période en cours.</p>
          </>
        ) : (
          <>
            <h2>1. Purpose</h2>
            <p>These terms govern the use of Host Registry, a SaaS service published by Glint (micro-entreprise).</p>

            <h2>2. Service</h2>
            <p>Host Registry is a compliance management tool for short-term rental hosts. It does not replace official registration with local authorities.</p>

            <h2>3. Subscription</h2>
            <p>Access to paid features requires a monthly subscription (Starter or Pro). A 14-day free trial is included. Payments are processed by Stripe.</p>

            <h2>4. Liability</h2>
            <p>Glint provides an organizational tool. Regulatory compliance responsibility rests with the host. Glint does not guarantee acceptance of data by platforms or authorities.</p>

            <h2>5. Termination</h2>
            <p>You may cancel your subscription at any time via the Stripe billing portal. Access remains active until the end of the current billing period.</p>
          </>
        )}

        <p className="mt-8">
          <Link href={`/${locale}`} className="text-emerald-600 hover:underline">← Back to home</Link>
        </p>
      </article>
    </div>
  );
}
