<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — DeepSeek Harness のための無料画像読み取り・生成スキル" width="100%">

<br>

# 🎨 dsh-media-skills

### *チャット欄に画像を直接貼り付け —— 無料のビジョンモデルと画像読み取り・生成スキル*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)

<br>

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) に「目」と「筆」を——2 つの無料スキル、1 つの無料ビジョンモデル、
さらにテキスト専用セッションへの画像貼り付け。キーのハードコードは一切なし。

[機能](#-機能) · [クイックスタート](#-クイックスタート) · [使い方](#-使い方) · [ビジョン設定ガイド](../SETUP_VISION.md)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## ✨ 機能

| 機能 | 内容 | モデル | 費用 |
|---|---|---|---|
| 🖼️ 画像貼り付け自動読み取り | **テキスト専用セッション**（例: deepseek-v4-pro）の入力欄に「画像を追加」ボタン（画像アイコン）が現れ、貼り付けた画像はビジョンモデルが自動でテキスト説明に変換して現行モデルへ渡す（**v0.1.1 以降は DeepSeek-V4-Flash-Vision-Exp がデフォルト**） | v0.1.1: DeepSeek-Vision-Exp · rc.7/8: 智譜 GLM-4V-Flash | GLM 無料・DeepSeek は残高払い（v0.1.1 デフォルト） |
| 🧠 ビジョンモデルルート | ≤ v0.1.1 ではインストール後、モデルセレクターに**自動で**「智譜 GLM-4V-Flash（視覚）」が追加されます（**v0.1.6** では **設定 → モデル** から一度追加）。新規セッションで画像について直接会話できます | 智譜 GLM-4V-Flash | 無料 |
| 👁️ `vision-review` | 画像・スクリーンショットの分析 / 認識 / 説明、UI の視覚的バグ（重なり・はみ出し・ずれ）の検出、ウォーターマーク / ロゴ検出、画像のテキスト化。エンジンチェーン: GLM-4V-Flash → DeepSeek-V4-Flash-Vision-Exp（エージェントと同じキー・任意で有料）→ SenseNova / SiliconFlow / Gemini | GLM-4V-Flash＋DeepSeek-Vision-Exp＋SenseNova＋Gemini | 無料（DeepSeek は任意・有料） |
| 🎨 `media-tools` | 画像・イラスト・アバター・背景・バナーの生成 | SenseNova U1 Fast → SiliconFlow Kolors | 無料・ウォーターマークなし |

> ⚠️ 正直な注記：「画像貼り付け自動読み取り」は DeepSeek Harness **本体**の機能です——**v0.1.6 / v0.1.1** は標準搭載、rc.7 / rc.8 は同梱のコアパッチ（`api-proxy` の画像受付ロジック）で有効になります。このバンドルが提供するのは**読み取り/生成スキル**（≤ v0.1.1 ではモデルルートも）です。ビジョンモデルはどの DSH ビルドでも動作します。

## ⚡ クイックスタート

1. バンドルをインストール：

   ```sh
   dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
   ```

2. **キー**：
   - **v0.1.6**：インストールにキーは不要——2 つのスキルが実行時に登録されます。スキル用キー（`GLM_API_KEY`、`SILICONFLOW_API_KEY`、任意で `GEMINI_API_KEY`）は `~/.dsh/secrets/media-tools.env` に置きます（[キー](#-キー) 参照）。ネイティブのモデルルートは **設定 → モデル** でご自身が設定してください。
   - **v0.1.1-rc.1 以降は追加キー不要**——貼り付け読み取りとビジョンルートはエージェントの既存 `DEEPSEEK_API_KEY` で動きます。無料エンジンを使う場合（または rc.7/rc.8）は、まず無料でキーを取得：[open.bigmodel.cn](https://open.bigmodel.cn) に登録/ログイン → 「API Keys」（glm-4v-flash は無料）。生成も使うなら [siliconflow.cn](https://siliconflow.cn) でも作成（Kolors は無料）。その後 Zhipu のキーを設定—— Web GUI（**設定 → モデル**）またはクレデンシャルファイルで：

   ```sh
   # ~/.dsh/.credentials.yaml（chmod 600）
   GLM_API_KEY: <あなたの Zhipu キー>
   ```

3. `dsh web` を**完全に再起動**し、`Cmd+Shift+R` でハードリフレッシュ。

4. 確認：スキル一覧に **`vision-review`** と **`media-tools`** が表示されること（v0.1.6 のビジョンルートは **設定 → モデル** でご自身で追加；≤ v0.1.1 ではモデルセレクターに **「智譜 GLM-4V-Flash（視覚）」** が表示されます）。本体が貼り付け読み取りに対応していれば、入力欄左下に **🖼️「画像を追加」ボタン**が表示される。任意のセッションに画像を貼ると、テキスト説明として届く。

詳細な手順・仕組み・トラブルシューティング：**[../SETUP_VISION.md](../SETUP_VISION.md)**

## 🔑 キー

キーは**このリポジトリに一切保存されない**。スキルスクリプトは次の順で読み取る：環境変数 → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env`（後方互換）。ビジョンモデルルートは DSH のクレデンシャルストアから `GLM_API_KEY` を読む（≤ v0.1.1。v0.1.6 ではルートを **設定 → モデル** でご自身が設定します）。

キー入手先（いずれも無料）：智譜 [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys（glm-4v-flash）；SiliconFlow [siliconflow.cn](https://siliconflow.cn) → API Keys（Kolors）。

```sh
# ~/.dsh/secrets/media-tools.env（chmod 600、1 行に KEY=value）
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 使い方

画像を読む 3 つの方法：

| 方法 | 使い方 | 向いている場面 |
|---|---|---|
| **A. 直接貼り付け（推奨）** | 任意のセッションで画像ボタン / ドラッグ / ペーストして送信 | 日常的な画像の質問——ファイル保存もモデル切り替えも不要 |
| **B. ビジョンモデルセッション** | 新規会話で「智譜 GLM-4V-Flash（視覚）」を選び、画像を貼って会話 | 画像を中心にした複数ターンの会話、ネイティブ `read_image` |
| **C. ファイル + スキル** | 画像をワークスペースに置き「vision-review でこの画像を読んで」と言う | 一括チェック、スクリプト化した処理 |

説明の言語はメッセージの言語に自動追従（中国語メッセージ→中国語の説明、英語メッセージ→英語の説明、テキストなし→中国語）。

そのほか、こう言うだけ：

- 「この画像を見て / このスクリーンショットの視覚バグをチェックして」→ `vision-review`
- 「〜の画像を生成して」→ `media-tools`

## 🗺️ 構成

```
dsh-media-skills/
├── package.json           # dsh.bundle マニフェスト
├── cordis.patch.yml       # プラグインレイヤー
├── index.js               # DSH v0.1.6 のプロバイダーライフサイクルで 2 つのスキルを登録
├── skills/
│   ├── vision-review/     # 画像読み取り
│   └── media-tools/       # 画像生成
├── docs/
│   ├── SETUP_VISION.md    # ビジョン設定ガイド（中国語）
│   ├── SETUP_VISION_EN.md # detailed setup guide (English)
│   └── lang/              # 各言語 README
├── scripts/make-banner.py # docs/social-preview.png の再生成
└── docs/social-preview.png
```

## 🤝 DSH プラグインエコシステムに参加

DeepSeek Harness 開発者プレビューは、Harness 開発者向けのテスト段階にあります。コアプラグインとベース API は進化を続けます。オープンソースで、オープンで、再利用可能で、組み合わせ可能なインフラの上で、世界中の開発者とともに知能の限界を探求していきましょう。

- [dsh-plugin トピック](https://github.com/topics/dsh-plugin)
- [クイックスタート](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [DeepSeek Harness リポジトリ](https://github.com/deepseek-ai/deepseek-harness)

> このリポジトリに [`dsh-plugin`](https://github.com/topics/dsh-plugin) トピックを付けて発見されやすくしましょう。

## 📄 License

[MIT](../../LICENSE)
