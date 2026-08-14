# DSH 本体补丁说明（贴图自动转述）

> 本文档记录让「纯文本模型也能贴图」生效所需的三处 **DeepSeek Harness 本体**改动。
> `dsh-media-skills` bundle 只负责模型配置与技能；这段本体能力不在 bundle 里。
> 有了它 + bundle 自动写入的视觉模型路由，纯文本会话贴图会被视觉模型自动转述成文字；
> 没有它，视觉模型仍可手动使用（新会话选视觉模型），但纯文本会话贴图会在入口被拒绝。
>
> [English version](HARNESS_PATCH_EN.md)

---

## 一、改动总览

| # | 文件 | 改动 |
|---|---|---|
| 1 | `packages/host/apiproxy/src/api-proxy.ts` | 图片准入：当前模型不支持图片时，自动找视觉模型转述，图片替换为文字描述；失败兜底存文件 |
| 2 | `packages/client/ui-conversation/src/client/skeleton/InputBar.tsx` | 输入框加「添加图片」按钮（回形针）+ 隐藏文件选择器 |
| 3 | `packages/client/ui-conversation/src/client/locales.ts`、`.../image-labels.ts` | 新增 `input.addImage` 与 `image.visionDescriptionFailed` 文案（中英） |

## 二、改动 1：视觉转述准入（api-proxy.ts）

### 新增的常量和辅助函数

- `VISION_DESCRIPTION_PROMPT`：转述提示词——「请描述这张图片的内容…使用与用户消息相同的语言回答；若用户消息没有文字，默认用中文」。
- `VISION_DESCRIPTION_TIMEOUT_MS = 60_000`、`VISION_DESCRIPTION_MAX_TOKENS = 1024`。
- `findVisionRoute(ctx)`：遍历 `ctx.llm.listProviders()`，返回第一个声明 `inputModalities` 含 `image` 的模型路由；单条路由异常不影响扫描。
- `describeImage(ctx, route, attachment, userText)`：把图片块 + 用户文字 + 提示词作为一条 user 消息，经 `ctx.llm.stream` 调视觉模型，用 `BlockAssembler` 收集文本。
- `describeImagesForTextModel(ctx, content, route, cwd)`：先 `durablePromptContent` 校验并存图，再逐张转述；单张转述失败时（`cwd` 可用）调 `saveImageFallback` 把图写入工作区 `.dsh/scratch/inbox/`，并把该部分替换为「请用 vision-review 读取」的指引文本。
- `saveImageFallback(part, cwd)` / `imageExtension(mediaType)`：文件名消毒（保留中文）、`wx` 独占写、同名自动加序号。

### prompt 准入逻辑改动

原逻辑：当前模型不含图片能力 → 直接返回 `MODEL_DOES_NOT_SUPPORT_IMAGES`。
新逻辑：

1. 当前模型支持图片 → 走原路（`durablePromptContent`）；
2. 不支持 → `findVisionRoute`：
   - 无视觉路由 → 保持原拒绝（`MODEL_DOES_NOT_SUPPORT_IMAGES`）；
   - 有 → `describeImagesForTextModel` 成功则消息全为文字块；失败返回 `undefined` → 拒绝并返回新码 `VISION_DESCRIPTION_FAILED`（前端有对应文案）。

### 相关 import 变更

- `BlockAssembler`、`LlmModelInfo`（type）加入 `@deepseek-ai/dsh-llm` import；
- `writeFile` 加入 `node:fs/promises`，`join` 加入 `node:path`。

## 三、改动 2：输入框「添加图片」按钮（InputBar.tsx）

- import 增加 `IconPaperclipOutline16`；
- 新增 `fileRef`（`useRef<HTMLInputElement | null>`）与 `onPickImages` 回调（取文件 → 清空 input → `intakeImages(files)`，复用现有摄入检查）；
- 在工具栏 `.tools` 内「+」命令按钮旁新增回形针按钮：`disabled={addImages === undefined || locked || machineBusy}`，点击触发 `fileRef.current?.click()`；
- 组件尾部新增隐藏的 `<input type=file accept=image/png,image/jpeg,image/webp,image/gif multiple hidden onChange={onPickImages} />`。

## 四、改动 3：文案（locales.ts / image-labels.ts）

- `locales.ts`（zh/en 两字典各加）：
  - `'input.addImage': '添加图片' / 'Add image'`
  - `'image.visionDescriptionFailed': '图片转述失败：视觉模型读取出错，请重试；或把图片保存成文件后让我用 vision-review 读取' / 'Image description failed: …'`
- `image-labels.ts` 的 `attachmentErrorText` switch 增加 `case 'VISION_DESCRIPTION_FAILED'`。

## 五、构建、测试与部署

~~~sh
cd <deepseek-harness checkout>
npm run build        # 全量：host lib + client lib + web dist（只改后端可只跑 npm run build:lib:host）

# 测试
npx vitest run packages/host/apiproxy/tests/api-proxy-models.spec.ts packages/host/apiproxy/tests/api-proxy-cold.spec.ts
npx vitest run packages/client/ui-conversation/tests/input-bar.client.spec.tsx packages/client/ui-conversation/tests/image-labels.client.spec.tsx
~~~

部署：**彻底重启** `dsh web`（仅刷新页面不加载新后端），再 `Cmd+Shift+R` 强刷页面。

## 六、依赖与兼容性

- 需要至少一个声明 `input: [text, image]` 的模型路由（`dsh-media-skills` 会自动写入 zhipu-vision/glm-4v-flash，配置含 `contextWindow: 16384`、`maxTokens: 4096`，避免智谱 1210 上下文超限）。
- 无视觉路由时行为与旧版完全一致（贴图被拒），不影响现有部署。
- 视觉模型会话（模型本身支持图片）不受影响，走原有图片链路。
- 自动转述路径不产生图片块 → 历史可自由切换模型；仅视觉模型会话直接贴图的历史才会被「切回纯文本」守卫拦截（新开会话即可）。

## 七、提交上游建议

- 标题示例：`feat(web): auto-describe pasted images via a vision-capable model for text-only sessions`
- PR 描述要点：问题（文本模型贴图被入口拒绝）、方案（准入时视觉转述 + 失败落盘兜底 + 回形针入口）、行为矩阵（有无视觉路由/转述成败）、测试（上述两个 spec）、文档链接。
