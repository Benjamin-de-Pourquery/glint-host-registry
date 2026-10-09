import type { SeoPageKey } from "@/lib/seo/page-paths";

export type GuideIndexGroup = {
  id: string;
  labelKey: `groups.${string}`;
  pages: SeoPageKey[];
};

/** Guides hub sections (locale-aware paths resolved at render time). */
export const GUIDE_INDEX_GROUPS: GuideIndexGroup[] = [
  {
    id: "france",
    labelKey: "groups.france",
    pages: [
      "guideRegistration",
      "guideFrNerMigration",
      "guideGuestRegister",
      "guideParisStrRegistration",
      "guideParisAirbnbRegistration",
      "guideLyonStrRegistration",
      "guideLyonAirbnbRegistration",
      "guideMarseilleStrRegistration",
      "guideMarseilleAirbnbRegistration",
      "guideBordeauxStrRegistration",
      "guideBordeauxAirbnbRegistration",
    ],
  },
  {
    id: "spain",
    labelKey: "groups.spain",
    pages: [
      "guideSes",
      "guideMadridStrRegistration",
      "guideMadridAirbnbRegistration",
      "guideBarcelonaStrRegistration",
      "guideBarcelonaAirbnbRegistration",
      "guideValenciaStrRegistration",
      "guideValenciaAirbnbRegistration",
      "guideMalagaStrRegistration",
      "guideMalagaAirbnbRegistration",
      "guideSevilleStrRegistration",
      "guideSevilleAirbnbRegistration",
    ],
  },
  {
    id: "italy",
    labelKey: "groups.italy",
    pages: ["guideItalyCinAlloggiati"],
  },
  {
    id: "portugal",
    labelKey: "groups.portugal",
    pages: ["guidePortugalRnalSiba"],
  },
  {
    id: "greece",
    labelKey: "groups.greece",
    pages: ["guideGreeceAmaAade"],
  },
  {
    id: "croatia",
    labelKey: "groups.croatia",
    pages: ["guideCroatiaEvisitor"],
  },
  {
    id: "netherlands",
    labelKey: "groups.netherlands",
    pages: [
      "guideAmsterdamNightCap",
      "guideAmsterdamStrRegistration",
      "guideAmsterdamAirbnbRegistration",
    ],
  },
  {
    id: "belgium",
    labelKey: "groups.belgium",
    pages: [
      "guideBelgiumStrRegistration",
      "guideBrusselsAirbnbRegistration",
    ],
  },
  {
    id: "germany",
    labelKey: "groups.germany",
    pages: [
      "guideBerlinStrRegistration",
      "guideBerlinAirbnbRegistration",
      "guideMunichStrRegistration",
      "guideMunichAirbnbRegistration",
    ],
  },
  {
    id: "austria",
    labelKey: "groups.austria",
    pages: [
      "guideViennaStrRegistration",
      "guideViennaAirbnbRegistration",
    ],
  },
  {
    id: "ireland",
    labelKey: "groups.ireland",
    pages: [
      "guideIrelandStrRegistration",
      "guideDublinAirbnbRegistration",
    ],
  },
];

const FOOTER_LABEL_KEY: Partial<Record<SeoPageKey, string>> = {
  guideRegistration: "guideRegistration",
  guideFrNerMigration: "guideFrNerMigration",
  guideGuestRegister: "guideGuestRegister",
  guideSes: "guideSes",
  guideAmsterdamNightCap: "guideAmsterdamNightCap",
  guideItalyCinAlloggiati: "guideItalyCinAlloggiati",
  guidePortugalRnalSiba: "guidePortugalRnalSiba",
  guideGreeceAmaAade: "guideGreeceAmaAade",
  guideCroatiaEvisitor: "guideCroatiaEvisitor",
  guideBelgiumStrRegistration: "guideBelgiumStrRegistration",
  guideBrusselsAirbnbRegistration: "guideBrusselsAirbnbRegistration",
  guideViennaStrRegistration: "guideViennaStrRegistration",
  guideViennaAirbnbRegistration: "guideViennaAirbnbRegistration",
  guideBerlinStrRegistration: "guideBerlinStrRegistration",
  guideBerlinAirbnbRegistration: "guideBerlinAirbnbRegistration",
  guideMunichStrRegistration: "guideMunichStrRegistration",
  guideMunichAirbnbRegistration: "guideMunichAirbnbRegistration",
  guideBarcelonaStrRegistration: "guideBarcelonaStrRegistration",
  guideBarcelonaAirbnbRegistration: "guideBarcelonaAirbnbRegistration",
  guideMadridStrRegistration: "guideMadridStrRegistration",
  guideMadridAirbnbRegistration: "guideMadridAirbnbRegistration",
  guideValenciaStrRegistration: "guideValenciaStrRegistration",
  guideValenciaAirbnbRegistration: "guideValenciaAirbnbRegistration",
  guideMalagaStrRegistration: "guideMalagaStrRegistration",
  guideMalagaAirbnbRegistration: "guideMalagaAirbnbRegistration",
  guideSevilleStrRegistration: "guideSevilleStrRegistration",
  guideSevilleAirbnbRegistration: "guideSevilleAirbnbRegistration",
  guideAmsterdamStrRegistration: "guideAmsterdamStrRegistration",
  guideAmsterdamAirbnbRegistration: "guideAmsterdamAirbnbRegistration",
  guideIrelandStrRegistration: "guideIrelandStrRegistration",
  guideDublinAirbnbRegistration: "guideDublinAirbnbRegistration",
  guideParisStrRegistration: "guideParisStrRegistration",
  guideParisAirbnbRegistration: "guideParisAirbnbRegistration",
  guideLyonStrRegistration: "guideLyonStrRegistration",
  guideLyonAirbnbRegistration: "guideLyonAirbnbRegistration",
  guideMarseilleStrRegistration: "guideMarseilleStrRegistration",
  guideMarseilleAirbnbRegistration: "guideMarseilleAirbnbRegistration",
  guideBordeauxStrRegistration: "guideBordeauxStrRegistration",
  guideBordeauxAirbnbRegistration: "guideBordeauxAirbnbRegistration",
};

export function footerLabelKeyForGuide(page: SeoPageKey): string {
  const key = FOOTER_LABEL_KEY[page];
  if (!key) {
    return page;
  }
  return key;
}
