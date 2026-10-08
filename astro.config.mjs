import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { redigera } from "./src/editor/plugin.js";

export default defineConfig({
  site: "https://kassapaplats.se",
  trailingSlash: "always",
  output: "static",
  integrations: [sitemap()],
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss(), redigera()],
  },
});
