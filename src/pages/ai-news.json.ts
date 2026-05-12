/**
 * 构建时生成 AI 资讯摘要
 * 拉取 RSS → DeepSeek 总结 → 输出静态 JSON
 */
export const prerender = true;

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_KEY = import.meta.env.DEEPSEEK_API_KEY;

const FEEDS = [
  "https://www.36kr.com/feed",
  "https://sspai.com/feed",
];

const AI_KW = [
  "AI", "人工智能", "GPT", "ChatGPT", "大模型", "LLM",
  "OpenAI", "Claude", "Gemini", "DeepSeek", "Copilot",
  "机器学习", "深度学习", "智能体", "Agent", "算力", "GPU",
  "芯片", "英伟达", "NVIDIA", "文心一言", "通义千问", "豆包", "Kimi",
];

interface Article {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

interface SummaryItem {
  id: number;
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  source: string;
}

async function fetchRSS(url: string, source: string): Promise<Article[]> {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) return [];
    const data = (await resp.json()) as { status: string; items: any[] };
    if (data.status !== "ok") return [];
    return data.items.map((item: any) => ({
      title: item.title,
      description: (item.description || "").replace(/<[^>]*>/g, "").trim(),
      link: item.link,
      pubDate: item.pubDate,
      source,
    }));
  } catch {
    return [];
  }
}

async function summarize(articles: Article[]): Promise<SummaryItem[]> {
  const articleText = articles
    .map((a, i) => `${i + 1}. 【${a.title}】${a.description.slice(0, 200)}`)
    .join("\n\n");

  const prompt = `你是AI行业资深编辑。根据以下今日AI新闻，写一份"今日AI资讯简报"。

要求：
1. 选出最重要的 6 条
2. 每条用1-2句中文总结核心要点
3. 用JSON格式输出

输出格式严格为JSON数组：
[{"id":1,"title":"简短标题(20字内)","summary":"要点总结(60-100字)"}, ...]

新闻列表：
${articleText}`;

  const resp = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是专业的AI资讯编辑，回复严格使用JSON格式，不要带markdown标记。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!resp.ok) throw new Error(`DeepSeek API error: ${resp.status}`);
  const data = (await resp.json()) as any;
  const content: string = data.choices[0].message.content;
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");
  const items: any[] = JSON.parse(jsonMatch[0]);

  return items.map((item, idx) => {
    const src = articles[idx] || articles[0];
    return {
      id: item.id || idx + 1,
      title: item.title,
      summary: item.summary,
      link: src.link,
      pubDate: src.pubDate,
      source: src.source,
    };
  });
}

export async function GET() {
  try {
    const results = await Promise.all(
      FEEDS.map((url, i) => fetchRSS(url, i === 0 ? "36氪" : "少数派"))
    );
    const allArticles = results.flat();

    // Filter AI-related
    const aiArticles = allArticles.filter((a) =>
      AI_KW.some((kw) => a.title.includes(kw) || a.description.includes(kw))
    );

    // Deduplicate + sort
    const seen = new Set<string>();
    const unique = aiArticles.filter((a) => {
      if (seen.has(a.link)) return false;
      seen.add(a.link);
      return true;
    });
    unique.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    const top = unique.slice(0, 8);
    const items = top.length > 0 ? await summarize(top) : [];

    return new Response(
      JSON.stringify({
        updated: new Date().toISOString(),
        items,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message, items: [] }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
