import assert from "node:assert/strict";
import { afterEach, before, describe, it } from "node:test";
import { JSDOM } from "jsdom";
import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../../../messages/en.json";
import { TouristTaxCard } from "@/components/tourist-tax-card";
import type { TouristTaxResponse } from "@/lib/france/tourist-tax-api";

const mockPayload: TouristTaxResponse = {
  applies: true,
  settings: {
    enabled: true,
    collectionMode: "platform_collects",
    declarationCadence: "quarterly",
    portalUrl: "https://example.com/portal",
    classification: "unclassified",
    attestationOnFile: false,
    notes: null,
  },
  summary: {
    enabled: true,
    collectionMode: "platform_collects",
    declarationCadence: "quarterly",
    attentionCount: 2,
    overdueCount: 1,
    dueCount: 1,
    nextDuePeriod: {
      id: "period-due",
      periodStart: "2026-01-01T00:00:00.000Z",
      periodEnd: "2026-03-31T00:00:00.000Z",
      status: "due",
      declarationDueDate: "2026-04-15T00:00:00.000Z",
      daysUntilDue: 5,
      needsAttention: true,
      nightsInPeriod: 6,
    },
    periods: [
      {
        id: "period-due",
        periodStart: "2026-01-01T00:00:00.000Z",
        periodEnd: "2026-03-31T00:00:00.000Z",
        status: "due",
        declarationDueDate: "2026-04-15T00:00:00.000Z",
        daysUntilDue: 5,
        needsAttention: true,
        nightsInPeriod: 6,
      },
      {
        id: "period-overdue",
        periodStart: "2025-10-01T00:00:00.000Z",
        periodEnd: "2025-12-31T00:00:00.000Z",
        status: "overdue",
        declarationDueDate: "2026-01-20T00:00:00.000Z",
        daysUntilDue: -12,
        needsAttention: true,
        nightsInPeriod: 3,
      },
    ],
  },
  priorityAction: null,
};

describe("TouristTaxCard", () => {
  let originalFetch: typeof fetch;
  let dom: JSDOM;

  before(() => {
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
      url: "https://localhost/",
    });
    const { window } = dom;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any;
    g.window = window;
    g.document = window.document;
    g.HTMLElement = window.HTMLElement;
    g.HTMLFormElement = window.HTMLFormElement;
    g.HTMLButtonElement = window.HTMLButtonElement;
    g.Element = window.Element;
    g.Node = window.Node;
    g.MutationObserver = window.MutationObserver;
    g.getComputedStyle = window.getComputedStyle.bind(window);
    g.requestAnimationFrame =
      window.requestAnimationFrame?.bind(window) ??
      ((callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 0));
    g.cancelAnimationFrame =
      window.cancelAnimationFrame?.bind(window) ?? ((id: number) => clearTimeout(id));
  });

  afterEach(() => {
    cleanup();
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    }
  });

  it("renders due and overdue periods when declarationDueDate is an ISO string", async () => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      ({
        ok: true,
        json: async () => mockPayload,
      }) as Response) as typeof fetch;

    const { getByText } = render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <TouristTaxCard propertyId="prop-demo" country="FR" locale="en" />
      </NextIntlClientProvider>
    );

    await waitFor(() => {
      assert.ok(getByText("Taxe de séjour (tourist tax)"));
    });

    assert.ok(getByText("Due"));
    assert.ok(getByText("Overdue"));
    assert.match(document.body.textContent ?? "", /Due by/);
  });
});
