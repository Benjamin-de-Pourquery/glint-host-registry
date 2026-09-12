"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type SesCredentialData = {
  configured: boolean;
  reportingSystem: "ses" | "catalonia" | "basque";
  usesSes: boolean;
  codigoArrendador: string | null;
  codigoEstablecimiento: string | null;
  liveSubmitEnabled: boolean;
  lastTestedAt: string | null;
  lastTestStatus: string | null;
  encryptionConfigured: boolean;
  sesLiveEnv: boolean;
};

type Props = {
  propertyId: string;
  city: string;
};

export function SesCredentialsPanel({ propertyId, city }: Props) {
  const t = useTranslations("ses");
  const [data, setData] = useState<SesCredentialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [form, setForm] = useState({
    codigoArrendador: "",
    wsUsername: "",
    wsPassword: "",
    codigoEstablecimiento: "",
    liveSubmitEnabled: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/ses-credentials`);
      if (!res.ok) throw new Error("Failed");
      const json = (await res.json()) as SesCredentialData;
      setData(json);
      if (json.codigoArrendador) {
        setForm((f) => ({
          ...f,
          codigoArrendador: json.codigoArrendador ?? "",
          codigoEstablecimiento: json.codigoEstablecimiento ?? "",
          liveSubmitEnabled: json.liveSubmitEnabled,
        }));
      }
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [propertyId, t]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/ses-credentials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      toast.success(t("saved"));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/ses-credentials/test`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      if (json.status === "ok") {
        toast.success(t("testOk"));
      } else {
        toast.error(t("testFailed", { message: json.governmentMessage ?? json.message }));
      }
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("testError"));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-8 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("loading")}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  if (!data.usesSes) {
    return (
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            {t("regionalSystem.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-900">
          <p>
            {data.reportingSystem === "catalonia"
              ? t("regionalSystem.catalonia", { city })
              : t("regionalSystem.basque", { city })}
          </p>
          <p className="text-xs text-amber-800">{t("regionalSystem.hint")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-slate-600" />
          {t("credentials.title")}
          {data.configured && (
            <Badge variant="secondary" className="ml-1">
              {t("credentials.configured")}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-slate-600">{t("credentials.subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data.encryptionConfigured && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {t("credentials.encryptionMissing")}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("credentials.codigoArrendador")}</Label>
            <Input
              value={form.codigoArrendador}
              onChange={(e) => setForm((f) => ({ ...f, codigoArrendador: e.target.value }))}
              placeholder="0000000001"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("credentials.codigoEstablecimiento")}</Label>
            <Input
              value={form.codigoEstablecimiento}
              onChange={(e) =>
                setForm((f) => ({ ...f, codigoEstablecimiento: e.target.value }))
              }
              placeholder="0000000001"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("credentials.wsUsername")}</Label>
            <Input
              value={form.wsUsername}
              onChange={(e) => setForm((f) => ({ ...f, wsUsername: e.target.value }))}
              placeholder="user_WS"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("credentials.wsPassword")}</Label>
            <Input
              type="password"
              value={form.wsPassword}
              onChange={(e) => setForm((f) => ({ ...f, wsPassword: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <Checkbox
            id="liveSubmit"
            checked={form.liveSubmitEnabled}
            onCheckedChange={(checked) =>
              setForm((f) => ({ ...f, liveSubmitEnabled: checked === true }))
            }
            disabled={!data.sesLiveEnv}
          />
          <div>
            <Label htmlFor="liveSubmit" className="text-sm font-medium">
              {t("credentials.liveSubmit")}
            </Label>
            <p className="text-xs text-slate-500">
              {data.sesLiveEnv
                ? t("credentials.liveSubmitHint")
                : t("credentials.liveSubmitDisabled")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={saving || !data.encryptionConfigured}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("credentials.save")}
          </Button>
          {data.configured && (
            <Button variant="outline" onClick={testConnection} disabled={testing}>
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("credentials.test")}
            </Button>
          )}
        </div>

        {data.lastTestedAt && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {data.lastTestStatus === "ok" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            )}
            {t("credentials.lastTest", {
              status: data.lastTestStatus ?? "unknown",
              date: new Date(data.lastTestedAt).toLocaleString(),
            })}
          </div>
        )}

        <p className="text-xs text-slate-500">{t("credentials.securityNote")}</p>
      </CardContent>
    </Card>
  );
}
