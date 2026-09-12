"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { toast } from "sonner";
import { PLANS } from "@/lib/plans";

type UserSettings = {
  name: string | null;
  email: string;
  language: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
};

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const [user, setUser] = useState<UserSettings | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setName(data.name || "");
      });
  }, []);

  const saveAccount = async () => {
    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      toast.success(t("account.save"));
    }
    setLoading(false);
  };

  const startCheckout = async (plan: string) => {
    setCheckoutLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, locale }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error || "Stripe not configured");
      setCheckoutLoading("");
    }
  };

  const openPortal = async () => {
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error || "Billing portal unavailable");
    }
  };

  const loadDemo = async () => {
    const res = await fetch("/api/demo/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    if (res.ok) {
      toast.success(t("demo.success"));
      window.location.reload();
    } else {
      toast.error(t("demo.error"));
    }
  };

  const isActive =
    user?.subscriptionStatus === "active" ||
    user?.subscriptionStatus === "trialing";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("account.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("account.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("account.email")}</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <Button onClick={saveAccount} disabled={loading}>
            {t("account.save")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("language.title")}</CardTitle>
          <CardDescription>{t("language.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("billing.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isActive ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="font-medium text-slate-900">
                    {t("billing.plan")}: {PLANS[user?.subscriptionPlan as keyof typeof PLANS]?.name || user?.subscriptionPlan}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t("billing.status")}: {user?.subscriptionStatus}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={openPortal}>
                {t("billing.manage")}
              </Button>
              {user?.subscriptionPlan === "starter" && (
                <Button onClick={() => startCheckout("pro")} disabled={checkoutLoading === "pro"}>
                  {t("billing.upgrade")}
                </Button>
              )}
            </>
          ) : (
            <>
              <p className="text-slate-600">{t("billing.none")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={() => startCheckout("starter")}
                  disabled={checkoutLoading === "starter"}
                  variant="outline"
                >
                  Starter — €{PLANS.starter.price}/mo
                </Button>
                <Button
                  onClick={() => startCheckout("pro")}
                  disabled={checkoutLoading === "pro"}
                >
                  Pro — €{PLANS.pro.price}/mo
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {process.env.NODE_ENV !== "production" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("demo.title")}</CardTitle>
            <CardDescription>{t("demo.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={loadDemo}>
              {t("demo.button")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
