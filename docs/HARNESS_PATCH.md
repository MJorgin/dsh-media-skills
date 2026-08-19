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
| 1 | `packages/host/apiproxy/src/api-proxy.ts` | 图片准入：**先上屏**（落盘 + 「读取中」占位，消息立即渲染），`agent/pre-step` 钩子按故障转移链转述（GLM → SiliconFlow → …，单路由 15s 超时），**图片块保留在消息里**（缩略图上屏）并在旁边追加转述文本；全部路由失败才降级为提示文本；`selectModel` 守卫放宽：带转述标记的历史图片允许切回纯文本模型，无标记的（视觉会话直接贴图）仍拒绝；视觉模型跳过转述时清理「读取中」占位；`VISION_DESCRIPTION_PROMPT` 增加防角色扮演约束 |
| 2 | `packages/llm/llm/src/index.ts` | 适配器边界新增图片投影：目标模型不支持图片时自动剥离图片块（保留转述文本块）；`inputModalities` 在 `prepareCall` 时解析一次、随 prepared call 传递，不产生第二次模型解析 |
| 3 | `packages/client/ui-conversation/src/client/skeleton/InputBar.tsx` | 输入框加「添加图片」按钮（图片图标，不用回形针）+ 隐藏文件选择器；生成中贴图不再静默丢弃，改为 toast 提示 |
| 4 | `packages/client/ui-conversation/src/client/locales.ts`、`.../image-labels.ts`、`.../chat/MessageItem.tsx` | 新增 `input.addImage`、`image.visionDescriptionFailed`、`image.pasteWhileBusy` 文案（中英）；消息含缩略图时隐藏转述标记文本块，只渲染「缩略图 + 用户文字」（旧历史无图片块的消息仍照常显示文字） |

## 二、改动 1：视觉转述准入（api-proxy.ts）

### 新增的常量和辅助函数

- `VISION_DESCRIPTION_PROMPT`：转述提示词——「请描述这张图片的内容…使用与用户消息相同的语言回答；若用户消息没有文字，默认用中文」。
- `VISION_DESCRIPTION_TIMEOUT_MS = 15_000`（单路由尝试上限）、`VISION_DESCRIPTION_MAX_TOKENS = 1024`。
- `findVisionRoutes(ctx)`：遍历 `ctx.llm.listProviders()`，返回**所有**声明 `inputModalities` 含 `image` 的模型路由（注册顺序即故障转移顺序）；单条路由异常不影响扫描。
- `describeImage(ctx, route, attachment, userText)`：把图片块 + 用户文字 + 提示词作为一条 user 消息，经 `ctx.llm.stream` 调视觉模型，用 `BlockAssembler` 收集文本。
- `contentHasImage`（dsh-llm 导出）：递归检查消息内容是否含图片块（含 tool-result 嵌套）。

### 先上屏 + pre-step 转述流程

1. **准入（admit）**：当前模型是纯文本时，只做 `durablePromptContent` 落盘校验，然后消息 = 图片块 + 文本「🖼️ 图片读取中…」，立即 `followup`——**消息瞬间上屏**（带缩略图和读取中占位）。
2. **转述（`agent/pre-step` 钩子）**：进入模型前，**保留图片块**（缩略图随历史持久化、上屏渲染），并在每个图片块旁追加转述文本块：
   - 只有**确认**模型支持图片时才跳过转述（拿不到模型信息时也转述，宁可转述也不裸发图片块）；跳过分支会清理 admit 阶段遗留的「读取中」占位，防止它持久化；
   - 按 `findVisionRoutes` 的顺序逐个尝试路由，单路由 15s 超时，失败的自动换下一个；
   - 全部路由失败 → 该图片块降级为提示文本（图片已存附件库，不会丢）。
3. **投影（llm 层 `adapterStream`）**：适配器边界按目标模型的 `inputModalities` 投影——纯文本模型自动剥离图片块、只看到转述文本；视觉模型原样收到图片与转述。转述文本块带 `[图片，已由视觉模型读取]` 标记。
4. **落史与上屏**：消息 = 图片块 + 转述文本块 + 用户文字一起写入历史。客户端渲染时隐藏转述标记块，只显示**缩略图 + 用户文字**（模型侧仍完整收到转述）；旧历史（无图片块）的消息照常显示文字。切换限制同步放宽：`selectModel` 只拒绝「无转述标记」的历史图片，带标记的消息切到任何纯文本模型都安全（投影保证）。

> 建议在 DSH 里配第二个视觉路由做故障转移（`~/.dsh/settings.yaml` 的 `llm-pi-ai.providers` 加 `siliconflow-vision`，见 [FREE_VISION_PROVIDERS.md](FREE_VISION_PROVIDERS.md) 现成配置片段）。

### prompt 准入逻辑改动

原逻辑：当前模型不含图片能力 → 直接返回 `MODEL_DOES_NOT_SUPPORT_IMAGES`。
新逻辑：

1. 当前模型支持图片 → 走原路（`durablePromptContent`）；
2. 不支持 → 准入落盘图片块并附「读取中」占位、立即上屏；`agent/pre-step` 钩子按视觉路由故障转移链转述，在图片块旁**追加**转述文本块（图片块保留）；全部路由失败降级为提示文本。

### 相关 import 变更

- `BlockAssembler`、`LlmModelInfo`（type）加入 `@deepseek-ai/dsh-llm` import；
- `randomUUID`、`mkdir`、`stat` 加入 `node:fs/promises`，`dirname` 加入 `node:path`（旧 inbox 兜底移除后，`writeFile`/`join` 已不再需要）。

## 三、改动 2：输入框「添加图片」按钮（InputBar.tsx）

- import 增加图片/照片图标（例如 `IconImageOutline16` 或项目现有图标库里的 image/photo 图标；**不要用回形针**，回形针在 DSH 里通常表示文件）；
- 新增 `fileRef`（`useRef<HTMLInputElement | null>`）与 `onPickImages` 回调（取文件 → 清空 input → `intakeImages(files)`，复用现有摄入检查）；
- 在工具栏 `.tools` 内「+」命令按钮旁新增**图片按钮**：`disabled={addImages === undefined || locked || machineBusy}`，点击触发 `fileRef.current?.click()`；
- 给图片按钮补上 `title={t('input.addImage')}` 与 `aria-label={t('input.addImage')}`：纯图标按钮在悬停/读屏时能明确表达「添加图片」，避免被误认成语音或文件上传；
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

- 需要至少一个声明 `input: [text, image]` 的模型路由（`dsh-media-skills` 会自动写入 zhipu-vision/glm-4v-flash，配置含 `contextWindow: 16384`、`maxTokens: 1024`）。注意智谱 glm-4v-flash 的真实限制：输入+输出 ≤ 16384，且 API 拒绝 max_tokens > 1024（报 1210「max_tokens参数非法：限制数值范围[1,1024]」）；把 maxTokens 写成 4096 反而会触发 1210。
- 无视觉路由时行为与旧版完全一致（贴图被拒），不影响现有部署。
- 视觉模型会话（模型本身支持图片）不受影响，走原有图片链路。
- 自动转述路径不产生图片块 → 历史可自由切换模型；仅视觉模型会话直接贴图的历史才会被「切回纯文本」守卫拦截（新开会话即可）。

## 七、提交上游建议

- 标题示例：`feat(web): auto-describe pasted images via a vision-capable model for text-only sessions`
- PR 描述要点：问题（文本模型贴图被入口拒绝）、方案（准入时视觉转述 + 失败落盘兜底 + 图片按钮入口 + 显示侧保留缩略图）、行为矩阵（有无视觉路由/转述成败）、测试（上述两个 spec）、文档链接。
