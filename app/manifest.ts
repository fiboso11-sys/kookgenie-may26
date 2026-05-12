import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KookGenie",
    short_name: "KookGenie",
    description: "Cook Smart. Live Healthy. Nutrition, recipes, and tracking.",
    id: "/",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#f5f5f5",
    theme_color: "#16a34a",
    orientation: "portrait-primary",
    categories: ["health", "food", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      { name: "Log food", short_name: "Food", url: "/food-logs", description: "Calorie tracker" },
      { name: "Water", short_name: "Water", url: "/water", description: "Hydration" },
      { name: "Health", short_name: "Health", url: "/health", description: "Progress" },
    ],
  };
}
