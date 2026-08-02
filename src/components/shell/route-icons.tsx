"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Bus,
  Calculator,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  ListTodo,
  MessageSquare,
  Package,
  Settings,
  Smartphone,
  Sparkles,
  TrendingUp,
  Trophy,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import type { RouteIconKey } from "@/lib/navigation/route-registry";

const routeIcons: Record<RouteIconKey, LucideIcon> = {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Bus,
  Calculator,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  ListTodo,
  MessageSquare,
  Package,
  Settings,
  Smartphone,
  Sparkles,
  TrendingUp,
  Trophy,
  UserCog,
  Users,
  Wrench,
};

export function getRouteIcon(iconKey?: RouteIconKey): LucideIcon | undefined {
  return iconKey ? routeIcons[iconKey] : undefined;
}
