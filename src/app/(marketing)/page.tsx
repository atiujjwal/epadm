import type { Metadata } from "next";
import { LandingPage } from "./landing-page";

export const metadata: Metadata = {
  title: "EPADM — AI School Operating System",
  description:
    "EPADM is the AI-first operating system for K-12 schools. Admissions, attendance, fees, exams, communications and mobile apps in one enterprise workspace.",
  openGraph: {
    title: "EPADM — AI School Operating System",
    description:
      "One platform for admissions, attendance, fees, exams, communications, transport and parent/teacher mobile apps — powered by purpose-built AI.",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
