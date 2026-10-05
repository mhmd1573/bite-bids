// components/PrivacyPolicy/PrivacyPolicy.js
import React from "react";
import { ShieldCheck } from "lucide-react";
import LegalLayout from "../Legal/LegalLayout";

const SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction",
    body: [
      {
        p: "BiteBids operates an online marketplace that connects software developers with investors. This Privacy Policy explains what personal data we collect, why we collect it, how long we keep it, and what rights you have over it.",
      },
      {
        p: "By creating an account, placing a bid, purchasing a project, or otherwise using the Platform, you confirm that you have read and understood this policy.",
      },
      {
        callout:
          "This policy applies to the BiteBids website and API. It does not apply to third-party payment providers, who process your card data under their own policies.",
        tone: "info",
      },
    ],
  },
  {
    id: "data-we-collect",
    title: "2. Information We Collect",
    body: [
      { p: "We collect information in three ways: what you give us, what we observe, and what our partners provide." },
      { p: "Information you provide to us:" },
      {
        ul: [
          "Account data: name, email address, password (stored hashed), and profile details such as your role (developer or investor).",
          "OAuth data: if you sign in with GitHub or Google we receive your provider ID, email and display name from that provider.",
          "Project data: project listings, descriptions, requirements, budgets, uploaded images and source files you submit.",
          "Bid data: bid amounts, bid timestamps and the bidding history on each project.",
          "Messaging data: the content of chats between investors and developers, including any files exchanged.",
          "Billing data: payout bank details supplied by developers. Full payment card numbers are never stored on our servers.",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    body: [
      {
        ul: [
          "To create and manage your account and authenticate you.",
          "To operate the marketplace: publish projects, place and evaluate bids, and match developers with investors.",
          "To process payments, hold funds in escrow, and pay developers out once work is approved.",
          "To communicate with you by email or in-app notification about transactions, disputes and account activity.",
          "To moderate content, including automated screening of messages and uploaded images for prohibited or harmful material.",
          "To detect, investigate and prevent fraud, abuse, spam and security incidents.",
          "To improve the Platform, including diagnosing errors and understanding which features are used.",
          "To comply with our legal, tax and accounting obligations.",
        ],
      },
      {
        callout:
          "We do not sell your personal information. We do not share it with third parties for their own marketing purposes.",
        tone: "success",
      },
    ],
  },
  {
    id: "legal-basis",
    title: "4. Legal Basis for Processing",
    body: [
      {
        p: "Where the GDPR or comparable legislation applies, we process personal data on the following bases:",
      },
      {
        ul: [
          "Performance of a contract — to deliver the marketplace service you have signed up for.",
          "Legitimate interests — to secure the Platform, prevent fraud, and improve user experience, balanced against your rights.",
          "Legal obligation — to retain transaction records for tax and accounting purposes.",
          "Consent — for optional communications and for cookies that are not strictly necessary. You may withdraw consent at any time.",
        ],
      },
    ],
  },
  {
    id: "cookies",
    title: "5. Cookies and Local Storage",
    body: [
      {
        p: "We use cookies and browser local storage to keep you signed in and to remember interface preferences. We do not use advertising or cross-site tracking cookies.",
      },
      { p: "The categories we use are:" },
      {
        ul: [
          "Strictly necessary — authentication token and session storage. These cannot be disabled without breaking the service.",
          "Functional — remembering your interface state, such as whether you dismissed a notice.",
          "Analytics — aggregated, IP-truncated page and event counts used to improve the Platform.",
        ],
      },
      {
        p: "You can clear or block cookies in your browser settings. Blocking strictly necessary cookies will prevent you from signing in.",
      },
    ],
  },
  {
    id: "sharing",
    title: "6. Sharing Your Information",
    body: [
      { p: "We share personal data only with the following categories of recipient:" },
      {
        ul: [
          "Payment processors (for example Payoneer, Dodo Payments and Stripe), to take payment, hold funds in escrow and pay developers out.",
          "Cloud storage and hosting providers, to store files and run the Platform.",
          "Email providers, to send transactional notifications.",
          "Professional advisers and authorities, where we are legally required to disclose information.",
        ],
      },
      {
        p: "Important: when you communicate with another user in a project chat, that other user sees the information you choose to share. Please do not post personal data of third parties in chat.",
      },
      {
        callout:
          "Aggregate or de-identified statistics may be shared with third parties for research and analytics without identifying you.",
        tone: "info",
      },
    ],
  },
  {
    id: "payments",
    title: "7. Payment and Financial Data",
    body: [
      {
        p: "Cardholder details are entered directly on the payment provider's hosted checkout page and never touch our servers. We store only the transaction reference, amount, currency and status.",
      },
      {
        p: "Developer payout bank details are encrypted at rest before being written to our database, and are revealed to an administrator only when a payout is being processed.",
      },
      {
        callout:
          "Full payment card numbers are never stored on BiteBids and are not visible to BiteBids staff at any point.",
        tone: "success",
      },
    ],
  },
  {
    id: "retention",
    title: "8. How Long We Keep Your Data",
    body: [
      { p: "We keep personal data only for as long as it is needed for the purposes described in this policy, or as long as the law requires." },
      {
        ul: [
          "Account data — for as long as your account is active, and for 12 months after closure.",
          "Transaction and escrow records — for the statutory accounting and tax period applicable in our jurisdiction.",
          "Chat messages — for as long as the related project is active, then archived with the project record.",
          "Uploaded files — for the lifetime of the project, then removed.",
          "Security and moderation logs — for up to 24 months.",
        ],
      },
    ],
  },
  {
    id: "your-rights",
    title: "9. Your Rights",
    body: [
      { p: "Depending on your location, you may have the following rights over your personal data:" },
      {
        ul: [
          "Access — obtain a copy of the data we hold about you.",
          "Rectification — correct inaccurate or incomplete data.",
          "Erasure — ask us to delete your data (subject to legal retention duties).",
          "Restriction — ask us to pause certain processing.",
          "Portability — receive your data in a structured, machine-readable format.",
          "Object — object to processing based on legitimate interests.",
          "Withdraw consent — at any time, where consent is the basis we rely on.",
          "Complain — to your local data protection authority.",
        ],
      },
      {
        p: "To exercise any of these rights, use the Contact page. We aim to respond within 30 days and may ask for information to verify your identity before acting on a request.",
      },
    ],
  },
{
    id: "security",
    title: "10. Data Security",
    body: [
      {
        p: "The Platform is served exclusively over HTTPS using TLS encryption. We encrypt sensitive fields such as payout bank details at rest, use hashed password storage, and never log full card numbers.",
      },
      {
        p: "No system is perfectly secure. If we become aware of a breach affecting your personal data, we will notify you and the relevant supervisory authority without undue delay.",
      },
    ],
  },
  {
    id: "international",
    title: "11. International Transfers",
    body: [
      {
        p: "BiteBids and its providers are located in multiple countries. Your data may therefore be processed outside your country of residence. Where a transfer is subject to the GDPR, we rely on an adequacy decision or on standard contractual clauses approved by the European Commission.",
      },
    ],
  },
  {
    id: "children",
    title: "12. Children's Privacy",
    body: [
      {
        p: "The Platform is intended for users aged 18 and over. We do not knowingly collect data from anyone under 16. If you believe a minor has provided us with personal data, contact us and we will delete it.",
      },
    ],
  },
  {
    id: "changes",
    title: "13. Changes to This Policy",
    body: [
      {
        p: "We may update this policy to reflect changes in our practices or the law. The \"Last updated\" date at the top of this page shows when it was last revised. Material changes will be announced by email or in-app notice before they take effect.",
      },
    ],
  },
  {
    id: "contact",
    title: "14. Contact Us",
    body: [
      {
        p: "For any privacy question, request or complaint, use the Contact page or write to us at the email address shown there. Our designated data protection contact is listed on that page.",
      },
    ],
  },
];

const PrivacyPolicy = ({ navigateToPage, currentPage }) => {
  return (
    <LegalLayout
      icon={ShieldCheck}
      title="Privacy Policy"
      subtitle="How BiteBids collects, uses, stores and protects your personal information."
      lastUpdated="February 10, 2026"
      sections={SECTIONS}
      currentPage={currentPage}
      navigateToPage={navigateToPage}
    />
  );
};

export default PrivacyPolicy;