"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Users,
  Wallet,
  BookOpenCheck,
  Bus,
  Smartphone,
  MessageSquare,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const modules = [
  { icon: Users, title: "Students & Staff", body: "Rich records, bulk imports, promotions, siblings, ID cards and registers." },
  { icon: BookOpenCheck, title: "Academics & Exams", body: "Timetable v2, marks entry, marksheets, hall tickets and topper analytics." },
  { icon: Wallet, title: "Fees & Payroll", body: "Structures, dues, reminders, salary cycles, statutory filings and bank exports." },
  { icon: Bus, title: "Transport & Facilities", body: "Vehicles, routes, library, labs, chemicals, safety and vendor POs." },
  { icon: MessageSquare, title: "Communications", body: "SMS, WhatsApp, Email and in-app notices with templates and delivery logs." },
  { icon: Smartphone, title: "Mobile apps", body: "Parent / Student / Teacher apps with feature flags, branding and adoption analytics." },
];

const aiCapabilities = [
  "AI Notice Composer — tone, audience, language",
  "Syllabus Drafter aligned to CBSE / ICSE / State boards",
  "Exam & Test Creator with blueprint balancing",
  "Question bank + auto worksheets & homework",
  "Report Card Comment generator per student",
  "Role-specific copilots for Principal, Teacher, Parent",
];

const plans = [
  { name: "Essentials", desc: "Small schools · up to 500 students", price: "₹18", features: ["Core academics", "Fees & communications", "Parent app", "Standard support"] },
  { name: "Professional", desc: "Growing schools · up to 2,000 students", price: "₹28", features: ["Everything in Essentials", "Payroll & transport", "Library & Labs", "AI Studio (5k credits)"], featured: true },
  { name: "Enterprise", desc: "Multi-campus & groups", price: "Custom", features: ["Everything in Pro", "Unlimited AI credits", "SSO / SAML", "SLA + dedicated CSM"] },
];

export function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold tracking-tight">EPADM</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">School OS</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-[12px] text-muted-foreground">
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#ai" className="hover:text-foreground">AI Studio</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#security" className="hover:text-foreground">Security</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-[12px] text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Button href="/login" size="sm" className="h-8 text-[12px]">
              Sign in <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero + Login */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent)_0%,transparent_60%)] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> AI-first · Enterprise grade · Built for K-12
            </div>
            <h1 className="mt-5 text-[42px] leading-[1.05] font-semibold tracking-tight">
              The operating system for<br />modern schools.
            </h1>
            <p className="mt-4 text-[14px] text-muted-foreground max-w-lg leading-relaxed">
              Admissions to alumni — every student, teacher, rupee and bus in one workspace.
              Purpose-built AI drafts your notices, syllabi, exams and report card comments while
              monitors watch dues, attendance and results in real time.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/login" className="h-10 text-[13px]">
                Sign in to your school <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <a href="#platform" className="text-[13px] text-muted-foreground hover:text-foreground">
                Explore the platform →
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
              {[
                ["220+", "Schools live"],
                ["1.4M", "Students on parent app"],
                ["99.98%", "Uptime · 12 mo"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="text-[20px] font-semibold font-mono tabular-nums">{v}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Login card */}
          <div id="login" className="justify-self-center w-full max-w-sm">
            <div className="rounded-lg border bg-surface shadow-lg p-6">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">School sign in</div>
              <h2 className="text-[18px] font-semibold tracking-tight mt-1">Welcome back</h2>
              <p className="text-[12px] text-muted-foreground mt-1">Use your school workspace email.</p>

              <form className="mt-5 space-y-3" onSubmit={handleLoginSubmit}>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground" htmlFor="landing-email">
                    Email
                  </label>
                  <Input
                    id="landing-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                    className="h-9 mt-1 text-[13px]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-muted-foreground" htmlFor="landing-password">
                      Password
                    </label>
                    <Link href="/login" className="text-[10px] text-muted-foreground hover:text-foreground">
                      Forgot?
                    </Link>
                  </div>
                  <Input
                    id="landing-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="h-9 mt-1 text-[13px]"
                  />
                </div>
                <Button type="submit" className="w-full h-9 text-[13px] mt-2">
                  Continue
                </Button>
                <div className="relative py-1">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                  <div className="relative text-center text-[10px] uppercase tracking-wider text-muted-foreground bg-surface w-fit mx-auto px-2">
                    or
                  </div>
                </div>
                <Button href="/login" variant="outline" className="w-full h-9 text-[13px]">
                  Sign in with SSO
                </Button>
              </form>

              <div className="mt-5 pt-4 border-t text-[11px] text-muted-foreground">
                New school onboarding is handled by your EPADM partner. No public signup.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="border-t bg-surface-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-[11px] uppercase tracking-wider text-primary font-medium">The platform</div>
            <h2 className="text-[28px] font-semibold tracking-tight mt-2">Every workflow a school actually runs.</h2>
            <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">
              Replace 8-12 disconnected tools with one operating system. Every module is dense, keyboard-first
              and export-ready — designed for the people who run schools, not the ones who sell software.
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden border">
            {modules.map((m) => (
              <div key={m.title} className="bg-surface p-5">
                <div className="h-8 w-8 rounded-md bg-accent grid place-items-center">
                  <m.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-[13px] font-semibold mt-3">{m.title}</div>
                <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-primary font-medium">AI Studio</div>
            <h2 className="text-[28px] font-semibold tracking-tight mt-2">AI that does the work — not a chatbot bolted on.</h2>
            <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed">
              Every generator is grounded on your own policies, syllabi and academic records. Copilots live inside
              the workflows you already use — composing notices, drafting exams, generating personalised report card
              comments and answering parent queries on the mobile app.
            </p>
            <div className="mt-6 flex gap-3">
              <Button href="/login" className="h-9 text-[13px]">
                Explore AI Studio <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
          <ul className="space-y-2.5">
            {aiCapabilities.map((c) => (
              <li key={c} className="flex items-start gap-2 rounded-md border bg-surface p-3 text-[12px]">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t bg-surface-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-[11px] uppercase tracking-wider text-primary font-medium">Pricing</div>
            <h2 className="text-[28px] font-semibold tracking-tight mt-2">One transparent price per student, per month.</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-lg border bg-surface p-6 ${p.featured ? "ring-2 ring-primary" : ""}`}>
                {p.featured && (
                  <div className="text-[10px] uppercase tracking-wider text-primary font-medium mb-2">Most popular</div>
                )}
                <div className="text-[15px] font-semibold">{p.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-[28px] font-semibold tabular-nums font-mono">{p.price}</span>
                  {p.price !== "Custom" && (
                    <span className="text-[12px] text-muted-foreground">/ student / mo</span>
                  )}
                </div>
                <ul className="mt-5 space-y-2 text-[12px]">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  href="/contact"
                  className="w-full mt-6 h-9 text-[13px]"
                  variant={p.featured ? "primary" : "outline"}
                >
                  Talk to us
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: "SOC 2 · ISO 27001", body: "Independent audit, role-based access, encryption at rest and in transit." },
            { icon: Zap, title: "99.98% uptime", body: "Region-scoped isolation, disaster recovery and per-tenant backups every hour." },
            { icon: Sparkles, title: "Data stays yours", body: "AI grounded on your data, never used for foundation training. Full audit trail." },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border bg-surface p-5">
              <f.icon className="h-5 w-5 text-primary" />
              <div className="text-[13px] font-semibold mt-3">{f.title}</div>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <div>© 2026 EPADM Technologies · All rights reserved.</div>
          <div className="flex gap-5">
            <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
            <a href="#" className="hover:text-foreground">Status</a>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
