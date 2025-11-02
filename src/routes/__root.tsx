/// <reference types="vite/client" />

import geistWoff2 from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import geistMonoWoff2 from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type * as React from "react";
import { Toaster } from "sonner";
import { DefaultCatchBoundary } from "~/components/default-catch-boundary";
import { NotFound } from "~/components/not-found";
import { seo } from "~/lib/seo";
import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "local-chat.ras.sh - Local LLM Chat",
        description:
          "Local-only LLM chat application powered by Transformers.js. Your conversations stay in your browser, never sent to external servers.",
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: geistWoff2,
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: geistMonoWoff2,
        crossOrigin: "anonymous",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [
      {
        src: "https://u.tronite.com/script.js",
        defer: true,
        "data-website-id": "84175d66-3d90-4758-89a7-a82f213293a6",
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="dark min-h-dvh font-sans text-foreground antialiased">
        {children}
        <Toaster position="top-center" richColors />
        <Scripts />
      </body>
    </html>
  );
}
