'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { scaleIn } from '@/lib/motion';
import { siteConfig } from '@/config/site';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  studentCount: string;
  message: string;
  consent: boolean;
}

const initialFields: FormFields = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  role: '',
  studentCount: '',
  message: '',
  consent: false,
};

type FieldErrors = Partial<Record<keyof FormFields, string>>;

function validateFields(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.firstName.trim()) errors.firstName = 'First name is required';
  if (!fields.lastName.trim()) errors.lastName = 'Last name is required';

  if (!fields.email.trim()) {
    errors.email = 'School email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!fields.company.trim()) errors.company = 'School name is required';
  if (!fields.role.trim()) errors.role = 'Your role is required';

  if (!fields.consent) {
    errors.consent = 'Please confirm you accept our privacy policy';
  }

  return errors;
}

export function DemoForm() {
  const [fields, setFields] = useState<FormFields>(initialFields);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});
  const [formState, setFormState] = useState<FormState>('idle');
  const [submitError, setSubmitError] = useState<string>('');

  const updateField = <K extends keyof FormFields>(key: K, value: FormFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const touchField = (key: keyof FormFields) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const fieldErrors = validateFields(fields);
    if (fieldErrors[key]) {
      setErrors((prev) => ({ ...prev, [key]: fieldErrors[key] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched = Object.keys(fields).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const fieldErrors = validateFields(fields);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      const firstError = Object.keys(fieldErrors)[0];
      document.getElementById(`field-${firstError}`)?.focus();
      return;
    }

    setFormState('submitting');
    setSubmitError('');

    try {
      const response = await fetch(siteConfig.demoFormEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          email: fields.email.trim().toLowerCase(),
          schoolName: fields.company.trim(),
          role: fields.role.trim(),
          studentCount: fields.studentCount,
          message: fields.message.trim(),
          consentTimestamp: new Date().toISOString(),
          source: 'demo-request-form',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Submission failed (${response.status})`);
      }

      setFormState('success');
      setFields(initialFields);
      setTouched({});
    } catch (err) {
      setFormState('error');
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again or email us directly.'
      );
    }
  };

  if (formState === 'success') {
    return (
      <m.div
        className="demo-form__success"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        role="status"
        aria-live="polite"
      >
        <div className="demo-form__success-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-500)" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 className="demo-form__success-title">Request received</h3>
        <p className="demo-form__success-body">
          Someone from the EPADM team will contact you within one business day to arrange a demo.
        </p>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => setFormState('idle')}
          style={{ marginTop: 'var(--space-4)' }}
        >
          Submit another request
        </button>
      </m.div>
    );
  }

  return (
    <form
      className="demo-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Request a demo"
    >
      <h2 className="demo-form__title">Schedule your walkthrough</h2>

      {/* Name row */}
      <div className="demo-form__row">
        <div className="form-group">
          <label className="form-label" htmlFor="field-firstName">
            First name <span aria-hidden="true">*</span>
          </label>
          <input
            id="field-firstName"
            type="text"
            autoComplete="given-name"
            className={`form-input${touched.firstName && errors.firstName ? ' form-input--error' : ''}`}
            value={fields.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            onBlur={() => touchField('firstName')}
            aria-required="true"
            aria-describedby={errors.firstName ? 'err-firstName' : undefined}
            aria-invalid={!!errors.firstName}
          />
          <AnimatePresence>
            {touched.firstName && errors.firstName && (
              <m.p
                id="err-firstName"
                className="form-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                role="alert"
              >
                {errors.firstName}
              </m.p>
            )}
          </AnimatePresence>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="field-lastName">
            Last name <span aria-hidden="true">*</span>
          </label>
          <input
            id="field-lastName"
            type="text"
            autoComplete="family-name"
            className={`form-input${touched.lastName && errors.lastName ? ' form-input--error' : ''}`}
            value={fields.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            onBlur={() => touchField('lastName')}
            aria-required="true"
            aria-describedby={errors.lastName ? 'err-lastName' : undefined}
            aria-invalid={!!errors.lastName}
          />
          <AnimatePresence>
            {touched.lastName && errors.lastName && (
              <m.p id="err-lastName" className="form-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="alert">
                {errors.lastName}
              </m.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Email */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-email">
          School email <span aria-hidden="true">*</span>
        </label>
        <input
          id="field-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          className={`form-input${touched.email && errors.email ? ' form-input--error' : ''}`}
          value={fields.email}
          onChange={(e) => updateField('email', e.target.value)}
          onBlur={() => touchField('email')}
          aria-required="true"
          aria-describedby={errors.email ? 'err-email' : undefined}
          aria-invalid={!!errors.email}
          placeholder="admin@yourschool.edu.in"
        />
        <AnimatePresence>
          {touched.email && errors.email && (
            <m.p id="err-email" className="form-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="alert">
              {errors.email}
            </m.p>
          )}
        </AnimatePresence>
      </div>

      {/* School + Role row */}
      <div className="demo-form__row">
        <div className="form-group">
          <label className="form-label" htmlFor="field-company">
            School Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="field-company"
            type="text"
            className={`form-input${touched.company && errors.company ? ' form-input--error' : ''}`}
            value={fields.company}
            onChange={(e) => updateField('company', e.target.value)}
            onBlur={() => touchField('company')}
            aria-required="true"
            aria-invalid={!!errors.company}
            placeholder="e.g. Delhi Public School"
          />
          <AnimatePresence>
            {touched.company && errors.company && (
              <m.p className="form-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="alert">
                {errors.company}
              </m.p>
            )}
          </AnimatePresence>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="field-role">
            Your role <span aria-hidden="true">*</span>
          </label>
          <input
            id="field-role"
            type="text"
            className={`form-input${touched.role && errors.role ? ' form-input--error' : ''}`}
            value={fields.role}
            onChange={(e) => updateField('role', e.target.value)}
            onBlur={() => touchField('role')}
            placeholder="e.g. Principal / Administrator"
            aria-required="true"
            aria-invalid={!!errors.role}
          />
          <AnimatePresence>
            {touched.role && errors.role && (
              <m.p className="form-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="alert">
                {errors.role}
              </m.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Student count */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-studentCount">
          Approx. Student Count
        </label>
        <select
          id="field-studentCount"
          className="form-select"
          value={fields.studentCount}
          onChange={(e) => updateField('studentCount', e.target.value)}
          style={{ color: fields.studentCount ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          <option value="" disabled>Select student count</option>
          <option value="under-500">Under 500 students</option>
          <option value="500-1500">500 – 1,500 students</option>
          <option value="1500-3000">1,500 – 3,000 students</option>
          <option value="3000+">3,000+ students</option>
        </select>
      </div>

      {/* Message */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-message">
          Additional school details (optional)
        </label>
        <textarea
          id="field-message"
          className="form-textarea"
          value={fields.message}
          onChange={(e) => updateField('message', e.target.value)}
          placeholder="Details about branches, current ERP software, biometric machines..."
          rows={4}
          maxLength={1000}
        />
      </div>

      {/* Consent */}
      <div className="demo-form__consent">
        <label className="demo-form__consent-label">
          <input
            type="checkbox"
            id="field-consent"
            checked={fields.consent}
            onChange={(e) => updateField('consent', e.target.checked)}
            onBlur={() => touchField('consent')}
            aria-required="true"
            aria-invalid={!!errors.consent}
            className="demo-form__consent-checkbox"
          />
          <span>
            I agree to the{' '}
            <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            . EPADM will use this information to contact me about your demo request.
          </span>
        </label>
        <AnimatePresence>
          {touched.consent && errors.consent && (
            <m.p className="form-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="alert">
              {errors.consent}
            </m.p>
          )}
        </AnimatePresence>
      </div>

      {/* Submit error */}
      <AnimatePresence>
        {formState === 'error' && (
          <m.div
            className="demo-form__submit-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            aria-live="assertive"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {submitError || 'Submission failed. Please try again.'}
          </m.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        className="btn btn--primary btn--lg w-full"
        disabled={formState === 'submitting'}
        aria-busy={formState === 'submitting'}
      >
        {formState === 'submitting' ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Scheduling walkthrough…
          </>
        ) : (
          <>
            Request a Demo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>

      <style>{`
        .demo-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .demo-form__title {
          font-size: var(--text-xl);
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
          margin: 0 0 var(--space-2);
          line-height: 1.2;
        }

        .demo-form__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .demo-form__consent {
          display: flex;
          flex-direction: column;
          gap: var(--space-1-5);
        }

        .demo-form__consent-label {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          cursor: pointer;
          line-height: var(--leading-relaxed);
        }

        .demo-form__consent-checkbox {
          margin-top: 3px;
          accent-color: var(--accent-primary);
          width: 16px;
          height: 16px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .demo-form__consent-label a {
          color: var(--accent-primary);
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .demo-form__submit-error {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          color: var(--color-error-500);
        }

        .demo-form__success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: var(--space-4);
          padding: var(--space-12) var(--space-8);
          min-height: 20rem;
        }

        .demo-form__success-icon {
          width: 4rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 50%;
        }

        .demo-form__success-title {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          color: var(--text-primary);
          margin: 0;
        }

        .demo-form__success-body {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: 32ch;
        }

        @media (max-width: 480px) {
          .demo-form__row { grid-template-columns: 1fr; }
        }
      `}</style>
    </form>
  );
}
