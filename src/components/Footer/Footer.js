// components/Footer/Footer.js
// Site-wide footer. Hosts the legally-required policy links (Privacy Policy,
// Terms of Service, Return & Refund Policy) alongside navigation and contact.
import React from "react";
import { Rocket, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import "./Footer.css";

const NAV_LINKS = [
  { label: "Home", page: "home" },
  { label: "Marketplace", page: "marketplace" },
  { label: "About", page: "about" },
  { label: "Contact", page: "contact" },
];

const LEGAL_LINKS = [
  { label: "Terms of Service", page: "terms" },
  { label: "Privacy Policy", page: "privacy" },
  { label: "Return & Refund Policy", page: "returns" },
];

const Footer = ({ navigateToPage }) => {
  const go = (page) => {
    if (navigateToPage) {
      navigateToPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-container">
        <div className="site-footer-grid">
          {/* Brand */}
          <div className="site-footer-brand">
            <button type="button" className="site-footer-logo" onClick={() => go("home")}>
              <Rocket size={22} className="text-brand" />
              BiteBids
            </button>
            <p className="site-footer-tagline">
              The marketplace connecting talented developers with visionary investors. Protected
              payments, escrow and dispute resolution on every project.
            </p>
            <span className="site-footer-badge">
              <ShieldCheck size={14} />
              256-bit SSL secured
            </span>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="site-footer-col-title">Navigate</h3>
            <ul className="site-footer-list">
              {NAV_LINKS.map((link) => (
                <li key={link.page}>
                  <button type="button" className="site-footer-link" onClick={() => go(link.page)}>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="site-footer-col-title">Legal</h3>
            <ul className="site-footer-list">
              {LEGAL_LINKS.map((link) => (
                <li key={link.page}>
                  <button type="button" className="site-footer-link" onClick={() => go(link.page)}>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="site-footer-col-title">Contact</h3>
            <div className="site-footer-contact">
              <a className="site-footer-contact-item" href="mailto:bitebids@gmail.com">
                <Mail size={16} />
                bitebids@gmail.com
              </a>
              <a className="site-footer-contact-item" href="tel:+96171509050">
                <Phone size={16} />
                +961 71 50 90 50
              </a>
              <span className="site-footer-contact-item">
                <MapPin size={16} />
                Mon–Fri, 9AM – 6PM EST
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="site-footer-bottom">
          <div className="site-footer-bottom-inner">
            <p className="site-footer-copyright">
              © {new Date().getFullYear()} BiteBids. All rights reserved.
            </p>
            <div className="site-footer-legal-inline">
              {LEGAL_LINKS.map((link) => (
                <button key={link.page} type="button" className="site-footer-link" onClick={() => go(link.page)}>
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;