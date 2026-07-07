"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  // next-themes injects an inline <script> to set the theme class before
  // paint (avoiding a flash of the wrong theme). React 19 warns about
  // rendering <script> tags from components on the client, since it only
  // executes scripts inline during the initial server-rendered HTML. Using
  // a non-executable type client-side keeps the SSR flash-prevention script
  // intact while silencing the (harmless) client-side re-render warning.
  const scriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider scriptProps={scriptProps} {...props}>
      {children}
    </NextThemesProvider>
  );
}
