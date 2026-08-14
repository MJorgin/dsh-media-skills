<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — 為 DeepSeek Harness 而生的免費讀圖與生圖 Skill" width="100%">

<br>

# 🎨 dsh-media-skills

### *直接把圖片貼進聊天框 —— DeepSeek Harness 的免費視覺模型與讀圖·生圖 Skill*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)

<br>

給 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 裝上「眼睛」和「畫筆」——
兩個免費 Skill、一個免費視覺模型，還能在純文字工作階段裡直接貼圖，全程無 Key 硬編碼。

[能力一覽](#-能力一覽) · [快速開始](#-快速開始) · [使用方式](#-使用方式) · [視覺模型詳細設定](../SETUP_VISION.md)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## ✨ 能力一覽

| 能力 | 說明 | 模型 | 費用 |
|---|---|---|---|
| 📎 貼圖自動轉述 | **純文字工作階段**（如 deepseek-v4-pro）的輸入框會多出「新增圖片」按鈕（迴紋針）；貼圖後由視覺模型自動轉成文字描述發給目前模型 | 智譜 GLM-4V-Flash | 免費 |
| 🧠 視覺模型路由 | 安裝後**自動**在模型選擇器寫入「智譜 GLM-4V-Flash（視覺）」，新工作階段選它即可直接看圖對話 | 智譜 GLM-4V-Flash | 免費 |
| 👁️ `vision-review` | 分析 / 辨識 / 描述圖片與截圖；找出介面視覺 bug（重疊、溢出、錯位）；偵測浮水印 Logo；圖片轉文字 | 智譜 GLM-4V-Flash | 免費 |
| 🎨 `media-tools` | 產生圖片、插畫、頭像、背景、banner | SiliconFlow Kolors | 免費、無浮水印 |

> ⚠️ 誠實說明：「貼圖自動轉述」屬於 DeepSeek Harness **本體**能力（`api-proxy` 的圖片准入邏輯）。本 bundle 負責**模型設定 + 讀圖/生圖技能**；任何 DSH 版本裝上後視覺模型都可用，但自動轉述這個便利功能需要你的 DSH 本體也包含對應支援。判斷方法見 [../SETUP_VISION.md](../SETUP_VISION.md) 常見問題 Q1。

## ⚡ 快速開始

1. 安裝 bundle：

   ```sh
   dsh plugin --profile <name> add github:akqwpeter-prog/dsh-media-skills
   ```

2. **先去免費申請 Key**：註冊/登入 [open.bigmodel.cn](https://open.bigmodel.cn) → 「API Keys」（glm-4v-flash 免費）；要生圖再順便到 [siliconflow.cn](https://siliconflow.cn) 建立一個（Kolors 免費）。然後填入——Web 介面（**設定 → 模型** → 找到 zhipu-vision 提供方的 **API Key 欄**）或憑證檔案裡填：

   ```sh
   # ~/.dsh/.credentials.yaml（chmod 600）
   GLM_API_KEY: <你的智譜 Key>
   ```

3. **徹底重啟** `dsh web`，然後 `Cmd+Shift+R` 強制重新整理頁面。

4. 驗證：模型選擇器出現 **「智譜 GLM-4V-Flash（視覺）」**；若你的 DSH 版本支援貼圖轉述，輸入框左下角還會出現 **📎「新增圖片」按鈕**。任意工作階段貼一張圖——它會以文字描述的形式到達。

完整步驟、工作原理與排錯：**[../SETUP_VISION.md](../SETUP_VISION.md)**

## 🔑 金鑰

Key **永不寫進本倉庫**。技能腳本按順序讀取：環境變數 → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env`（相容回退）；視覺模型路由從 DSH 憑證庫讀取 `GLM_API_KEY`。

Key 取得（皆免費）：智譜 [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys（glm-4v-flash）；SiliconFlow [siliconflow.cn](https://siliconflow.cn) → API 金鑰（Kolors）。

```sh
# ~/.dsh/secrets/media-tools.env（chmod 600，每行 KEY=value）
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 使用方式

三種讀圖方式：

| 方式 | 怎麼用 | 適用場景 |
|---|---|---|
| **A. 直接貼圖（推薦）** | 任意工作階段點迴紋針選圖 / 拖曳 / 貼上，直接傳送 | 日常看圖，不用切工作階段、不用存檔案 |
| **B. 視覺模型工作階段** | 新開對話，模型選「智譜 GLM-4V-Flash（視覺）」，貼圖對話 | 多輪圍繞圖片對話、原生讀圖（`read_image`） |
| **C. 檔案 + 技能** | 把圖放到工作區，說「用 vision-review 讀一下這張圖」 | 批次檢查、腳本化處理 |

轉述語言自動跟隨你發訊息的語言（中文訊息出中文描述、英文訊息出英文描述；沒打字預設中文）。

另外直接說：

- 「看看這張圖 / 檢查這個截圖有沒有視覺 bug」→ 走 `vision-review`
- 「給我產生一張 XX 的圖」→ 走 `media-tools`

## 🗺️ 目錄結構

```
dsh-media-skills/
├── package.json           # dsh.bundle 清單
├── cordis.patch.yml       # 外掛層
├── index.js               # 註冊技能 + 自動寫入 zhipu-vision 模型路由
├── skills/
│   ├── vision-review/     # 讀圖
│   └── media-tools/       # 生圖
├── docs/
│   ├── SETUP_VISION.md    # 視覺模型詳細設定指南（中文）
│   ├── SETUP_VISION_EN.md # detailed setup guide (English)
│   └── lang/              # 各語言 README
├── scripts/make-banner.py # 重現 docs/social-preview.png
└── docs/social-preview.png
```

## 🤝 加入 DSH 外掛生態

DeepSeek Harness 開發者預覽版仍處於面向 Harness 開發者的測試階段，核心外掛和基礎 API 將持續迭代。我們期待與全球開發者一起，在開源、開放、可複用、可組合的基礎設施之上，共同探索智慧上限。

- [dsh-plugin 外掛話題](https://github.com/topics/dsh-plugin)
- [快速上手](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [DeepSeek Harness 倉庫](https://github.com/deepseek-ai/deepseek-harness)

> 給本倉庫打上 [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic，方便被發現。

## 📄 License

[MIT](../../LICENSE)
