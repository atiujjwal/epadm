import type { Metadata } from "next";
import "../styles.css";

export const metadata: Metadata = {
  title: "EPADM — AI School Operating System",
  description: "EPADM is the AI-powered operating system for schools.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
