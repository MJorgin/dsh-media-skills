# 示例 · Examples

本目录提供两类示例素材，方便你验证 `dsh-media-skills` 的读图与生图能力。
This folder ships two kinds of sample material for verifying `dsh-media-skills`.

## 🎨 生成示例 · Generated images（`examples/generated/`）

全部由 `media-tools`（SiliconFlow Kolors，免费）生成，使用的提示词如下——你可以复制提示词重新生成，或直接用它们测试读图。
All generated with `media-tools` (SiliconFlow Kolors, free). Prompts below — regenerate them or use the images to test reading.

| 图片 | 提示词 Prompt |
|---|---|
| cat-astronaut.jpg | 一只戴着宇航员头盔的橘猫，星空背景，卡通风格，高清 / a cat in a space helmet, starry sky, cartoon style |
| cyberpunk.jpg | 赛博朋克城市夜景，霓虹灯，雨夜反光，电影感，高清 / cyberpunk city night, neon, rain reflections |
| ink-landscape.jpg | 水墨风格中国山水画，孤舟蓑笠翁，留白意境，高清 / Chinese ink landscape, lone boat, empty-space aesthetic |
| laptop-poster.jpg | 极简产品海报，白色笔记本电脑，柔和阴影，浅色背景，高清 / minimal product poster, white laptop |
| fox-forest.jpg | a watercolor fox sitting in an autumn forest, soft warm light, storybook illustration style |
| cozy-room.jpg | isometric cozy room at night with warm lamp light, a cat sleeping on the desk, soft pastel colors, clean illustration |

## 🔍 读图测试卡 · Vision test card（`examples/vision-test-card.png`）

一张人工构造的「界面截图」：包含标题、说明文字、两个按钮、柱状图四个数值（Q1=210 / Q2=270 / Q3=450 / Q4=630）和底部注文。
A hand-built fake UI screenshot: title, description, two buttons, four bar-chart values (Q1=210 / Q2=270 / Q3=450 / Q4=630) and a footer note.

用它测试读图时，正确答案应当是：标题「欢迎使用 dsh-media-skills」、按钮「确定 / 取消」、四个数值与标签、注文。视觉模型应能逐项读出（免费模型对末尾字符偶有漏读属正常现象）。
When testing, the expected answer: the title, both buttons, all four values with labels, and the footer note.

## 🚀 怎么用 · How to use

1. **贴图自动转述**：把任意一张直接贴进聊天框（或点回形针选择），纯文本模型会收到视觉模型生成的文字描述。
   **Paste it**: paste any image into the chat (or pick it with the paperclip button) — a text-only model receives the vision model's description.
2. **vision-review 技能**：把图片放进工作区，说「用 vision-review 检查这张图」。
   **vision-review skill**: put the image in the workspace and say “read this image with vision-review”.
3. **重新生成**：复制上表的提示词，说「用 media-tools 生成：<提示词>」。
   **Regenerate**: copy a prompt above and say “generate with media-tools: <prompt>”.
