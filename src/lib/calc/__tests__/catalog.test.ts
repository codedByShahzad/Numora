import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import catalog from "@/data/site/catalog.json";
import { CALCULATOR_CONTENT } from "@/lib/site/registry";
import { BLOGS } from "@/lib/blog";

const loaderSource = readFileSync(path.resolve(__dirname, "../../../components/calculator/CalculatorLoader.tsx"), "utf8");

describe("site catalog", () => {
  it("every catalog calculator has a component in the loader", () => {
    for (const c of catalog.calculators) expect(loaderSource).toContain(`"${c.id}": dynamic(`);
  });
  it("every new calculator has page content with sources, FAQs and a review date", () => {
    for (const c of catalog.calculators.filter((x) => x.kind === "new")) {
      const content = CALCULATOR_CONTENT[c.id];
      expect(content, c.id).toBeTruthy();
      expect(content.faqs.length).toBeGreaterThanOrEqual(4);
      expect(content.faqs.length).toBeLessThanOrEqual(6);
      expect(content.sources.length).toBeGreaterThan(0);
      expect(content.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const slug of content.articles) expect(BLOGS.some((b) => b.slug === slug), slug).toBe(true);
    }
  });
  it("URLs are unique, lowercase and keyword based", () => {
    const paths = catalog.calculators.map((c) => `/${c.category}/${c.slug}/`);
    expect(new Set(paths).size).toBe(paths.length);
    for (const p of paths) expect(p).toMatch(/^\/[a-z0-9-]+\/[a-z0-9-]+\/$/);
  });
  it("every category has calculators and every calculator a valid category", () => {
    const slugs = new Set(catalog.categories.map((c) => c.slug));
    for (const c of catalog.calculators) expect(slugs.has(c.category), c.id).toBe(true);
    for (const s of slugs) expect(catalog.calculators.some((c) => c.category === s), s).toBe(true);
  });
  it("legacy URLs are unique and never collide with new URLs", () => {
    const legacy = catalog.calculators.flatMap((c) => c.legacyPaths);
    expect(new Set(legacy).size).toBe(legacy.length);
    for (const l of legacy) expect(l.startsWith("/categories/")).toBe(true);
  });
  it("meta titles and descriptions are unique and sized for search results", () => {
    const titles = catalog.calculators.map((c) => c.metaTitle);
    const descs = catalog.calculators.map((c) => c.metaDescription);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descs).size).toBe(descs.length);
    for (const t of titles) expect(t.length + " | Numoro".length).toBeLessThanOrEqual(62);
    for (const d of descs) expect(d.length).toBeGreaterThanOrEqual(130);
    for (const d of descs) expect(d.length).toBeLessThanOrEqual(160);
  });
  it("blog posts link to calculators that exist", () => {
    const ids = new Set(catalog.calculators.map((c) => c.id));
    for (const b of BLOGS) for (const id of b.calculatorIds ?? []) expect(ids.has(id), `${b.slug} → ${id}`).toBe(true);
  });
});
