import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { redigera } from "./src/editor/plugin.js";

export default defineConfig({
  site: "https://kassapaplats.se",
  output: "static",
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss(), redigera()],
  },
});
