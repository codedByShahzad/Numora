import Link from "next/link";
import { Formula, WorkedTable } from "@/components/site/ContentBlocks";
import rules from "@/data/tax/overtime-rules.json";
import type { CalculatorContent } from "./types";

const content: CalculatorContent = {
  lead:
    "Estimate how much of your overtime pay you can deduct under the 2025 tax law, often called “no tax on overtime”, and roughly how much federal income tax it saves. Only the half-time premium counts, the deduction is capped, and it shrinks at higher incomes.",
  lastReviewed: rules.lastVerified,
  howTo: [
    "Pick the tax year (2025 to 2028) and your filing status. Married couples have to file a joint return to qualify.",
    <>
      Choose how you know your overtime: from your <strong>regular hourly rate and FLSA overtime hours</strong>, from the amount in <strong>W-2 box 12 with code TT</strong> (the official figure from tax year 2026), or, for 2025 only, from the <strong>total overtime pay</strong> on your pay stubs.
    </>,
    "Enter your modified adjusted gross income (MAGI). For most people this is the adjusted gross income on Form 1040, line 11.",
    "Optionally choose your federal tax bracket so the calculator can estimate the income tax you save.",
    "Read the breakdown and any warnings, then compare the result with your W-2 and your tax software.",
  ],
  formula: (
    <>
      <Formula caption="Amounts in brackets apply to a married-filing-jointly return. The reduction is never below $0.">
        {`Qualified premium = 0.5 × regular hourly rate × FLSA overtime hours
Amount after cap  = smaller of (qualified premium, $12,500 [$25,000])
Phase-out steps   = whole number of (MAGI − $150,000 [$300,000]) ÷ $1,000
Reduction         = phase-out steps × $100
Deduction         = amount after cap − reduction (not below $0)
Tax saved (est.)  = deduction × your marginal federal rate`}
      </Formula>
      <p>
        <strong>Regular hourly rate</strong> is your FLSA “regular rate”, which includes most pay for the work, not just the base wage. <strong>FLSA overtime hours</strong> are hours over 40 in a workweek that the Fair Labor Standards Act requires to be paid at one and a half times the regular rate. The <strong>qualified premium</strong> is the extra half of that time-and-a-half. If your employer pays double time, the extra beyond the half-time premium does not count. From tax year 2026, the figure your employer reports in W-2 box 12 (code TT) replaces this estimate.
      </p>
    </>
  ),
  example: (
    <>
      <p>
        Maria is a hospital nurse paid $40 an hour. In 2026 she works 156 hours of FLSA overtime at time-and-a-half. She files as single, her MAGI is $85,000 and her top federal bracket is 22%.
      </p>
      <WorkedTable
        caption="Maria, single, 2026"
        rows={[
          ["Total overtime pay ($40 × 1.5 × 156)", "$9,360.00"],
          ["Qualified premium ($40 × 0.5 × 156)", "$3,120.00"],
          ["Cap for a single filer", "$12,500.00"],
          ["Amount after cap", "$3,120.00"],
          ["MAGI over $150,000", "$0.00"],
          ["Phase-out reduction", "$0.00"],
          ["Deduction", "$3,120.00"],
          ["Estimated tax saved at 22%", "$686.40"],
        ]}
      />
      <p>
        Now take Darnell, an electrician who files single. His W-2 shows $5,000 in box 12, code TT, and his MAGI is $170,000. He is $20,000 over the threshold, which is 20 full steps of $1,000, so the deduction is reduced by $2,000 to <strong>$3,000</strong>. If his MAGI were $200,000, the $5,000 reduction would wipe out his deduction completely, because the reduction comes off the capped overtime amount, not off the $12,500 cap.
      </p>
    </>
  ),
  explanation: (
    <>
      <p>
        The deduction comes from section 225 of the Internal Revenue Code, added by the One Big Beautiful Bill Act in July 2025. You claim it on Schedule 1-A, Part III, and you can take it whether you itemize or use the standard deduction. The calculator follows the order of that form: it adds up your qualified overtime, keeps the smaller of that amount and the cap, works out the income reduction, and subtracts it.
      </p>
      <p>
        The phase-out drops partial steps. Schedule 1-A tells you to divide the amount over the threshold by $1,000 and, if the result isn&apos;t a whole number, reduce it to the next lower whole number. So $150,999 of MAGI gives no reduction, while $151,000 gives a $100 reduction. For a single filer at the full $12,500 cap, the deduction reaches zero at $275,000 of MAGI; for a joint return at $25,000 it reaches zero at $550,000.
      </p>
      <p>
        For <strong>2025</strong>, employers didn&apos;t have to report overtime separately, so IRS Notice 2025-69 lets you use a premium shown on a pay statement, one-third of total time-and-a-half overtime pay, one-quarter of total double-time pay, or another reasonable method. From <strong>2026</strong>, only the amount reported on your W-2 (box 12, code TT) or a 1099 counts. If it looks too low, ask your employer for a corrected W-2. Read more in{" "}
        <Link href="/blog/w2-box-12-code-tt-explained/" className="text-[#125FF9] hover:underline">
          W-2 box 12 code TT explained
        </Link>
        .
      </p>
    </>
  ),
  assumptions: [
    "Federal income tax only. The deduction doesn't reduce Social Security or Medicare (FICA) tax, and each state decides whether to follow it.",
    "Employees who are exempt from FLSA overtime rules get $0, even if they receive overtime pay.",
    "Overtime paid only because of state law (for example daily overtime), a union contract or company policy doesn't count unless the FLSA also requires it.",
    "Married filing separately gets $0. Head of household and qualifying surviving spouse use the $12,500 cap and $150,000 threshold.",
    "The tax-saved figure multiplies the deduction by one bracket rate. If the deduction moves some income into a lower bracket, the real saving is a little smaller.",
    "Your employer won't lower withholding for the deduction unless you file a new Form W-4, so the saving usually shows up in your refund.",
    "Other Schedule 1-A deductions (tips, car loan interest, the senior deduction) aren't included.",
  ],
  faqs: [
    {
      q: "How much will I get back from no tax on overtime?",
      a: "Multiply your deduction by your top federal tax rate. A $3,120 deduction in the 22% bracket lowers your federal income tax by about $686. It is a deduction, not a credit, so it reduces taxable income rather than your tax bill dollar for dollar, and whether you see it as a bigger refund depends on how much was withheld.",
    },
    {
      q: "Is all overtime tax-free now?",
      a: "No. Only the premium the FLSA requires (the extra half in time-and-a-half) can be deducted, up to $12,500 a year ($25,000 on a joint return), and only from federal income tax. The regular-rate part of each overtime hour is taxed as usual, and Social Security, Medicare and most state taxes still apply.",
    },
    {
      q: "What is W-2 box 12 code TT?",
      a: "Starting with tax year 2026, employers report qualified overtime compensation in box 12 of Form W-2 with code TT. For 2026 and later that reported figure is the amount you can deduct. If it's missing or too low, ask your employer for a corrected W-2; you can't use Form 4852 to claim unreported overtime.",
    },
    {
      q: "I'm salaried. Can I claim the overtime deduction?",
      a: "Only if you are non-exempt under the FLSA and actually receive FLSA overtime. Many salaried managers, professionals and administrative staff are exempt, so their extra-hours pay doesn't qualify. Federal employees can check the FLSA category on their SF-50.",
    },
    {
      q: "Can I claim it if I'm married filing separately?",
      a: "No. Married taxpayers must file a joint return to claim the deduction, so the calculator shows $0 for married filing separately.",
    },
    {
      q: "Do I need to itemize to get the deduction?",
      a: "No. It's claimed on Schedule 1-A and is available whether you take the standard deduction or itemize.",
    },
  ],
  sources: rules.sources,
  disclaimer:
    "This calculator gives an estimate based on IRS guidance available on the review date. It is not tax advice. Tax law and IRS guidance can change; check the official instructions or a tax professional before filing.",
  articles: ["w2-box-12-code-tt-explained", "no-tax-on-overtime-deduction-explained"],
};

export default content;
