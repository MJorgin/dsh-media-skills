<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — DeepSeek Harness를 위한 무료 이미지 읽기 및 생성 스킬" width="100%">

<br>

# 🎨 dsh-media-skills

### *DeepSeek Harness에 재사용 가능한 이미지 검토 및 생성 스킬을 추가하세요 — Desktop 0.2.0-rc.2에서 검증됨.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)
[![Harness](https://img.shields.io/badge/Harness-0.2.0%20verified%20%7C%200.2.1--rc.2%20source%20checked-4D6BFE)](../DESKTOP_0.2.md)

<br>

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)에 「눈」과 「붓」을 ——
두 개의 런타임 스킬과 자체 키 기반 Vision 장애 조치 체인을 제공합니다. Desktop **0.2.0-rc.2**에서 런타임 동작을 검증했고, 최신 태그 **dsh-v0.2.1-rc.2**에서도 동일한 provider 계약을 소스로 확인했습니다. 하드코딩된 키는 없습니다.

[기능](#-기능) · [빠른 시작](#-빠른-시작) · [호환성](#-호환성) · [사용법](#-사용법) · [Vision 설정](../SETUP_VISION.md)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## ✨ 기능

| 기능 | 설명 | 모델 | 비용 |
|---|---|---|---|
| 🖼️ 네이티브 이미지 첨부 | Desktop 0.2 / v0.1.6+에서는 **현재 라우트가 이미지를 지원할 때** 붙여넣기·드래그·선택할 수 있습니다. 기본 `deepseek-flash`는 이미지를 지원합니다. 텍스트 전용 라우트는 `MODEL_DOES_NOT_SUPPORT_IMAGES`로 거부하며 예전 자동 전사 파이프라인은 사용하지 않습니다. | 기본 `deepseek-flash` 또는 설정한 Vision 라우트 | 선택한 제공업체 기준 |
| 🔀 Vision 장애 조치 체인 | 파일 경로 및 스크립트 워크플로우에서 `vision-review`가 GLM-4V-Flash, DeepSeek Vision, Qwen3-VL, SenseNova, Gemini, 사용자 정의 OpenAI 호환 엔드포인트를 순서대로 시도할 수 있습니다. | 사용자 키와 라우트 | 무료 한도 또는 선택 제공업체 |
| 👁️ `vision-review` | 로컬 이미지와 스크린샷 분석, OCR, 워터마크/로고 감지, UI 시각적 버그 검사, 구조화된 JSON 증거 출력을 지원합니다. 긴 경로, 일괄 검토, `--structured`도 사용할 수 있습니다. | GLM-4V-Flash + 선택 Vision 제공업체 | GLM/SiliconFlow 무료 한도, 나머지는 선택 |
| 🎨 `media-tools` | 이미지·일러스트·아바타·배경·배너 생성 | SenseNova U1 Fast → SiliconFlow Kolors | 무료, 워터마크 없음 |

> ⚠️ 중요: Desktop 0.2에서 네이티브 이미지 첨부가 허용되려면 현재 모델이 `inputModalities: ["text", "image"]`를 선언해야 합니다. **코어 패치는 필요 없고**, 서명된 `app.asar`를 수정해서는 안 되며, 번들이 모델 설정을 쓰지도 않습니다. 텍스트 전용 라우트에서는 로컬 이미지 경로로 `vision-review`를 호출하세요.

## ⚡ 빠른 시작

1. 번들 설치:

   ```sh
   dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
   ```

2. **키**:
   - **Desktop 0.2 / v0.1.6+**: 설치에 키가 필요하지 않으며 두 스킬이 런타임에 등록됩니다. 기본 `deepseek-flash` 라우트는 네이티브 이미지 대화를 지원합니다. 스킬 장애 조치용 키(`GLM_API_KEY`, `SILICONFLOW_API_KEY`, 선택 `GEMINI_API_KEY`)는 `~/.dsh/secrets/media-tools.env`에 두고, 추가 모델 라우트는 **설정 → 모델**에서 직접 설정합니다.
   - **이전 ≤ v0.1.1 미리보기 빌드**: 당시 붙여넣기 읽기와 Vision 라우트는 에이전트의 기존 `DEEPSEEK_API_KEY`를 사용할 수 있었습니다. 이 자동 전사 동작은 Desktop 0.2에 적용되지 않습니다.

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <내 Zhipu 키>
   ```

3. `dsh web`을 **완전히 재시작**하고 `Cmd+Shift+R`로 강력 새로고침.

4. 확인: 스킬 목록에 **`vision-review`**, **`media-tools`**가 표시됩니다. Desktop 0.2에서 네이티브 첨부를 보내기 전에는 **`deepseek-flash`**처럼 이미지를 지원하는 라우트를 선택하세요. 텍스트 전용 라우트는 `MODEL_DOES_NOT_SUPPORT_IMAGES`를 반환하며 이미지를 자동으로 설명하지 않습니다.

전체 절차·동작 원리·문제 해결: **[../SETUP_VISION.md](../SETUP_VISION.md)**

## 🔑 키

키는 이 저장소에 **절대 저장되지 않습니다**. 독립 실행형 `vision-review` 체인은 환경 변수 → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env`(레거시 폴백) 순서로 읽습니다. 예전 자동 GLM 라우트 설정은 ≤ v0.1.1에만 해당하며 Desktop 0.2 / v0.1.6+ 라우트는 **설정 → 모델**에서 관리합니다.

스킬 엔진용 키 발급처(무료 한도는 제공업체 약관 기준): Zhipu — [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys(glm-4v-flash). SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → API Keys(Kolors). Google Gemini는 선택 사항으로 장애 조치 체인에 추가할 수 있습니다.

```sh
# ~/.dsh/secrets/media-tools.env (chmod 600, 줄마다 KEY=value)
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 사용법

이미지를 읽는 세 가지 방법:

| 방법 | 사용법 | 적합한 상황 |
|---|---|---|
| **A. 네이티브 첨부(권장)** | 이미지 지원 라우트(기본 `deepseek-flash`)를 선택하고 🖼️ 버튼 클릭 / 드래그 / 붙여넣기 후 전송 | 일반적인 멀티모달 이미지 질문 |
| **B. 이미지 지원 모델 세션** | 새 대화에서 `deepseek-flash` 또는 설정된 GLM/Qwen/SenseNova 라우트를 선택하고 이미지를 첨부 | 다중 턴 네이티브 이미지 대화 |
| **C. 파일 + 스킬** | 이미지를 워크스페이스에 두고 “vision-review로 이 이미지를 읽어줘”라고 말하거나 경로와 함께 `scripts/vision.py`를 실행 | 일괄 검토, 구조화 OCR/QA, 텍스트 전용 라우트 |

네이티브 첨부는 선택한 이미지 지원 모델로 직접 전송됩니다. `vision-review`에서는 프롬프트로 언어와 출력 형식을 지정하거나 `--structured`를 사용합니다.

그냥 이렇게 말하세요:

- 「이 이미지 좀 봐줘 / 이 스크린샷에 시각 버그 있는지 확인해줘」→ `vision-review`
- 「〜한 이미지 생성해줘」→ `media-tools`

## 🔌 호환성

| DSH 빌드 | 상태 |
|---|---|
| Desktop **0.2.0-rc.2** | **런타임 검증 완료.** 표준 런타임 플러그인이며 두 스킬은 `ctx.skills.registerProvider()`로 등록됩니다. 네이티브 첨부는 `inputModalities: ["text", "image"]`일 때만 허용되고 기본 `deepseek-flash`는 지원합니다. 코어 패치나 설정 쓰기는 없습니다. |
| 태그 **dsh-v0.2.1-rc.2** | **소스 확인 완료.** `@deepseek-ai/dsh-skill@0.2.1-rc.2`는 provider factory, `list()`/`get()`, candidate 필드, 이미지 허용 동작을 유지합니다. 전체 부팅 테스트용 rc.2 Desktop 패키지 빌드는 로컬에 없었습니다. |
| **v0.1.6** | 동일하게 지원되는 provider 라이프사이클입니다. 선택 GLM/SiliconFlow/SenseNova/Gemini 라우트는 **설정 → 모델**에서 설정합니다. |
| v0.1.1 및 이전 미리보기 빌드 | 기록상 동작만을 위한 설명입니다. 서명된 Desktop 0.2 빌드에 예전 코어 패치를 적용하지 마세요. |

전체 검사 목록은 [Desktop 0.2 호환성 노트](../DESKTOP_0.2.md)를 참고하세요.

### ModLens와 함께 사용

이 번들은 [ModLens](https://github.com/liustack/modlens)와 함께 설치할 수 있지만, Desktop 0.2에는 예전 api-proxy 자동 전사 폴백이 없습니다. ModLens의 붙여넣기→경로 워크플로우를 유지하거나, 이미지 지원 모델에 네이티브 첨부하도록 `pasteToPath: false`를 사용하세요. 역사적 비교 문서(중국어)는 [../COMPARE_MODLENS.md](../COMPARE_MODLENS.md)에 있습니다.

## 🗺️ 구성

```
dsh-media-skills/
├── package.json           # dsh.bundle 매니페스트
├── cordis.patch.yml       # 플러그인 레이어
├── index.js               # DSH v0.1.6+ / Desktop 0.2 provider 런타임으로 두 스킬 등록
├── skills/
│   ├── vision-review/     # 이미지 읽기
│   └── media-tools/       # 이미지 생성
├── docs/
│   ├── SETUP_VISION.md    # 비전 설정 가이드(중국어)
│   ├── SETUP_VISION_EN.md # detailed setup guide (English)
│   └── lang/              # 각 언어 README
├── scripts/make-banner.py # docs/social-preview.png 재생성
└── docs/social-preview.png
```

## 🤝 DSH 플러그인 생태계에 참여하세요

DeepSeek Harness 개발자 프리뷰는 Harness 개발자 대상 테스트 단계이며, 핵심 플러그인과 기본 API는 계속 발전합니다. 오픈소스·개방적·재사용 가능·조합 가능한 인프라 위에서 전 세계 개발자들과 함께 지능의 한계를 탐험하길 기대합니다.

- [dsh-plugin 토픽](https://github.com/topics/dsh-plugin)
- [빠른 시작](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [DeepSeek Harness 저장소](https://github.com/deepseek-ai/deepseek-harness)

> 이 저장소에 [`dsh-plugin`](https://github.com/topics/dsh-plugin) 토픽을 달아 다른 사람들이 찾을 수 있게 하세요.

## 📄 License

[MIT](../../LICENSE)
