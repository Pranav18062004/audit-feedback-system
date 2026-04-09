import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Audit Feedback System",
    short_name: "Audit Feedback",
    description: "Authenticated store feedback and analytics dashboard.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f5f6",
    theme_color: "#f5333f",
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
