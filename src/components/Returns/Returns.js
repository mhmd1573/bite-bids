// components/Returns/Returns.js
import React from "react";
import { RotateCcw } from "lucide-react";
import LegalLayout from "../Legal/LegalLayout";

const SECTIONS = [
  {
    id: "overview",
    title: "1. Overview",
    body: [
      {
        p: "Every purchase on BiteBids is held in escrow until you confirm delivery. That escrow is your primary protection: if a developer does not deliver, or delivers something that does not match the listing, your money is not released and you can ask for a full refund through our dispute process.",
      },
      {
        p: "This page also explains your statutory right of withdrawal, the situations where a refund cannot be granted, and the timelines that apply.",
      },
      {
        callout:
          "BiteBids is a marketplace, not the developer of the software you purchase. Refunds for defective work are handled through our dispute process so that the developer can respond fairly.",
        tone: "info",
      },
    ],
  },
  {
    id: "withdrawal-right",
    title: "2. Right of Withdrawal",
    body: [
      {
        p: "Contracts concluded on BiteBids are concluded at a distance. Where you are a consumer in a jurisdiction that provides a statutory cooling-off period, you may withdraw from the contract within 14 days without giving a reason.",
      },
      {
        p: "The withdrawal period begins on the day the contract is concluded — that is, the day your payment is confirmed and escrow is created. To withdraw, you must notify us before the period expires.",
      },
      {
        p: "To exercise the right of withdrawal, send us a clear statement of your intention through the Contact page, or by email to the address listed there. A simple message such as \"I withdraw from my purchase of [project name]\" is sufficient.",
      },
      {
        callout:
          "Where you are a business rather than a consumer, the statutory withdrawal right may not apply to you, but our escrow and dispute protections still apply in full.",
        tone: "warning",
      },
    ],
  },
  {
    id: "digital-content",
    title: "3. Immediate Performance and Digital Content",
    body: [
      {
        p: "On BiteBids the deliverable is digital content — source code, software or a repository access — which is supplied as soon as work begins and cannot be returned in physical form.",
      },
      {
        p: "Under applicable consumer law, the right of withdrawal is normally lost once you have expressly asked us to begin performance immediately and have acknowledged that you lose that right. If you ask us to start immediately, we will record your acknowledgement before work begins.",
      },
      {
        p: "Because BiteBids holds funds in escrow and does not release them until you approve delivery, you remain financially protected even where the statutory withdrawal right is lost.",
      },
    ],
  },
  {
    id: "refund-reasons",
    title: "4. When You Can Get a Refund",
    body: [
      { p: "You can request a full refund of the project amount in any of these situations:" },
      {
        ul: [
          "You withdraw within the applicable cooling-off period.",
          "The developer never starts the work and does not respond to your messages.",
          "The developer does not deliver within the deadline agreed in the project.",
          "The delivered work materially does not match the listing description or requirements.",
          "The developer delivers work that is unlawful, infringing, or fails to meet the stated requirements after a reasonable attempt to correct it.",
          "An administrator resolves a dispute in your favour.",
        ],
      },
      {
        p: "Requests are assessed on the evidence in the project chat and any files submitted for delivery.",
      },
    ],
  },
  {
    id: "refund-process",
    title: "5. How to Request a Refund",
    body: [
      { p: "To request a refund:" },
      {
        ol: [
          "Open the project chat and tell the developer the problem. Most issues are resolved directly.",
          "If it is not resolved, open a dispute from the project or dashboard.",
          "Describe what went wrong and reference the specific requirement that was not met.",
          "Upload any evidence — screenshots, files, or logs — that supports your claim.",
        ],
      },
      { p: "An administrator reviews the dispute and issues one of the following decisions:" },
      {
        ul: [
          "Refund the investor — you receive the project amount back.",
          "Refund the developer — funds are released to the developer and the project continues or closes.",
          "Continue the project — the dispute is closed and work resumes under the original terms.",
        ],
      },
      {
        callout:
          "The administrator's decision is final. Keep all project correspondence in the chat so that decisions can be based on an accurate record.",
        tone: "info",
      },
    ],
  },
  {
    id: "refund-timeline",
    title: "6. Refund Timeline and Method",
    body: [
      { p: "If a refund is approved:" },
      {
        ol: [
          "The dispute decision is recorded and notified to both parties.",
          "We ask our payment provider to return the funds.",
          "Your payment provider posts the funds back to your original payment method.",
        ],
      },
      {
        p: "Refund timelines are set by your payment provider, not by BiteBids. Typically 5–10 business days for card payments, and up to 14 days for bank or wallet transfers. You will receive a refund confirmation email from BiteBids before the funds leave our side.",
      },
    ],
  },
  {
    id: "non-refundable",
    title: "7. When a Refund Cannot Be Granted",
    body: [
      { p: "A refund cannot be granted where:" },
      {
        ul: [
          "The statutory withdrawal period has expired and the deliverable was supplied in accordance with the listing.",
          "The developer has completed and you have expressly approved the delivery, releasing the escrow.",
          "The work fails only because the requirements were changed after the project began.",
          "The claim relates to dissatisfaction with a stylistic or subjective preference that was clearly described in the original listing.",
          "The claim is made after the project has been closed for more than 30 days without an admin decision.",
          "Evidence has been altered, fabricated, or the account has been used to commit fraud.",
        ],
      },
    ],
  },
{
    id: "fees",
    title: "8. Are the Fees Refundable?",
    body: [
      { p: "This is the part most vendors leave unclear, so we state it plainly:" },
      {
        ul: [
          "When a refund is granted in your favour, you receive the full project amount you paid back.",
          "Platform and processing fees (6% plus $30) are service fees and are not refunded, because the transaction and the escrow service have already been performed.",
          "Posting credits purchased by a developer are non-refundable once used to publish a listing.",
          "Where we are at fault, or where an administrator rules that the developer breached the contract, we may in addition reimburse the processing fee at our discretion.",
        ],
      },
      {
        callout:
          "This section does not limit any statutory right you may have to recover fees paid for a service not properly supplied.",
        tone: "warning",
      },
    ],
  },
  {
    id: "chargebacks",
    title: "9. Chargebacks",
    body: [
      {
        p: "Where a problem can be resolved through our dispute process, please use it — it is faster and gives the developer a fair opportunity to respond. Use of chargebacks for issues already addressed through BiteBids may result in the account being restricted from future purchases.",
      },
      {
        p: "Where you believe fraud has occurred, contact us first and also consider notifying your payment provider promptly, as chargeback windows are usually short.",
      },
    ],
  },
  {
    id: "developers",
    title: "10. Developers and Withdrawn Work",
    body: [
      {
        p: "If an administrator refunds an investor, the developer keeps no fee on that transaction and the unpaid balance of the escrow is returned to the investor. Repeated refunds caused by failure to deliver may lead to removal from the marketplace.",
      },
    ],
  },
  {
    id: "changes",
    title: "11. Changes to This Policy",
    body: [
      {
        p: "We may update this Return & Refund Policy. The \"Last updated\" date at the top of this page shows the current version. We will give you reasonable notice of material changes by email or in-app notice. Changes do not affect transactions already completed before the change took effect.",
      },
    ],
  },
];

const Returns = ({ navigateToPage, currentPage }) => {
  return (
    <LegalLayout
      icon={RotateCcw}
      title="Return & Refund Policy"
      subtitle="How escrow protection, refunds and returns work on BiteBids."
      lastUpdated="February 10, 2026"
      sections={SECTIONS}
      currentPage={currentPage}
      navigateToPage={navigateToPage}
    />
  );
};

export default Returns;