"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Copy,
  Check,
  Link2,
  Loader2,
  Download,
  FileText,
  RefreshCw,
  Users,
  AlertCircle,
  UserPlus,
  AlertTriangle,
  CalendarPlus,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";
import QRCode from "qrcode";
import { format } from "date-fns";

type GuestRecordSummary = {
  id: string;
  lastName: string;
  firstNames: string;
  nationality: string;
  arrivalDate: string;
  departureDate: string;
  isFrenchNational: boolean;
  requiresPoliceForm: boolean;
  signedAt: string | null;
  submittedAt: string | null;
  retentionExpiresAt: string | null;
};

type GuestStaySummary = {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  expectsForeignGuest: boolean;
  guestLabel: string | null;
  notes: string | null;
  hasMatchingFiche: boolean;
  isMissingFiche: boolean;
  ficheDeadline: string;
};

type GuestRegisterData = {
  token: { enabled: boolean; token: string; createdAt: string } | null;
  records: GuestRecordSummary[];
  stays: GuestStaySummary[];
  guestsThisMonth: number;
  missingFichesCount: number;
};

type Props = {
  propertyId: string;
  locale: string;
};

export function GuestRegisterPanel({ propertyId, locale }: Props) {
  const t = useTranslations("guestRegister");
  const [data, setData] = useState<GuestRegisterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stayLoading, setStayLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [showStayForm, setShowStayForm] = useState(false);
  const [stayForm, setStayForm] = useState({
    checkInDate: "",
    checkOutDate: "",
    expectsForeignGuest: true,
    guestLabel: "",
    notes: "",
  });

  const checkInUrl =
    data?.token?.enabled && data.token.token
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/${locale}/check-in/${data.token.token}`
      : null;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/guest-register`);
      if (!res.ok) throw new Error("Failed");
      const json = (await res.json()) as GuestRegisterData;
      setData(json);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [propertyId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!checkInUrl) {
      setQrSvg(null);
      return;
    }
    QRCode.toString(checkInUrl, { type: "svg", margin: 1, width: 160 })
      .then(setQrSvg)
      .catch(() => setQrSvg(null));
  }, [checkInUrl]);

  const runAction = async (action: "enable" | "disable" | "rotate") => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/guest-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed");
      await loadData();
      toast.success(
        action === "disable" ? t("linkDisabled") : t("linkEnabled")
      );
    } catch {
      toast.error(t("actionError"));
    } finally {
      setActionLoading(false);
    }
  };

  const copyLink = async () => {
    if (!checkInUrl) return;
    await navigator.clipboard.writeText(checkInUrl);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const addExpectedStay = async () => {
    if (!stayForm.checkInDate || !stayForm.checkOutDate) {
      toast.error(t("stays.dateRequired"));
      return;
    }
    setStayLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/guest-stays`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stayForm),
      });
      if (!res.ok) throw new Error("Failed");
      await loadData();
      setShowStayForm(false);
      setStayForm({
        checkInDate: "",
        checkOutDate: "",
        expectsForeignGuest: true,
        guestLabel: "",
        notes: "",
      });
      toast.success(t("stays.added"));
    } catch {
      toast.error(t("stays.addError"));
    } finally {
      setStayLoading(false);
    }
  };

  const deleteStay = async (stayId: string) => {
    setStayLoading(true);
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/guest-stays?stayId=${stayId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed");
      await loadData();
      toast.success(t("stays.deleted"));
    } catch {
      toast.error(t("stays.deleteError"));
    } finally {
      setStayLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-10 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("loading")}
        </CardContent>
      </Card>
    );
  }

  const isEnabled = data?.token?.enabled ?? false;
  const missingCount = data?.missingFichesCount ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-600" />
              {t("title")}
              {missingCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {t("missingFichesBadge", { count: missingCount })}
                </Badge>
              )}
            </CardTitle>
            <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
          </div>
          {data && data.guestsThisMonth > 0 && (
            <Badge variant="secondary">
              {t("guestsThisMonth", { count: data.guestsThisMonth })}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {missingCount > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium">{t("missingFichesTitle", { count: missingCount })}</p>
              <p className="mt-1 text-amber-800">{t("missingFichesHint")}</p>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-900">
          <p className="font-medium">{t("legal.title")}</p>
          <p className="mt-1 text-blue-800">{t("legal.summary")}</p>
          <p className="mt-2 text-xs text-blue-700">{t("legal.disclaimer")}</p>
          <a
            href="https://www.service-public.fr/particuliers/vosdroits/F33458"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-medium underline"
          >
            {t("legal.sourceLink")}
          </a>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-900">{t("checkInLink")}</p>
          {isEnabled && checkInUrl ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <code className="min-w-0 max-w-full overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 text-xs sm:flex-1">
                  {checkInUrl}
                </code>
                <Button variant="outline" size="sm" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? t("copied") : t("copyLink")}
                </Button>
              </div>
              {qrSvg && (
                <div
                  className="inline-block rounded-lg border border-slate-200 bg-white p-2"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runAction("rotate")}
                  disabled={actionLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("rotateLink")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => runAction("disable")}
                  disabled={actionLoading}
                >
                  {t("disableLink")}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => runAction("enable")} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              {t("enableLink")}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">{t("stays.title")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStayForm((v) => !v)}
            >
              <CalendarPlus className="h-4 w-4" />
              {t("stays.add")}
            </Button>
          </div>
          <p className="text-xs text-slate-500">{t("stays.subtitle")}</p>

          {showStayForm && (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="checkInDate">{t("stays.checkIn")}</Label>
                  <Input
                    id="checkInDate"
                    type="date"
                    value={stayForm.checkInDate}
                    onChange={(e) =>
                      setStayForm((f) => ({ ...f, checkInDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="checkOutDate">{t("stays.checkOut")}</Label>
                  <Input
                    id="checkOutDate"
                    type="date"
                    value={stayForm.checkOutDate}
                    onChange={(e) =>
                      setStayForm((f) => ({ ...f, checkOutDate: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="guestLabel">{t("stays.guestLabel")}</Label>
                <Input
                  id="guestLabel"
                  value={stayForm.guestLabel}
                  onChange={(e) =>
                    setStayForm((f) => ({ ...f, guestLabel: e.target.value }))
                  }
                  placeholder={t("stays.guestLabelPlaceholder")}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="expectsForeignGuest"
                  checked={stayForm.expectsForeignGuest}
                  onCheckedChange={(checked) =>
                    setStayForm((f) => ({
                      ...f,
                      expectsForeignGuest: checked === true,
                    }))
                  }
                />
                <Label htmlFor="expectsForeignGuest" className="text-sm font-normal">
                  {t("stays.expectsForeignGuest")}
                </Label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addExpectedStay} disabled={stayLoading}>
                  {stayLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t("stays.save")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowStayForm(false)}
                >
                  {t("stays.cancel")}
                </Button>
              </div>
            </div>
          )}

          {!data || data.stays.length === 0 ? (
            <p className="text-sm text-slate-500">{t("stays.empty")}</p>
          ) : (
            <div className="space-y-2">
              {data.stays.map((stay) => (
                <div
                  key={stay.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
                    stay.isMissingFiche
                      ? "border-amber-200 bg-amber-50/50"
                      : "border-slate-100"
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {stay.guestLabel || t("stays.unnamedGuest")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(stay.checkInDate), "dd/MM/yyyy")} –{" "}
                      {format(new Date(stay.checkOutDate), "dd/MM/yyyy")}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {stay.expectsForeignGuest ? (
                        stay.hasMatchingFiche ? (
                          <Badge variant="secondary" className="text-xs">
                            {t("stays.ficheReceived")}
                          </Badge>
                        ) : stay.isMissingFiche ? (
                          <Badge variant="destructive" className="text-xs">
                            {t("stays.ficheMissing")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {t("stays.fichePending")}
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="text-xs text-slate-500">
                          {t("stays.frenchOnly")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteStay(stay.id)}
                    disabled={stayLoading}
                  >
                    <Trash2 className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">{t("recordsTitle")}</p>
            {data && data.records.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <a href={`/api/properties/${propertyId}/guest-register/export`}>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    {t("exportCsv")}
                  </Button>
                </a>
                <a
                  href={`/${locale}/app/properties/${propertyId}/guest-register/print-all`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4" />
                    {t("exportAllPdf")}
                  </Button>
                </a>
              </div>
            )}
          </div>

          {!data || data.records.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title={t("emptyRecords.title")}
              description={t("emptyRecords.description")}
              className="py-8"
            >
              {isEnabled && checkInUrl ? (
                <Button variant="outline" size="sm" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? t("copied") : t("emptyRecords.cta")}
                </Button>
              ) : (
                <Button size="sm" onClick={() => runAction("enable")} disabled={actionLoading}>
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  {t("enableLink")}
                </Button>
              )}
            </EmptyState>
          ) : (
            <div className="space-y-2">
              {data.records.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {record.lastName}
                      {record.firstNames ? `, ${record.firstNames}` : ""}
                    </p>
                    <p className="text-xs text-slate-500">
                      {record.nationality}
                      {record.arrivalDate && record.departureDate && (
                        <>
                          {" · "}
                          {format(new Date(record.arrivalDate), "dd/MM/yyyy")} –{" "}
                          {format(new Date(record.departureDate), "dd/MM/yyyy")}
                        </>
                      )}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {record.requiresPoliceForm && (
                        <Badge variant="outline" className="text-xs">
                          {t("policeFormRequired")}
                        </Badge>
                      )}
                      {record.isFrenchNational && (
                        <Badge variant="secondary" className="text-xs">
                          {t("frenchOptional")}
                        </Badge>
                      )}
                      {record.retentionExpiresAt && (
                        <Badge variant="outline" className="text-xs text-slate-500">
                          {t("retentionUntil", {
                            date: format(new Date(record.retentionExpiresAt), "dd/MM/yyyy"),
                          })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <a
                    href={`/${locale}/app/properties/${propertyId}/guest-register/${record.id}/print`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                      {t("printFiche")}
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-500">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>{t("retentionNote")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
