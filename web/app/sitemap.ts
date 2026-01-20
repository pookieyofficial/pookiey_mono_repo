import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pookiey.com";

  const routes = [
    "",
    "/auth",
    "/dashboard",
    "/privacy-policy",
    "/support",
    "/admin",
    "/admin/users",
    "/admin/payments",
    "/admin/reports",
    "/admin/interactions",
    "/admin/locations",
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changefreq: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.7,
  }));
}

