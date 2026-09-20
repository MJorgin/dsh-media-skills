<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — DeepSeek Harness のための画像レビューと画像生成" width="100%">

<br>

# 🎨 dsh-media-skills

### DeepSeek Harness v0.1.6 向けの画像レビュー・画像生成スキル

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-v0.1.6--alpha.2-4D6BFE)](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.6-alpha.2)
[![No bundled keys](https://img.shields.io/badge/keys-never%20in%20repo-8B5CF6)](#キーの設定)
[![Docs](https://img.shields.io/badge/docs-9%20languages-4D6BFE)](README_JA.md)

<br>

軽量な DSH プラグインです。キーは自分で用意する（bring-your-own-key）2 つのメディアスキルを提供します。

- 👁️ **`vision-review`** — 画像の記述、OCR、スクリーンショットの検査、文字の重なりやはみ出しといった UI 問題の検出、オプションで構造化エビデンスの出力。
- 🎨 **`media-tools`** — SenseNova U1 Fast または SiliconFlow Kolors でイラスト、アバター、背景、バナーを生成。

このプラグインは DSH v0.1.6 のスキルプロバイダー・ライフサイクルを使用し、**DSH コアへのパッチ、モデル設定の変更、プロバイダー登録、隠し設定の書き込みは一切行いません**。

[なぜ](#なぜ使うのか) · [インストール](#インストール) · [キー設定](#キーの設定) · [使い方](#使い方) · [手動インストール](#手動ディレクトリインストール) · [検証](#検証) · [FAQ](#faq)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## なぜ使うのか

DeepSeek Harness v0.1.6 は、画像入力を受け付けるモデル向けにモダンな添付ファイル・ファイルワークフローをすでに備えています。このバンドルは、ネイティブの添付ファイル機能ではカバーしきれない、相補的な 2 つの仕事に集中します。

| ニーズ | スキル | できること |
|---|---|---|
| 明示的なスクリーンショット QA | `vision-review` | 描画の完全性、重なり、はみ出し、ズレ、透かし、見た目の一貫性をチェック。 |
| OCR と画像のテキスト化 | `vision-review` | スクリーンショット・写真・スキャンをテキスト化。構造化 JSON 契約も選択可能。 |
| プロバイダーのフェイルオーバー | `vision-review` | 設定済みエンジンを決まった順序で試行し、失敗を報告。 |
| 画像素材の制作 | `media-tools` | 設定済みの SenseNova または SiliconFlow キーで実用的な画像ファイルを生成。 |

モデルルーティングは DSH とその **Models** UI に任せます。そのため v0.1.6 の実行時の有効化・無効化・アンインストール・再起動と互換性があり、グローバル状態を残しません。

## v0.1.6 の変更点

- `ctx.skills.registerProvider(...)` で 2 つのバンドルスキルを登録。
- 旧バージョンの暗黙的な `llm-pi-ai` 設定書き込みとモデルルートのシードをすべて削除。
- スキルのメタデータを各 `SKILL.md` から直接読み取り、文言のズレを防止。
- 実行時プラグイン・ライフサイクルをサポート。登録はプラグイン fiber に紐づき、クリーンに除去可能。
- 旧コアパッチは `<= v0.1.1-rc.2` 向けの歴史資料としてのみ保持。v0.1.6 では不要。
- 静的 manifest 検証と、擬似コンテキストによる実行時プロバイダーテストを追加。

## インストール

### 方法 1: DSH Plugin Manager

DSH の Plugin Manager で以下を追加します。

```text
github:MJorgin/dsh-media-skills
```

その後プロファイルを再起動してください。

### 方法 2: CLI

一般的な web プロファイルの場合:

```sh
dsh plugin --profile web add github:MJorgin/dsh-media-skills
```

`web` は実際に使う DSH プロファイルに置き換えてください。インストール後、そのプロファイルを再起動すると新しいバンドルがマウントされます。

ビルドは不要です。ESM と Python スクリプトがそのまま動く状態で同梱され、依存関係のインストールや `prepare` スクリプトはありません。

## キーの設定

キーがこのリポジトリに保存されることはありません。スキルスクリプトはまず環境変数を読み、その後以下を読みます。

```text
~/.dsh/secrets/media-tools.env
~/.codex/secrets/media-tools.env   # 旧バージョン互換
```

`vision-review` は以下のファイルからも互換キーを読み取れます。

```text
~/.dsh/.credentials.yaml
```

`media-tools` は環境変数と 2 つの `media-tools.env` を読みます。これらの場所のいずれかに明示的に設定してください。

| キー | 利用スキル | 備考 |
|---|---|---|
| `GLM_API_KEY` | `vision-review` | プライマリの智譜 `glm-4v-flash`。最新の料金・無料枠条件を要確認。 |
| `DEEPSEEK_API_KEY` | `vision-review` | 任意の有料 DeepSeek ビジョンモデル。DSH 認証ストアからも読取。 |
| `SILICONFLOW_API_KEY` | 両方 | レビューは Qwen3-VL、生成は Kolors。 |
| `SENSENOVA_API_KEY` | 両方 | レビューは SenseNova ビジョンモデル、生成は U1 Fast。 |
| `GEMINI_API_KEY` | `vision-review` | 任意の Gemini フォールバック。ネットワークによっては `GEMINI_PROXY` が必要。 |

secrets ファイルの例:

```sh
# ~/.dsh/secrets/media-tools.env, chmod 600 推奨
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
SENSENOVA_API_KEY=...
GEMINI_API_KEY=...
```

### DSH ネイティブの画像モデル

このプラグインは DSH のモデル選択にモデルを追加しません。通常の DSH 会話でネイティブに画像を受け付けたい場合は、DSH の **Models** 設定でマルチモーダルモデル/プロバイダーを設定し、DSH 標準の添付フローを使ってください。

マルチモーダルチャットの応答だけでなく、スクリプト化されたレビュー/OCR ワークフロー、プロバイダーのフェイルオーバーチェーン、構造化エビデンスが必要な場合は `vision-review` を使ってください。

## 使い方

### ビジョンレビュー

DSH に `vision-review` を使うよう依頼するか、スキルディレクトリから直接スクリプトを実行します。

```bash
python3 scripts/vision.py screenshot.png
python3 scripts/vision.py a.png b.png --structured
python3 scripts/vision.py screenshot.png --provider=siliconflow-qwen
python3 scripts/vision.py --doctor
```

デフォルトプロンプトは、描画の完全性、文字の重なり・ズレ・はみ出し、配色の階層、透かし、明らかな視覚バグをチェックします。特定タスクには絞り込んだプロンプトを渡せます。

```bash
python3 scripts/vision.py page.png --prompt="ボタン、見出し、チャートの重なりを位置付きで指摘してください"
```

フェイルオーバーチェーンには、対応するキーが利用可能なエンジンだけが参加します。`--structured` を付けると、要約、OCR、読み順のレイアウト、セマンティクス、視覚メモ、不確実性を含む構造化出力が得られます。

### 画像生成

```bash
python3 skills/media-tools/scripts/generate.py "雲海に浮かぶ中国宮殿、写実的で映画的、雄大な構図" palace.jpg 16:9
```

`SENSENOVA_API_KEY` があれば SenseNova、なければ `SILICONFLOW_API_KEY` がある場合に SiliconFlow Kolors を使います。SenseNova のサイズは正確な寸法または一般的な比率で指定でき、最も近い対応サイズにマッピングされます。

## 手動ディレクトリインストール

このリポジトリには複数スキルが含まれるため、プラグインとしてのインストールを推奨します。v0.1.6 のファイルシステムプロバイダーはスキルルートの 1 階層だけをスキャンするため、リポジトリを直接 `~/.dsh/skills/` にクローンしてもネストされた `skills/*/SKILL.md` は発見されません。

手動インストールではスキルごとにリンクします。

```sh
git clone https://github.com/MJorgin/dsh-media-skills.git ~/.dsh/bundles/dsh-media-skills
mkdir -p ~/.dsh/skills
ln -s ~/.dsh/bundles/dsh-media-skills/skills/vision-review ~/.dsh/skills/vision-review
ln -s ~/.dsh/bundles/dsh-media-skills/skills/media-tools ~/.dsh/skills/media-tools
```

リンク作成後に DSH を再起動してください。

## 検証

ローカルの全チェックを実行します。

```sh
npm test
```

DSH バンドル manifest の検証、DSH 風コンテキストを通した実行時プロバイダーの登録・読込テスト、JavaScript 構文チェック、両スキルスクリプトの Python コンパイルチェックを行います。

## 歴史的パッチ

旧コアパッチは、古い DSH ビルドを保守するユーザー向けに残されています。

- [中文説明](../HARNESS_PATCH.md)
- [English notes](../HARNESS_PATCH_EN.md)

これらが適用されるのは `v0.1.1-rc.2` までの歴史的ビルドです。v0.1.6 の新規ユーザーは適用しないでください。

## プロジェクト構成

```text
dsh-media-skills/
├── package.json              # DSH バンドル manifest とテストコマンド
├── cordis.patch.yml          # Cordis プラグインの挿入
├── index.js                  # バンドルスキルプロバイダーの登録
├── skills/
│   ├── vision-review/        # 画像分析とスクリーンショット QA
│   └── media-tools/          # 画像生成
├── scripts/                  # バンドル検証ヘルパー
├── examples/                 # サンプル画像とテストカード
└── docs/                     # セットアップガイド、翻訳、歴史資料
```

## FAQ

**DSH v0.1.6 にコアパッチは必要ですか？**
いいえ。DSH でマルチモーダルモデルを設定すればネイティブに画像会話できます。専用のレビュー・生成ワークフローにはスキルスクリプトを使ってください。

**プラグインはモデル選択にモデルを自動追加しますか？**
いいえ。v0.1.6 にはモデル・プラグイン管理があり、プラグインはスキルを登録するだけでモデル設定を変更しません。

**すべてのプロバイダーは無料ですか？**
料金や無料枠は変わることがあります。GLM-4V-Flash と Kolors は無料枠に友好的ですが、DeepSeek は有料です。依存する前に各プロバイダーの最新条件を確認してください。

**API キーは同梱されていますか？**
いいえ。キーは環境変数、DSH 認証ストア、またはローカルの secrets ファイルにのみ存在します。

**社内の機密スクリーンショットはどこに送るべきですか？**
組織が承認したプロバイダーだけに送ってください。社内文書をポリシーで許可されずに Gemini などの外部プロバイダーへ送らないでください。

## 例

<img src="../../examples/generated/fox-forest.jpg" width="30%"> <img src="../../examples/generated/cat-astronaut.jpg" width="30%"> <img src="../../examples/vision-test-card.png" width="30%">

詳細は [examples/README.md](../../examples/README.md)。

## License

[MIT](../../LICENSE)
