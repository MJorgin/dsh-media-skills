# Free vision models beyond Zhipu (swap or extend)

> The vision capability of this bundle is **not tied to Zhipu**: DSH model routes speak the OpenAI-compatible protocol, so any model that declares image input works.
> The table below lists free image-reading APIs as of 2026-08 (quotas and model ids change — always check each console after signup).
> How to configure: append the snippet of your choice under `llm-pi-ai.providers` in `~/.dsh/settings.yaml`, put the key (under the name given by `apiKeyEnv`) into DSH credentials (Web Settings → Models → API Key field), then restart DSH.

## Recommended list

| Provider | Model | Where to get the key | Free tier | Notes |
|---|---|---|---|---|
| Zhipu (current default) | glm-4v-flash | [open.bigmodel.cn](https://open.bigmodel.cn) | Free long-term | General vision, Chinese-friendly |
| SiliconFlow | Qwen/Qwen2.5-VL-7B-Instruct | [siliconflow.cn](https://siliconflow.cn) → API Keys | Sign-up credits + some free models | **Works with the key you already have for image generation** |
| ModelScope | Qwen/Qwen2.5-VL-7B-Instruct | [modelscope.cn](https://modelscope.cn) → access token | Free inference quota | Mainland-friendly, Chinese-friendly |
| Alibaba Bailian (DashScope) | qwen-vl-plus | [Bailian console](https://bailian.console.aliyun.com) → API-KEY | New-user free quota (million-token scale) | Strong Chinese/OCR |
| Google | gemini-2.5-flash | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | ~1,500 requests/day free | Best free visual reasoning |
| OpenRouter | qwen/qwen2.5-vl-72b-instruct:free and more | [openrouter.ai/keys](https://openrouter.ai/keys) | Models with the `:free` suffix | One key, many providers |
| Groq | llama-3.2-11b-vision-preview | [console.groq.com/keys](https://console.groq.com/keys) | Free tier (rate-limited) | Very fast |
| Cloudflare Workers AI | @cf/llava-hf/llava-1.5-7b-hf | [dash.cloudflare.com](https://dash.cloudflare.com) | 10k neurons/day free | Not OpenAI-compatible, config differs |

## Ready-to-paste snippets

(Append under `llm-pi-ai.providers`; double-check `contextWindow`/`maxTokens` against each console.)

### SiliconFlow (try this first — you already have the key)

```yaml
    siliconflow-vision:
      apiKeyEnv: SILICONFLOW_API_KEY
      displayName: SiliconFlow Qwen2.5-VL (vision)
      api: openai-completions
      baseURL: https://api.siliconflow.cn/v1
      models:
        - id: Qwen/Qwen2.5-VL-7B-Instruct
          input: [ text, image ]
          contextWindow: 32768
          maxTokens: 4096
```

### ModelScope

```yaml
    modelscope-vision:
      apiKeyEnv: MODELSCOPE_API_KEY
      displayName: ModelScope Qwen2.5-VL (vision)
      api: openai-completions
      baseURL: https://api-inference.modelscope.cn/v1
      models:
        - id: Qwen/Qwen2.5-VL-7B-Instruct
          input: [ text, image ]
          contextWindow: 32768
          maxTokens: 4096
```

### Alibaba Bailian (DashScope)

```yaml
    dashscope-vision:
      apiKeyEnv: DASHSCOPE_API_KEY
      displayName: Qwen VL (vision)
      api: openai-completions
      baseURL: https://dashscope.aliyuncs.com/compatible-mode/v1
      models:
        - id: qwen-vl-plus
          input: [ text, image ]
          contextWindow: 32768
          maxTokens: 4096
```

### Google Gemini (OpenAI-compatible endpoint)

```yaml
    gemini-vision:
      apiKeyEnv: GEMINI_API_KEY
      displayName: Gemini 2.5 Flash (vision)
      api: openai-completions
      baseURL: https://generativelanguage.googleapis.com/v1beta/openai
      models:
        - id: gemini-2.5-flash
          input: [ text, image ]
          contextWindow: 262144
          maxTokens: 8192
```

### OpenRouter

```yaml
    openrouter-vision:
      apiKeyEnv: OPENROUTER_API_KEY
      displayName: OpenRouter vision (free models)
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

## Notes

- **Default describe model**: paste-image auto-description uses the **first** image-capable model in registration order. To change the default, put the provider you want first (or remove other vision routes).
- **Quotas change**: free quotas and model ids rotate — when a call errors, check the console for the current free list.
- **Privacy**: images are sent to the chosen provider's API; pick mainland/global providers according to your data-compliance needs.
- Sources: [free-vision-skill](https://github.com/lora-sys/free-vision-skill), [ModelVisionSkill](https://github.com/yan-stone-computer/ModelVisionSkill) and the providers' official consoles.
