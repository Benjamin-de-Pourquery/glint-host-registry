import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingHeader } from "@/components/marketing-header";

type Props = { params: Promise<{ locale: string }> };

export default async function MentionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.mentions");
  const isFr = locale === "fr";

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 prose prose-slate">
        <h1>{t("title")}</h1>
        <p className="text-slate-500">{t("updated")}</p>

        {isFr ? (
          <>
            <h2>Éditeur</h2>
            <p>
              <strong>Glint</strong> — Micro-entreprise<br />
              Contact : contact@glint-host.eu
            </p>

            <h2>Directeur de la publication</h2>
            <p>Le représentant légal de Glint</p>

            <h2>Hébergement</h2>
            <p>
              Vercel Inc.<br />
              440 N Barranca Ave #4133, Covina, CA 91723, USA
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>L&apos;ensemble du contenu du site Host Registry est protégé par le droit d&apos;auteur. Toute reproduction est interdite sans autorisation.</p>
          </>
        ) : (
          <>
            <h2>Publisher</h2>
            <p>
              <strong>Glint</strong> — Micro-entreprise<br />
              Contact: contact@glint-host.eu
            </p>

            <h2>Publication Director</h2>
            <p>The legal representative of Glint</p>

            <h2>Hosting</h2>
            <p>
              Vercel Inc.<br />
              440 N Barranca Ave #4133, Covina, CA 91723, USA
            </p>

            <h2>Intellectual Property</h2>
            <p>All content on the Host Registry site is protected by copyright. Reproduction without authorization is prohibited.</p>
          </>
        )}

        <p className="mt-8">
          <Link href={`/${locale}`} className="text-emerald-600 hover:underline">← Back to home</Link>
        </p>
      </article>
    </div>
  );
}
