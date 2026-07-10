import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import * as content from "./content";

function collectHrefs(value: unknown, hrefs = new Set<string>()): Set<string> {
  if (!value || typeof value !== "object") return hrefs;
  if (Array.isArray(value)) {
    for (const item of value) collectHrefs(item, hrefs);
    return hrefs;
  }
  for (const [key, item] of Object.entries(value)) {
    if (key === "href" && typeof item === "string") hrefs.add(item);
    else collectHrefs(item, hrefs);
  }
  return hrefs;
}

function appPageRoutes(directory: string, segments: string[] = []): Set<string> {
  const routes = new Set<string>();
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name === "page.tsx") {
      routes.add(`/${segments.join("/")}`.replace(/\/$/, "") || "/");
      continue;
    }
    if (!entry.isDirectory() || entry.name.startsWith("[") || entry.name === "api") continue;
    const nextSegments = entry.name.startsWith("(") ? segments : [...segments, entry.name];
    for (const route of appPageRoutes(path.join(directory, entry.name), nextSegments)) {
      routes.add(route);
    }
  }
  return routes;
}

describe("marketing navigation", () => {
  test("every internal page link resolves to an App Router page", () => {
    const appDirectory = fileURLToPath(new URL("../../app", import.meta.url));
    const routes = appPageRoutes(appDirectory);
    const pageLinks = [...collectHrefs(content)].filter((href) => href.startsWith("/"));
    for (const href of pageLinks) expect(routes.has(href), href).toBe(true);
  });

  test("every section link targets a landing-page section", () => {
    const sectionIds = new Set([
      "#features",
      "#how-it-works",
      "#universities",
      "#analytics",
      "#club-cta",
      "#faq",
    ]);
    const sectionLinks = [...collectHrefs(content)].filter((href) => href.startsWith("#"));
    for (const href of sectionLinks) expect(sectionIds.has(href), href).toBe(true);
  });
});
