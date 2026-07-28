'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { scaleIn } from '@/lib/motion';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';
import { FormErrorSummary } from '@/components/ui/form-error-summary';

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
  if (!fields.consent) errors.consent = 'Please confirm you accept our privacy policy';

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

    setTouched(Object.keys(fields).reduce((acc, key) => ({ ...acc, [key]: true }), {}) as Partial<Record<keyof FormFields, boolean>>);

    const fieldErrors = validateFields(fields);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      const firstError = Object.keys(fieldErrors)[0] as keyof FormFields;
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
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        role="status"
        aria-live="polite"
      >
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900">Request received</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Someone from the EPADM team will contact you within one business day to arrange a demo.
        </p>
        <Button
          variant="ghost"
          className="mt-6"
          onClick={() => setFormState('idle')}
          type="button"
        >
          Submit another request
        </Button>
      </m.div>
    );
  }

  const inputBase = 'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2';
  const formErrors = Array.from(
    new Set(
      [...Object.values(errors), submitError].filter(
        (error): error is string => Boolean(error),
      ),
    ),
  );

  return (
    <form
      className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Request a demo"
    >
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Schedule your walkthrough</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Our team will help you get started with a live demo tailored to your school.
        </p>
      </div>

      <FormErrorSummary errors={formErrors} />

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { id: 'firstName', label: 'First name', type: 'text', autoComplete: 'given-name', value: fields.firstName, onChange: (value: string) => updateField('firstName', value) },
          { id: 'lastName', label: 'Last name', type: 'text', autoComplete: 'family-name', value: fields.lastName, onChange: (value: string) => updateField('lastName', value) },
        ].map((field) => {
          const error = touched[field.id as keyof FormFields] && errors[field.id as keyof FormFields];
          return (
            <div key={field.id} className="space-y-2">
              <label className="text-sm font-medium text-slate-900" htmlFor={`field-${field.id}`}>
                {field.label} <span aria-hidden="true">*</span>
              </label>
              <input
                id={`field-${field.id}`}
                type={field.type}
                autoComplete={field.autoComplete}
                className={`${inputBase} ${error ? 'border-rose-500 ring-rose-100' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'}`}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={() => touchField(field.id as keyof FormFields)}
                aria-required="true"
                aria-describedby={error ? `err-${field.id}` : undefined}
                aria-invalid={!!error}
              />
              <AnimatePresence>
                {error && (
                  <m.p
                    id={`err-${field.id}`}
                    className="text-sm text-rose-600"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    role="alert"
                  >
                    {error}
                  </m.p>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="field-email">
            School email <span aria-hidden="true">*</span>
          </label>
          <input
            id="field-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className={`${inputBase} ${touched.email && errors.email ? 'border-rose-500 ring-rose-100' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'}`}
            value={fields.email}
            onChange={(e) => updateField('email', e.target.value)}
            onBlur={() => touchField('email')}
            placeholder="admin@yourschool.edu.in"
            aria-required="true"
            aria-describedby={errors.email ? 'err-email' : undefined}
            aria-invalid={!!errors.email}
          />
          <AnimatePresence>
            {touched.email && errors.email && (
              <m.p
                id="err-email"
                className="text-sm text-rose-600"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                role="alert"
              >
                {errors.email}
              </m.p>
            )}
          </AnimatePresence>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            { id: 'company', label: 'School Name', placeholder: 'e.g. Delhi Public School', value: fields.company, onChange: (value: string) => updateField('company', value) },
            { id: 'role', label: 'Your role', placeholder: 'e.g. Principal / Administrator', value: fields.role, onChange: (value: string) => updateField('role', value) },
          ].map((field) => {
            const error = touched[field.id as keyof FormFields] && errors[field.id as keyof FormFields];
            return (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-medium text-slate-900" htmlFor={`field-${field.id}`}>
                  {field.label} <span aria-hidden="true">*</span>
                </label>
                <input
                  id={`field-${field.id}`}
                  type="text"
                  className={`${inputBase} ${error ? 'border-rose-500 ring-rose-100' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'}`}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={() => touchField(field.id as keyof FormFields)}
                  placeholder={field.placeholder}
                  aria-required="true"
                  aria-invalid={!!error}
                />
                <AnimatePresence>
                  {error && (
                    <m.p
                      className="text-sm text-rose-600"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      role="alert"
                    >
                      {error}
                    </m.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="field-studentCount">
            Approx. Student Count
          </label>
          <select
            id="field-studentCount"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            value={fields.studentCount}
            onChange={(e) => updateField('studentCount', e.target.value)}
          >
            <option value="" disabled>Select student count</option>
            <option value="under-500">Under 500 students</option>
            <option value="500-1500">500 – 1,500 students</option>
            <option value="1500-3000">1,500 – 3,000 students</option>
            <option value="3000+">3,000+ students</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="field-message">
            Additional school details (optional)
          </label>
          <textarea
            id="field-message"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            value={fields.message}
            onChange={(e) => updateField('message', e.target.value)}
            placeholder="Details about branches, current ERP software, biometric machines..."
            rows={4}
            maxLength={1000}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <label className="flex items-start gap-3 text-sm font-medium text-slate-900">
          <input
            type="checkbox"
            id="field-consent"
            checked={fields.consent}
            onChange={(e) => updateField('consent', e.target.checked)}
            onBlur={() => touchField('consent')}
            aria-required="true"
            aria-invalid={!!errors.consent}
            className="mt-1 h-5 w-5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          <span className="text-sm font-normal text-slate-700">
            I agree to the{' '}
            <a className="font-semibold text-slate-900 underline" href="/legal/privacy" target="_blank" rel="noopener noreferrer">
              privacy policy
            </a>.
          </span>
        </label>
        {touched.consent && errors.consent && (
          <p className="text-sm text-rose-600" role="alert">
            {errors.consent}
          </p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-rose-600" role="alert">
          {submitError}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" variant="primary" className="w-full sm:w-auto">
          {formState === 'submitting' ? 'Submitting…' : 'Request demo'}
        </Button>
        <p className="text-sm text-slate-500">
          We will never share your information. This request is only used to book a demo.
        </p>
      </div>
    </form>
  );
}
