import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** PWA / Workbox output — do not lint generated bundles. */
const generatedPublicIgnores = [
  "public/sw.js",
  "public/workbox-*.js",
  "public/fallback-*.js",
];

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "next-env.d.ts",
      ...generatedPublicIgnores,
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
