# Provider 与密钥说明

这个 bundle 在技能脚本层面保持 provider 中立。插件本身不会注册模型 provider，也不会修改 DSH 模型设置。

[English](FREE_VISION_PROVIDERS_EN.md) · [返回 README](../README.md)

## 读图引擎

`vision-review` 会按以下顺序尝试已配置引擎：

| 顺序 | 引擎 | 密钥变量 | 默认模型 | 模型覆盖变量 |
|---:|---|---|---|---|
| 1 | 智谱 GLM | `GLM_API_KEY` | `glm-4v-flash` | — |
| 2 | DeepSeek | `DEEPSEEK_API_KEY` | `deepseek-v4-flash-vision-exp` | `DEEPSEEK_VISION_MODEL` |
| 3 | SiliconFlow | `SILICONFLOW_API_KEY` | `Qwen/Qwen3-VL-8B-Instruct` | `SILICONFLOW_VISION_MODEL` |
| 4 | SenseNova | `SENSENOVA_API_KEY` | `sensenova-6.8-flash-lite` | `SENSENOVA_VISION_MODEL` |
| 5 | Gemini | `GEMINI_API_KEY` | `gemini-3.6-flash` | `GEMINI_MODEL` |

可选引擎只有检测到对应 key 时才会加入故障转移链。各服务商的模型 ID、免费额度和价格可能变化，使用前请以官方控制台为准。

## 生图引擎

`media-tools` 的优先级：

1. 配置 `SENSENOVA_API_KEY` 时，使用 SenseNova U1 Fast。
2. 未配置 SenseNova、但配置 `SILICONFLOW_API_KEY` 时，使用 SiliconFlow Kolors。

插件不内置生图 key，也不提供匿名共享端点。

## 密钥位置

技能脚本优先读环境变量，然后读：

```text
~/.dsh/secrets/media-tools.env
~/.codex/secrets/media-tools.env
```

`vision-review` 还会读取 `~/.dsh/.credentials.yaml`，包括其中的 `refs` 子映射。

示例：

```sh
# ~/.dsh/secrets/media-tools.env
GLM_API_KEY=...
DEEPSEEK_API_KEY=...
SILICONFLOW_API_KEY=...
SENSENOVA_API_KEY=...
GEMINI_API_KEY=...
GEMINI_PROXY=http://127.0.0.1:7897
```

## 自定义 OpenAI 兼容引擎

把 `VISION_FALLBACKS` 设置为 JSON 数组：

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

`name`、`baseUrl`、`model` 必填；`apiKeyEnv` 缺省为 `OPENAI_API_KEY`。

## DSH 原生模型配置

如果希望普通 DSH 对话直接接收图片，请在 DSH 的 **Models** 设置中配置支持图片输入的模型。这条链路与技能脚本相互独立：插件只提供 `vision-review` 和 `media-tools`，不会改变模型选择器。

## 隐私

图片会发送给故障转移链实际调用的服务商，不会发送给本仓库。内部截图、客户资料、证件或文档只能发送给组织批准的服务商。
