"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CopyFieldChip } from "@/components/copy-field-chip";
import {
  LISTING_PLATFORMS,
  PLATFORM_HELP_LINKS,
  getLinkedPlatforms,
  getPlatformProgressSummary,
  type ListingPlatform,
  type PlatformProgressItem,
} from "@/lib/listings/platforms";
import { ExternalLink, HelpCircle, Link2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FormData = {
  airbnbUrl?: string | null;
  bookingUrl?: string | null;
  vrboUrl?: string | null;
  registrationNumber?: string | null;
};

type Props = {
  propertyId: string;
  initial: FormData;
  platformProgress: PlatformProgressItem[];
};

const PLATFORM_LABEL_KEYS: Record<ListingPlatform, string> = {
  airbnb: "airbnb",
  booking: "booking",
  vrbo: "vrbo",
};

export function PropertyListingsForm({ propertyId, initial, platformProgress }: Props) {
  const t = useTranslations("properties.detail.listings");
  const tForm = useTranslations("properties.form");
  const locale = useLocale();
  const router = useRouter();
  const lang = (locale === "fr" ? "fr" : "en") as "en" | "fr";

  const [form, setForm] = useState({
    airbnbUrl: initial.airbnbUrl || "",
    bookingUrl: initial.bookingUrl || "",
    vrboUrl: initial.vrboUrl || "",
    registrationNumber: initial.registrationNumber || "",
  });
  const [progress, setProgress] = useState(platformProgress);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<ListingPlatform | null>(null);

  const hasListings =
    form.airbnbUrl.trim() || form.bookingUrl.trim() || form.vrboUrl.trim();

  const hasRegistrationNumber = Boolean(form.registrationNumber.trim());

  const linkedPlatforms = useMemo(
    () =>
      getLinkedPlatforms({
        airbnbUrl: form.airbnbUrl,
        bookingUrl: form.bookingUrl,
        vrboUrl: form.vrboUrl,
      }),
    [form.airbnbUrl, form.bookingUrl, form.vrboUrl]
  );

  const summary = getPlatformProgressSummary(linkedPlatforms, progress);

  const getPlatformUrl = (platform: ListingPlatform) => {
    switch (platform) {
      case "airbnb":
        return form.airbnbUrl;
      case "booking":
        return form.bookingUrl;
      case "vrbo":
        return form.vrboUrl;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const [propRes, regRes] = await Promise.all([
      fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          airbnbUrl: form.airbnbUrl || null,
          bookingUrl: form.bookingUrl || null,
          vrboUrl: form.vrboUrl || null,
        }),
      }),
      fetch(`/api/properties/${propertyId}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber: form.registrationNumber || null }),
      }),
    ]);

    setLoading(false);
    if (!propRes.ok || !regRes.ok) {
      toast.error(t("saveError"));
      return;
    }
    router.refresh();
    toast.success(t("saved"));
  };

  const togglePlatform = async (platform: ListingPlatform) => {
    const current = progress.find((p) => p.platform === platform);
    const completed = !current?.completed;
    setToggling(platform);

    const res = await fetch(`/api/properties/${propertyId}/listings-platforms`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, completed }),
    });

    setToggling(null);

    if (!res.ok) {
      toast.error(t("checklist.toggleError"));
      return;
    }

    const data = await res.json();
    setProgress((prev) =>
      prev.map((p) =>
        p.platform === platform
          ? { ...p, completed: data.completed, completedAt: data.completedAt }
          : p
      )
    );
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {!hasListings && (
        <div className="rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center">
          <Link2 className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-medium text-slate-900">{t("empty.title")}</p>
          <p className="mt-1 text-sm text-slate-500">{t("empty.description")}</p>
        </div>
      )}

      {hasRegistrationNumber && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">{t("registrationTitle")}</h2>
          <p className="text-sm text-slate-600">{t("registrationHint")}</p>
          <CopyFieldChip
            label={t("registrationLabel")}
            value={form.registrationNumber}
            copiedLabel={t("copied")}
          />
        </section>
      )}

      {hasRegistrationNumber && linkedPlatforms.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{t("checklist.title")}</h2>
            <p className="text-sm font-medium text-slate-600">
              {t("checklist.summary", {
                completed: summary.completed,
                total: summary.total,
              })}
            </p>
          </div>
          <p className="text-sm text-slate-500">{t("checklist.description")}</p>
          <ul className="space-y-3">
            {LISTING_PLATFORMS.map((platform) => {
              const isLinked = linkedPlatforms.includes(platform);
              const item = progress.find((p) => p.platform === platform);
              const helpLink = PLATFORM_HELP_LINKS[platform];
              const platformUrl = getPlatformUrl(platform);

              return (
                <li
                  key={platform}
                  className={cn(
                    "rounded-lg border px-4 py-3",
                    isLinked ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`platform-${platform}`}
                      checked={item?.completed ?? false}
                      disabled={!isLinked || toggling === platform}
                      onCheckedChange={() => togglePlatform(platform)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <label
                        htmlFor={`platform-${platform}`}
                        className={cn(
                          "text-sm font-medium",
                          isLinked ? "text-slate-900 cursor-pointer" : "text-slate-400"
                        )}
                      >
                        {t("checklist.item", { platform: tForm(PLATFORM_LABEL_KEYS[platform]) })}
                      </label>
                      {!isLinked && (
                        <p className="text-xs text-slate-400">{t("checklist.notLinked")}</p>
                      )}
                      {isLinked && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {platformUrl && (
                            <a
                              href={platformUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t("checklist.openListing")}
                            </a>
                          )}
                          <a
                            href={helpLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 hover:underline"
                          >
                            <HelpCircle className="h-3 w-3" />
                            {helpLink.label[lang]}
                          </a>
                        </div>
                      )}
                    </div>
                    {isLinked && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                          item?.completed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-50 text-amber-800"
                        )}
                      >
                        {item?.completed ? t("checklist.done") : t("checklist.pending")}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {summary.total > 0 && summary.completed === summary.total && (
            <p className="text-sm text-emerald-700">{t("checklist.allComplete")}</p>
          )}
        </section>
      )}

      {hasRegistrationNumber && linkedPlatforms.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
          {t("checklist.noLinkedPlatforms")}
        </div>
      )}

      {!hasRegistrationNumber && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {t("checklist.noRegistration")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">{t("urlsTitle")}</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="airbnb">{tForm("airbnb")}</Label>
              <div className="flex gap-2">
                <Input
                  id="airbnb"
                  type="url"
                  value={form.airbnbUrl}
                  onChange={(e) => setForm({ ...form, airbnbUrl: e.target.value })}
                  placeholder="https://"
                />
                {form.airbnbUrl && (
                  <a href={form.airbnbUrl} target="_blank" rel="noopener noreferrer">
                    <Button type="button" variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking">{tForm("booking")}</Label>
              <div className="flex gap-2">
                <Input
                  id="booking"
                  type="url"
                  value={form.bookingUrl}
                  onChange={(e) => setForm({ ...form, bookingUrl: e.target.value })}
                  placeholder="https://"
                />
                {form.bookingUrl && (
                  <a href={form.bookingUrl} target="_blank" rel="noopener noreferrer">
                    <Button type="button" variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vrbo">{tForm("vrbo")}</Label>
              <div className="flex gap-2">
                <Input
                  id="vrbo"
                  type="url"
                  value={form.vrboUrl}
                  onChange={(e) => setForm({ ...form, vrboUrl: e.target.value })}
                  placeholder="https://"
                />
                {form.vrboUrl && (
                  <a href={form.vrboUrl} target="_blank" rel="noopener noreferrer">
                    <Button type="button" variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {!hasRegistrationNumber && (
          <section className="space-y-4 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-semibold text-slate-900">{t("registrationTitle")}</h2>
            <p className="text-sm text-slate-500">{t("registrationHint")}</p>
            <div className="space-y-2">
              <Label htmlFor="registration">{t("registrationLabel")}</Label>
              <Input
                id="registration"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                placeholder="e.g. 75112-STR-2024-00847"
                className="font-mono"
              />
            </div>
          </section>
        )}

        <Button type="submit" disabled={loading}>
          {t("save")}
        </Button>
      </form>
    </div>
  );
}
