import type { ReactNode } from "react";
import type { Faq, Source } from "@/components/site/ContentBlocks";

/** Server-rendered explanatory content for a calculator page (section 9 template). */
export type CalculatorContent = {
  /** One or two sentences under the H1. */
  lead: string;
  /** ISO date the rules/rates and copy were last reviewed. */
  lastReviewed: string;
  howTo: ReactNode[];
  formula: ReactNode;
  example: ReactNode;
  explanation: ReactNode;
  assumptions: ReactNode[];
  faqs: Faq[];
  sources: Source[];
  disclaimer?: ReactNode;
  /** Blog post slugs to link from the page. */
  articles: string[];
};
