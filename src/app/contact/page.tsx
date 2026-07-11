'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { scaleIn } from '@/lib/motion';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Valid email is required';
    }
    if (!message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setFormState('submitting');
    try {
      const res = await fetch(siteConfig.contactFormEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          source: 'contact-form'
        }),
      });
      if (!res.ok) throw new Error();
      setFormState('success');
    } catch {
      setFormState('error');
      setSubmitError('Something went wrong. Please try again or email us directly.');
    }
  };

  return (
    <div className="contact-page">
      <div className="container contact-page__layout">
        {/* Left column */}
        <div className="contact-page__info">
          <Badge variant="accent" style={{ marginBottom: 'var(--space-4)' }}>Contact Us</Badge>
          <h1 className="contact-page__heading">Get in touch</h1>
          <p className="contact-page__body">
            Have questions about billing, integrations, biometric machine support (ADMS), or how our platform maps to CBSE/ICSE regulatory norms? Drop us a line.
          </p>

          <div className="contact-page__channels">
            <a href={`mailto:${siteConfig.contactEmail}`} className="contact-page__channel">
              <div className="contact-page__channel-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <span className="contact-page__channel-label">Email Support</span>
                <span className="contact-page__channel-value">{siteConfig.contactEmail}</span>
              </div>
            </a>

            <Link href="/demo" className="contact-page__channel">
              <div className="contact-page__channel-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <div>
                <span className="contact-page__channel-label">Request a demo</span>
                <span className="contact-page__channel-value">Talk to an onboarding specialist</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Right column — Form */}
        <Card variant="elevated" padding="lg" className="contact-page__form-wrap">
          {formState === 'success' ? (
            <m.div className="contact-page__success" variants={scaleIn} initial="hidden" animate="visible" role="status">
              <div className="contact-page__success-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3>Message sent</h3>
              <p>Someone from the EPADM team will get back to you within 24 hours.</p>
            </m.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
              <div className="form-group">
                <Label htmlFor="contact-name">Name *</Label>
                <Input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                  autoComplete="name"
                  aria-required="true"
                  error={!!errors.name}
                />
                {errors.name && <p className="form-error" role="alert">{errors.name}</p>}
              </div>

              <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                <Label htmlFor="contact-email">School Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                  autoComplete="email"
                  aria-required="true"
                  error={!!errors.email}
                />
                {errors.email && <p className="form-error" role="alert">{errors.email}</p>}
              </div>

              <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  placeholder="e.g. CBSE multi-branch setup"
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                <Label htmlFor="contact-message">Message *</Label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={e => { setMessage(e.target.value); setErrors(prev => ({ ...prev, message: '' })); }}
                  rows={5}
                  placeholder="Details about your school size, current ERP system..."
                  aria-required="true"
                  error={!!errors.message}
                />
                {errors.message && <p className="form-error" role="alert">{errors.message}</p>}
              </div>

              <AnimatePresence>
                {formState === 'error' && (
                  <m.p className="form-error" style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="alert">
                    {submitError}
                  </m.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                style={{ marginTop: 'var(--space-6)' }}
                disabled={formState === 'submitting'}
                aria-busy={formState === 'submitting'}
              >
                {formState === 'submitting' ? <><span className="spinner" aria-hidden="true" />Sending…</> : 'Send message'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}