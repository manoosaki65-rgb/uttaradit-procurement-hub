import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ระบบงานพัสดุ โรงพยาบาลอุตรดิตถ์",
    short_name: "ระบบงานพัสดุ",
    description: "ศูนย์รวมระบบงานพัสดุ โรงพยาบาลอุตรดิตถ์",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b6f93",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
    ]
  };
}
