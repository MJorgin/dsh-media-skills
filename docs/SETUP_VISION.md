# DSH v0.1.6 安装与配置指南

这份指南区分两条能力链路：

1. **DSH 原生多模态对话**：在 DSH 中配置支持图片输入的模型，然后像平常一样附加图片。
2. **技能脚本工作流**：用 `vision-review` 做截图 QA/OCR，用 `media-tools` 生成图片。

[English](SETUP_VISION_EN.md) · [返回 README](../README.md)

## 1. 安装插件

在 DSH Plugin Manager 中添加：

```text
github:MJorgin/dsh-media-skills
```

或使用 CLI：

```sh
dsh plugin --profile web add github:MJorgin/dsh-media-skills
```

请把 `web` 替换成你实际使用的 DSH profile。安装后重启该 profile。

插件会注册两个技能：

- `vision-review`
- `media-tools`

插件不会向 DSH 模型选择器自动添加模型，也不会覆盖模型配置。

## 2. 配置 DSH 原生视觉模型

如果希望普通对话直接接收图片，请在 DSH 的 **Models** 设置中配置一个支持图片输入的 provider/model。

配置完成后，直接使用 DSH v0.1.6 的原生附件和文件处理流程即可。v0.1.6 不需要本仓库历史上的核心补丁。

除非你正在维护旧版 DSH，否则不要复制旧归档文档里的 `llm-pi-ai` YAML 片段。

## 3. 配置技能密钥

技能脚本优先读取环境变量，然后读取：

```text
~/.dsh/secrets/media-tools.env
~/.codex/secrets/media-tools.env
```

`vision-review` 还会读取 `~/.dsh/.credentials.yaml`，兼容顶层 key 和 `refs` 子映射两种格式。

示例：

```sh
# ~/.dsh/secrets/media-tools.env
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
SENSENOVA_API_KEY=...
GEMINI_API_KEY=...
```

建议把文件权限设置为 `600`。

## 4. 体检引擎

安装后可运行：

```sh
python3 scripts/vision.py --doctor
```

通过 DSH 使用时，技能资源目录会自动解析。如果从终端运行，请在已安装的 `vision-review` 技能目录下执行，或使用脚本绝对路径。

体检会检查 Pillow、已配置 key、候选模型名和端点连通性。

## 5. 使用技能

视觉检查：

```sh
python3 scripts/vision.py screenshot.png
python3 scripts/vision.py a.png b.png --structured
```

生成图片：

```sh
python3 ../media-tools/scripts/generate.py "云海之上的中国宫殿，写实、电影感、气势恢宏" palace.jpg 16:9
```

也可以直接用自然语言让 DSH 调用：

- “用 vision-review 检查这张截图有没有文字重叠。”
- “用 media-tools 生成一张科技感 banner。”

## 故障排查

**插件已安装但看不到技能。**
先重启 DSH profile。如果是手动目录安装，确认每个技能目录都直接位于技能根目录下一层；多技能仓库的嵌套目录不会被递归发现。

**原生图片附件被拒绝。**
检查当前选中的模型和 provider 配置。技能插件不会让纯文本模型变成多模态模型。

**技能提示缺少 key。**
把 key 放到环境变量或 `~/.dsh/secrets/media-tools.env`。`vision-review` 也可从 `~/.dsh/.credentials.yaml` 读取。

**Gemini 连不上。**
部分网络需要代理。可在同一环境或 secrets 中设置 `GEMINI_PROXY` 或 `HTTPS_PROXY`。

**缺少 Pillow。**
安装：

```sh
python3 -m pip install Pillow
```

## 历史版本

旧补丁文档仅用于维护 `v0.1.1-rc.2` 及更早版本：

- [中文补丁说明](HARNESS_PATCH.md)
- [English patch notes](HARNESS_PATCH_EN.md)

DSH v0.1.6 用户不要应用这些补丁。
