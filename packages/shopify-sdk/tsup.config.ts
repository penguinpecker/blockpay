import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    theme: "src/theme.ts",
    "theme.browser": "src/theme.browser.ts",
    app: "src/app.ts",
    webhooks: "src/webhooks.ts",
    types: "src/types.ts",
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
  external: ["node:crypto", "@blockpay/checkout"],
});
