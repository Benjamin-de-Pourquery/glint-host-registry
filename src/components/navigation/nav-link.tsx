"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type NavLinkProps = ComponentProps<typeof Link> & {
  showSpinner?: boolean;
};

function NavLinkPendingState({
  linkRef,
  showSpinner,
}: {
  linkRef: React.RefObject<HTMLAnchorElement | null>;
  showSpinner: boolean;
}) {
  const { pending } = useLinkStatus();

  useEffect(() => {
    const link = linkRef.current;
    if (!link) {
      return;
    }

    link.dataset.pending = pending ? "true" : "false";
    if (pending) {
      link.setAttribute("aria-busy", "true");
    } else {
      link.removeAttribute("aria-busy");
    }
    link.classList.toggle("is-nav-pending", pending);
  }, [pending, linkRef]);

  if (!showSpinner || !pending) {
    return null;
  }

  return (
    <Loader2
      className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-current"
      aria-hidden="true"
    />
  );
}

export function NavLink({
  children,
  className,
  showSpinner = false,
  ...props
}: NavLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <Link
      ref={linkRef}
      className={cn("nav-link-root relative", className)}
      {...props}
    >
      <NavLinkPendingState linkRef={linkRef} showSpinner={showSpinner} />
      {children}
    </Link>
  );
}
