import type { SeoPageKey } from "@/lib/seo/page-paths";
import { PAGE_PATHS } from "@/lib/seo/page-paths";

export type GuideCountryId =
  | "france"
  | "spain"
  | "italy"
  | "portugal"
  | "greece"
  | "croatia"
  | "netherlands"
  | "belgium"
  | "germany"
  | "austria"
  | "ireland";

type CountryNav = {
  national: SeoPageKey[];
  cities: SeoPageKey[];
};

const COUNTRY_NAV: Record<GuideCountryId, CountryNav> = {
  france: {
    national: ["guideRegistration", "guideGuestRegister", "guideFrNerMigration"],
    cities: [
      "guideParisStrRegistration",
      "guideLyonStrRegistration",
      "guideMarseilleStrRegistration",
    ],
  },
  spain: {
    national: ["guideSes"],
    cities: [
      "guideMadridStrRegistration",
      "guideBarcelonaStrRegistration",
      "guideValenciaStrRegistration",
      "guideMalagaStrRegistration",
      "guideSevilleStrRegistration",
    ],
  },
  italy: {
    national: ["guideItalyCinAlloggiati"],
    cities: [],
  },
  portugal: {
    national: ["guidePortugalRnalSiba"],
    cities: [],
  },
  greece: {
    national: ["guideGreeceAmaAade"],
    cities: [],
  },
  croatia: {
    national: ["guideCroatiaEvisitor"],
    cities: [],
  },
  netherlands: {
    national: ["guideAmsterdamNightCap"],
    cities: ["guideAmsterdamStrRegistration"],
  },
  belgium: {
    national: ["guideBelgiumStrRegistration"],
    cities: ["guideBrusselsAirbnbRegistration"],
  },
  germany: {
    national: [],
    cities: ["guideBerlinStrRegistration", "guideMunichStrRegistration"],
  },
  austria: {
    national: [],
    cities: ["guideViennaStrRegistration", "guideViennaAirbnbRegistration"],
  },
  ireland: {
    national: ["guideIrelandStrRegistration"],
    cities: ["guideDublinAirbnbRegistration"],
  },
};

const PAGE_TO_COUNTRY = new Map<SeoPageKey, GuideCountryId>([
  ["guideRegistration", "france"],
  ["guideGuestRegister", "france"],
  ["guideFrNerMigration", "france"],
  ["guideParisStrRegistration", "france"],
  ["guideParisAirbnbRegistration", "france"],
  ["guideLyonStrRegistration", "france"],
  ["guideLyonAirbnbRegistration", "france"],
  ["guideMarseilleStrRegistration", "france"],
  ["guideMarseilleAirbnbRegistration", "france"],
  ["guideSes", "spain"],
  ["guideMadridStrRegistration", "spain"],
  ["guideMadridAirbnbRegistration", "spain"],
  ["guideBarcelonaStrRegistration", "spain"],
  ["guideBarcelonaAirbnbRegistration", "spain"],
  ["guideValenciaStrRegistration", "spain"],
  ["guideValenciaAirbnbRegistration", "spain"],
  ["guideMalagaStrRegistration", "spain"],
  ["guideMalagaAirbnbRegistration", "spain"],
  ["guideSevilleStrRegistration", "spain"],
  ["guideSevilleAirbnbRegistration", "spain"],
  ["guideItalyCinAlloggiati", "italy"],
  ["guidePortugalRnalSiba", "portugal"],
  ["guideGreeceAmaAade", "greece"],
  ["guideCroatiaEvisitor", "croatia"],
  ["guideAmsterdamNightCap", "netherlands"],
  ["guideAmsterdamStrRegistration", "netherlands"],
  ["guideAmsterdamAirbnbRegistration", "netherlands"],
  ["guideBelgiumStrRegistration", "belgium"],
  ["guideBrusselsAirbnbRegistration", "belgium"],
  ["guideBerlinStrRegistration", "germany"],
  ["guideBerlinAirbnbRegistration", "germany"],
  ["guideMunichStrRegistration", "germany"],
  ["guideMunichAirbnbRegistration", "germany"],
  ["guideViennaStrRegistration", "austria"],
  ["guideViennaAirbnbRegistration", "austria"],
  ["guideIrelandStrRegistration", "ireland"],
  ["guideDublinAirbnbRegistration", "ireland"],
]);

for (const [page, country] of [...PAGE_TO_COUNTRY]) {
  const frKey = `${page}Fr` as SeoPageKey;
  if (frKey in PAGE_PATHS && !PAGE_TO_COUNTRY.has(frKey)) {
    PAGE_TO_COUNTRY.set(frKey, country);
  }
}

export function getCountryNavForPage(page: SeoPageKey): CountryNav | null {
  const country = PAGE_TO_COUNTRY.get(page);
  if (!country) {
    return null;
  }
  return COUNTRY_NAV[country];
}

export function getCountryIdForPage(page: SeoPageKey): GuideCountryId | null {
  return PAGE_TO_COUNTRY.get(page) ?? null;
}
