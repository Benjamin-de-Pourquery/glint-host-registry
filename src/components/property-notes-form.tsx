"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Props = {
  propertyId: string;
  initialNotes?: string | null;
};

export function PropertyNotesForm({ propertyId, initialNotes }: Props) {
  const t = useTranslations("properties.detail.notes");
  const tForm = useTranslations("properties.form");
  const router = useRouter();

  const [notes, setNotes] = useState(initialNotes || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/properties/${propertyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notes || null }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(t("saveError"));
      return;
    }
    router.refresh();
    toast.success(t("saved"));
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t("title")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">{tForm("notes")}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={8}
          placeholder={t("placeholder")}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {t("save")}
      </Button>
    </form>
  );
}
