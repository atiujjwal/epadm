"use client";

import NextLink from "next/link";
import { usePathname, useRouter as useNextRouter, useSearchParams } from "next/navigation";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

type Destination = { to: string; search?: Record<string, string | undefined>; replace?: boolean };

/** Minimal App Router bridge that lets the preserved route UI keep its router API. */
export function createFileRoute(_path: string) {
  return <T extends object>(options: T) => ({ options });
}

export function Link({ to, children, ...props }: PropsWithChildren<{ to: string } & AnchorHTMLAttributes<HTMLAnchorElement>>) {
  return <NextLink href={to} {...props}>{children}</NextLink>;
}

function useNavigation() {
  const router = useNextRouter();
  const pathname = usePathname();
  return ({ to, search, replace }: Destination) => {
    const query = search
      ? `?${new URLSearchParams(Object.entries(search).filter(([, value]) => value !== undefined) as [string, string][]).toString()}`
      : "";
    const href = `${to || pathname}${query}`;
    if (replace) router.replace(href); else router.push(href);
  };
}

export function useNavigate() {
  return useNavigation();
}

export function useRouter() {
  return { navigate: useNavigation(), invalidate: () => window.location.reload() };
}

export function useRouterState<T>({ select }: { select: (state: { location: { pathname: string; searchStr: string } }) => T }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();
  return select({ location: { pathname, searchStr: query ? `?${query}` : "" } });
}
