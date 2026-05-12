/** 站点全局配置，改这里即可 */
export const SITE = {
  /** 博客名称 */
  title: "Zeal-Hope-Journey",
  /** 首页简介 */
  description: "写写字，记录所学所想",
  /** 作者名 */
  author: "jaysong",
  /** 部署后的域名 */
  url: "https://blog.timoorjzhj.workers.dev/",
  /** 页面语言 */
  lang: "zh-CN",
  /** 文章列表每页条数 */
  postsPerPage: 10,
  /** 是否开启首页 AI 资讯简报（构建时会调 DeepSeek API） */
  showAINews: true,
} as const;
