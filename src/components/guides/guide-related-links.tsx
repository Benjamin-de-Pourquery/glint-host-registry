import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { footerLabelKeyForGuide } from "@/lib/guides/catalog";
import { buildLocalizedPath } from "@/lib/seo/metadata";
import { getGuideLocalePair } from "@/lib/seo/guide-routing";
import type { SeoPageKey } from "@/lib/seo/page-paths";
import { routing } from "@/i18n/routing";

function isExcluded(page: SeoPageKey, excludePage?: SeoPageKey): boolean {
  if (!excludePage) {
    return false;
  }
  if (page === excludePage) {
    return true;
  }
  const pair = getGuideLocalePair(page);
  if (pair) {
    return pair.en === excludePage || pair.fr === excludePage;
  }
  const excludePair = getGuideLocalePair(excludePage);
  if (excludePair) {
    return excludePair.en === page || excludePair.fr === page;
  }
  return false;
}

type Locale = (typeof routing.locales)[number];

type Props = {
  locale: string;
  pages: SeoPageKey[];
  excludePage?: SeoPageKey;
};

export async function GuideRelatedLinks({ locale, pages, excludePage }: Props) {
  const loc = locale as Locale;
  const tFooter = await getTranslations("landing.footer");

  const items = pages.filter((page) => !isExcluded(page, excludePage));

  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="not-prose mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
      {items.map((page) => (
        <li key={page}>
          <Link
            href={buildLocalizedPath(loc, page)}
            className="font-medium text-emerald-700 hover:underline"
          >
            {tFooter(footerLabelKeyForGuide(page))}
          </Link>
        </li>
      ))}
    </ul>
  );
}
