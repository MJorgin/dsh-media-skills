---
name: media-tools
description: "图片生成。用户要求生成图片、插画、头像、封面、背景、banner、海报或其他视觉素材时使用。优先 SenseNova U1 Fast，其次 SiliconFlow Kolors；密钥只从环境变量或 ~/.dsh/secrets/media-tools.env、~/.codex/secrets/media-tools.env 读取，不内置、不写入任何密钥。"
---

# Media Tools（图片生成）

通过用户自行配置的服务商生成图片素材。优先使用 SenseNova U1 Fast；未配置 SenseNova key 时，使用 SiliconFlow Kolors。

## 用法

```bash
python3 scripts/generate.py "<提示词>" <输出路径.png> [尺寸]
```

示例：

```bash
python3 scripts/generate.py "云海中的中国宫殿，写实电影感，气势恢宏" palace.jpg 16:9
python3 scripts/generate.py "简洁科技感产品发布会背景，深蓝渐变" banner.png 2752x1536
```

## 尺寸

- SenseNova 支持常见横版、竖版和方形比例，可传 `16:9`、`9:16`、`1:1`、`3:4`、`4:3` 等比例。
- 也可传精确尺寸；脚本会映射到最接近宽高比的 SenseNova 支持尺寸。
- SiliconFlow 会把第三参数作为 `image_size` 传给 Kolors。
- 缺省尺寸为 `1024x1024`。

## 密钥来源

按顺序读取：

1. 进程环境变量；
2. `~/.dsh/secrets/media-tools.env`；
3. `~/.codex/secrets/media-tools.env`（历史兼容）。

支持的 key：

- `SENSENOVA_API_KEY`：优先使用 SenseNova U1 Fast。
- `SILICONFLOW_API_KEY`：未配置 SenseNova 时使用 SiliconFlow Kolors。

Secrets 文件每行一个 `KEY=value`，建议权限 `600`。本技能不读取或修改 DSH 模型配置，也不内置任何 key。

## 输出和隐私

- 生成文件只写到命令指定的输出路径。
- 不要自动上传、复制到公开目录或提交到仓库。
- 提示词中不要包含证件号、客户资料、未公开商业信息等敏感内容，除非用户明确授权并确认服务商合规。
- 避免在未授权情况下要求复现可识别个人、私有参考图或许可受限的角色/品牌素材。

## 故障排查

如果提示缺少 key，请在环境变量或 `~/.dsh/secrets/media-tools.env` 中配置 `SENSENOVA_API_KEY` 或 `SILICONFLOW_API_KEY`。如果服务商返回模型、余额或限流错误，按对应服务商控制台提示处理。
