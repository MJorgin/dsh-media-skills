# 其他免费视觉模型（替换 / 扩展智谱）

> 本 bundle 的视觉能力**不绑定智谱**：DSH 的模型路由基于 OpenAI 兼容协议，任何声明了图片输入的模型都能用。
> 下表是当前可用的免费识图 API（2026-08 调研，额度和模型 id 会变，注册后以各控制台为准）。
> 配置方法：把对应片段追加到 `~/.dsh/settings.yaml` 的 `llm-pi-ai.providers` 下，Key 用 `apiKeyEnv` 指定的名字放进 DSH 凭据（Web 设置页 → 模型 → API Key 栏），重启 DSH 即可。

## 推荐清单

| 供应商 | 模型 | Key 去哪申请 | 免费额度 | 备注 |
|---|---|---|---|---|
| 智谱（当前默认） | glm-4v-flash | [open.bigmodel.cn](https://open.bigmodel.cn) | 长期免费 | 通用视觉、中文友好 |
| SiliconFlow | Qwen/Qwen2.5-VL-7B-Instruct | [siliconflow.cn](https://siliconflow.cn) → API 密钥 | 注册送额度 + 部分模型免费 | **你已有生图 Key，同一个 key 就能用** |
| ModelScope 魔搭 | Qwen/Qwen2.5-VL-7B-Instruct | [modelscope.cn](https://modelscope.cn) → 访问令牌 | 免费推理额度 | 国内直连、中文友好 |
| 阿里云百炼 | qwen-vl-plus | [百炼控制台](https://bailian.console.aliyun.com) → API-KEY | 新用户免费额度（百万 token 级） | 中文/OCR 强 |
| Google | gemini-3.6-flash | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | 免费档约 1500 次/天 | 视觉推理最强的一档；`vision-review` 技能引擎的默认 Gemini 型号（`GEMINI_MODEL` 可换） |
| OpenRouter | qwen/qwen2.5-vl-72b-instruct:free 等 | [openrouter.ai/keys](https://openrouter.ai/keys) | 部分模型带 `:free` 后缀免费 | 一个 key 通吃多家 |
| Groq | llama-3.2-11b-vision-preview | [console.groq.com/keys](https://console.groq.com/keys) | 免费档（限速） | 速度极快 |
| Cloudflare Workers AI | @cf/llava-hf/llava-1.5-7b-hf | [dash.cloudflare.com](https://dash.cloudflare.com) | 每天 1 万 neurons 免费 | 非 OpenAI 兼容，配置略不同 |

## 现成配置片段

（追加进 `llm-pi-ai.providers` 即可；`contextWindow`/`maxTokens` 请以各控制台当前参数为准。）

### SiliconFlow（推荐先试——你已经有 key）

```yaml
    siliconflow-vision:
      apiKeyEnv: SILICONFLOW_API_KEY
      displayName: SiliconFlow Qwen2.5-VL（视觉）
      api: openai-completions
      baseURL: https://api.siliconflow.cn/v1
      models:
        - id: Qwen/Qwen2.5-VL-7B-Instruct
          input: [ text, image ]
          contextWindow: 32768
          maxTokens: 4096
```

### ModelScope 魔搭

```yaml
    modelscope-vision:
      apiKeyEnv: MODELSCOPE_API_KEY
      displayName: 魔搭 Qwen2.5-VL（视觉）
      api: openai-completions
      baseURL: https://api-inference.modelscope.cn/v1
      models:
        - id: Qwen/Qwen2.5-VL-7B-Instruct
          input: [ text, image ]
          contextWindow: 32768
          maxTokens: 4096
```

### 阿里云百炼 DashScope

```yaml
    dashscope-vision:
      apiKeyEnv: DASHSCOPE_API_KEY
      displayName: 通义千问 VL（视觉）
      api: openai-completions
      baseURL: https://dashscope.aliyuncs.com/compatible-mode/v1
      models:
        - id: qwen-vl-plus
          input: [ text, image ]
          contextWindow: 32768
          maxTokens: 4096
```

### Google Gemini（OpenAI 兼容端点）

> `vision-review` 技能引擎默认用 `gemini-3.6-flash`（可用 `GEMINI_MODEL` 环境变量换型号），配好 `GEMINI_API_KEY` 即自动加入读图回退链；下面的路由配置则是把 Gemini 放进模型选择器当会话模型用。

```yaml
    gemini-vision:
      apiKeyEnv: GEMINI_API_KEY
      displayName: Gemini 3.6 Flash（视觉）
      api: openai-completions
      baseURL: https://generativelanguage.googleapis.com/v1beta/openai
      models:
        - id: gemini-3.6-flash
          input: [ text, image ]
          contextWindow: 262144
          maxTokens: 8192
```

### OpenRouter

```yaml
    openrouter-vision:
      apiKeyEnv: OPENROUTER_API_KEY
      displayName: OpenRouter 视觉（free 模型）
      api: openai-completions
      baseURL: https://openrouter.ai/api/v1
      models:
        - id: qwen/qwen2.5-vl-72b-instruct:free
          input: [ text, image ]
          contextWindow: 32768
          maxTokens: 4096
```

### Groq

```yaml
    groq-vision:
      apiKeyEnv: GROQ_API_KEY
      displayName: Groq Llama 3.2 Vision
      api: openai-completions
      baseURL: https://api.groq.com/openai/v1
      models:
        - id: llama-3.2-11b-vision-preview
          input: [ text, image ]
          contextWindow: 131072
          maxTokens: 4096
```

## 注意事项

- **默认转述模型**：贴图自动转述会使用「注册顺序里第一个支持图片的模型」。想换默认，把想用的 provider 写在最前面（或删掉其他视觉路由）。
- **额度会变**：免费额度/模型 id 常调整，报错时先到对应控制台确认模型是否还在免费清单里。
- **隐私**：图片会发给对应服务商的 API，选国内/国外服务时按你的数据合规要求来。
- 调研来源：[free-vision-skill](https://github.com/lora-sys/free-vision-skill)、[ModelVisionSkill](https://github.com/yan-stone-computer/ModelVisionSkill) 及各服务商官方控制台。
