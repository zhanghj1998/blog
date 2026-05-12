import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@/utils/constants";

export async function GET() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  const sorted = posts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: SITE.url,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.id}/`,
    })),
    customData: `<language>zh-cn</language>`,
  });
}
