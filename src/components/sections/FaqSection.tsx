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
    <div className={`border-b border-[var(--border-default)] ${isOpen ? 'pb-4' : ''}`}>
      <button
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-medium text-[var(--text-primary)] cursor-pointer bg-transparent border-0 hover:text-[var(--accent-primary)] transition-colors duration-200"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.slice(0, 20).replace(/\s+/g, '-')}`}
      >
        <span>{question}</span>
        <span className="shrink-0 text-[var(--text-muted)]" aria-hidden="true">
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
            className="overflow-hidden"
            variants={accordionContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ overflow: 'hidden' }}
          >
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0 pb-2">{answer}</p>
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
    <section className="py-[var(--section-padding-y)]" aria-labelledby="faq-heading">
      <div className="mx-auto w-full max-w-[90rem] px-[var(--gutter-xs)] sm:px-[var(--gutter-sm)] md:px-[var(--gutter-md)] lg:px-[var(--gutter-lg)] xl:px-[var(--gutter-xl)]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16 items-start">
          {/* Header */}
          <m.div
            className="flex flex-col gap-4 max-w-3xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="font-sans text-xs font-semibold tracking-[0.1em] uppercase text-[var(--accent-primary)] flex items-center gap-2">
              <span className="block w-6 h-px bg-[var(--accent-primary)] shrink-0" aria-hidden="true" />
              FAQ
            </p>
            <h2 className="m-0 text-[var(--text-primary)]" id="faq-heading">
              Questions from enterprise teams
            </h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-[52ch] m-0">
              Answers to what platform engineers, enterprise admins, and
              technical decision-makers ask before deploying EPADM.
            </p>
          </m.div>

          {/* FAQ list */}
          <m.div
            className="flex flex-col"
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
