<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — DeepSeek Harness 的免費圖片讀取與生成" width="100%">

<br>

# 🎨 dsh-media-skills

### *賦予 DeepSeek Harness 眼睛——以及一支畫筆。在任何對話中讀取圖片、生成新圖片，全部使用免費模型。*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)
[![Free vision](https://img.shields.io/badge/vision-GLM%2BGemini-2EA44F)](../SETUP_VISION_EN.md)
[![Free generation](https://img.shields.io/badge/generation-Kolors-2EA44F)](../FREE_VISION_PROVIDERS_EN.md)
[![No hardcoded keys](https://img.shields.io/badge/keys-never%20in%20repo-8B5CF6)](README_ZH_TW.md#-金鑰與隱私)
[![Docs](https://img.shields.io/badge/docs-9%20languages-4D6BFE)](README_ZH_TW.md)

<br>

DeepSeek Harness 的推理能力十分出色——但純文字模型看不見你剛拖進對話的圖片。這個套件以**兩個免費技能**、一個**免費視覺模型路由**以及一條**視覺引擎容錯移轉鏈**解決這個問題：

- 🖼️ **貼上即讀取**——在任何工作階段中貼上、拖曳或挑選圖片；免費視覺模型會把它轉成你目前模型能理解的文字。
- 👁️ **`vision-review`**——分析圖片與螢幕截圖、找出 UI 視覺錯誤、偵測浮水印、將圖片轉成文字。
- 🎨 **`media-tools`**——用免費、無浮水印的模型生成插圖、頭像、背景與橫幅。
- 🔀 **引擎容錯移轉**——GLM-4V-Flash → SiliconFlow Qwen3-VL → Google Gemini（[AI Studio](https://aistudio.google.com)）→ 任何 OpenAI 相容端點，並輸出 ModLens 風格的結構化證據。

不寫死金鑰、無需付費 API、不需儲存檔案、不用切換工作階段。

[為什麼](#-為什麼) · [快速開始](#-快速開始) · [看看實際效果](#-看看實際效果) · [使用方法](#-使用方法) · [金鑰與隱私](#-金鑰與隱私) · [常見問題](#-常見問題) · [範例](#-範例)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## 🤔 為什麼

多數 DSH 視覺外掛只能**讀取**圖片——而且很多會把你導向共用的第三方端點。`dsh-media-skills` 採取不同的立場：

| | 本套件 | 一般僅視覺外掛 |
|---|---|---|
| 免費讀取圖片 | ✅ Zhipu GLM-4V-Flash | ✅ |
| 免費**生成**圖片 | ✅ SiliconFlow Kolors | ❌ 通常沒有 |
| 選取器中自動加入模型路由 | ✅ 自動安裝 | 有時 |
| 金鑰提交至儲存庫 | ❌ 絕不——金鑰僅存本機 | ⚠️ 通常需要 |
| 多語言說明文件 | ✅ 9 種語言 | ❌ 通常只有英文 |
| 隱私 | ✅ 由你選擇供應商；圖片只會傳給你的供應商 | 共用免費端點可能看到你的圖片 |

**為什麼要自備免費金鑰，而不是使用內建的匿名端點？** 隱私與可靠性。你的圖片只會傳給你選擇的供應商，在你的帳戶與速率限制之下運作——中間沒有任何共用的第三方服務。

## ✨ 你會獲得什麼

| 功能 | 作用 | 模型 | 費用 |
|---|---|---|---|
| 🖼️ 貼上圖片讀取 | 在**純文字**工作階段中，輸入列會多出「Add image」按鈕（圖片圖標）；貼上的圖片會由視覺模型自動描述，並以文字形式交給目前的模型 | Zhipu GLM-4V-Flash | 免費 |
| 🧠 視覺模型路由 | 「智譜 GLM-4V-Flash（視覺）」會自動出現在模型選擇器中——在開新對話時選用它，即可直接針對圖片交談 | Zhipu GLM-4V-Flash | 免費 |
| 👁️ `vision-review` | 分析／辨識／描述圖片與螢幕截圖；找出 UI 視覺錯誤（重疊、溢出、未對齊）；偵測浮水印／標誌；將圖片轉成文字。選用的 `--structured` 模式會回傳 ModLens 風格的證據 JSON（摘要、完整 OCR、閱讀順序版面、實體／關係、不確定性）。引擎容錯移轉鏈：GLM-4V-Flash → SiliconFlow Qwen3-VL／Google Gemini（有免費金鑰即自動加入）→ 任何 OpenAI 相容端點 | GLM-4V-Flash＋Qwen3-VL＋Gemini | 免費 |
| 🎨 `media-tools` | 生成圖片、插圖、頭像、背景、橫幅 | SiliconFlow Kolors | 免費、無浮水印 |

## ⚡ 快速開始

```sh
dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
```

1. **取得兩個免費金鑰**（約 2 分鐘，無需付款）：
   - Zhipu——[open.bigmodel.cn](https://open.bigmodel.cn) → **API Keys**（`glm-4v-flash` 免費）
   - SiliconFlow——[siliconflow.cn](https://siliconflow.cn) → **API Keys**（Kolors 免費）
   - *（選用的第三個）* Google Gemini——[aistudio.google.com](https://aistudio.google.com) → **Get API key**；會自動加入視覺容錯移轉鏈
2. **加入金鑰**：在網頁介面（**Settings → Models** → zhipu-vision 供應商的 **API Key** 欄位）中輸入，或使用憑證檔案：

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <你的金鑰>
   ```

3. **重新啟動** `dsh web`，然後強制重新整理（`Cmd+Shift+R`）。

驗證：模型選擇器會顯示**智譜 GLM-4V-Flash（視覺）**。如果你的 Harness 版本支援貼上圖片讀取，輸入列也會有 🖼️ **Add image** 按鈕——在任何工作階段貼上圖片，它就會以文字描述的形式抵達。

完整步驟與疑難排解：[../SETUP_VISION_EN.md](../SETUP_VISION_EN.md)。

## 📸 看看實際效果

*在純文字工作階段貼上圖片 → 免費視覺模型描述它 → 你的模型回答。同一個套件也能按需求生成新圖片。*

<img src="../screenshots/demo-paste.png" alt="示範：在純文字 DeepSeek Harness 工作階段貼上圖片，視覺模型讀取後由模型回答；同一個套件也能生成圖片" width="100%">

*一張圖看懂運作方式：*

<img src="../screenshots/how-it-works.png" alt="貼上圖片讀取的運作方式：貼上 → 視覺模型描述 → 文字描述送達目前的模型" width="100%">

## 🚀 使用方法

讀取圖片的三種方式：

| 方式 | 做法 | 時機 |
|---|---|---|
| **A. 直接貼上（建議）** | 在任何工作階段中，點擊 🖼️ 按鈕／拖曳／貼上圖片後送出 | 日常圖片問答——不需儲存檔案、不用切換模型 |
| **B. 視覺模型工作階段** | 開新對話，選擇智譜 GLM-4V-Flash（視覺），貼上圖片開始交談 | 多輪圖片對話、原生 `read_image` |
| **C. 檔案＋技能** | 把圖片放進工作區，說「用 vision-review 讀取這張圖片」 | 批次審查、腳本化工作流程 |

描述會跟隨你的訊息語言（中文訊息 → 中文描述；英文訊息 → 英文描述；沒有文字 → 中文）。

也可以直接說：

- 「看看這張圖片／檢查這張截圖有沒有視覺錯誤」 → `vision-review`
- 「生成一張……的圖片」 → `media-tools`

## 🔑 金鑰與隱私

金鑰**絕不儲存在這個儲存庫中**。技能腳本依序讀取：環境變數 → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env`（舊版備援）。視覺模型路由會從 DSH 的憑證存放區讀取 `GLM_API_KEY`。

哪裡取得金鑰（全部免費）：Zhipu——[open.bigmodel.cn](https://open.bigmodel.cn) → API Keys（glm-4v-flash）。SiliconFlow——[siliconflow.cn](https://siliconflow.cn) → API Keys（Kolors）。Google（選用，會自動加入視覺容錯移轉鏈）——[aistudio.google.com](https://aistudio.google.com) → Get API key。

```sh
# ~/.dsh/secrets/media-tools.env（chmod 600，每行一個 KEY=value）
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
GEMINI_API_KEY=...   # 選用
```

你的圖片只會傳給你設定的供應商——絕不會傳給這個儲存庫，也不會傳給共用的匿名端點。

> Gemini 的隱私提醒：Google 免費層級金鑰附有資料使用條款——請求內容可能被用於改善 Google 產品。對於敏感圖片（身分證件、內部文件、客戶資料），建議優先使用直接連線的引擎（Zhipu／SiliconFlow）。

## ❓ 常見問題

**貼上圖片讀取是否需要修補 DeepSeek Harness 核心？**
自動描述管線位於 Harness **核心**（`api-proxy` 的圖片准入邏輯；請見 [../HARNESS_PATCH_EN.md](../HARNESS_PATCH_EN.md)）。這個套件提供**模型路由＋技能**：視覺模型在任何 DSH 版本都能運作，但貼上圖片讀取需要具備該核心支援的 Harness 版本——請見 [../SETUP_VISION_EN.md](../SETUP_VISION_EN.md) 的常見問答 Q1。

**為什麼不乾脆使用完全不需要金鑰的內建免費端點？**
我們傾向讓你自己掌控路由：你的圖片會傳給你選擇的供應商，在你的速率限制之下運作，中間沒有共用的仲介。金鑰免費，大約兩分鐘就能建立。

**`media-tools` 真的免費嗎？**
是的——SiliconFlow Kolors 免費且無浮水印。如果某個模型暫時停用，技能會列出可用模型，你可以自行切換。

## 🎁 範例

可立即試用的範例素材——6 張 AI 生成圖片及其提示詞，加上一張專為檢查讀取準確度設計的視覺測試卡（標題、按鈕、長條圖數值）：

<img src="../../examples/generated/fox-forest.jpg" width="30%"> <img src="../../examples/generated/cat-astronaut.jpg" width="30%"> <img src="../../examples/vision-test-card.png" width="30%">

→ [../../examples/README.md](../../examples/README.md)

## 🗺️ 目錄結構

```
dsh-media-skills/
├── package.json           # dsh.bundle 清單
├── cordis.patch.yml       # 外掛層
├── index.js               # 註冊技能＋植入 zhipu-vision 模型路由
├── skills/
│   ├── vision-review/     # 圖片讀取
│   └── media-tools/       # 圖片生成
├── examples/              # 範例圖片＋視覺測試卡
├── docs/
│   ├── screenshots/       # 示範樣板與運作原理示意圖
│   ├── SETUP_VISION_EN.md # 詳細設定指南（英文）
│   ├── SETUP_VISION.md    # 詳細設定指南（中文）
│   ├── HARNESS_PATCH_EN.md# 核心修補說明（英文）
│   ├── HARNESS_PATCH.md   # 主程式修補說明（中文）
│   ├── COMPARE_MODLENS.md # 與 ModLens 的比較／共存（中文）
│   └── lang/              # 9 種語言的 README
├── scripts/make-banner.py # 重新生成 docs/social-preview.png
└── docs/social-preview.png
```

## 🧩 想與 ModLens 並用？

這個套件和 [ModLens](https://github.com/liustack/modlens) 都能賦予純文字模型視覺能力。兩者同時安裝不會衝突：ModLens 會先攔截貼上的圖片（路徑 → `modlens_read_image` 工具），這個套件的 api-proxy 備援則處理它未接管的部分。完整的比較、貼上路由順序，以及如何將 ModLens 指向同一個免費 Zhipu 端點，請見 [../COMPARE_MODLENS.md](../COMPARE_MODLENS.md)（中文）。

## 🤝 加入 DSH 外掛生態系

DeepSeek Harness 開發者預覽版對 Harness 開發者而言仍處於測試階段；核心外掛與基礎 API 將持續迭代。我們期待與全球開發者一起，在開放原始碼、開放、可重用且可組合的基礎設施之上，探索智慧的極限。

- [dsh-plugin topic](https://github.com/topics/dsh-plugin)
- [Quickstart](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [DeepSeek Harness repo](https://github.com/deepseek-ai/deepseek-harness)

> 這個儲存庫已標記為 [`dsh-plugin`](https://github.com/topics/dsh-plugin) 並收錄於 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 精選清單。歡迎提交 PR、回報問題與翻譯貢獻。

## 📄 授權條款

[MIT](../../LICENSE)
