"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, RefreshCw, Scale, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GENERIC_COLUMN_FIELDS } from "@/lib/authority-mirror/parsers/generic";

type LedgerChannel = {
  channel: string;
  platformNights: number;
  platformReservations: number;
  declaredTouristTaxNights: number | null;
  guestReportsFiled: number;
  registrationKeyDisplayed: string | null;
};

type Finding = {
  id: string;
  code: string;
  severity: string;
  expected: Record<string, unknown>;
  observed: Record<string, unknown>;
  sourceRefs: string[];
  resolvedAt: string | null;
};

type Dac7Overview = {
  id: string;
  year: number;
  channel: string;
  listingRef: string | null;
  daysRented: number;
  q1ConsiderationCents: number | null;
  q2ConsiderationCents: number | null;
  q3ConsiderationCents: number | null;
  q4ConsiderationCents: number | null;
};

type Props = {
  propertyId: string;
  locale: string;
};

const CHANNELS = ["AIRBNB", "BOOKING", "GENERIC"] as const;

function currentPeriodMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function findingFixHref(
  locale: string,
  propertyId: string,
  code: string
): string {
  const base = `/${locale}/app/properties/${propertyId}`;
  switch (code) {
    case "UNDECLARED_NIGHTS":
      return `${base}?tab=overview`;
    case "GUEST_REPORT_MISSING":
    case "GUEST_COUNT_MISMATCH":
      return `${base}?tab=register`;
    case "CAP_EXCEEDED_CROSS_CHANNEL":
      return `${base}?tab=overview`;
    case "WRONG_KEY_ON_CHANNEL":
      return `${base}?tab=listings`;
    case "DAC7_DAYS_MISMATCH":
      return `${base}?tab=overview`;
    default:
      return `${base}?tab=overview`;
  }
}

export function AuthorityMirrorCard({ propertyId, locale }: Props) {
  const t = useTranslations("authorityMirror");
  const [period, setPeriod] = useState(currentPeriodMonth());
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showAmounts, setShowAmounts] = useState(false);
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("AIRBNB");
  const [ledgerChannels, setLedgerChannels] = useState<LedgerChannel[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [nightCapUsed, setNightCapUsed] = useState(0);
  const [nightCapLimit, setNightCapLimit] = useState<number | null>(null);
  const [touristTaxNights, setTouristTaxNights] = useState<number | null>(null);
  const [recentImports, setRecentImports] = useState<
    Array<{ id: string; channel: string; filename: string | null; rowCount: number; createdAt: string }>
  >([]);
  const [dac7Year, setDac7Year] = useState(new Date().getFullYear());
  const [dac7Rows, setDac7Rows] = useState<Dac7Overview[]>([]);
  const [dac7Form, setDac7Form] = useState({
    channel: "AIRBNB",
    listingRef: "",
    daysRented: "",
    q1: "",
    q2: "",
    q3: "",
    q4: "",
  });
  const [genericHeaders, setGenericHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const openFindings = useMemo(
    () => findings.filter((finding) => !finding.resolvedAt),
    [findings]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/authority-mirror?period=${period}`
      );
      if (!response.ok) throw new Error("load failed");
      const data = await response.json();
      setLedgerChannels(data.ledger?.channels ?? []);
      setFindings(data.findings ?? []);
      setNightCapUsed(data.ledger?.nightCapUsed ?? 0);
      setNightCapLimit(data.ledger?.nightCapLimit ?? null);
      setTouristTaxNights(data.ledger?.touristTaxNightsDeclared ?? null);
      setRecentImports(data.recentImports ?? []);
    } catch {
      toast.error(t("errors.load"));
    } finally {
      setLoading(false);
    }
  }, [period, propertyId, t]);

  const loadDac7 = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/authority-mirror/dac7?year=${dac7Year}`
      );
      if (!response.ok) return;
      const data = await response.json();
      setDac7Rows(data.overviews ?? []);
    } catch {
      // optional panel
    }
  }, [dac7Year, propertyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadDac7();
  }, [loadDac7]);

  const runReconcile = async () => {
    setReconciling(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}/authority-mirror`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      if (!response.ok) throw new Error("reconcile failed");
      toast.success(t("reconcile.success"));
      await loadData();
    } catch {
      toast.error(t("errors.reconcile"));
    } finally {
      setReconciling(false);
    }
  };

  const handleFilePreview = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("channel", channel);
    formData.append("preview", "true");
    const response = await fetch(`/api/properties/${propertyId}/authority-mirror/import`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) return;
    const data = await response.json();
    setGenericHeaders(data.headers ?? []);
    setColumnMapping(data.mapping ?? {});
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("channel", channel);
      if (channel === "GENERIC") {
        formData.append("mapping", JSON.stringify(columnMapping));
        await fetch(`/api/properties/${propertyId}/authority-mirror/column-mapping`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: "GENERIC", mapping: columnMapping }),
        });
      }
      const response = await fetch(`/api/properties/${propertyId}/authority-mirror/import`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("import failed");
      const data = await response.json();
      toast.success(t("import.success", { count: data.imported, matched: data.matched }));
      await loadData();
    } catch {
      toast.error(t("errors.import"));
    } finally {
      setImporting(false);
    }
  };

  const resolveFinding = async (findingId: string) => {
    const response = await fetch(`/api/properties/${propertyId}/authority-mirror/findings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ findingId }),
    });
    if (!response.ok) {
      toast.error(t("errors.resolve"));
      return;
    }
    toast.success(t("findings.resolved"));
    await loadData();
  };

  const saveDac7 = async () => {
    const response = await fetch(`/api/properties/${propertyId}/authority-mirror/dac7`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: dac7Year,
        channel: dac7Form.channel,
        listingRef: dac7Form.listingRef || null,
        daysRented: Number(dac7Form.daysRented || 0),
        q1ConsiderationCents: dac7Form.q1 ? Math.round(Number(dac7Form.q1) * 100) : null,
        q2ConsiderationCents: dac7Form.q2 ? Math.round(Number(dac7Form.q2) * 100) : null,
        q3ConsiderationCents: dac7Form.q3 ? Math.round(Number(dac7Form.q3) * 100) : null,
        q4ConsiderationCents: dac7Form.q4 ? Math.round(Number(dac7Form.q4) * 100) : null,
      }),
    });
    if (!response.ok) {
      toast.error(t("errors.dac7"));
      return;
    }
    toast.success(t("dac7.saved"));
    setDac7Form({
      channel: dac7Form.channel,
      listingRef: "",
      daysRented: "",
      q1: "",
      q2: "",
      q3: "",
      q4: "",
    });
    await loadDac7();
    await loadData();
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-700" />
            <h3 className="text-sm font-semibold text-slate-900">{t("title")}</h3>
          </div>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
          <p className="mt-1 text-xs text-slate-500">{t("disclaimer")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="month"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="w-[9.5rem]"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={runReconcile}
            disabled={reconciling}
          >
            {reconciling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {t("reconcile.action")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("loading")}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section>
            <h4 className="text-sm font-medium text-slate-900">{t("ledger.title")}</h4>
            <p className="mt-1 text-xs text-slate-500">{t("ledger.hint")}</p>
            <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">{t("ledger.channel")}</th>
                    <th className="px-3 py-2">{t("ledger.platformNights")}</th>
                    <th className="px-3 py-2">{t("ledger.reservations")}</th>
                    <th className="px-3 py-2">{t("ledger.touristTaxNights")}</th>
                    <th className="px-3 py-2">{t("ledger.guestReports")}</th>
                    <th className="px-3 py-2">{t("ledger.registrationKey")}</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerChannels.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-slate-500">
                        {t("ledger.empty")}
                      </td>
                    </tr>
                  ) : (
                    ledgerChannels.map((row) => (
                      <tr key={row.channel} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-medium">{row.channel}</td>
                        <td className="px-3 py-2">{row.platformNights}</td>
                        <td className="px-3 py-2">{row.platformReservations}</td>
                        <td className="px-3 py-2">
                          {row.declaredTouristTaxNights ?? t("ledger.notDeclared")}
                        </td>
                        <td className="px-3 py-2">{row.guestReportsFiled}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {row.registrationKeyDisplayed ?? t("ledger.missingKey")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
              <span>
                {t("ledger.nightCap")}: {nightCapUsed}
                {nightCapLimit != null ? ` / ${nightCapLimit}` : ""}
              </span>
              <span>
                {t("ledger.touristTaxTotal")}: {touristTaxNights ?? t("ledger.notDeclared")}
              </span>
            </div>
          </section>

          <section className="rounded-md border border-dashed border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-slate-600" />
              <h4 className="text-sm font-medium text-slate-900">{t("import.title")}</h4>
            </div>
            <p className="mt-1 text-xs text-slate-500">{t("import.hint")}</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <Label className="text-xs">{t("import.channel")}</Label>
                <Select value={channel} onValueChange={(value) => setChannel(value as typeof channel)}>
                  <SelectTrigger className="mt-1 w-[10rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t("import.file")}</Label>
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="mt-1"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (channel === "GENERIC") {
                      setPendingFile(file);
                      handleFilePreview(file);
                      return;
                    }
                    handleImport(file);
                  }}
                  disabled={importing}
                />
              </div>
              {channel === "GENERIC" && pendingFile && (
                <Button
                  type="button"
                  size="sm"
                  disabled={importing || !columnMapping.checkIn || !columnMapping.checkOut}
                  onClick={() => pendingFile && handleImport(pendingFile)}
                >
                  {importing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {t("import.runGeneric")}
                </Button>
              )}
            </div>

            {channel === "GENERIC" && genericHeaders.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {GENERIC_COLUMN_FIELDS.map((field) => (
                  <div key={field}>
                    <Label className="text-xs">{t(`import.mapping.${field}`)}</Label>
                    <Select
                      value={columnMapping[field] ?? ""}
                      onValueChange={(value) =>
                        setColumnMapping((prev) => ({ ...prev, [field]: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t("import.mapping.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {genericHeaders.map((header) => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <Checkbox
                id={`show-amounts-${propertyId}`}
                checked={showAmounts}
                onCheckedChange={(checked) => setShowAmounts(checked === true)}
              />
              <Label htmlFor={`show-amounts-${propertyId}`} className="text-xs text-slate-600">
                {t("import.showAmounts")}
              </Label>
            </div>

            {recentImports.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-slate-600">
                {recentImports.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>
                      {item.channel} · {item.rowCount} rows ·{" "}
                      {format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium text-slate-900">{t("findings.title")}</h4>
              {openFindings.length > 0 && (
                <Badge variant="secondary">{openFindings.length}</Badge>
              )}
            </div>
            {openFindings.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">{t("findings.empty")}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {openFindings.map((finding) => (
                  <li
                    key={finding.id}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm",
                      finding.severity === "likely_issue"
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">
                          {t(`findings.codes.${finding.code}`)}
                        </p>
                        <p className="text-xs text-slate-600">
                          {t(`findings.severity.${finding.severity}`)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {t(`explanations.${finding.code}`)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={findingFixHref(locale, propertyId, finding.code)}>
                            {t("findings.fix")}
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => resolveFinding(finding.id)}
                        >
                          {t("findings.resolve")}
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-md border border-slate-200 p-4">
            <h4 className="text-sm font-medium text-slate-900">{t("dac7.title")}</h4>
            <p className="mt-1 text-xs text-slate-500">{t("dac7.hint")}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">{t("dac7.year")}</Label>
                <Input
                  type="number"
                  value={dac7Year}
                  onChange={(event) => setDac7Year(Number(event.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">{t("dac7.channel")}</Label>
                <Select
                  value={dac7Form.channel}
                  onValueChange={(value) =>
                    setDac7Form((prev) => ({ ...prev, channel: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["AIRBNB", "BOOKING", "VRBO", "OTHER"].map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t("dac7.listingRef")}</Label>
                <Input
                  value={dac7Form.listingRef}
                  onChange={(event) =>
                    setDac7Form((prev) => ({ ...prev, listingRef: event.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">{t("dac7.daysRented")}</Label>
                <Input
                  type="number"
                  value={dac7Form.daysRented}
                  onChange={(event) =>
                    setDac7Form((prev) => ({ ...prev, daysRented: event.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            {showAmounts && (
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                {(["q1", "q2", "q3", "q4"] as const).map((quarter) => (
                  <div key={quarter}>
                    <Label className="text-xs">{t(`dac7.${quarter}`)}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={dac7Form[quarter]}
                      onChange={(event) =>
                        setDac7Form((prev) => ({ ...prev, [quarter]: event.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            )}
            <Button type="button" size="sm" className="mt-3" onClick={saveDac7}>
              {t("dac7.save")}
            </Button>
            {dac7Rows.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-slate-600">
                {dac7Rows.map((row) => (
                  <li key={row.id}>
                    {row.channel}
                    {row.listingRef ? ` (${row.listingRef})` : ""}: {row.daysRented} days
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
