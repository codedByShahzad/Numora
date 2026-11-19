import Link from "next/link";
import { Formula, WorkedTable } from "@/components/site/ContentBlocks";
import data from "@/data/energy/electricity-prices.json";
import type { CalculatorContent } from "./types";

const ca = data.states.find((s) => s.code === "CA")!;
const nv = data.states.find((s) => s.code === "NV")!;

const content: CalculatorContent = {
  lead:
    "Find out what it costs to charge your electric car at home: the price of one charge, the cost per mile and per 100 miles, and your weekly, monthly and yearly running cost, with average electricity prices for every US state and an optional comparison with a gas car.",
  lastReviewed: data.lastVerified,
  howTo: [
    "Enter your battery's usable capacity in kWh, its current charge and the level you charge to.",
    "Leave charging efficiency at 88% unless you know your charger's figure. It accounts for energy lost as heat while charging.",
    "Pick your state to use its average residential electricity price, or type the rate from your own bill.",
    "Enter how far you drive each month and your car's efficiency in miles per kWh, and say whether that figure comes from the car's display or the EPA label.",
    "Tick the gas comparison and enter a comparable car's MPG and the gas price to see the difference.",
  ],
  formula: (
    <>
      <Formula caption="An EPA efficiency figure is measured from the wall, so it already includes charging losses and isn't divided by efficiency again.">
        {`Energy into battery (kWh) = battery capacity × (target % − current %) ÷ 100
Energy from grid (kWh)    = energy into battery ÷ charging efficiency
Cost of the charge        = energy from grid × price per kWh
Cost per mile             = price per kWh ÷ (miles per kWh × charging efficiency)
Monthly cost              = monthly miles × cost per mile
Weekly cost               = monthly cost × 12 ÷ 52`}
      </Formula>
      <p>
        <strong>Charging efficiency</strong> is the share of electricity from the outlet that ends up stored in the battery. <strong>Miles per kWh</strong> from the car&apos;s display measures energy taken out of the battery, so the calculator adds charging losses back. The gas comparison uses gas price ÷ MPG for the cost per mile.
      </p>
    </>
  ),
  example: (
    <>
      <p>
        A driver with a 75 kWh battery charges from 20% to 80% at home. Charging is 90% efficient and electricity costs 15¢ per kWh. The car averages 3.5 miles per kWh on its display and is driven 1,000 miles a month.
      </p>
      <WorkedTable
        caption="75 kWh EV, 20% → 80%, 15¢/kWh"
        rows={[
          ["Energy into battery (75 × 60%)", "45 kWh"],
          ["Energy from the grid (45 ÷ 0.90)", "50 kWh"],
          ["Cost of the charge (50 × $0.15)", "$7.50"],
          ["Cost per mile ($0.15 ÷ (3.5 × 0.90))", "4.8¢ ($4.76 per 100 mi)"],
          ["Monthly cost (1,000 mi)", "$47.62"],
          ["Yearly cost", "$571.43"],
          ["Gas car, 30 MPG at $3.99/gal, monthly", "$133.00"],
          ["EV saves per month", "$85.38"],
        ]}
      />
      <p>
        Location matters as much as the car. At {data.dataPeriodLabel} averages, the same 50 kWh charge costs about <strong>${(50 * ca.centsPerKwh / 100).toFixed(2)}</strong> in California ({ca.centsPerKwh}¢/kWh) and about <strong>${(50 * nv.centsPerKwh / 100).toFixed(2)}</strong> in Nevada ({nv.centsPerKwh}¢/kWh).
      </p>
    </>
  ),
  explanation: (
    <>
      <p>
        Charging losses are the part most simple calculators skip. Some electricity is lost as heat in the charger, the cable and the battery itself, and the car may use power to heat or cool the battery while it charges. That&apos;s why a charge that adds 45 kWh to the battery can draw 50 kWh from your meter, and why your electricity bill rises by more than the battery capacity suggests.
      </p>
      <p>
        State prices come from the U.S. Energy Information Administration&apos;s Electric Power Monthly (Table 5.6.A), which divides utilities&apos; residential revenue by the electricity they sold. That average folds in fixed monthly charges and taxes, so your own rate, especially on a time-of-use plan with cheap overnight hours, can be quite different. More detail is in{" "}
        <Link href="/blog/cost-to-charge-electric-car-at-home/" className="text-[#125FF9] hover:underline">
          how much it costs to charge an electric car at home
        </Link>
        .
      </p>
    </>
  ),
  assumptions: [
    `State prices are EIA averages for ${data.dataPeriodLabel} (released ${data.releaseDate}). ${data.verificationNote}`,
    `Default gas price: ${data.gasoline.label} (${data.gasoline.publisher}).`,
    "Home charging only. Public DC fast chargers are priced per kWh or per minute at rates the calculator doesn't model.",
    "Efficiency changes with temperature, speed and battery size; winter driving and cabin heating can raise consumption noticeably.",
    "Running costs include electricity and gasoline only, not maintenance, insurance, charger installation or depreciation.",
    "Weekly cost is monthly cost × 12 ÷ 52; yearly cost is monthly cost × 12.",
  ],
  faqs: [
    {
      q: "How much does it cost to charge an EV at home?",
      a: `Multiply the kWh drawn from the grid by your electricity rate. At the US average of ${data.usAverageCentsPerKwh}¢ per kWh (${data.dataPeriodLabel}), drawing 60 kWh costs about $${(60 * data.usAverageCentsPerKwh / 100).toFixed(2)}. Your own rate and the size of each charge decide the real figure.`,
    },
    {
      q: "Where do I find my electricity rate?",
      a: "Your bill lists the price per kWh for supply and delivery, often on separate lines. Add them together, and include per-kWh taxes or riders if shown. If you're on a time-of-use plan, use the rate for the hours you usually charge.",
    },
    {
      q: "Is charging an EV cheaper than buying gas?",
      a: "Usually, for home charging. In the worked example an EV at 15¢ per kWh costs $47.62 a month against $133 for a 30 MPG gas car at $3.99 a gallon. In states with very high electricity prices, or if you rely on public fast charging, the gap narrows.",
    },
    {
      q: "Why does charging use more electricity than the battery holds?",
      a: "Some energy is lost as heat while charging, and the car may run battery heating or cooling during the session. With 88–90% efficiency, about 10–12% of the electricity you pay for never reaches the battery.",
    },
    {
      q: "Should I charge to 100% every time?",
      a: "Many EV makers recommend a lower everyday charge limit and charging to 100% only before long trips. Follow your car's manual. The calculator works for any start and end level.",
    },
  ],
  sources: data.sources,
  articles: ["cost-to-charge-electric-car-at-home", "ev-charging-cost-vs-gas"],
};

export default content;
