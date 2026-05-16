import type { ReactNode } from "react";

/**
 * Scopes a section of the page to the Vault palette by setting
 * the palette CSS variables. Use to wrap marketing pages.
 */
export function PaletteScope({
  children,
  palette = "vault",
}: {
  children: ReactNode;
  palette?: "vault" | "stealth" | "aurora";
}) {
  return (
    <div
      className={`palette-${palette}`}
      style={{ minHeight: "100vh", background: "var(--bg)" }}
    >
      {children}
    </div>
  );
}
