'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { accordionContent, viewportConfig } from '@/lib/motion';

const faqs = [
  {
    q: 'How does EPADM handle tenant isolation?',
    a: 'Each tenant receives a fully isolated namespace for configuration, data, credentials, and session state. Tenant boundaries are enforced at the application and infrastructure layer — no shared context between tenants, and no possibility of cross-tenant data access by design.',
  },
  {
    q: 'Can EPADM integrate with our existing identity provider?',
    a: 'Yes. EPADM supports identity federation via SAML 2.0 and OIDC. You can connect Okta, Azure Active Directory, Google Workspace, or any standards-compliant IdP. Identity mapping to EPADM roles can be configured at the platform level or individually per tenant.',
  },
  {
    q: 'Is the CMS / Control Plane a separate application from the marketing site?',
    a: 'The EPADM control plane is a dedicated administrative interface for authorized platform operators. It is clearly separated from the public marketing website — both architecturally and in terms of access. Authentication is required, and access is restricted to verified administrators.',
  },
  {
    q: 'How is the REST API secured?',
    a: 'All API endpoints require authentication via signed tokens with configurable expiration windows. Rate limiting, input validation, and CORS policies are enforced at the API gateway. API keys are scoped to specific permissions and can be rotated or revoked at any time through the control plane.',
  },
  {
    q: 'What does the tenant login experience look like?',
    a: 'Tenant users authenticate through the standard EPADM login flow, which supports email/password, SSO via your configured identity provider, and optional multi-factor authentication. After authentication, users are routed to their tenant-specific environment automatically.',
  },
  {
    q: 'Does EPADM support multi-region deployments?',
    a: 'EPADM is designed to run in your infrastructure of choice. Deployment configuration, environment-specific URLs, and infrastructure topology are fully configurable. Multi-region and air-gapped deployments are supported depending on your deployment model.',
  },
  {
    q: 'How do we get started with EPADM?',
    a: 'The recommended first step is a platform assessment call with the EPADM team. We map your current tenant architecture, data flows, and access model, then help you design an onboarding plan that matches your environment. Request a demo below to start the conversation.',
  },
] as const;

function FaqItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`faq__item${isOpen ? ' faq__item--open' : ''}`}>
      <button
        className="faq__question"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.slice(0, 20).replace(/\s+/g, '-')}`}
      >
        <span>{question}</span>
        <span className="faq__chevron" aria-hidden="true">
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.22s ease' }}
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            id={`faq-answer-${question.slice(0, 20).replace(/\s+/g, '-')}`}
            className="faq__answer"
            variants={accordionContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ overflow: 'hidden' }}
          >
            <p className="faq__answer-text">{answer}</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section faq" aria-labelledby="faq-heading">
      <div className="container">
        <div className="faq__layout">
          {/* Header */}
          <m.div
            className="faq__header"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="section-header__eyebrow">FAQ</p>
            <h2 className="section-header__title" id="faq-heading">
              Questions from enterprise teams
            </h2>
            <p className="section-header__subtitle">
              Answers to what platform engineers, enterprise admins, and
              technical decision-makers ask before deploying EPADM.
            </p>
          </m.div>

          {/* FAQ list */}
          <m.div
            className="faq__list"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.5, delay: 0.1 }}
            role="list"
          >
            {faqs.map((faq, index) => (
              <div key={faq.q} role="listitem">
                <FaqItem
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openIndex === index}
                  onToggle={() => toggle(index)}
                />
              </div>
            ))}
          </m.div>
        </div>
      </div>
    </section>
  );
}
