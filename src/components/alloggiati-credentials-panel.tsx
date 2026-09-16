"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type AlloggiatiCredentialData = {
  configured: boolean;
  usesAlloggiati: boolean;
  utente: string | null;
  liveSubmitEnabled: boolean;
  lastTestedAt: string | null;
  lastTestStatus: string | null;
  encryptionConfigured: boolean;
  alloggiatiLiveEnv: boolean;
  wsManualUrl: string;
};

type Props = {
  propertyId: string;
};

export function AlloggiatiCredentialsPanel({ propertyId }: Props) {
  const t = useTranslations("alloggiati");
  const [data, setData] = useState<AlloggiatiCredentialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [form, setForm] = useState({
    utente: "",
    password: "",
    wsKey: "",
    liveSubmitEnabled: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/alloggiati-credentials`);
      if (!res.ok) throw new Error("Failed");
      const json = (await res.json()) as AlloggiatiCredentialData;
      setData(json);
      if (json.utente) {
        setForm((f) => ({
          ...f,
          utente: json.utente ?? "",
          liveSubmitEnabled: json.liveSubmitEnabled,
        }));
      }
    } catch {
      toast.error(t("credentials.loadError"));
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
      const res = await fetch(`/api/properties/${propertyId}/alloggiati-credentials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      toast.success(t("credentials.saved"));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("credentials.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/alloggiati-credentials/test`,
        { method: "POST" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      if (json.status === "ok") {
        toast.success(t("credentials.testOk"));
      } else {
        toast.error(
          t("credentials.testFailed", {
            message: json.governmentMessage ?? json.message ?? json.status,
          })
        );
      }
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("credentials.testError"));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-8 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("credentials.loading")}
        </CardContent>
      </Card>
    );
  }

  if (!data?.usesAlloggiati) return null;

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

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          {t("credentials.optionalNote")}
          <a
            href={data.wsManualUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex items-center gap-1 text-slate-800 underline"
          >
            {t("credentials.wsManual")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("credentials.utente")}</Label>
            <Input
              value={form.utente}
              onChange={(e) => setForm((f) => ({ ...f, utente: e.target.value }))}
              placeholder="XX002458"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("credentials.password")}</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("credentials.wsKey")}</Label>
            <Input
              type="password"
              value={form.wsKey}
              onChange={(e) => setForm((f) => ({ ...f, wsKey: e.target.value }))}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <Checkbox
            id="alloggiatiLiveSubmit"
            checked={form.liveSubmitEnabled}
            onCheckedChange={(checked) =>
              setForm((f) => ({ ...f, liveSubmitEnabled: checked === true }))
            }
            disabled={!data.alloggiatiLiveEnv}
          />
          <div>
            <Label htmlFor="alloggiatiLiveSubmit" className="text-sm font-medium">
              {t("credentials.liveSubmit")}
            </Label>
            <p className="text-xs text-slate-500">
              {data.alloggiatiLiveEnv
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
