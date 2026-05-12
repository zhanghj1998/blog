---
title: "个人博客搭建记录"
date: 2025-05-12
description: "从零搭建轻量博客全过程，技术选型、设计迭代、AI 资讯功能实现。"
tags: ["博客", "前端"]
---

## 动机

需要一个不受平台限制、内容不会消失、想写什么就写什么的地方。不想要臃肿的 CMS，也不想每个月为服务器付费。

## 选型过程

| 方案 | 结论 | 原因 |
|---|---|---|
| Astro | **选用** | 内容站点首选，零 JS 默认输出，Markdown 一等公民 |
| Next.js | 放弃 | 太重，博客不需要 React 运行时 |
| WordPress | 放弃 | 需要服务器和数据库维护 |
| Hugo / 11ty | 备选 | 模板语法不如 Astro 的 `.astro` 单文件组件直觉 |

最终栈：**Astro + Tailwind CSS v3 + Cloudflare Pages**，零服务器费用。

## 功能

### 博客基础

- Markdown 写文章，Git 版本控制
- 文章列表 + 标签筛选 + RSS 订阅
- 代码高亮（Shiki）
- 暗色模式跟随系统

### AI 资讯简报

每天自动生成 AI 行业简报，核心流程：

1. 构建时从 36氪、少数派拉取 AI 相关新闻
2. 调 DeepSeek API 做中文摘要，选出最重要的 6 条
3. 输出为静态 JSON，前端直接读本地文件

不依赖外部 API 服务，不担心被墙，每次 `npm run build` 自动更新。

### 设计迭代

经历了几轮调整：

- 初版太素，加了 indigo 主色调和渐变 Hero 区
- 内容区从 768px 扩到 1024px，解决两侧留白过大
- 文章排版加了下划线分隔的 h2、hover 高亮的表格行、圆角代码块

## 部署

推送到 GitHub，Cloudflare Pages 自动构建部署，免费无限流量。

```bash
git push  # 自动部署到 blog.pages.dev
```
