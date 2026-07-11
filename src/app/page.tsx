'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ctaNav } from '@/config/site';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

/* ── Motion Variants ────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const cardHoverVariants = {
  hover: {
    y: -8,
    borderColor: 'var(--accent-primary)',
    boxShadow: 'var(--shadow-glow-sm)',
    transition: { duration: 0.25 }
  }
};

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const pillars = [
    {
      num: '01',
      title: 'Biometric Automation',
      subtitle: 'Hardware-level ADMS synchronization protocol',
      desc: 'Connect your physical biometric devices directly to the cloud. Our native ADMS engine automatically synchronizes fingerprint and RFID attendance terminals in real-time, eliminating spreadsheet imports and data tampering.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
        </svg>
      ),
      badges: ['Real-time sync', 'Zero manual exports', 'Tamperproof audit logs']
    },
    {
      num: '02',
      title: 'AI Academic Operations',
      subtitle: 'Generative AI Exams & Genetic Scheduling Algorithms',
      desc: 'Supercharge classroom operations with state-of-the-art AI tooling. Auto-generate comprehensive CBSE/ICSE exam papers matching blueprint structures, query school policy/guideline documents using context-aware RAG, and compute conflict-free school timetables instantly using Genetic Algorithms.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
      ),
      badges: ['Exam Generation', 'Genetic Timetables', 'School RAG Base']
    },
    {
      num: '03',
      title: 'DPDP Act 2023 Compliance',
      subtitle: 'Built-in tools for India’s new data privacy framework',
      desc: 'Protect student privacy with the only K-12 management system built for the Digital Personal Data Protection (DPDP) Act 2023. Manage verifiable parental consents for minors, empower parents with clear data fiduciary controls, and audit data access using strict row-level isolation.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
      badges: ['Verifiable Parental Consent', 'Right to Erase', 'Audit Trails']
    }
  ];

  const pricingTiers = [
    {
      name: 'Foundation',
      price: '₹25,000',
      period: 'flat / year',
      description: 'Core school administration and compliance tools for mid-sized private schools.',
      features: [
        'Up to 500 Students',
        'Student & Staff Directory ERP',
        'Basic Gradebook & Report Cards',
        'Parent Consent Registry (DPDP)',
        'Row-Level isolated secure database',
        'Standard Email Support'
      ],
      cta: 'Get Started',
      href: '/register',
      popular: false
    },
    {
      name: 'Growth',
      price: '₹40',
      period: 'student / month',
      description: 'Complete operational automation with AI and biometrics integration.',
      features: [
        'Unlimited Students',
        'Everything in Foundation',
        'Biometric Device Sync (ADMS protocol)',
        'AI Exam & Question Paper Generator',
        'Genetic Timetable Auto-Scheduler',
        'Active Parent & Teacher Portals',
        'Priority Technical Support'
      ],
      cta: 'Start 14-Day Free Trial',
      href: '/register',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '₹60',
      period: 'student / month',
      description: 'Advanced features for school chains and multi-branch educational societies.',
      features: [
        'Multi-Branch Consolidated Dashboard',
        'Everything in Growth',
        'Custom Domain & White-labeling',
        'Dedicated Database Server',
        'Complete DPDP Data Audit Logging',
        'Custom API Integrations',
        'Dedicated Account Manager 24/7'
      ],
      cta: 'Contact Sales',
      href: '/contact',
      popular: false
    }
  ];

  const faqs = [
    {
      q: "How does the biometric ADMS sync work?",
      a: "Our platform features a built-in Automatic Data Management System (ADMS) proxy. Once configured, your school's physical attendance machines (such as Essl, Matrix, or ZKTeco devices) communicate directly with EPADM's cloud server over secure HTTPS. No local server, static IP, or manual file uploads are required."
    },
    {
      q: "What tools are provided for DPDP Act 2023 compliance?",
      a: "We act as a Data Processor for schools (the Data Fiduciaries). We provide built-in tools for collecting and logging verifiable parental consents, school-wide privacy policies, localized databases, and clear audit workflows for responding to parent requests such as Right to Access, Right to Rectify, and Right to Erase."
    },
    {
      q: "How does the AI Timetable generator work?",
      a: "Creating school timetables is a complex optimization problem. EPADM uses a specialized Genetic Algorithm that takes teacher availability, room limits, subject difficulty, maximum lectures per day, and school guidelines to compute the most optimal timetable layout within seconds."
    },
    {
      q: "Can we migrate our existing student data to EPADM?",
      a: "Yes. We offer fully guided data migration tools. You can upload student, teacher, and historical grade records via CSV or Excel sheets, and our automated mapping wizard formats and validates the records into your isolated tenant environment."
    },
    {
      q: "Are there any hidden setup fees?",
      a: "No. Our pricing is transparent. The Foundation tier is flat ₹25,000/year, and the Growth/Enterprise tiers are charged based on active students. Standard data migration, onboarding training, and basic templates are completely free."
    }
  ];

  return (
    <div className="home-page">
      {/* ── HERO SECTION ── */}
      <section className="hero-section" aria-label="EPADM Hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-bg__glow hero-bg__glow--1" />
          <div className="hero-bg__glow hero-bg__glow--2" />
          <div className="hero-bg__grid" />
        </div>

        <div className="container hero-layout">
          <m.div
            className="hero-copy"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={itemVariants} className="hero-eyebrow">
              <Badge variant="accent">
                <span className="status-dot status-dot--live" aria-hidden="true" />
                End-to-End K-12 School Management
              </Badge>
            </m.div>

            <m.h1 variants={itemVariants} className="hero-heading">
              Next-Gen <br />
              <span className="text-gradient">AI-Driven School</span> <br />
              Management.
            </m.h1>

            <m.p variants={itemVariants} className="hero-subtitle">
              EPADM is an all-in-one K-12 administration SaaS engineered for mid-sized private schools in India. Streamline academic operations with generative AI, sync biometrics automatically, and achieve complete DPDP Act 2023 compliance.
            </m.p>

            <m.div variants={itemVariants} className="hero-ctas">
              <Button href={ctaNav.primary.href} variant="primary" size="lg">
                {ctaNav.primary.label}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
              <Button href="/demo" variant="secondary" size="lg">
                Request a Demo
              </Button>
            </m.div>

            <m.div variants={itemVariants} className="hero-trust">
              <div className="hero-trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Hardware ADMS Sync</span>
              </div>
              <div className="hero-trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>DPDP 2023 Compliant</span>
              </div>
              <div className="hero-trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Generative AI Tools</span>
              </div>
            </m.div>
          </m.div>

          {/* <m.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            <div className="hero-visual-card">
              <div className="hero-visual-card-header">
                <div className="card-dots">
                  <span className="dot dot--red" />
                  <span className="dot dot--yellow" />
                  <span className="dot dot--green" />
                </div>
                <span className="card-title">EPADM Unified Network</span>
                <span className="badge badge--success">Secure tenant</span>
              </div>
              <div className="hero-visual-card-body">
                <SchoolTopologyVisual />
              </div>
            </div>
          </m.div> */}
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="features-section section">
        <div className="container">
          <div className="section-header section-header--center">
            <span className="section-header__eyebrow">Core Features</span>
            <h2 className="section-header__title text-gradient">
              The 3 Pillars of Modern School Administration
            </h2>
            <p className="section-header__subtitle">
              We replace legacy, slow school ERPs with a modern platform built on security, AI intelligence, and compliance.
            </p>
          </div>

          <div className="features-grid grid">
            {pillars.map((pillar) => (
              <m.div
                key={pillar.num}
                className="feature-card"
                variants={cardHoverVariants}
                whileHover="hover"
              >
                <Card variant="interactive" padding="md">
                  <div className="feature-card-header">
                    <div className="card__icon">{pillar.icon}</div>
                    <span className="feature-num">{pillar.num}</span>
                  </div>

                  <h3 className="card__title">{pillar.title}</h3>
                  <p className="feature-card-subtitle">{pillar.subtitle}</p>
                  <p className="card__body">{pillar.desc}</p>

                  <div className="feature-badges">
                    {pillar.badges.map((b) => (
                      <Badge key={b} variant="outline">{b}</Badge>
                    ))}
                  </div>
                </Card>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="pricing" className="pricing-section section">
        <div className="container">
          <div className="section-header section-header--center">
            <span className="section-header__eyebrow">Pricing Plans</span>
            <h2 className="section-header__title text-gradient">
              Transparent, Value-Based Plans
            </h2>
            <p className="section-header__subtitle">
              Choose the layout that matches your school’s growth model. Simple billing, zero onboarding fees, cancel anytime.
            </p>
          </div>

          <div className="pricing-grid grid grid--3">
            {pricingTiers.map((tier) => (
              <m.div
                key={tier.name}
                className={`pricing-card card ${tier.popular ? 'pricing-card--popular' : ''}`}
                variants={cardHoverVariants}
                whileHover="hover"
              >
                {tier.popular && (
                  <Badge variant="success">Most Popular</Badge>
                )}

                <div className="pricing-card-header">
                  <h3 className="pricing-name">{tier.name}</h3>
                  <div className="pricing-price-wrap">
                    <span className="price-amount">{tier.price}</span>
                    <span className="price-period">/ {tier.period}</span>
                  </div>
                  <p className="pricing-description">{tier.description}</p>
                </div>

                <div className="divider" style={{ marginBlock: 'var(--space-6)' }} />

                <ul className="pricing-features" role="list">
                  {tier.features.map((feat) => (
                    <li key={feat} className="pricing-feature-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  href={tier.href}
                  variant={tier.popular ? 'primary' : 'secondary'}
                  className="w-full"
                  style={{ marginTop: 'auto' }}
                >
                  {tier.cta}
                </Button>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="faq-section section">
        <div className="container">
          <div className="section-header section-header--center">
            <span className="section-header__eyebrow">Frequently Asked Questions</span>
            <h2 className="section-header__title text-gradient">
              Got Questions? We’ve Got Answers
            </h2>
            <p className="section-header__subtitle">
              Learn how EPADM fits your school infrastructure and operational requirements.
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`faq-item ${activeFaq === i ? 'faq-item--active' : ''}`}
              >
                <button
                  className="faq-trigger"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  aria-expanded={activeFaq === i}
                >
                  <span>{faq.q}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    style={{
                      transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <m.div
                      className="faq-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p>{faq.a}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STYLES ── */}
      <style>{`
        /* Hero Section */
        .hero-section {
          position: relative;
          min-height: calc(100vh - var(--nav-height));
          display: flex;
          align-items: center;
          overflow: hidden;
          padding-block: clamp(4rem, 8vw, 8rem);
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: var(--z-behind);
        }

        .hero-bg__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .hero-bg__glow--1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(79, 110, 247, 0.16) 0%, transparent 70%);
          top: -10%;
          right: -10%;
        }

        .hero-bg__glow--2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(79, 110, 247, 0.08) 0%, transparent 70%);
          bottom: -10%;
          left: -5%;
        }

        .hero-bg__grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%);
        }

        .hero-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: var(--space-16);
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-copy {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .hero-eyebrow {
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          color: var(--text-muted);
        }

        .hero-heading {
          font-size: clamp(2.5rem, 5.5vw, 4.5rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: var(--tracking-tighter);
          line-height: var(--leading-tight);
          margin: 0;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 1.4vw, 1.15rem);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          max-width: 52ch;
          margin: 0;
        }

        .hero-ctas {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .hero-trust {
          display: flex;
          align-items: center;
          gap: var(--space-6);
          flex-wrap: wrap;
          margin-top: var(--space-2);
        }

        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          color: var(--text-muted);
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-visual-card {
          width: 100%;
          max-width: 38rem;
          background: rgba(15, 22, 41, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl), 0 0 60px rgba(79, 110, 247, 0.1);
        }

        .hero-visual-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid var(--border-subtle);
        }

        .card-dots {
          display: flex;
          gap: 6px;
        }

        .card-dots .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot--red    { background: #ef4444; opacity: 0.6; }
        .dot--yellow { background: #f59e0b; opacity: 0.6; }
        .dot--green  { background: #10b981; opacity: 0.6; }

        .card-title {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--text-muted);
        }

        .hero-visual-card-body {
          padding: var(--space-6);
        }

        /* Features Section */
        .features-grid {
          margin-top: var(--space-12);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
        }

        .feature-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .feature-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .feature-num {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          font-weight: var(--weight-extrabold);
          color: rgba(79, 110, 247, 0.15);
        }

        .feature-card-subtitle {
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
          margin-top: calc(-1 * var(--space-2));
        }

        .feature-badges {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1px);
          margin-top: auto;
          padding-top: var(--space-2);
        }

        /* Pricing Section */
        .pricing-grid {
          margin-top: var(--space-12);
          align-items: stretch;
        }

        .pricing-card {
          display: flex;
          flex-direction: column;
          padding: var(--space-8);
          position: relative;
        }

        .pricing-card--popular {
          border-color: var(--accent-primary);
          box-shadow: 0 0 24px var(--accent-glow);
          background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(79, 110, 247, 0.04) 100%);
        }

        .popular-badge {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          background: var(--accent-primary);
          color: var(--color-white);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          letter-spacing: var(--tracking-wide);
        }

        .pricing-name {
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
          margin: 0 0 var(--space-2);
        }

        .pricing-price-wrap {
          display: flex;
          align-items: baseline;
          gap: var(--space-1);
          margin-bottom: var(--space-3);
        }

        .price-amount {
          font-family: var(--font-display);
          font-size: var(--text-4xl);
          font-weight: var(--weight-extrabold);
          color: var(--text-primary);
        }

        .price-period {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }

        .pricing-description {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: 0;
          line-height: var(--leading-relaxed);
        }

        .pricing-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-3-5);
          margin-bottom: var(--space-8);
          padding: 0;
        }

        .pricing-feature-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2.5);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-snug);
        }

        .pricing-feature-item svg {
          margin-top: 2px;
          flex-shrink: 0;
        }

        /* FAQ Section */
        .faq-list {
          max-width: 48rem;
          margin-inline: auto;
          margin-top: var(--space-12);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .faq-item {
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color var(--duration-fast);
        }

        .faq-item:hover,
        .faq-item--active {
          border-color: var(--border-strong);
        }

        .faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: var(--text-base);
          font-weight: var(--weight-semibold);
          text-align: left;
          cursor: pointer;
          font-family: var(--font-body);
        }

        .faq-content {
          overflow: hidden;
        }

        .faq-content p {
          padding: 0 var(--space-6) var(--space-5);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: none;
        }

        /* Responsive Layouts */
        @media (max-width: 1024px) {
          .hero-layout {
            grid-template-columns: 1fr;
            gap: var(--space-12);
            text-align: center;
          }

          .hero-copy {
            align-items: center;
          }

          .hero-subtitle {
            max-width: 48ch;
          }

          .hero-ctas, .hero-trust {
            justify-content: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: var(--space-5);
          }

          .pricing-grid {
            grid-template-columns: 1fr;
            max-width: 32rem;
            margin-inline: auto;
            gap: var(--space-6);
          }
        }

        @media (max-width: 640px) {
          .hero-heading {
            font-size: 2.25rem;
          }

          .hero-ctas {
            flex-direction: column;
            width: 100%;
          }

          .hero-ctas .btn {
            width: 100%;
          }

          .pricing-card {
            padding: var(--space-6);
          }
        }
      `}</style>
    </div>
  );
}