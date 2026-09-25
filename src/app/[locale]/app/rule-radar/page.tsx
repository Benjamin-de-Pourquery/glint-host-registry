"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Radar } from "lucide-react";
import { toast } from "sonner";
import { RULE_KEYS } from "@/lib/rule-radar/keys";

type ConsoleData = {
  sources: Array<{
    url: string;
    labelEn: string;
    labelFr: string;
    role: string;
    contentHash: string;
  }>;
  triageQueue: Array<{
    source: {
      url: string;
      labelEn: string;
      labelFr: string;
      contentHash: string;
    };
    suggestedRuleKeys: string[];
  }>;
  rules: Array<{
    id: string;
    key: string;
    country: string;
    valueJson: string;
    effectiveFrom: string;
    sourceUrl: string | null;
  }>;
  changes: Array<{
    id: string;
    summaryEn: string;
    summaryFr: string;
    confidence: string;
    publishedAt: string | null;
    impactCount: number;
  }>;
};

export default function RuleRadarConsolePage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  const t = useTranslations("ruleRadar.console");

  const [data, setData] = useState<ConsoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [summaryEn, setSummaryEn] = useState("");
  const [summaryFr, setSummaryFr] = useState("");
  const [confidence, setConfidence] = useState("official");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_CITIES,
  ]);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/internal/rule-radar/console");
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) return;
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const createDraft = async (publish: boolean) => {
    if (!summaryEn.trim() || !summaryFr.trim() || selectedKeys.length === 0) {
      toast.error(t("validation"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/internal/rule-radar/changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleKeys: selectedKeys,
          summaryEn,
          summaryFr,
          confidence,
          publish,
        }),
      });

      if (!res.ok) {
        toast.error(t("error"));
        return;
      }

      const result = await res.json();
      toast.success(
        publish
          ? t("published", { count: result.impactsCreated ?? 0 })
          : t("draftSaved")
      );
      setSummaryEn("");
      setSummaryFr("");
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("loading")}
      </div>
    );
  }

  if (forbidden) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("forbiddenTitle")}</CardTitle>
          <CardDescription>{t("forbiddenDescription")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Radar className="h-6 w-6" />
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        </div>
        <p className="mt-1 text-slate-600">{t("description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("triageTitle")}</CardTitle>
          <CardDescription>{t("triageDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.triageQueue.slice(0, 12).map((item) => (
            <div key={item.source.url} className="rounded border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={item.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-700 hover:underline"
                >
                  {locale === "fr" ? item.source.labelFr : item.source.labelEn}
                </a>
                <Badge variant="outline">hash:{item.source.contentHash}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {item.suggestedRuleKeys.join(", ")}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("authorTitle")}</CardTitle>
          <CardDescription>{t("authorDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.values(RULE_KEYS).map((key) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={selectedKeys.includes(key) ? "default" : "outline"}
                onClick={() => toggleKey(key)}
              >
                {key}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="summaryEn">{t("summaryEn")}</Label>
              <Textarea
                id="summaryEn"
                value={summaryEn}
                onChange={(e) => setSummaryEn(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summaryFr">{t("summaryFr")}</Label>
              <Textarea
                id="summaryFr"
                value={summaryFr}
                onChange={(e) => setSummaryFr(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("confidence")}</Label>
            <Select value={confidence} onValueChange={setConfidence}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="official">{t("confidenceOfficial")}</SelectItem>
                <SelectItem value="announced">{t("confidenceAnnounced")}</SelectItem>
                <SelectItem value="reported">{t("confidenceReported")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => createDraft(false)}
            >
              {t("saveDraft")}
            </Button>
            <Button disabled={submitting} onClick={() => createDraft(true)}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("publish")}
            </Button>
          </div>
          <p className="text-xs text-slate-500">{t("publishNote")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("rulesTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {data.rules.slice(0, 20).map((rule) => (
              <div key={rule.id} className="rounded border p-2">
                <span className="font-mono text-xs">{rule.key}</span>
                <span className="mx-2 text-slate-400">|</span>
                <span>{rule.country}</span>
                <span className="mx-2 text-slate-400">|</span>
                <span className="text-slate-600">{rule.valueJson}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("changesTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data.changes.map((change) => (
            <div key={change.id} className="rounded border p-3">
              <p className="font-medium">{change.summaryEn}</p>
              <p className="text-slate-600">{change.summaryFr}</p>
              <p className="mt-1 text-xs text-slate-500">
                {change.publishedAt ? t("publishedLabel") : t("draftLabel")}
                {change.publishedAt ? ` | ${change.impactCount} impacts` : ""}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
