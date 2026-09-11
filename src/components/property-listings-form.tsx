"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Link2 } from "lucide-react";
import { toast } from "sonner";

type FormData = {
  airbnbUrl?: string | null;
  bookingUrl?: string | null;
  vrboUrl?: string | null;
  registrationNumber?: string | null;
};

type Props = {
  propertyId: string;
  initial: FormData;
};

export function PropertyListingsForm({ propertyId, initial }: Props) {
  const t = useTranslations("properties.detail.listings");
  const tForm = useTranslations("properties.form");
  const router = useRouter();

  const [form, setForm] = useState({
    airbnbUrl: initial.airbnbUrl || "",
    bookingUrl: initial.bookingUrl || "",
    vrboUrl: initial.vrboUrl || "",
    registrationNumber: initial.registrationNumber || "",
  });
  const [loading, setLoading] = useState(false);

  const hasListings =
    form.airbnbUrl.trim() || form.bookingUrl.trim() || form.vrboUrl.trim();

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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {!hasListings && (
        <div className="rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center">
          <Link2 className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-medium text-slate-900">{t("empty.title")}</p>
          <p className="mt-1 text-sm text-slate-500">{t("empty.description")}</p>
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

        <Button type="submit" disabled={loading}>
          {t("save")}
        </Button>
      </form>
    </div>
  );
}
