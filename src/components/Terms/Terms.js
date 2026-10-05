// components/Terms/Terms.js
import React from "react";
import { ScrollText } from "lucide-react";
import LegalLayout from "../Legal/LegalLayout";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    body: [
      {
        p: "These Terms of Service form a binding agreement between you and BiteBids regarding your use of the Platform. By creating an account, browsing the marketplace, placing a bid or purchasing a project, you confirm that you have read, understood and agree to be bound by these Terms.",
      },
      {
        p: "If you do not agree with any part of these Terms, you must not use the Platform. If you use the Platform on behalf of a company, you confirm you are authorised to bind that company.",
      },
      {
        callout:
          "These Terms should be read together with our Privacy Policy and our Return & Refund Policy, which form part of this agreement.",
        tone: "info",
      },
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility and Accounts",
    body: [
      { p: "To use the Platform you must:" },
      {
        ul: [
          "Be at least 18 years old and legally capable of entering into a binding contract.",
          "Provide accurate, current registration information and keep it up to date.",
          "Protect your account credentials. You are responsible for all activity under your account.",
          "Use the Platform only for lawful purposes and in line with these Terms.",
        ],
      },
      {
        p: "One person or entity may hold only one account. We may suspend or close accounts that we reasonably believe are fraudulent, duplicated, or used to circumvent our fees or moderation.",
      },
    ],
  },
  {
    id: "marketplace",
    title: "3. The Marketplace Service",
    body: [
      {
        p: "BiteBids operates a marketplace. Developers may list software projects and solutions; investors may bid on or purchase those listings. Unless expressly stated otherwise, BiteBids is not a party to the commercial contract between an investor and a developer, and does not itself develop or supply the software.",
      },
      {
        p: "We act as an intermediary that hosts listings, facilitates communication, holds payment in escrow and administers the dispute process.",
      },
      {
        callout:
          "A listing is an invitation to treat, not an offer capable of acceptance. A contract between investor and developer is formed only when payment has completed and escrow has been confirmed.",
        tone: "warning",
      },
    ],
  },
  {
    id: "account-bidding",
    title: "4. Bidding and Purchasing",
    body: [
      {
        p: "Where a project is offered by auction, an investor may submit a bid. Bids are binding. An investor may have one active bid per project at a time.",
      },
      {
        p: "Where a project is offered at a fixed price, an investor may purchase it directly. Fixed-price projects may be purchased by more than one investor; each purchase is a separate contract.",
      },
      {
        p: "We may reject or remove any bid or listing that we reasonably believe is inaccurate, unlawful, infringing, or that attempts to circumvent the marketplace.",
      },
    ],
  },
  {
    id: "pricing-fees",
    title: "5. Pricing and Fees",
    body: [
      { p: "All prices are displayed in US dollars (USD). The total payable is made up of:" },
      {
        ul: [
          "The project price or winning bid amount.",
          "A platform fee of 6% of the project amount.",
          "A fixed processing fee of $30 per transaction.",
        ],
      },
      {
        p: "Listing a project on the marketplace requires posting credits, charged at $0.99 each at the time of purchase.",
      },
      {
        p: "Prices exclude any taxes that may apply in your jurisdiction. Where we are required to collect tax, it will be shown before payment is confirmed.",
      },
      {
        callout:
          "The total shown at checkout is the amount charged. Fees are not refundable except where these Terms or the Return & Refund Policy expressly provide otherwise.",
        tone: "info",
      },
    ],
  },
  {
    id: "escrow",
    title: "6. Escrow and Payment",
    body: [
      {
        p: "When an investor completes payment, the funds are held in escrow by our payment provider and are not released to the developer until delivery is confirmed or an administrator resolves a dispute.",
      },
      {
        p: "Payment is made through our payment providers' hosted checkout pages. We never receive or store your full card number. All payment pages are served over HTTPS.",
      },
      {
        p: "Funds are released to the developer when the investor approves delivery, or when a dispute is resolved in the developer's favour. Payouts to developers are made by bank transfer and may be subject to a processing delay and verification checks.",
      },
    ],
  },
  {
    id: "obligations",
    title: "7. Your Obligations",
    body: [
      { p: "As a developer you agree to:" },
      {
        ul: [
          "Deliver work that materially matches the listing description and requirements.",
          "Respond to investor messages in project chat and use the delivery mechanism provided.",
          "Not request payment or contact details outside the Platform (off-platform solicitation is prohibited).",
          "Comply with all applicable laws, including export, sanctions and tax obligations.",
        ],
      },
      { p: "As an investor you agree to:" },
      {
        ul: [
          "Pay the amount shown at checkout promptly and accurately.",
          "Provide clear, constructive feedback and respond to delivery submissions.",
          "Not use the Platform for fraudulent, abusive or unlawful purposes.",
        ],
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "8. Acceptable Use",
    body: [
      { p: "You must not use the Platform to:" },
      {
        ul: [
          "Upload or distribute malware, or content that is illegal, hateful, violent or sexually explicit.",
          "Post another person's confidential information, credentials or contact details.",
          "Publish content you do not have the right to license, or that infringes intellectual property rights.",
          "Scrape, reverse engineer, overload or attempt to gain unauthorised access to the Platform.",
          "Circumvent fees, or manipulate bids, ratings or reviews.",
        ],
      },
      {
        p: "We use automated moderation to screen messages and uploaded images. Content flagged as prohibited may be removed and may result in suspension of your account.",
      },
    ],
  },
{
    id: "ip",
    title: "9. Intellectual Property",
    body: [
      {
        p: "The BiteBids name, logo, interface and underlying software are owned by BiteBids. We grant you a limited, revocable, non-exclusive licence to use the Platform as intended.",
      },
      {
        p: "You retain all rights in content you upload. You grant BiteBids a non-exclusive, worldwide licence to host, store, reproduce and display that content solely to operate the marketplace and deliver the services you have requested.",
      },
      {
        p: "Ownership of code delivered under a project passes from developer to investor on the terms agreed between them. BiteBids claims no ownership of such deliverables.",
      },
    ],
  },
  {
    id: "disputes",
    title: "10. Disputes and Refunds",
    body: [
      {
        p: "If something goes wrong, raise the issue in project chat first. If it cannot be resolved, either party may open a dispute.",
      },
      {
        p: "An administrator reviews the dispute and may resolve it in one of three ways: refund the investor in full, refund the developer (release funds to them), or continue the project. The administrator's decision on a dispute is final and binding.",
      },
      {
        p: "Our Return & Refund Policy forms part of these Terms and explains your withdrawal rights and refund timelines in more detail.",
      },
    ],
  },
  {
    id: "liability",
    title: "11. Disclaimer and Liability",
    body: [
      {
        p: "The Platform is provided \"as is\" and \"as available\". We do not warrant that it will be uninterrupted, error-free, or that listings will be accurate or fit for a particular purpose.",
      },
      {
        p: "We do not verify the identity, competence or intentions of users, and we are not responsible for the quality, safety or legality of work exchanged between them. You contract directly with the other party.",
      },
      {
        p: "To the maximum extent permitted by law, our total liability arising out of or relating to the Platform is limited to the total amount you paid us in the 12 months preceding the claim. We are not liable for indirect, incidental or consequential loss, including loss of profit, data or opportunity.",
      },
      {
        callout:
          "Nothing in these Terms limits liability for fraud, or for anything that cannot lawfully be limited, including your statutory consumer rights.",
        tone: "warning",
      },
    ],
  },
  {
    id: "suspension",
    title: "12. Suspension and Termination",
    body: [
      {
        p: "You may close your account at any time. We may suspend or terminate an account, and freeze escrow funds, where we reasonably believe there has been a breach of these Terms, fraud, or a security risk to the Platform or its users.",
      },
      {
        p: "Where we terminate for cause, funds held in escrow for work already delivered are handled under the dispute process. Where we terminate without cause, we will return funds that have not been released, less any amounts properly owed.",
      },
    ],
  },
  {
    id: "changes",
    title: "13. Changes to These Terms",
    body: [
      {
        p: "We may update these Terms. The \"Last updated\" date at the top of this page shows the current version. We will give you reasonable notice of material changes by email or in-app notice. Continued use of the Platform after changes take effect means you accept them.",
      },
    ],
  },
  {
    id: "law",
    title: "14. Governing Law and Disputes",
    body: [
      {
        p: "These Terms are governed by the laws of the jurisdiction in which BiteBids is established. Nothing in this clause limits mandatory consumer protections that may apply to you where you live.",
      },
      {
        p: "Before starting proceedings, both parties agree to attempt good-faith resolution for 30 days by contacting support. This does not prevent either party from seeking urgent injunctive relief.",
      },
    ],
  },
  {
    id: "general",
    title: "15. General",
    body: [
      {
        ul: [
          "If a provision is found unenforceable, the remaining provisions stay in force.",
          "A failure to enforce a right is not a waiver of it.",
          "You may not assign your account without our written consent. We may assign these Terms as part of a merger or sale of the business.",
          "Nothing in these Terms creates a partnership, agency or employment relationship between you and BiteBids.",
        ],
      },
      {
        p: "Questions about these Terms can be raised through the Contact page.",
      },
    ],
  },
];

const Terms = ({ navigateToPage, currentPage }) => {
  return (
    <LegalLayout
      icon={ScrollText}
      title="Terms of Service"
      subtitle="The distance sales agreement governing the use of the BiteBids marketplace."
      lastUpdated="February 10, 2026"
      sections={SECTIONS}
      currentPage={currentPage}
      navigateToPage={navigateToPage}
    />
  );
};

export default Terms;