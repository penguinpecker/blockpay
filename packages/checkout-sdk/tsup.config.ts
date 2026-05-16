import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "index.browser": "src/index.browser.ts",
    invoices: "src/invoices.ts",
    "payment-links": "src/payment-links.ts",
    webhooks: "src/webhooks.ts",
    receipts: "src/receipts.ts",
    types: "src/types.ts",
    transport: "src/transport.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,
  splitting: false,
  treeshake: true,
  target: "es2022",
  platform: "neutral",
  external: ["node:crypto", "viem"],
});
