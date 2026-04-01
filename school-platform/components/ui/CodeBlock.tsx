"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  lang?: string;
}

// Shiki injects inline background-color/color on the <pre> and <code> tags.
// We strip those so our CSS variables (via .shiki-wrapper) control the palette.
function stripInlineStyles(html: string): string {
  return html
    .replace(/<pre([^>]*?) style="[^"]*"([^>]*)>/g, "<pre$1$2>")
    .replace(/<code([^>]*?) style="[^"]*"([^>]*)>/g, "<code$1$2>");
}

export function CodeBlock({ code, lang = "text" }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Normalise language tag: shiki uses lowercase IDs, strip any leading dot
    const normLang = (lang ?? "text").toLowerCase().replace(/^\./, "") || "text";

    codeToHtml(code, {
      lang: normLang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,   // emit both light + dark CSS vars
    })
      .then((result) => {
        if (!cancelled) setHtml(stripInlineStyles(result));
      })
      .catch(() => {
        // Fallback: re-try as plain text
        if (cancelled) return;
        codeToHtml(code, {
          lang: "text",
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
        })
          .then((r) => { if (!cancelled) setHtml(stripInlineStyles(r)); })
          .catch(() => { if (!cancelled) setHtml(null); });
      });

    return () => { cancelled = true; };
  }, [code, lang]);

  if (!html) {
    // Plain fallback while shiki is loading
    return (
      <pre className="overflow-x-auto rounded-xl bg-muted border border-border px-5 py-4 text-sm font-mono text-foreground">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      // shiki wraps output in a <pre><code>; we override its inline styles with
      // CSS variables so it respects the design-system light/dark palette.
      className="shiki-wrapper not-prose overflow-x-auto rounded-xl border border-border text-sm"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
