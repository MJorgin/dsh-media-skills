# Providers and keys

This bundle is provider-neutral at the skill-script level. The plugin itself does not register model providers or mutate DSH model settings.

[中文版](FREE_VISION_PROVIDERS.md) · [Back to README](../README.md)

## Image review providers

`vision-review` tries configured engines in this order:

| Order | Engine | Key variable | Default model | Model override |
|---:|---|---|---|---|
| 1 | Zhipu GLM | `GLM_API_KEY` | `glm-4v-flash` | — |
| 2 | DeepSeek | `DEEPSEEK_API_KEY` | `deepseek-v4-flash-vision-exp` | `DEEPSEEK_VISION_MODEL` |
| 3 | SiliconFlow | `SILICONFLOW_API_KEY` | `Qwen/Qwen3-VL-8B-Instruct` | `SILICONFLOW_VISION_MODEL` |
| 4 | SenseNova | `SENSENOVA_API_KEY` | `sensenova-6.8-flash-lite` | `SENSENOVA_VISION_MODEL` |
| 5 | Gemini | `GEMINI_API_KEY` | `gemini-3.6-flash` | `GEMINI_MODEL` |

Optional engines join only when their key is available. Provider catalogs and pricing change frequently; verify model IDs, quotas and free-tier terms in the provider console.

## Image generation providers

`media-tools` uses:

1. SenseNova U1 Fast when `SENSENOVA_API_KEY` is set.
2. SiliconFlow Kolors when SenseNova is not configured and `SILICONFLOW_API_KEY` is set.

There is no bundled image-generation key and no anonymous shared endpoint.

## Secret locations

Skill scripts read environment variables first, then:

```text
~/.dsh/secrets/media-tools.env
~/.codex/secrets/media-tools.env
```

`vision-review` also reads `~/.dsh/.credentials.yaml`, including a `refs` mapping.

Example:

```sh
# ~/.dsh/secrets/media-tools.env
GLM_API_KEY=...
DEEPSEEK_API_KEY=...
SILICONFLOW_API_KEY=...
SENSENOVA_API_KEY=...
GEMINI_API_KEY=...
GEMINI_PROXY=http://127.0.0.1:7897
```

## Custom OpenAI-compatible engines

Set `VISION_FALLBACKS` to a JSON array:

```json
[
  {
    "name": "internal-vl",
    "baseUrl": "https://vision.example.com/v1",
    "apiKeyEnv": "INTERNAL_VL_KEY",
    "model": "vl-model-name",
    "maxTokens": 4096,
    "jsonObject": true
  }
]
```

Required fields are `name`, `baseUrl` and `model`; `apiKeyEnv` defaults to `OPENAI_API_KEY`.

## Native DSH provider configuration

To use images directly in a normal DSH conversation, configure an image-capable model in DSH **Models** settings. That route is independent from the scripts above: the plugin can provide `vision-review` and `media-tools` without changing your model picker.

## Privacy

Images are sent to the provider actually selected by the failover chain, not to this repository. For internal screenshots, customer data, IDs or documents, use only providers approved by your organization.
