import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Audit Feedback System",
    short_name: "Audit Feedback",
    description: "Anonymous store feedback and analytics dashboard.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4efe6",
    theme_color: "#c96838",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
