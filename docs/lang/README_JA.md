<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — DeepSeek Harness のための無料画像読み取り・生成スキル" width="100%">

<br>

# 🎨 dsh-media-skills

### *DeepSeek Harness に再利用可能な画像レビュー／画像生成スキルを追加 — Desktop 0.2.0-rc.2 で動作確認済み。*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)
[![Harness](https://img.shields.io/badge/Harness-0.2.0%20verified%20%7C%200.2.1--rc.2%20source%20checked-4D6BFE)](../DESKTOP_0.2.md)

<br>

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) に「目」と「筆」を——2 つの無料スキル、1 つの無料ビジョンモデル、
2つのランタイムスキルと、BYOKのビジョン・フェイルオーバーチェーンを提供します。Desktop **0.2.0-rc.2** でランタイム動作を確認し、最新タグ **dsh-v0.2.1-rc.2** でも同じ provider 契約をソースコードで確認済みです。キーのハードコードはありません。

[機能](#-機能) · [クイックスタート](#-クイックスタート) · [互換性](#-互換性) · [使い方](#-使い方) · [Vision 設定](../SETUP_VISION.md)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## ✨ 機能

| 機能 | 内容 | モデル | 費用 |
|---|---|---|---|
| 🖼️ ネイティブ画像添付 | Desktop 0.2 / v0.1.6+ では、**現在のルートが画像対応**していれば貼り付け・ドラッグ・選択できます。既定の `deepseek-flash` は画像対応です。テキスト専用ルートは `MODEL_DOES_NOT_SUPPORT_IMAGES` で拒否し、旧自動文字起こしは呼び出されません。 | 既定 `deepseek-flash` または設定した Vision ルート | 選択したプロバイダーに準ずる |
| 🔀 Vision フェイルオーバー | ファイルパスやスクリプト型ワークフローでは、`vision-review` が GLM-4V-Flash、DeepSeek Vision、Qwen3-VL、SenseNova、Gemini、カスタム OpenAI 互換エンドポイントを順に試せます。 | 各自のキーとルート | 無料枠または任意プロバイダー |
| 👁️ `vision-review` | ローカル画像・スクリーンショットの分析、OCR、透かし／ロゴ検出、UI の視覚的不具合検出、構造化 JSON 証拠の出力に対応します。ロングパス、一括確認、`--structured` も利用できます。 | GLM-4V-Flash + 任意の Vision プロバイダー | GLM/SiliconFlow 無料枠、その他は任意 |
| 🎨 `media-tools` | 画像・イラスト・アバター・背景・バナーの生成 | SenseNova U1 Fast → SiliconFlow Kolors | 無料・ウォーターマークなし |

> ⚠️ 重要: Desktop 0.2 でネイティブ画像添付が許可されるのは、現在のモデルが `inputModalities: ["text", "image"]` を公開している場合だけです。**コアパッチは不要**で、署名済み `app.asar` を変更してはいけません。プラグインはモデル設定も書き換えません。テキスト専用ルートでは、ローカル画像パスで `vision-review` を呼びます。

## ⚡ クイックスタート

1. バンドルをインストール：

   ```sh
   dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
   ```

2. **キー**：
   - **Desktop 0.2 / v0.1.6+**: インストール自体にキーは不要で、2つのスキルはランタイム登録されます。既定の `deepseek-flash` はネイティブ画像会話に対応しています。スキルのフェイルオーバー用キー（`GLM_API_KEY`、`SILICONFLOW_API_KEY`、任意 `GEMINI_API_KEY`）は `~/.dsh/secrets/media-tools.env` に置き、追加ルートは **設定 → モデル** で自分で構成します。
   - **旧 ≤ v0.1.1 プレビュー版**: 当時の貼り付け読み取りと Vision ルートは、エージェント既存の `DEEPSEEK_API_KEY` を使える場合がありました。この自動文字起こし動作は Desktop 0.2 には適用されません。

   ```sh
   # ~/.dsh/.credentials.yaml（chmod 600）
   GLM_API_KEY: <あなたの Zhipu キー>
   ```

3. `dsh web` を**完全に再起動**し、`Cmd+Shift+R` でハードリフレッシュ。

4. 確認: スキル一覧に **`vision-review`** と **`media-tools`** が表示されます。Desktop 0.2 でネイティブ添付する前に、**`deepseek-flash`** などの画像対応ルートを選択してください。テキスト専用ルートでは `MODEL_DOES_NOT_SUPPORT_IMAGES` が返り、自動説明は行われません。

詳細な手順・仕組み・トラブルシューティング：**[../SETUP_VISION.md](../SETUP_VISION.md)**

## 🔑 キー

キーがこのリポジトリに保存されることは**ありません**。スタンドアロンの `vision-review` チェーンは、環境変数 → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env`（旧フォールバック）の順に読みます。旧 GLM ルート自動設定は ≤ v0.1.1 だけのもので、Desktop 0.2 / v0.1.6+ のルートは **設定 → モデル** で管理します。

スキル用エンジンのキー入手先（無料枠は各社条件に準ずる）: Zhipu — [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys（glm-4v-flash）。SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → API Keys（Kolors）。Google Gemini は任意でフェイルオーバーに追加できます。

```sh
# ~/.dsh/secrets/media-tools.env（chmod 600、1 行に KEY=value）
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 使い方

画像を読む 3 つの方法：

| 方法 | 使い方 | 向いている場面 |
|---|---|---|
| **A. ネイティブ添付（推奨）** | 画像対応ルート（既定 `deepseek-flash`）を選び、🖼️ ボタン・ドラッグ・貼り付けで送信する | 日常的なマルチモーダル画像質問 |
| **B. 画像対応モデルの会話** | 新しい会話で `deepseek-flash`、または設定済み GLM/Qwen/SenseNova ルートを選び、画像を貼り付ける | 複数ターンのネイティブ画像会話 |
| **C. ファイル + スキル** | 画像をワークスペースに置き、「vision-review でこの画像を読んで」と指示するか、パス付きで `scripts/vision.py` を実行する | 一括レビュー、構造化 OCR/QA、テキスト専用ルート |

ネイティブ添付は、選択した画像対応モデルへ直接送られます。`vision-review` ではプロンプトで言語や出力形式を指定するか、`--structured` を使います。

そのほか、こう言うだけ：

- 「この画像を見て / このスクリーンショットの視覚バグをチェックして」→ `vision-review`
- 「〜の画像を生成して」→ `media-tools`

## 🔌 互換性

| DSH ビルド | 状態 |
|---|---|
| Desktop **0.2.0-rc.2** | **ランタイム確認済み。** 標準ランタイムプラグインとして、両スキルは `ctx.skills.registerProvider()` で登録されます。ネイティブ添付は `inputModalities: ["text", "image"]` の場合だけ許可され、既定 `deepseek-flash` は対応しています。コアパッチも設定書き込みも不要です。 |
| タグ **dsh-v0.2.1-rc.2** | **ソース確認済み。** `@deepseek-ai/dsh-skill@0.2.1-rc.2` は provider factory、`list()`/`get()`、candidate フィールド、画像 admission を維持しています。完全起動テスト用のパッケージ済み rc.2 Desktop ビルドは手元にありません。 |
| **v0.1.6** | 同じサポート対象の provider ライフサイクルです。任意 GLM/SiliconFlow/SenseNova/Gemini ルートは **設定 → モデル** で構成します。 |
| v0.1.1 以前のプレビュー版 | 履歴的な動作です。古いコアパッチを署名済み Desktop 0.2 ビルドに適用しないでください。 |

完全な確認項目は [Desktop 0.2 互換性メモ](../DESKTOP_0.2.md) を参照してください。

### ModLens との併用

[ModLens](https://github.com/liustack/modlens) と同時にインストールできますが、Desktop 0.2 には旧 api-proxy の自動文字起こしフォールバックはありません。ModLens の「貼り付け→パス」ワークフローを残すか、`pasteToPath: false` にして画像対応モデルへネイティブ添付するかを明確に選んでください。歴史的な比較（中国語）は [../COMPARE_MODLENS.md](../COMPARE_MODLENS.md) にあります。

## 🗺️ 構成

```
dsh-media-skills/
├── package.json           # dsh.bundle マニフェスト
├── cordis.patch.yml       # プラグインレイヤー
├── index.js               # DSH v0.1.6+ / Desktop 0.2 の provider ランタイム経由で2スキルを登録
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
