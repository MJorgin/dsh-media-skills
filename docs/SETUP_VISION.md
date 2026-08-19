# 视觉模型完整配置说明（直接贴图读图）

> 本文是 `dsh-media-skills` 的详细安装与配置指南：装完后，你的 DeepSeek Harness 会多出一个**免费的视觉模型**「智谱 GLM-4V-Flash（视觉）」，并且**在纯文本模型（如 deepseek-v4-pro）的会话里直接拖/贴图片，图片会被自动转述成文字**，不用存文件、不用切会话。
>
> 如果只想快速开始，看 [README](../README.md) 的「Quick start」；遇到问题翻到本文最后的「常见问题」。[English version](SETUP_VISION_EN.md)
>
> 💡 不想用智谱？[其他免费视觉模型](FREE_VISION_PROVIDERS.md)（SiliconFlow / 魔搭 / 百炼 / Gemini / OpenRouter / Groq…）

---

## 目录

1. [你能得到什么](#1-你能得到什么)
2. [前置条件](#2-前置条件)
3. [安装与配置（共 4 步）](#3-安装与配置共-4-步)
4. [三种读图方式](#4-三种读图方式)
5. [工作原理](#5-工作原理)
6. [常见问题](#6-常见问题)
7. [关键文件一览](#7-关键文件一览)

---

## 1. 你能得到什么

装完并重启后：

| 能力 | 说明 | 费用 |
|---|---|---|
| 🧠 视觉模型路由 | 模型选择器里出现「智谱 GLM-4V-Flash（视觉）」，新会话可选它当默认模型 | 免费 |
| 🖼️ 贴图自动转述 | 在**纯文本模型**的会话里，输入框有「添加图片」按钮（图片图标）；贴图后由视觉模型自动转成文字描述发给当前模型 | 免费 |
| 👁️ `vision-review` 技能 | 让智能体读取本地图片文件做视觉检查 | 免费 |
| 🎨 `media-tools` 技能 | 免费生成图片 | 免费 |

> ⚠️ 诚实说明：「贴图自动转述」依赖 DeepSeek Harness **本体**的视觉转述支持（`api-proxy` 里的图片准入逻辑）。本 bundle 负责的是**模型配置 + 读图/生图技能**；如果你的 DSH 版本没有这段本体能力，模型路由依然生效（可手动切换到视觉模型会话看图），但纯文本会话贴图会被拒绝。本文第 6 节给了判断方法。

## 2. 前置条件

- 已安装 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)，能启动 `dsh web`（默认端口 3080）。
- 一个**智谱 API Key**（读图用，免费）。**获取步骤**：注册/登录 [open.bigmodel.cn](https://open.bigmodel.cn) → 控制台 → 「API Keys」→ 新建并复制（`glm-4v-flash` 免费，无需付费）。
- （可选）一个 **SiliconFlow API Key**（仅当你还要用 `media-tools` 免费生图）。**获取步骤**：注册/登录 [siliconflow.cn](https://siliconflow.cn) → 「API 密钥」→ 新建并复制（Kolors 模型免费）。
- （可选）一个 **Google Gemini API Key**（让 `vision-review` 技能引擎链在智谱失败时自动回退到 Gemini）。**获取步骤**：[aistudio.google.com](https://aistudio.google.com) → 「Get API key」（约三分钟，无需信用卡）。
- Key 不会写进本仓库的任何文件，只会作为 `GLM_API_KEY` / `SILICONFLOW_API_KEY` / `GEMINI_API_KEY` 保存在你自己的 DSH 凭据里。

## 3. 安装与配置（共 4 步）

### 第 1 步：安装 bundle

```sh
dsh plugin --profile web add github:MJorgin/dsh-media-skills
```

> 已装过旧版本？升级：`dsh plugin --profile web update dsh-media-skills`
>
> 也可以不走 bundle：把本仓库 `skills/` 下的目录放进任意 skill 根目录（`~/.dsh/skills/` 或项目内 `.dsh/skills/`）。但那样只会得到两个技能，**不会**自动写入视觉模型配置——你需要按第 7 节的文件说明手动补。

### 第 2 步：获取并填入 GLM_API_KEY（两种方式，任选其一）

> 还没有 Key？先到 [open.bigmodel.cn](https://open.bigmodel.cn) 注册并创建（glm-4v-flash 免费）。要生图再顺便去 [siliconflow.cn](https://siliconflow.cn) 创建一个。

**方式 A（推荐）：在 Web 界面填**

打开 `http://127.0.0.1:3080` → **设置（Settings）→ 模型（Models）** → 找到 zhipu-vision 提供方（智谱 GLM-4V-Flash（视觉））→ 在它的 **API Key 栏**填上你的智谱 Key → 保存。

**方式 B：直接写凭据文件**

```sh
# ~/.dsh/.credentials.yaml（权限 600）
GLM_API_KEY: <你的智谱 Key>
```

> 两种方式写的是同一个地方。**永远不要**把 Key 写进 `settings.yaml`、本仓库或任何 skill 文件。

### 第 3 步：重启 DSH

bundle 安装和凭据填写完成后，**彻底重启** `dsh web`（停掉旧进程再启动，只刷新页面不算）：

```sh
# 停掉正在跑的 dsh web（Ctrl+C，或 kill 掉占用 3080 端口的进程）
lsof -i :3080          # 找到 PID
kill <PID>

# 重新启动
dsh web
```

> 装完 bundle 后模型路由会热加载，不一定需要重启；但凭据、缓存、前端资源在重启后最稳，所以强烈建议重启一次。

### 第 4 步：验证

1. 浏览器 `Cmd+Shift+R` 强刷页面。
2. 打开**模型选择器**（Models 页 / 顶部模型菜单）：应能看到 **「智谱 GLM-4V-Flash（视觉）」**。
3. 若你的 DSH 版本支持贴图转述：在任意会话（包括纯文本模型会话）看**输入框左下角**，应有一个 **图片「添加图片」按钮**。
4. 直接选一张图发送：纯文本会话里，你会看到消息变成「[图片「xxx.png」，已由视觉模型读取] + 文字描述」，模型基于描述正常回答。

到这一步就全部就绪了。

## 4. 三种读图方式

| 方式 | 怎么用 | 适用场景 |
|---|---|---|
| **A. 直接贴图（推荐）** | 纯文本会话（如 deepseek-v4-pro）里点图片按钮选图 / 拖拽 / 粘贴，直接发送 | 日常看图，不用切会话、不用存文件 |
| **B. 视觉模型会话** | 新开对话，模型选「智谱 GLM-4V-Flash（视觉）」，贴图对话 | 需要多轮围绕图片对话、原生读图（`read_image`） |
| **C. 文件 + 技能** | 把图放到工作区，说「用 vision-review 读一下这张图」 | 批量检查、需要脚本化处理时 |

转述语言会自动跟随你发消息的语言（中文消息出中文描述，英文消息出英文描述；没打字默认中文）。

## 5. 工作原理

以方式 A 为例，一次贴图的完整链路：

1. 你在纯文本会话里贴图并发送；
2. DSH 发现当前模型不能读图 → 图片立即落盘（附件库），消息**先上屏**：缩略图 + 「🖼️ 图片读取中…」占位；
3. 进入模型前（pre-step），按注册顺序尝试视觉路由转述（默认 `zhipu-vision / glm-4v-flash`，配了 `siliconflow-vision` 会自动故障转移），单路由 15 秒超时，按「与用户消息相同的语言」输出文字描述；
4. **模型侧**的图片块被替换为文字描述交给当前模型（所以纯文本模型也能“看图”），**显示侧仍保留原图缩略图**，不会把用户看到的图换成识别出的文字；历史里只有模型侧的文字；
5. 因为历史里只有文字，这个会话随时可以在纯文本模型和视觉模型之间切换，不会触发「会话已含图片，无法切换」的限制。

**失败兜底**：如果所有视觉路由都转述失败，消息降级为一句「图片无法转述」的提示（图片仍保存在附件库里，不会丢）；此时稍后重试，或运行 `vision-review` 的 `--doctor` 检查引擎配置。

## 6. 常见问题

### Q1：贴图提示「当前模型不支持图片，请切换支持图片的模型」

两种可能：

- **模型选择器里没有「智谱 GLM-4V-Flash（视觉）」**：说明视觉路由没注册成功。检查 bundle 是否装进当前 profile（`dsh plugin --profile web list`），Key 是否已填，然后彻底重启 DSH。
- **有视觉模型但还是被拒**：说明你的 DSH 本体是旧版本，没有视觉转述支持。此时视觉模型仍可手动使用（方式 B），但纯文本会话贴图会被入口拦截。

### Q2：视觉模型报 400 / `1210` / "inputs tokens + max_new_tokens must be <= 16384"

智谱 GLM-4V-Flash 的真实限制有两条：**输入 + 输出 ≤ 16384**，且 API 拒绝 `max_tokens` 大于 1024（报 `1210`「max_tokens参数非法：限制数值范围[1,1024]」）。本 bundle 写入的模型配置为 `contextWindow: 16384`、`maxTokens: 1024`，正常会触发 DSH 自动压缩历史。如果仍报错：

- 大概率是在一个**超长历史会话**里第一次贴图：换个**新会话**贴图即可；
- 确认 `~/.dsh/settings.yaml` 里 `zhipu-vision` 的模型条目带 `contextWindow: 16384`（第 7 节有示例）。

### Q3：会话里贴过图之后，切不回纯文本模型？

这是 DSH 的保护机制，但已按「图片是否带转述」细化：历史图片只要带有 `[图片，已由视觉模型读取]` 转述标记，切到纯文本模型就是安全的——llm 层投影会剥离图片块、保留转述文本，**方式 A（贴图自动转述）因此可以自由切换**；只有方式 B（视觉模型会话里直接贴图）的历史图片没有转述标记，切换会被拒绝，此时**新开一个会话**即可。

### Q4：贴图后消息变成「图片无法转述：视觉路由全部不可用…」？

所有视觉路由都转述失败了（常见原因：智谱 API 间歇性抽风、或网络波动）。图片仍保存在会话附件库里，不会丢。处理办法：

1. 稍等一两分钟重发一次（智谱的抽风通常是分钟级的）；
2. 在设置里给 DSH 配上第二个视觉路由做故障转移（`siliconflow-vision`，见 [FREE_VISION_PROVIDERS.md](FREE_VISION_PROVIDERS.md) 的现成配置片段），以后智谱挂掉会自动换硅基流动转述；
3. 排查引擎：运行 `python3 ~/.dsh/skills/vision-review/scripts/vision.py --doctor` 看哪些引擎可用。

### Q5：想卸载视觉模型配置？

删掉 `~/.dsh/settings.yaml` 里 `llm-pi-ai.providers.zhipu-vision` 整个条目，重启 DSH。卸载 bundle 本身：`dsh plugin --profile web remove dsh-media-skills`。

## 7. 关键文件一览

安装后，bundle 会自动写入以下配置（与你手写等价）：

```yaml
# ~/.dsh/settings.yaml 中自动新增的部分
llm-pi-ai:
  providers:
    zhipu-vision:
      apiKeyEnv: GLM_API_KEY
      displayName: 智谱 GLM-4V-Flash（视觉）
      api: openai-completions
      baseURL: https://open.bigmodel.cn/api/paas/v4
      models:
        - id: glm-4v-flash
          input: [ text, image ]
          contextWindow: 16384
          maxTokens: 1024
```

- 凭据：`~/.dsh/.credentials.yaml`（只放 Key，权限 600）
- 技能脚本读 Key 的顺序：环境变量 → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env`
- 转述失败时图片保留在会话附件库（不会丢，也无需手动处理）
- 自动写入只在**没有** `zhipu-vision` 配置时发生，绝不覆盖你已有的修改

---

Created by [@MJorgin](https://github.com/MJorgin) · Powered by [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
