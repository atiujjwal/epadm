"use client";

import { useParams } from "next/navigation";
import { Route as Home } from "@/routes/index";
import { Route as Dashboard } from "@/routes/dashboard";
import { Route as Academics } from "@/routes/academics";
import { Route as Admin } from "@/routes/admin";
import { Route as Admissions } from "@/routes/admissions";
import { Route as AIStudio } from "@/routes/ai-studio";
import { Route as Attendance } from "@/routes/attendance";
import { Route as CMS } from "@/routes/cms";
import { Route as Communications } from "@/routes/communications";
import { Route as Exams } from "@/routes/exams";
import { Route as Fees } from "@/routes/fees";
import { Route as Intelligence } from "@/routes/intelligence";
import { Route as Labs } from "@/routes/labs";
import { Route as Library } from "@/routes/library";
import { Route as Mobile } from "@/routes/mobile";
import { Route as Payroll } from "@/routes/payroll";
import { Route as Settings } from "@/routes/settings";
import { Route as Staff } from "@/routes/staff";
import { Route as Students } from "@/routes/students";
import { Route as Timetable } from "@/routes/timetable";
import { Route as Vehicles } from "@/routes/vehicles";

const routes = { dashboard: Dashboard, academics: Academics, admin: Admin, admissions: Admissions, "ai-studio": AIStudio, attendance: Attendance, cms: CMS, communications: Communications, exams: Exams, fees: Fees, intelligence: Intelligence, labs: Labs, library: Library, mobile: Mobile, payroll: Payroll, settings: Settings, staff: Staff, students: Students, timetable: Timetable, vehicles: Vehicles } as const;

export default function RoutePage() {
  const params = useParams<{ slug?: string[] }>();
  const slug = params.slug?.join("/") ?? "";
  const route = slug ? routes[slug as keyof typeof routes] : Home;
  const Component = route?.options.component;
  if (!Component) return <main className="grid min-h-screen place-items-center">404 — Page not found</main>;
  return <Component />;
}
