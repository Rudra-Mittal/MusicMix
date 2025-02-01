"use client";
import dynamic from "next/dynamic";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const DynamicThemeProvider = dynamic(
  () => import("next-themes").then(mod => mod.ThemeProvider),
  { ssr: false }
);

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <DynamicThemeProvider {...props}>{children}</DynamicThemeProvider>;
}