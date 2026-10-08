import type { ReactNode } from "react";
import Link from "next/link";
import { routing } from "@/i18n/routing";
import { getGuideSlugToPageMap } from "@/lib/seo/guide-routing";
import { buildLocalizedPath } from "@/lib/seo/metadata";
import { resolveGuideSlugRedirect } from "@/lib/seo/guide-routing";

type Locale = (typeof routing.locales)[number];

const GUIDE_PATH_RE = /\/guides\/([a-z0-9-]+)/g;

function hrefForSlug(locale: Locale, slug: string): string {
  const redirect = resolveGuideSlugRedirect(locale, slug);
  if (redirect) {
    return redirect;
  }
  const page = getGuideSlugToPageMap().get(slug);
  if (!page) {
    return `/${locale}/guides/${slug}`;
  }
  return buildLocalizedPath(locale, page);
}

type Props = {
  locale: string;
  text: string;
};

/** Turns `/guides/slug` segments in guide copy into locale-aware links. */
export function GuideInlineText({ locale, text }: Props) {
  const loc = locale as Locale;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const re = new RegExp(GUIDE_PATH_RE.source, "g");
  while ((match = re.exec(text)) !== null) {
    const [full, slug] = match;
    const start = match.index;
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    parts.push(
      <Link
        key={`${slug}-${start}`}
        href={hrefForSlug(loc, slug)}
        className="font-medium text-emerald-700 hover:underline"
      >
        {full}
      </Link>
    );
    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 0) {
    return <>{text}</>;
  }

  return <>{parts}</>;
}
