"use client";

import { useState } from "react";
import { Check, Printer, Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href.split("?")[0];
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or share failed — fall back to copying.
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={share} className="btn-secondary">
      {copied ? <Check className="size-4 text-emerald-600" /> : <Share2 className="size-4" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-secondary" aria-label="Print recipe">
      <Printer className="size-4" />
    </button>
  );
}
