import Link from "next/link";
import { Formula, WorkedTable } from "@/components/site/ContentBlocks";
import fees from "@/data/ecommerce/etsy-fees.json";
import type { CalculatorContent } from "./types";

const content: CalculatorContent = {
  lead:
    "See every Etsy fee on an order, from the $0.20 listing fee to payment processing, Offsite Ads and VAT, then your payout, profit and margin. Switch to reverse mode to find the price you need for a target profit.",
  lastReviewed: fees.lastVerified,
  howTo: [
    "Choose the country of the bank account linked to your Etsy Payments. That sets the payment processing and Regulatory Operating fees.",
    "Enter the item price, how many items are in the order and the shipping you charge the buyer.",
    "Add your costs: what one item costs to make or buy, what you pay to ship the order and any packaging or other costs.",
    "Say whether the sale came through an Etsy Offsite Ad (15%, or 12% if your shop has passed $10,000 in sales in a 365-day period).",
    <>
      Open <strong>More options</strong> for gift wrap, sales tax, VAT on fees and currency conversion. To price a product, switch to <strong>Price for a target profit</strong> and enter the profit you want.
    </>,
  ],
  formula: (
    <>
      <Formula caption="Each fee is rounded to the cent. VAT or GST, where Etsy charges it, is added on top of the fees.">
        {`Order total       = item price × quantity + shipping charged + gift wrap
Listing fee       = $0.20 × items sold
Transaction fee   = 6.5% × order total
Processing fee    = processing % × (order total + sales tax) + fixed fee
Regulatory fee    = country rate × order total
Offsite Ads fee   = 15% or 12% × order total, capped at $100
Profit            = order total − Etsy fees − product cost − shipping cost − other costs`}
      </Formula>
      <p>
        The <strong>processing rate</strong> depends on your bank country: 3% + $0.25 in the US, 4% + £0.20 in the UK, 4% + €0.30 in Germany and France, and 3% + C$0.25 or A$0.25 for domestic orders in Canada and Australia. The <strong>Regulatory Operating fee</strong> applies only in some countries, for example 0.48% in the UK, 0.50% in Canada and 1.14% in France. Reverse mode searches for the lowest price, to the cent, whose profit reaches your target using exactly this calculation.
      </p>
    </>
  ),
  example: (
    <>
      <p>A US seller sells a $25 print with $5 shipping charged. The print costs $8 to make and postage is $4.50. No Offsite Ad was involved.</p>
      <WorkedTable
        caption="US shop, one item"
        rows={[
          ["Order total ($25 + $5)", "$30.00"],
          ["Listing fee", "$0.20"],
          ["Transaction fee (6.5% × $30)", "$1.95"],
          ["Processing (3% × $30 + $0.25)", "$1.15"],
          ["Total Etsy fees (11% of the order)", "$3.30"],
          ["Product cost + shipping cost", "$12.50"],
          ["Profit (47.3% margin)", "$14.20"],
        ]}
      />
      <p>
        If the same order came from an Offsite Ad at 15%, Etsy would add $4.50 and profit would fall to <strong>$9.70</strong>. To keep a $20 profit on that print with free shipping, reverse mode gives a price of <strong>$36.41</strong>: at $36.40 the profit is $19.99.
      </p>
      <p>
        A UK seller with two £20 items and £3.50 postage, £5 cost per item and £3 shipping cost pays £0.29 listing fees (billed as $0.40), £2.83 transaction, £1.94 processing and £0.21 Regulatory Operating fee, plus £1.05 VAT on those fees: <strong>£6.32</strong> in total, leaving £24.18 profit.
      </p>
    </>
  ),
  explanation: (
    <>
      <p>
        Every Etsy fee uses its own base, which is why simple “Etsy takes about 10%” estimates often miss. The transaction fee includes the shipping you charge, so moving cost from shipping into the item price doesn&apos;t change it. The processing fee also includes any sales tax Etsy collects, plus a fixed amount per order that weighs heavily on cheap items. Offsite Ads fees apply only to orders Etsy attributes to its ads, but at 12–15% they are usually the biggest single fee when they happen.
      </p>
      <p>
        Etsy bills the listing fee in US dollars and caps the Offsite Ads fee at $100 USD, so for a shop paid in pounds, euros or other currencies the calculator converts those two amounts with the exchange rate under More options. Sellers in many countries also pay VAT or GST on their Etsy fees unless they have given Etsy a VAT ID. For a full walk-through, see{" "}
        <Link href="/blog/etsy-fees-explained/" className="text-[#125FF9] hover:underline">
          Etsy fees explained
        </Link>
        .
      </p>
    </>
  ),
  assumptions: [
    "Uses Etsy's published standard rates on the review date. Your Payment account statement is the final word.",
    "The listing fee is counted as $0.20 per item sold, which matches how Etsy charges multi-quantity orders.",
    "Sales tax affects only the processing fee. The Offsite Ads and conversion fees are calculated on the order total without tax.",
    "Default exchange rates for USD-billed fees are approximate (from GOV.UK consular rates for November 2026). Edit them for today's rate.",
    "VAT/GST on fees defaults to the standard national rate (20% UK, 19% Germany, 20% France, 10% Australia, 0% US). Canadian GST/HST depends on your province, so enter your own.",
    `Not included: ${fees.notIncluded.join("; ").toLowerCase()}.`,
  ],
  faqs: [
    {
      q: "How much does Etsy take per sale?",
      a: "For a US seller with no Offsite Ad, Etsy takes 6.5% of the order total plus 3% payment processing, a $0.25 processing fee per order and $0.20 per item for the listing. On a $30 order that's $3.30, or 11%. Offsite Ads add 12% or 15% on attributed orders.",
    },
    {
      q: "Does Etsy charge fees on shipping?",
      a: "Yes. The 6.5% transaction fee and the payment processing fee both include the shipping you charge the buyer, as do the Regulatory Operating and Offsite Ads fees.",
    },
    {
      q: "Can I turn off Etsy Offsite Ads?",
      a: "Only while your shop has never made $10,000 USD or more in any 365-day period. After that, Offsite Ads are mandatory and the fee drops to 12%. The fee never exceeds $100 USD on a single order.",
    },
    {
      q: "Why are Etsy fees higher for UK sellers?",
      a: "UK sellers pay 4% + £0.20 for payment processing instead of 3% + $0.25, a 0.48% Regulatory Operating fee, and 20% VAT on their Etsy fees unless they've given Etsy a VAT number.",
    },
    {
      q: "How do I price an item to make a $20 profit on Etsy?",
      a: "Switch the calculator to “Price for a target profit”, enter $20 and your costs. It finds the lowest price whose profit after every Etsy fee is at least $20. Because fees are a percentage of the price, you can't just add $20 to your costs.",
    },
  ],
  sources: fees.sources,
  articles: ["etsy-fees-explained", "calculate-etsy-profit-after-fees"],
};

export default content;
