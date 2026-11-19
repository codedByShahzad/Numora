/**
 * Explanatory content for the calculators built on the full page template.
 * Components are loaded by src/components/calculator/CalculatorLoader.tsx.
 */
import overtimeContent from "@/content/calculators/no-tax-on-overtime";
import etsyContent from "@/content/calculators/etsy-fees";
import tiktokContent from "@/content/calculators/tiktok-shop-fees";
import stripeContent from "@/content/calculators/stripe-fees";
import evContent from "@/content/calculators/ev-charging-cost";
import type { CalculatorContent } from "@/content/calculators/types";

export const CALCULATOR_CONTENT: Record<string, CalculatorContent> = {
  "no-tax-on-overtime": overtimeContent,
  "etsy-fees": etsyContent,
  "tiktok-shop-fees": tiktokContent,
  "stripe-fees": stripeContent,
  "ev-charging-cost": evContent,
};
