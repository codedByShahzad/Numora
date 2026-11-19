import Link from "next/link";
import { Formula, WorkedTable } from "@/components/site/ContentBlocks";
import stripe from "@/data/payments/stripe-fees.json";
import paypal from "@/data/payments/paypal-fees.json";
import type { CalculatorContent } from "./types";

const content: CalculatorContent = {
  lead:
    "Calculate Stripe's fee on a payment for a US or UK account, including international card, currency conversion and manual entry surcharges, and see what you actually receive. Reverse mode tells you what to charge so you net an exact amount.",
  lastReviewed: stripe.lastVerified,
  howTo: [
    "Choose whether you want the fee on a payment or the amount to charge to receive a set figure.",
    "Enter the payment amount (or the amount you want to receive).",
    "Pick your Stripe account country, the payment method and the card type. For US accounts you can also pick in-person Terminal payments or ACH Direct Debit.",
    "Tick currency conversion if the customer pays in a different currency from your payout currency, and manual entry if you type card details into the Dashboard.",
    "If you have negotiated pricing, tick “Use my own rate” and enter your percentage and fixed fee.",
  ],
  formula: (
    <>
      <Formula caption="Stripe rounds the fee to the cent. ACH Direct Debit is 0.8% capped at $5.">
        {`Fee            = amount × (base % + card surcharge % + conversion % + manual entry %) + fixed fee
You receive    = amount − fee

To receive a set amount:
Amount to charge = (amount you want + fixed fee) ÷ (1 − total %), then rounded to a whole cent that still nets the target`}
      </Formula>
      <p>
        For a US account the base rate for online card payments is 2.9% + 30¢. An international card adds 1.5%, currency conversion adds 1% and a manually entered card adds 0.5%. For a UK account, standard UK cards are 1.5% + 20p, premium UK cards 2.8% + 20p, EEA cards 2.5% + 20p and other international cards 3.15% + 20p, with 2% more if a currency conversion is needed.
      </p>
    </>
  ),
  example: (
    <>
      <WorkedTable
        caption="Common cases"
        rows={[
          ["US: $100, US card", "fee $3.20 · you get $96.80"],
          ["US: $100, international card + conversion (5.4% + 30¢)", "fee $5.70 · you get $94.30"],
          ["US: $100, typed in manually (3.4% + 30¢)", "fee $3.70 · you get $96.30"],
          ["US: $1,000 by ACH Direct Debit", "fee $5.00 (cap) · you get $995.00"],
          ["UK: £100, standard UK card", "fee £1.70 · you get £98.30"],
          ["US: charge needed to receive $100", "$103.30"],
        ]}
      />
      <p>
        The reverse case is where most people slip. Adding 3.2% to $100 gives $103.20, but Stripe takes 2.9% of the whole $103.20 plus 30¢, which is $3.29, leaving $99.91. The correct charge is ($100 + $0.30) ÷ (1 − 0.029) = $103.2956, which rounds up to <strong>$103.30</strong> and leaves exactly $100.00.
      </p>
    </>
  ),
  explanation: (
    <>
      <p>
        Stripe&apos;s headline rate only applies to the simplest case: a card issued in your own country, no currency conversion, entered by the customer online. Each extra condition adds a percentage, and they stack. A customer abroad paying in their own currency can almost double the fee on a US account. The comparison table in the results shows the same payment across every card type for your country.
      </p>
      <p>
        The PayPal comparison uses PayPal&apos;s published merchant rates (3.49% + $0.49 for PayPal Checkout and 2.99% + $0.49 for standard card payments in the US; 2.9% + £0.30 in the UK), plus PayPal&apos;s international surcharge when the card isn&apos;t domestic. Want the full story on quoting clients? Read{" "}
        <Link href="/blog/charge-to-receive-100-after-stripe-fees/" className="text-[#125FF9] hover:underline">
          how much to charge to receive $100 after Stripe fees
        </Link>
        .
      </p>
    </>
  ),
  assumptions: [
    stripe.verificationNote,
    "Standard pay-as-you-go pricing only. Volume discounts, interchange-plus pricing and Stripe Connect platform fees aren't modelled; use a custom rate instead.",
    "Only US and UK accounts have presets. For other countries, enter your published rate with the custom option.",
    "Not included: dispute fees, Stripe Billing, Invoicing, Tax, Radar for Fraud Teams and Instant Payouts.",
    "The PayPal comparison doesn't include PayPal's currency conversion spread, dispute fees or withdrawal fees.",
    "Before passing fees on to customers as a surcharge, check card-network rules and the law where you and your customers are.",
  ],
  faqs: [
    {
      q: "How much does Stripe charge per transaction?",
      a: "For a US account, 2.9% + 30¢ for a US card paid online, plus 1.5% for international cards, 1% when currency conversion is needed and 0.5% for manually entered cards. For a UK account, 1.5% + 20p for standard UK cards, rising to 3.15% + 20p for international cards plus 2% for conversion.",
    },
    {
      q: "How do I calculate what to charge to cover Stripe fees?",
      a: "Add the fixed fee to the amount you want, then divide by one minus the percentage. To receive $100 on a US card: ($100 + $0.30) ÷ 0.971 = $103.30. The calculator's reverse mode does this for any combination of surcharges.",
    },
    {
      q: "Is Stripe cheaper than PayPal?",
      a: "On standard published rates, Stripe is usually cheaper for domestic card payments: $3.20 on $100 in the US against $3.98 for PayPal Checkout or $3.48 for a PayPal card payment. Results can change with international cards and negotiated pricing, so compare your own numbers in the calculator.",
    },
    {
      q: "What counts as an international card on Stripe?",
      a: "A card issued in a different country from your Stripe account. For UK accounts Stripe prices cards from the European Economic Area separately from cards issued elsewhere.",
    },
    {
      q: "Why doesn't my Stripe fee match the calculator?",
      a: "Your account may have custom pricing, the card may be a premium or commercial card, or extra products such as Billing, Invoicing or Radar may add fees. Your Stripe Dashboard shows the exact fee for each payment.",
    },
  ],
  sources: [...stripe.sources, ...paypal.sources],
  articles: ["stripe-fees-explained", "charge-to-receive-100-after-stripe-fees"],
};

export default content;
