"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyFieldChip } from "@/components/copy-field-chip";
import { PlatformBlockPlaybook } from "@/components/platform-block-playbook";
import {
  LISTING_CHANNELS,
  type DisplayStatus,
  type ListingChannelRecord,
  type ListingChannelType,
} from "@/lib/listings/channels";
import { ExternalLink, Link2, Plus, Ban, Check, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  propertyId: string;
  city: string;
  country?: string;
  registrationNumber?: string | null;
  nationalRegistrationNumber?: string | null;
  cinNumber?: string | null;
  initialChannels: ListingChannelRecord[];
};

const CHANNEL_LABEL_KEYS: Record<ListingChannelType, string> = {
  AIRBNB: "airbnb",
  BOOKING: "booking",
  VRBO: "vrbo",
  OTHER: "other",
};

const STATUS_STYLES: Record<DisplayStatus, string> = {
  PRESENT: "bg-emerald-100 text-emerald-800",
  MISSING: "bg-amber-100 text-amber-800",
  BLOCKED: "bg-red-100 text-red-800",
  UNKNOWN: "bg-slate-100 text-slate-700",
};

export function PropertyListingsForm({
  propertyId,
  city,
  country = "",
  registrationNumber,
  nationalRegistrationNumber,
  cinNumber,
  initialChannels,
}: Props) {
  const t = useTranslations("properties.detail.listings");
  const tForm = useTranslations("properties.form");
  const router = useRouter();

  const [channels, setChannels] = useState(initialChannels);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newChannel, setNewChannel] = useState<ListingChannelType>("AIRBNB");
  const [newUrl, setNewUrl] = useState("");
  const [blockReasonDraft, setBlockReasonDraft] = useState("");
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

  const effectiveNer =
    nationalRegistrationNumber?.trim() ||
    cinNumber?.trim() ||
    registrationNumber?.trim() ||
    "";

  const blockedChannel = channels.find((c) => c.displayStatus === "BLOCKED");
  const showBlockPlaybook =
    blockedChannel || expandedBlockId !== null;

  const issueCount = useMemo(
    () =>
      channels.filter(
        (c) => c.displayStatus === "MISSING" || c.displayStatus === "BLOCKED"
      ).length,
    [channels]
  );

  const updateChannel = async (
    channelId: string,
    patch: {
      displayStatus?: DisplayStatus;
      blockReason?: string | null;
      registrationNumberDisplayed?: string | null;
      listingUrl?: string;
    }
  ) => {
    setLoading(true);
    const res = await fetch(
      `/api/properties/${propertyId}/listing-channels/${channelId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }
    );
    setLoading(false);

    if (!res.ok) {
      toast.error(t("statusError"));
      return;
    }

    const updated = (await res.json()) as ListingChannelRecord;
    setChannels((prev) => prev.map((c) => (c.id === channelId ? updated : c)));
    router.refresh();
    toast.success(t("statusUpdated"));
  };

  const addChannel = async () => {
    if (!newUrl.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/properties/${propertyId}/listing-channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: newChannel,
        listingUrl: newUrl,
        registrationNumberDisplayed: effectiveNer || null,
        displayStatus: effectiveNer ? "PRESENT" : "MISSING",
      }),
    });
    setLoading(false);

    if (!res.ok) {
      toast.error(t("saveError"));
      return;
    }

    const created = (await res.json()) as ListingChannelRecord;
    setChannels((prev) => {
      const without = prev.filter((c) => c.channel !== created.channel);
      return [...without, created];
    });
    setNewUrl("");
    setShowAdd(false);
    router.refresh();
    toast.success(t("saved"));
  };

  const markBlocked = async (channelId: string) => {
    await updateChannel(channelId, {
      displayStatus: "BLOCKED",
      blockReason: blockReasonDraft || null,
    });
    setExpandedBlockId(channelId);
    setBlockReasonDraft("");
  };

  const playbookChannel =
    blockedChannel?.channel ||
    channels.find((c) => c.id === expandedBlockId)?.channel ||
    "Airbnb";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {channels.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center">
          <Link2 className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-medium text-slate-900">{t("empty.title")}</p>
          <p className="mt-1 text-sm text-slate-500">{t("empty.description")}</p>
        </div>
      )}

      {effectiveNer && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">{t("registrationTitle")}</h2>
          <p className="text-sm text-slate-600">{t("registrationHint")}</p>
          <CopyFieldChip
            label={t("registrationLabel")}
            value={effectiveNer}
            copiedLabel={t("copied")}
          />
        </section>
      )}

      {showBlockPlaybook && (
        <PlatformBlockPlaybook
          channel={playbookChannel}
          registrationNumber={registrationNumber}
          nationalRegistrationNumber={nationalRegistrationNumber}
          city={city}
          blockReason={blockedChannel?.blockReason}
        />
      )}

      {issueCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
          {t("issuesBanner", { count: issueCount })}
        </div>
      )}

      {channels.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{t("channelsTitle")}</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdd(!showAdd)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t("addChannel")}
            </Button>
          </div>

          <ul className="space-y-3">
            {channels.map((channel) => (
              <li
                key={channel.id}
                className="rounded-lg border border-slate-200 bg-white p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {tForm(CHANNEL_LABEL_KEYS[channel.channel])}
                    </p>
                    <a
                      href={channel.listingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline break-all"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {channel.listingUrl}
                    </a>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      STATUS_STYLES[channel.displayStatus]
                    )}
                  >
                    {t(`status.${channel.displayStatus}`)}
                  </span>
                </div>

                {channel.registrationNumberDisplayed && (
                  <CopyFieldChip
                    label={t("nerOnListing")}
                    value={channel.registrationNumberDisplayed}
                    copiedLabel={t("copied")}
                  />
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() =>
                      updateChannel(channel.id, {
                        displayStatus: "PRESENT",
                        registrationNumberDisplayed: effectiveNer || channel.registrationNumberDisplayed,
                      })
                    }
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    {t("markPresent")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() =>
                      updateChannel(channel.id, { displayStatus: "MISSING" })
                    }
                  >
                    <HelpCircle className="mr-1 h-3.5 w-3.5" />
                    {t("markMissing")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => setExpandedBlockId(channel.id)}
                  >
                    <Ban className="mr-1 h-3.5 w-3.5" />
                    {t("markBlocked")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    onClick={() =>
                      updateChannel(channel.id, { displayStatus: "UNKNOWN" })
                    }
                  >
                    {t("clearStatus")}
                  </Button>
                </div>

                {expandedBlockId === channel.id && channel.displayStatus !== "BLOCKED" && (
                  <div className="space-y-2 rounded-md border border-red-100 bg-red-50/50 p-3">
                    <Label htmlFor={`block-reason-${channel.id}`}>{t("blockReasonLabel")}</Label>
                    <Textarea
                      id={`block-reason-${channel.id}`}
                      value={blockReasonDraft}
                      onChange={(e) => setBlockReasonDraft(e.target.value)}
                      placeholder={t("blockReasonPlaceholder")}
                      rows={2}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={loading}
                      onClick={() => markBlocked(channel.id)}
                    >
                      {t("confirmBlock")}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(showAdd || channels.length === 0) && (
        <section className="space-y-4 rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {channels.length === 0 ? t("urlsTitle") : t("addChannel")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("channelLabel")}</Label>
              <Select
                value={newChannel}
                onValueChange={(v) => setNewChannel(v as ListingChannelType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_CHANNELS.map((ch) => (
                    <SelectItem key={ch} value={ch}>
                      {tForm(CHANNEL_LABEL_KEYS[ch])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="listing-url">{t("listingUrlLabel")}</Label>
              <Input
                id="listing-url"
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>
          <Button type="button" onClick={addChannel} disabled={loading || !newUrl.trim()}>
            {t("save")}
          </Button>
        </section>
      )}

      {!effectiveNer && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {t("noRegistrationHint")}
        </div>
      )}
    </div>
  );
}
