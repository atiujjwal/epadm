import type { ReactNode } from "react";
import { MarketingChrome } from "./marketing-chrome";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <MarketingChrome>{children}</MarketingChrome>;
}
