export const seo = (title: string, description: string) => ({
  meta: [
    { title: `${title} — IRONHAUS Gym OS` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — IRONHAUS Gym OS` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
