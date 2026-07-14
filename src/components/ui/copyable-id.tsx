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
      className="copyable-id"
      title={`Copy ${label}: ${value}`}
    >
      <span className="copyable-id__label">{label}</span>
      <span className="copyable-id__value">
        <code>{displayed}</code>
      </span>
      {copied ? (
        <svg
          className="copyable-id__icon copyable-id__icon--success"
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
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          className="copyable-id__icon"
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
