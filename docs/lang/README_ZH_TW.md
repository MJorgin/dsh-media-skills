<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills —— 為 DeepSeek Harness 提供圖片審查與生成能力" width="100%">

<br>

# 🎨 dsh-media-skills

### 面向 DeepSeek Harness v0.1.6 的圖片審查與圖片生成技能

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-v0.1.6--alpha.2-4D6BFE)](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.6-alpha.2)
[![No bundled keys](https://img.shields.io/badge/keys-%E5%BE%9E%E4%B8%8D%E5%85%A7%E5%BB%BA-8B5CF6)](#金鑰與隱私)
[![Docs](https://img.shields.io/badge/docs-9%20languages-4D6BFE)](README_ZH_TW.md)

<br>

一個輕量 DSH 外掛，提供兩個「自帶金鑰」（bring-your-own-key）的媒體技能：

- 👁️ **`vision-review`** —— 描述圖片、OCR、審查截圖，發現文字重疊/溢出等 UI 問題，並可輸出結構化證據。
- 🎨 **`media-tools`** —— 透過 SenseNova U1 Fast 或 SiliconFlow Kolors 生成插畫、頭像、背景和 Banner。

外掛使用 DSH v0.1.6 的技能提供者生命週期，**不修改 DSH 核心、不變更模型設定、不註冊模型提供者、不寫入隱藏設定**。

[為什麼](#為什麼) · [安裝](#安裝) · [設定金鑰](#設定金鑰) · [用法](#用法) · [手動目錄安裝](#手動目錄安裝) · [驗證](#驗證) · [FAQ](#faq)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## 為什麼

DeepSeek Harness v0.1.6 已為支援圖片輸入的模型提供了現代的附件與檔案工作流程。本 bundle 聚焦原生附件支援之外仍然有價值的兩類互補工作：

| 需求 | 技能 | 作用 |
|---|---|---|
| 明確的截圖 QA | `vision-review` | 檢查渲染完整性、重疊、溢出、錯位、浮水印與視覺一致性。 |
| OCR 與圖片轉文字 | `vision-review` | 把截圖、照片和掃描件轉成文字，可選結構化 JSON 契約。 |
| 提供者故障轉移 | `vision-review` | 按固定順序嘗試已設定的引擎，並回報每次失敗。 |
| 圖片素材生產 | `media-tools` | 透過已設定的 SenseNova 或 SiliconFlow 金鑰生成可用圖片檔案。 |

模型路由交給 DSH 及其 **Models** 介面負責。因此外掛相容 v0.1.6 的執行階段啟用、停用、解除安裝與重啟，不殘留全域狀態。

## v0.1.6 有什麼變化

- 透過 `ctx.skills.registerProvider(...)` 註冊兩個內建技能。
- 移除舊的隱含 `llm-pi-ai` 設定寫入和所有模型路由播種邏輯。
- 技能中繼資料直接讀取各自的 `SKILL.md`，避免描述漂移。
- 支援執行階段外掛生命週期：註冊歸屬於外掛 fiber，可被乾淨移除。
- 舊核心補丁僅作為 `<= v0.1.1-rc.2` 的歷史資料保留；v0.1.6 不再需要。
- 新增靜態 manifest 校驗和執行階段 fake-context 提供者測試。

## 安裝

### 方式一：DSH Plugin Manager

在 DSH 的 Plugin Manager 中新增：

```text
github:MJorgin/dsh-media-skills
```

然後重啟該 profile。

### 方式二：CLI

以常用的 web profile 為例：

```sh
dsh plugin --profile web add github:MJorgin/dsh-media-skills
```

請把 `web` 替換為你實際使用的 DSH profile。安裝後重啟該 profile 以掛載新 bundle。

無需建置：套件內是開箱即用的 ESM 與 Python 腳本，沒有相依套件安裝，也沒有 `prepare` 腳本。

## 設定金鑰

金鑰永遠不會存放在本倉庫中。技能腳本優先讀取環境變數，然後讀取：

```text
~/.dsh/secrets/media-tools.env
~/.codex/secrets/media-tools.env   # 歷史相容
```

`vision-review` 還可以從以下檔案讀取相容金鑰：

```text
~/.dsh/.credentials.yaml
```

`media-tools` 讀取環境變數和兩個 `media-tools.env` 檔案；請在上述位置明確設定它的金鑰。

| 金鑰 | 使用方 | 說明 |
|---|---|---|
| `GLM_API_KEY` | `vision-review` | 主引擎智譜 `glm-4v-flash`；請核實智譜當前定價/免費額度條款。 |
| `DEEPSEEK_API_KEY` | `vision-review` | 可選的付費 DeepSeek 視覺模型；也會從 DSH 認證儲存讀取。 |
| `SILICONFLOW_API_KEY` | 兩個技能 | 審查用 Qwen3-VL，生成用 Kolors。 |
| `SENSENOVA_API_KEY` | 兩個技能 | 審查用 SenseNova 視覺模型，生成用 U1 Fast。 |
| `GEMINI_API_KEY` | `vision-review` | 可選 Gemini 備用引擎；部分網路下可能需要 `GEMINI_PROXY`。 |

secrets 檔案範例：

```sh
# ~/.dsh/secrets/media-tools.env，建議 chmod 600
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
SENSENOVA_API_KEY=...
GEMINI_API_KEY=...
```

### DSH 原生圖片模型

本外掛不會向 DSH 模型選擇器新增模型。若希望一般 DSH 對話原生接收圖片，請在 DSH 的 **Models** 設定中設定多模態模型/提供者，然後使用 DSH 原生附件流程。

當你需要專門的腳本化審查/OCR 工作流程、提供者故障轉移鏈或結構化證據，而不只是多模態對話回覆時，使用 `vision-review`。

## 用法

### 視覺審查

請 DSH 使用 `vision-review`，或在技能目錄下直接執行腳本：

```bash
python3 scripts/vision.py screenshot.png
python3 scripts/vision.py a.png b.png --structured
python3 scripts/vision.py screenshot.png --provider=siliconflow-qwen
python3 scripts/vision.py --doctor
```

預設 prompt 會檢查渲染完整性、文字重疊/錯位/溢出、配色層次、浮水印和明顯視覺 bug。針對具體任務可傳入聚焦 prompt：

```bash
python3 scripts/vision.py page.png --prompt="檢查按鈕、標題和圖表是否有重疊，並指出具體位置"
```

故障轉移鏈只會在對應金鑰可用時加入引擎。可選的 `--structured` 輸出包含摘要、OCR、按閱讀順序的版面、語義、視覺備註和不確定項。

### 圖片生成

```bash
python3 skills/media-tools/scripts/generate.py "雲海中的中國宮殿，寫實電影感，氣勢恢宏" palace.jpg 16:9
```

設定了 `SENSENOVA_API_KEY` 時使用 SenseNova，否則在有 `SILICONFLOW_API_KEY` 時使用 SiliconFlow Kolors。SenseNova 尺寸可傳精確尺寸或常見比例，腳本會映射到最接近的支援尺寸。

## 手動目錄安裝

建議使用外掛安裝，因為本倉庫包含多個技能。v0.1.6 的檔案系統提供者只掃描技能根目錄下一層，直接把倉庫複製進 `~/.dsh/skills/` 無法發現巢狀的 `skills/*/SKILL.md`。

手動安裝需要分別連結每個技能：

```sh
git clone https://github.com/MJorgin/dsh-media-skills.git ~/.dsh/bundles/dsh-media-skills
mkdir -p ~/.dsh/skills
ln -s ~/.dsh/bundles/dsh-media-skills/skills/vision-review ~/.dsh/skills/vision-review
ln -s ~/.dsh/bundles/dsh-media-skills/skills/media-tools ~/.dsh/skills/media-tools
```

建立連結後重啟 DSH。

## 驗證

執行完整本地檢查：

```sh
npm test
```

內容包括：DSH bundle manifest 校驗、透過仿 DSH 上下文進行執行階段提供者註冊/載入驗證、JavaScript 語法檢查，以及兩個技能腳本的 Python 編譯檢查。

## 歷史補丁

舊核心補丁仍為維護歷史 DSH 組建的使用者保留：

- [中文說明](../HARNESS_PATCH.md)
- [English notes](../HARNESS_PATCH_EN.md)

它們僅適用於截至 `v0.1.1-rc.2` 的歷史組建。v0.1.6 新使用者不要套用。

## 專案結構

```text
dsh-media-skills/
├── package.json              # DSH bundle manifest 與測試命令
├── cordis.patch.yml          # Cordis 外掛插入項
├── index.js                  # 註冊內建技能提供者
├── skills/
│   ├── vision-review/        # 圖片分析與截圖 QA
│   └── media-tools/          # 圖片生成
├── scripts/                  # bundle 校驗輔助腳本
├── examples/                 # 範例圖片與測試卡
└── docs/                     # 安裝指南、譯文與歷史資料
```

## FAQ

**DSH v0.1.6 需要核心補丁嗎？**
不需要。在 DSH 中設定多模態模型即可進行原生圖片對話；專門的審查與生成工作流程則使用技能腳本。

**外掛會自動向模型選擇器新增模型嗎？**
不會。DSH v0.1.6 已提供模型與外掛管理；外掛只註冊技能，絕不變更模型設定。

**所有提供者都是免費的嗎？**
提供者定價與免費額度政策可能變化。GLM-4V-Flash 和 Kolors 一向對免費額度友善，DeepSeek 則為付費。依賴某條工作流程前請查看提供者當前條款。

**內建 API 金鑰嗎？**
不。金鑰只存在於你的環境變數、DSH 認證儲存或本地 secrets 檔案中。

**敏感的公司內部截圖應該發給誰？**
只發給你所在組織批准的提供者。除非公司政策允許，內部文件不要發給 Gemini 或其他外部提供者。

## 範例

<img src="../../examples/generated/fox-forest.jpg" width="30%"> <img src="../../examples/generated/cat-astronaut.jpg" width="30%"> <img src="../../examples/vision-test-card.png" width="30%">

更多內容見 [examples/README.md](../../examples/README.md)。

## License

[MIT](../../LICENSE)
