"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

type NavigationProgressContextValue = {
  start: () => void;
  isNavigating: boolean;
};

const NavigationProgressContext =
  createContext<NavigationProgressContextValue | null>(null);

function isInternalNavigationLink(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  if (href.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function TopLoadingBar({ active, progress }: { active: boolean; progress: number }) {
  if (!active) {
    return null;
  }

  return (
    <div
      className="navigation-progress-track pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] bg-emerald-100/80"
      role="progressbar"
      aria-hidden="true"
    >
      <div
        className="navigation-progress-bar h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function NavigationProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const creepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPathRef = useRef(pathname);

  const clearTimers = useCallback(() => {
    if (creepTimerRef.current) {
      clearInterval(creepTimerRef.current);
      creepTimerRef.current = null;
    }
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setActive(true);
    setProgress(8);

    requestAnimationFrame(() => {
      setProgress(24);
    });

    creepTimerRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 88) {
          return current;
        }
        const increment = current < 50 ? 4 : current < 75 ? 2 : 0.6;
        return Math.min(current + increment, 88);
      });
    }, 180);
  }, [clearTimers]);

  const complete = useCallback(() => {
    clearTimers();
    setProgress(100);
    completeTimerRef.current = setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 220);
  }, [clearTimers]);

  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      if (active) {
        complete();
      }
    }
  }, [pathname, active, complete]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || !isInternalNavigationLink(anchor)) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href) {
        return;
      }

      const nextPath = href.startsWith("/")
        ? href.split(/[?#]/)[0]
        : new URL(href, window.location.origin).pathname;

      if (nextPath === window.location.pathname) {
        return;
      }

      start();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [start]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const value: NavigationProgressContextValue = {
    start,
    isNavigating: active,
  };

  return (
    <NavigationProgressContext.Provider value={value}>
      <TopLoadingBar active={active} progress={progress} />
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);
  if (!context) {
    throw new Error("useNavigationProgress must be used within NavigationProgressProvider");
  }
  return context;
}
