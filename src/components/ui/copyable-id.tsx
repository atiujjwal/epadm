"use client";

import { useState, useCallback } from "react";

export interface CopyableIdProps {
  label: string;
  value: string;
  truncate?: boolean;
}

export function CopyableId({ label, value, truncate = true }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value]);

  const displayed = truncate && value.length > 12
    ? `${value.slice(0, 8)}…${value.slice(-4)}`
    : value;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex w-full items-center justify-between gap-3 text-xs text-slate-500 hover:text-slate-900 transition-colors duration-150 py-1 text-left font-normal focus:outline-none group"
      title={`Copy ${label}: ${value}`}
    >
      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] shrink-0">
        {label}
      </span>
      <span className="font-mono text-slate-700 bg-slate-100/80 px-1.5 py-0.5 rounded truncate select-all ml-auto max-w-[180px]">
        {displayed}
      </span>
      {copied ? (
        <svg
          className="h-3.5 w-3.5 text-emerald-600 shrink-0"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors duration-150"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export default CopyableId;
