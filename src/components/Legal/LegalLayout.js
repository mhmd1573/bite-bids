// components/Legal/LegalLayout.js
// Shared shell for the static legal pages (Privacy Policy, Terms, Returns).
// Provides the hero header, a sticky table of contents and the section renderer.
import React from "react";
import { Info, AlertTriangle, CheckCircle2, ArrowLeft, MessageSquare, ScrollText, ShieldCheck, RotateCcw } from "lucide-react";
import "./Legal.css";

const CALLOUT_ICONS = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
};

/**
 * Renders one content block from a section's `body` array.
 * Supported shapes:
 *   { p: "paragraph" }
 *   { ul: ["item", ...] }
 *   { ol: ["item", ...] }
 *   { callout: "text", tone: "info" | "warning" | "success" }
 */
const renderBlock = (block, key) => {
  if (block.p) {
    return <p key={key}>{block.p}</p>;
  }

  if (block.ul) {
    return (
      <ul key={key}>
        {block.ul.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.ol) {
    return (
      <ol key={key}>
        {block.ol.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    );
  }

  if (block.callout) {
    const Icon = CALLOUT_ICONS[block.tone] || Info;
    return (
      <div key={key} className={`legal-callout legal-callout-${block.tone || "info"}`}>
        <Icon size={18} />
        <p>{block.callout}</p>
      </div>
    );
  }

  return null;
};

const RELATED_DOCS = [
  { label: "Terms of Service", page: "terms", icon: ScrollText },
  { label: "Privacy Policy", page: "privacy", icon: ShieldCheck },
  { label: "Return & Refund Policy", page: "returns", icon: RotateCcw },
];

/**
 * Section titles are authored as "3. Escrow and Payment" so they stay
 * meaningful in the table of contents. Split the leading number out so the
 * heading can render it as a visual badge instead of plain text.
 * Returns { number, text }; number is null when the title is unnumbered.
 */
const splitSectionTitle = (title) => {
  const match = /^(\d+)\.\s+(.*)$/.exec(title);
  return match ? { number: match[1], text: match[2] } : { number: null, text: title };
};

const LegalLayout = ({
  icon: Icon,
  title,
  subtitle,
  lastUpdated,
  sections,
  currentPage,
  navigateToPage,
}) => {
  return (
    <div className="legal-page">
      {/* ===== Hero ===== */}
      <section className="legal-hero">
        <div className="legal-hero-content">
          {Icon && (
            <div className="legal-hero-icon">
              <Icon size={40} className="text-white" />
            </div>
          )}
          <h1 className="legal-title">{title}</h1>
          <p className="legal-subtitle">{subtitle}</p>
          {lastUpdated && <span className="legal-updated">Last updated: {lastUpdated}</span>}
        </div>
      </section>

      {/* ===== Table of contents + body ===== */}
      <div className="legal-layout">
        <aside className="legal-sidebar">
          <nav className="legal-toc-card" aria-label="Table of contents">
            <h2 className="legal-toc-title">Contents</h2>
            <div className="legal-toc-list">
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="legal-toc-link">
                  {section.title}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        <div className="legal-content">
          {sections.map((section) => {
            const { number, text } = splitSectionTitle(section.title);
            return (
              <article key={section.id} id={section.id} className="legal-section">
                <h2 className="legal-section-title">
                  {number && (
                    <span className="legal-section-number" aria-hidden="true">
                      {number}
                    </span>
                  )}
                  <span className="legal-section-text">{text}</span>
                </h2>
                {section.body.map((block, i) => renderBlock(block, `${section.id}-${i}`))}
              </article>
            );
          })}

          {/* ===== Related documents ===== */}
          <nav className="legal-related" aria-label="Related documents">
            {RELATED_DOCS.filter((doc) => doc.page !== currentPage).map((doc) => {
              const DocIcon = doc.icon;
              return (
                <button
                  key={doc.page}
                  type="button"
                  className="legal-related-link"
                  onClick={() => navigateToPage(doc.page)}
                >
                  <DocIcon size={18} />
                  <span>{doc.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ===== CTA ===== */}
          <div className="legal-cta-card">
            <h2 className="legal-cta-title">Need help with this?</h2>
            <p className="legal-cta-description">
              Our team can answer any questions about this policy, or help you exercise a right
              described here.
            </p>
            <div className="legal-cta-buttons">
              <button
                type="button"
                className="legal-cta-button legal-cta-button-primary"
                onClick={() => navigateToPage("contact")}
              >
                <MessageSquare size={16} />
                Contact Support
              </button>
              <button
                type="button"
                className="legal-cta-button legal-cta-button-outline"
                onClick={() => navigateToPage("home")}
              >
                <ArrowLeft size={16} />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;