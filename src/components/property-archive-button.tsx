"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  propertyId: string;
  propertyName: string;
  archived: boolean;
  variant?: "outline" | "ghost" | "destructive";
  size?: "default" | "sm";
  redirectOnArchive?: string;
};

export function PropertyArchiveButton({
  propertyId,
  propertyName,
  archived,
  variant = "outline",
  size = "sm",
  redirectOnArchive,
}: Props) {
  const t = useTranslations("properties");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const action = archived ? "restore" : "archive";

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !archived }),
      });

      if (!res.ok) {
        toast.error(t("archiveAction.error"));
        return;
      }

      toast.success(
        archived ? t("archiveAction.restored") : t("archiveAction.archived")
      );
      setOpen(false);

      if (redirectOnArchive) {
        router.push(redirectOnArchive);
      } else {
        router.refresh();
      }
    } catch {
      toast.error(t("archiveAction.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={archived ? variant : "outline"}
        size={size}
        className={!archived ? "text-amber-700 hover:text-amber-800" : undefined}
        onClick={() => setOpen(true)}
      >
        {archived ? (
          <ArchiveRestore className="h-4 w-4" />
        ) : (
          <Archive className="h-4 w-4" />
        )}
        {archived ? t("card.restore") : t("card.archive")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(`archiveAction.${action}.title`, { name: propertyName })}
            </DialogTitle>
            <DialogDescription>
              {t(`archiveAction.${action}.description`, { name: propertyName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t("archiveAction.cancel")}
            </Button>
            <Button
              variant={archived ? "default" : "destructive"}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t(`archiveAction.${action}.confirm`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
