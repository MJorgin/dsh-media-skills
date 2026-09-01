# DSH 本体补丁说明（贴图自动转述 · v2）

> 本文档记录让「纯文本模型也能贴图」生效所需的 **DeepSeek Harness 本体**改动。
> `dsh-media-skills` bundle 只负责模型配置与技能；这段本体能力不在 bundle 里。
>
> **版本适配**
>
> | Harness 版本 | 补丁文件 | 状态 |
> |---|---|---|
> | `dsh-v0.1.2-alpha.3`（最新，2026-08-31 发布） | [patches/dsh-v0.1.2-alpha.3-vision-transcription.patch](patches/dsh-v0.1.2-alpha.3-vision-transcription.patch) | ✅ 回环验证（`git apply --check` 干净 + 逐字节一致）+ typecheck（`tsc -b tsconfig.host.json` 干净）。**v0.1.2 注意**：上游**删除了 `packages/host/apiproxy`**，补丁改为只改 `packages/api/session-controller/src/commands.ts`（准入放宽 + 在 `SessionCommandController` 上注册 `agent/pre-step` 转述钩子）。client-ux 补丁对 alpha.1/alpha.2/alpha.3 通用 |
> | `dsh-v0.1.2-alpha.3` 客户端 UX | [patches/dsh-v0.1.2-alpha.3-client-ux.patch](patches/dsh-v0.1.2-alpha.3-client-ux.patch) | ✅ `git apply --check` 对 alpha.1/alpha.2/alpha.3 均干净；`tsc -b tsconfig.client.json` **零新增**类型错误（新增「添加图片」按钮 + 隐藏文件选择器 + 缩略图在场时隐藏转述标记）。`MessageItem` 已移至 `packages/client/ui-chat` |
> | `dsh-v0.1.1-rc.1` | [patches/dsh-v0.1.1-rc.1-vision-transcription.patch](patches/dsh-v0.1.1-rc.1-vision-transcription.patch) | ✅ 回环验证（`git apply --check` 干净 + 与应用结果逐字节一致） |
> | `dsh-v0.1.1-rc.1` 客户端 UX | [patches/dsh-v0.1.1-rc.1-client-ux.patch](patches/dsh-v0.1.1-rc.1-client-ux.patch) | ✅ 回环验证（`git apply --check` 干净 + 与应用结果逐字节一致） |
> | `dsh-v0.1.1-rc.2` | [patches/dsh-v0.1.1-rc.2-vision-transcription.patch](patches/dsh-v0.1.1-rc.2-vision-transcription.patch) | ✅ 回环验证（apply/check 干净 + 逐字节一致）+ typecheck（`tsc -b` host 干净） |
> | `dsh-v0.1.1-rc.2` 客户端 UX | [patches/dsh-v0.1.1-rc.2-client-ux.patch](patches/dsh-v0.1.1-rc.2-client-ux.patch) | ✅ 复用 rc.1-client-ux——rc.1 与 rc.2 的这四个客户端文件逐字节一致，`git apply --check` 干净 |
| `dsh-v0.1.0-rc.8`（2026-08-19 发布） | [patches/dsh-v0.1.0-rc.8-vision-transcription.patch](patches/dsh-v0.1.0-rc.8-vision-transcription.patch) | ✅ 已 typecheck（`tsc -b tsconfig.host.json` 干净） |
> | `dsh-v0.1.0-rc.8` 客户端 UX | [patches/dsh-v0.1.0-rc.8-client-ux.patch](patches/dsh-v0.1.0-rc.8-client-ux.patch) | ✅ 回环验证（`git apply --check` 干净 + 与工作区逐字节一致） |
> | `dsh-v0.1.0-rc.7`（2026-08-12 发布） | [patches/dsh-v0.1.0-rc.7-vision-transcription.patch](patches/dsh-v0.1.0-rc.7-vision-transcription.patch) | ✅ 补丁回环验证通过（`git apply --check` 干净） |
> | `dsh-v0.1.0-rc.7` 客户端 UX | [patches/dsh-v0.1.0-rc.7-client-ux.patch](patches/dsh-v0.1.0-rc.7-client-ux.patch) | ✅ 回环验证（`git apply --check` 干净 + 与应用结果逐字节一致） |
>
> 两份补丁内容几乎相同：rc.7 与 rc.8 的 `packages/llm/llm/src/index.ts` **逐字节一致**，
> `packages/host/apiproxy/src/api-proxy.ts` 的版本差异仅在与本补丁无关的 import 上下文
> （rc.8 新增 `homedir`、`admitEncodedImages` 附件重构），本补丁的改动点文本两版完全相同。
> 因此两个版本行为一致：准入放宽 + `agent/pre-step` 转述 + 请求级图片投影 + `selectModel` 守卫放宽。
>
> 在对应 tag 的干净源码上 `git apply <补丁文件>` 即可（已做回环验证）。
> **v3（0.1.1-rc.2）重要变化**：上游在 0.1.1-rc.2 **原生实现了请求级图片投影**
> （`projectImagesForTextModel`，llm 包 `content.ts`）并**删除了 selectModel 图片守卫**——
> 因此 0.1.1-rc.2 补丁**只有 api-proxy.ts 一处文件**（准入放宽 + `agent/pre-step` 转述），
> 不再包含 llm 投影与守卫放宽（上游已替我们做掉）。
>
> **v4（0.1.2-alpha）重要变化**：v0.1.2 **移除了旧的 API Proxy 宿主包**（`packages/host/apiproxy`），相关调用迁移到按领域划分的 Remote 服务。准入与 `agent/pre-step` 钩子现在位于 **`packages/api/session-controller/src/commands.ts`**（`SessionCommandController`）：宿主补丁去掉 `prompt()` 里按模型能力拒绝图片的逻辑，并在该 controller 的 `ctx` 上注册转述钩子。客户端侧，`InputBar` 仍属于合成器（只支持粘贴/拖放——「添加图片」按钮仍由本补丁提供），而 `MessageItem` 已迁至新的 **`packages/client/ui-chat`** 包；llm 的纯文本投影（`textOnlyImageText` / 图片内容处理）仍是原生兜底。v0.1.2-alpha.3 补丁已做 `git apply` + `tsc` 干净验证；client-ux 补丁对 alpha.1/alpha.2/alpha.3 逐字节适用，宿主 vision 补丁以 alpha.3 为基线（alpha.1/alpha.2 仍用旧的 `admitEncodedImages` 准入助手——请升级到 alpha.3）。

>
> **v2 相对旧版 v1 的变化**：v1 面向更早的 pre-rc.7 构建（准入先上屏占位 + 客户端加按钮），
> rc.7 / rc.8 已原生支持粘贴/拖放图片摄入（`InputBar` 的 `addImages` 管线、`imageLimits` 预检），
> `agent/pre-step` 语义也已定型（waterfall，可替换进入 step 的消息），
> 因此 v2 宿主侧只需两处改动。**但客户端并非零改动**：rc.8 的 `InputBar` 只有摄入管线、没有「添加图片」按钮（按钮一直是本补丁集的客户端部分），气泡渲染也需要「缩略图在场时隐藏转述标记文本」的显示逻辑——这两块由配套的客户端补丁提供（rc.7 / rc.8 各一份，`dsh-v0.1.0-rc.7-client-ux.patch` 与 `dsh-v0.1.0-rc.8-client-ux.patch`）。

---

## 一、改动总览（两处，均为宿主侧）

| # | 文件 | 改动 |
|---|---|---|
| 1 | `packages/host/apiproxy/src/api-proxy.ts` | 图片准入**不再按当前模型能力拒绝**；新增 `agent/pre-step` 钩子：纯文本模型会话的图片块按视觉路由故障转移链自动转述（GLM → SiliconFlow → Gemini → …，单路由 15s 超时），图片块保留（缩略图上屏）、转述文本块追加；全部路由失败则图片块降级为提示文本；`selectModel` 守卫放宽（带转述标记的图片历史允许切回纯文本模型） |
| 2 | `packages/llm/llm/src/index.ts` | 适配器边界新增**请求级图片投影**：目标模型明确不接受图片时，请求中的图片块自动剥离（历史保持原样，转述文本块不受影响）；能力未知的模型不投影 |

需要配套的客户端改动（rc.7 / rc.8 各一份客户端补丁）：
- 「添加图片」按钮 + 隐藏文件选择器（图片图标）——rc.8 的 `InputBar` 只有粘贴/拖放摄入管线、没有按钮；
- 气泡渲染：消息含缩略图时隐藏 `[图片，已由视觉模型读取]` 转述标记块（旧的无图消息照常显示文字）；
- 生成中贴图弹提示（不再静默丢弃）+ `input.addImage` / `image.pasteWhileBusy` 文案（中英）。

rc.8 已原生支持、无需改动：
- 粘贴 / 拖放入摄管线（`addImages`、`imageLimits` 预检、`attachmentErrorText`）；
- 会话内模型切换守卫：rc.8 无此守卫，图片历史切回纯文本模型由改动 2 的投影兜底。

**兼容性与安全说明**：宿主补丁与客户端补丁对 rc.7 / rc.8 / v0.1.1-rc.1 均通过回环验证（各自版本独立生成，互不混用）。v0.1.1-rc.1 的 llm/index.ts 与 rc.8 逐字节一致，api-proxy 仅 import 区新增 zod 等引入，客户端 locales/InputBar 有 access 权限预设改动——两处补丁已按新版重新生成。安全与隐私：补丁不引入任何密钥、不新增网络端点；图片仅发送到你在 settings 里配置的视觉路由（默认智谱），转述失败时图片保留在会话附件库；客户端改动全部为本地 UI 行为（文件选择器、toast、显示过滤）。

## 二、改动 1：准入放宽 + pre-step 转述（api-proxy.ts）

### 准入（admit）

原逻辑：当前模型不含图片能力 → 直接返回 `MODEL_DOES_NOT_SUPPORT_IMAGES` 拒绝。
新逻辑：**删除该拒绝分支**。图片照常经 `durablePromptContent`（`admitEncodedImages` 落盘
附件库）后随消息入队，模型能力检查全部交给 pre-step 钩子与投影兜底。

### pre-step 钩子（新增）

```ts
ctx.on('agent/pre-step', async ({ agent, messages, signal }, next): Promise<PreStepDecision> => {
  if (!messages.some(message => message.content.some(block => block.type === 'image'))) return next()
  const decision = await next()
  if (decision.kind !== 'enter') return decision
  const current = selectionFor(agent).current
  const modelInfo = await ctx.llm.resolveModelInfo(current.provider, current.model, signal)
  if (modelInfo.inputModalities !== undefined && modelInfo.inputModalities.includes('image')) {
    return decision          // 视觉模型会话：图片原样进入
  }
  const rewritten = await describeImagesInMessages(ctx, visionRouteCache, decision.messages, signal)
  return rewritten === null ? decision : { kind: 'enter', messages: rewritten }
})
```

关键语义（rc.8 的 pre-step）：inbox 中的消息**尚未落史**，钩子返回的
`{ kind: 'enter', messages }` 就是最终写入历史并进入模型请求的消息。因此：

- 无图片的 step：一次轻量 content 扫描后直接 `next()`，零开销；
- 当前模型支持图片：`next()` 原样进入（视觉会话行为与未打补丁完全一致）；
- 纯文本模型 + 图片：逐图调用 `ctx.llm.stream`（视觉路由），成功后消息 = **图片块（保留缩略图）+ 转述文本块（带「[图片，已由视觉模型读取]」标记）+ 用户文字**；
- 全部视觉路由失败：图片块原位替换为失败提示文本，消息正常落史（模型侧无图片块，不会触发请求失败）。

### 视觉路由发现

`findVisionRoutes(ctx)`：遍历 `ctx.llm.listProviders()`，对每个路由调 `ctx.llm.listModels(provider)`（llm-pi-ai 为本地快照，无网络开销），取第一个 `inputModalities` 含 `image` 的模型；注册顺序即故障转移顺序；结果缓存，`llm/adapters-updated` 事件触发时清空。单路由异常只跳过该路由。

### 转述调用

`ctx.llm.stream({ provider, model, maxTokens: 1024, signal, messages: [图片块 + 提示词] })`（`BlockAssembler` 收集文本；信号 = agent 取消信号与 15s 单路由超时的合成）。注意 glm-4v-flash 的硬限制：**max_tokens > 1024 会被智谱 API 拒绝（错误 1210）**，因此 `VISION_DESCRIPTION_MAX_TOKENS = 1024` 是输出上限，不要调大。

## 三、改动 2：请求级图片投影（llm/src/index.ts）

`adapterStream` 中，目标模型能力（`inputModalities`）已随 `resolveCallFor` / `prepareCall` 解析出来，投影在适配器边界完成：

- 模型**明确不含** image 能力 → 本次请求的 `messages` 剥离图片块（其他块保留）；
- 模型能力未知 → 不投影（宁可让 adapter 自行处理，不静默删图）；
- 视觉模型 → 不投影。

投影是**请求级**的：会话历史（含图片块与转述文本）保持原样，因此「纯文本模型会话贴图 → 转述成功 → 模型看到转述文本；转述失败 → 模型只看到用户文字」都安全；带图片历史切回纯文本模型也不会导致请求失败。

## 四、构建、测试与部署

```sh
cd <deepseek-harness checkout>   # 必须是 dsh-v0.1.0-rc.8 tag
git apply docs/patches/dsh-v0.1.0-rc.8-vision-transcription.patch   # 从 dsh-media-skills 仓库拷贝
corepack pnpm install            # 首次
pnpm run typecheck               # 至少确认这两个包：dsh-llm、dsh-host-apiproxy

# 单测说明：改动 1 会破坏部分既有测试（旧测试断言 MODEL_DOES_NOT_SUPPORT_IMAGES 拒绝路径），
# 这类失败属预期；改动 2 的投影是纯函数，可补 keyless 单测。
pnpm run build                   # 全量构建（lib + web dist）
```

部署：**彻底重启** `dsh web`（仅刷新页面不会加载新后端），再 `Cmd+Shift+R` 强刷页面。

## 五、依赖与兼容性

- 需要至少一个声明 `input: [text, image]` 的模型路由（`dsh-media-skills` 会自动写入 zhipu-vision/glm-4v-flash）。多配一个视觉路由（如 SiliconFlow Qwen3-VL）即获得故障转移；
- 无视觉路由时：准入不再拒绝，图片会落史但转述失败 → 消息里图片块降级为失败提示文本，模型只看到文字（行为从「贴图被拒」变为「贴图不报错但无转述」）；
- 视觉模型会话（模型本身支持图片）完全不受影响，走原有图片链路；
- 转述文本带「[图片，已由视觉模型读取]」标记并**直接显示**在消息里（rc.8 客户端不做旧版的「隐藏转述块」渲染；缩略图 + 转述文字同时可见，属预期 UX）；
- 模型切换：带图历史切回纯文本模型不再被拦截（rc.8 无守卫），由请求级投影兜底——模型只看到转述/文字，不会看到图片块。

## 六、提交上游建议

- 标题示例：`feat(host): auto-transcribe pasted images via a vision-capable model for text-only sessions`
- PR 要点：准入放宽 + `agent/pre-step` 转述 + `adapterStream` 请求级图片投影；行为矩阵（有无视觉路由 / 转述成败 / 视觉与纯文本会话）；为改动 2 补 keyless 单测（投影的纯函数部分），改动 1 的集成行为建议在真实合成下验证。