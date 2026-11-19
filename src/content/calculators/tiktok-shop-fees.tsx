import Link from "next/link";
import { Formula, WorkedTable } from "@/components/site/ContentBlocks";
import fees from "@/data/ecommerce/tiktok-shop-fees.json";
import type { CalculatorContent } from "./types";

const content: CalculatorContent = {
  lead:
    "Work out what you keep from a TikTok Shop order after the platform's referral fee or commission, creator affiliate commission, shipping and product cost, for US and UK shops. Reverse mode finds the price you need for a target profit.",
  lastReviewed: fees.lastVerified,
  howTo: [
    "Pick your shop country and the commission rate for your product category. If Seller Center shows a different rate, choose Custom and type it in.",
    "Enter the selling price and any discount you fund yourself, such as a seller coupon.",
    "Add your product cost and what you pay to ship or fulfil each order.",
    "If a creator sells the item, tick the affiliate box and enter the commission rate you offer.",
    "Enter the number of orders to see total profit, or switch to “Price for a target profit” to work backwards.",
  ],
  formula: (
    <>
      <Formula caption="Platform-funded discounts are added back by TikTok, so they don't change the fee base.">
        {`Customer payment     = selling price − seller-funded discount
Platform commission  = commission rate × customer payment
Affiliate commission = affiliate rate × customer payment
Net payout           = customer payment − commission − affiliate − other fees
Profit per order     = net payout − product cost − shipping cost
Total profit         = profit per order × number of orders`}
      </Formula>
      <p>
        In the US the platform charge is called a <strong>referral fee</strong>. TikTok calculates it as the rate × (customer payment + platform discount − tax), and it already includes payment processing. TikTok&apos;s public US table lists 6% for most categories and 5% for selected jewelry and pre-owned items. In the UK it is called a <strong>platform commission</strong>, listed at 9% for most categories and stated to include VAT.
      </p>
    </>
  ),
  example: (
    <>
      <p>
        A US seller lists a phone stand at $30 with free shipping. Each unit costs $8 and fulfilment costs $5. A creator promotes it for 15% commission, and the category rate is 6%.
      </p>
      <WorkedTable
        caption="US shop, creator sale"
        rows={[
          ["Customer pays", "$30.00"],
          ["Referral fee (6%)", "$1.80"],
          ["Affiliate commission (15%)", "$4.50"],
          ["Net payout", "$23.70"],
          ["Product + fulfilment", "$13.00"],
          ["Profit per order (35.7% margin)", "$10.70"],
          ["Profit on 50 orders", "$535.00"],
        ]}
      />
      <p>
        Without the creator, profit per order would be $15.20. To keep exactly $10 per order with the 15% creator commission, reverse mode gives a price of <strong>$29.12</strong>. A UK shop selling at £20 with a £2 seller discount, 9% commission, £6 product cost and £3 postage keeps <strong>£7.38</strong> per order.
      </p>
    </>
  ),
  explanation: (
    <>
      <p>
        Discounts are where TikTok Shop maths most often goes wrong. A discount you fund lowers what the customer pays and therefore the commission base. A discount TikTok funds is paid back to you and added to the base, so it doesn&apos;t change your fee or payout. That&apos;s why the calculator only asks for seller-funded discounts.
      </p>
      <p>
        Affiliate commission usually costs more than the platform fee itself. On the example above, the 15% creator commission is two and a half times the 6% referral fee. Reverse mode makes it easy to test how much a higher creator rate pushes up the price you need. A full breakdown of each charge is in{" "}
        <Link href="/blog/tiktok-shop-seller-fees-explained/" className="text-[#125FF9] hover:underline">
          TikTok Shop seller fees explained
        </Link>
        .
      </p>
    </>
  ),
  assumptions: [
    fees.verificationNote,
    fees.countries.US.rateNote,
    "The affiliate rate is applied to the price after your own discount. TikTok's exact commission base can differ by programme, for example in how shipping fees are treated, so check the commission on your order statements.",
    "Assumes one unit per order. For multi-unit orders, enter the order's combined price and costs.",
    `Not included (US): ${fees.countries.US.notIncluded.join("; ")}.`,
    `Not included (UK): ${fees.countries.GB.notIncluded.join("; ")}.`,
  ],
  faqs: [
    {
      q: "How much does TikTok Shop take from sellers?",
      a: "TikTok's public US table lists a 6% referral fee for most categories and 5% for selected jewelry and pre-owned categories. UK sellers pay a 9% platform commission (VAT included) on most categories. Creator affiliate commission, shipping and promotions are extra.",
    },
    {
      q: "Is payment processing charged on top in the US?",
      a: "No. TikTok's US referral fee covers payment processing, so there's no separate card fee to add.",
    },
    {
      q: "Did TikTok Shop raise the US fee to 8%?",
      a: "Some seller reports from August 2026 say the standard US rate rose to 8%, but TikTok's public category table still showed 6% when we checked. Use the rate shown for your product in Seller Center; the Custom option lets you enter any rate.",
    },
    {
      q: "What happens to fees when an order is refunded?",
      a: "In the US, TikTok refunds the referral fee on a returned order but keeps a refund administration fee of 20% of that referral fee, up to $5 per SKU. This calculator doesn't include refunds.",
    },
    {
      q: "How do I work out total profit for a month?",
      a: "Enter your average order details and the number of orders. The calculator multiplies profit per order by the order count. For a mix of products, run each product separately and add the totals.",
    },
  ],
  sources: fees.sources,
  articles: ["tiktok-shop-seller-fees-explained", "calculate-tiktok-shop-profit"],
};

export default content;
