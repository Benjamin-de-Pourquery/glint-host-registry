import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingHeader } from "@/components/marketing-header";

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.privacy");
  const isFr = locale === "fr";

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 prose prose-slate">
        <h1>{t("title")}</h1>
        <p className="text-slate-500">{t("updated")}</p>

        {isFr ? (
          <>
            <h2>1. Responsable du traitement</h2>
            <p>Glint (micro-entreprise) est responsable du traitement des données personnelles collectées via Host Registry.</p>

            <h2>2. Données collectées</h2>
            <p>Nous collectons : nom, adresse e-mail, informations de compte, données relatives à vos biens immobiliers et enregistrements de conformité que vous saisissez volontairement.</p>

            <h2>3. Finalités</h2>
            <p>Les données sont traitées pour fournir le service Host Registry, gérer votre abonnement, et améliorer notre plateforme.</p>

            <h2>4. Conservation</h2>
            <p>Vos données sont conservées tant que votre compte est actif, puis supprimées dans un délai de 30 jours après la fermeture du compte.</p>

            <h2>5. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos données. Contactez-nous à privacy@glint-host.eu.</p>

            <h2>6. Sous-traitants</h2>
            <p>Nous utilisons Stripe pour le traitement des paiements et des hébergeurs cloud conformes au RGPD pour l&apos;hébergement des données.</p>
          </>
        ) : (
          <>
            <h2>1. Data Controller</h2>
            <p>Glint (micro-entreprise) is the data controller for personal data collected through Host Registry.</p>

            <h2>2. Data Collected</h2>
            <p>We collect: name, email address, account information, property details, and compliance registration data you voluntarily enter.</p>

            <h2>3. Purposes</h2>
            <p>Data is processed to provide the Host Registry service, manage your subscription, and improve our platform.</p>

            <h2>4. Retention</h2>
            <p>Your data is retained while your account is active, then deleted within 30 days of account closure.</p>

            <h2>5. Your Rights</h2>
            <p>Under GDPR, you have the right to access, rectify, delete, and port your data. Contact us at privacy@glint-host.eu.</p>

            <h2>6. Sub-processors</h2>
            <p>We use Stripe for payment processing and GDPR-compliant cloud hosting providers for data storage.</p>
          </>
        )}

        <p className="mt-8">
          <Link href={`/${locale}`} className="text-emerald-600 hover:underline">← Back to home</Link>
        </p>
      </article>
    </div>
  );
}
