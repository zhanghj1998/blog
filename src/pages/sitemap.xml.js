import { getCollection } from "astro:content";
import { SITE } from "@/utils/constants";

export async function GET() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);

  const staticPages = ["", "/posts", "/tags", "/about"];

  const urls = [
    ...staticPages.map(
      (path) => `
    <url>
      <loc>${SITE.url}${path}</loc>
      <changefreq>weekly</changefreq>
      <priority>${path === "" ? "1.0" : "0.8"}</priority>
    </url>`
    ),
    ...posts.map(
      (post) => `
    <url>
      <loc>${SITE.url}/posts/${post.id.replace(/\.md$/, "")}</loc>
      <lastmod>${post.data.date.toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`
    ),
  ];

  const tags = new Set(posts.flatMap((p) => p.data.tags));
  for (const tag of tags) {
    urls.push(`
    <url>
      <loc>${SITE.url}/tags/${tag}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.5</priority>
    </url>`);
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`.trim(),
    {
      headers: { "Content-Type": "application/xml" },
    }
  );
}
