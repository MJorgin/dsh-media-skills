<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — DeepSeek Harness를 위한 무료 이미지 읽기 및 생성 스킬" width="100%">

<br>

# 🎨 dsh-media-skills

### *채팅창에 이미지를 바로 붙여넣기 —— 무료 비전 모델과 이미지 읽기·생성 스킬*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)

<br>

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)에 「눈」과 「붓」을 ——
무료 스킬 2개, 무료 비전 모델 1개, 텍스트 전용 세션에서의 이미지 붙여넣기까지. 키 하드코딩 없음.

[기능](#-기능) · [빠른 시작](#-빠른-시작) · [사용법](#-사용법) · [비전 설정 가이드](../SETUP_VISION.md)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## ✨ 기능

| 기능 | 설명 | 모델 | 비용 |
|---|---|---|---|
| 🖼️ 이미지 붙여넣기 자동 읽기 | **텍스트 전용 세션**(예: deepseek-v4-pro)의 입력창에 「이미지 추가」 버튼(이미지 아이콘)이 생기고, 붙여넣은 이미지는 비전 모델이 자동으로 텍스트 설명으로 변환해 현재 모델에 전달(**v0.1.1부터는 DeepSeek-V4-Flash-Vision-Exp가 기본**) | v0.1.1: DeepSeek-Vision-Exp · rc.7/8: Zhipu GLM-4V-Flash | GLM 무료·DeepSeek 잔액 과금(v0.1.1 기본) |
| 🧠 비전 모델 라우트 | 설치 후 모델 선택기에 **자동으로** 「智譜 GLM-4V-Flash（視覚）」이 등록되어, 새 세션에서 이미지에 대해 바로 대화 가능 | Zhipu GLM-4V-Flash | 무료 |
| 👁️ `vision-review` | 이미지·스크린샷 분석/인식/설명, UI 시각 버그(겹침·넘침·어긋남) 탐지, 워터마크/로고 감지, 이미지 텍스트화. 엔진 체인: GLM-4V-Flash → DeepSeek-V4-Flash-Vision-Exp(에이전트와 동일 키·선택 유료) → SenseNova / SiliconFlow / Gemini | GLM-4V-Flash＋DeepSeek-Vision-Exp＋SenseNova＋Gemini | 무료(DeepSeek 선택 유료) |
| 🎨 `media-tools` | 이미지·일러스트·아바타·배경·배너 생성 | SiliconFlow Kolors | 무료, 워터마크 없음 |

> ⚠️ 정직한 안내: 「이미지 붙여넣기 자동 읽기」는 DeepSeek Harness **본체** 기능(`api-proxy`의 이미지 수용 로직)입니다. 이 번들이 제공하는 것은 **모델 설정 + 읽기/생성 스킬**입니다. 비전 모델은 어떤 DSH 빌드에서도 동작하지만, 자동 읽기 편의 기능은 본체에 해당 지원이 포함되어 있어야 합니다. 판별 방법은 [../SETUP_VISION.md](../SETUP_VISION.md) FAQ Q1을 참고하세요.

## ⚡ 빠른 시작

1. 번들 설치:

   ```sh
   dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
   ```

2. **키**: **v0.1.1-rc.1부터는 추가 키 불필요** — 붙여넣기 읽기와 비전 라우트가 에이전트의 기존 `DEEPSEEK_API_KEY`로 동작합니다. 무료 엔진을 쓰려면(또는 rc.7/rc.8): 먼저 무료로 키 발급 — [open.bigmodel.cn](https://open.bigmodel.cn)에 가입/로그인 → 「API Keys」(glm-4v-flash 무료). 생성도 쓸 거면 [siliconflow.cn](https://siliconflow.cn)에서도 발급(Kolors 무료). 그다음 Zhipu 키 설정 — Web GUI(**설정 → 모델** → zhipu-vision 프로바이더의 **API Key 필드**) 또는 자격증명 파일:

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <내 Zhipu 키>
   ```

3. `dsh web`을 **완전히 재시작**하고 `Cmd+Shift+R`로 강력 새로고침.

4. 확인: 모델 선택기에 **「智譜 GLM-4V-Flash（視覚）」**이 보여야 합니다. 본체가 붙여넣기 읽기를 지원하면 입력창 왼쪽 아래에 **🖼️「이미지 추가」 버튼**이 보입니다. 아무 세션에 이미지를 붙여넣으면 텍스트 설명으로 도착합니다.

전체 절차·동작 원리·문제 해결: **[../SETUP_VISION.md](../SETUP_VISION.md)**

## 🔑 키

키는 **이 저장소에 절대 저장되지 않습니다**. 스킬 스크립트는 다음 순서로 읽습니다: 환경 변수 → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env`(레거시 폴백). 비전 모델 라우트는 DSH 자격증명 저장소에서 `GLM_API_KEY`를 읽습니다.

키 발급처: v0.1.1+는 에이전트의 기존 DEEPSEEK_API_KEY 그대로 사용(추가 발급 불필요). 무료 엔진: Zhipu [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys(glm-4v-flash); SiliconFlow [siliconflow.cn](https://siliconflow.cn) → API Keys(Kolors).

```sh
# ~/.dsh/secrets/media-tools.env (chmod 600, 줄마다 KEY=value)
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 사용법

이미지를 읽는 세 가지 방법:

| 방법 | 사용법 | 적합한 상황 |
|---|---|---|
| **A. 직접 붙여넣기(권장)** | 아무 세션에서 이미지 버튼 / 드래그 / 붙여넣기 후 전송 | 일상적인 이미지 질문 — 파일 저장·모델 전환 불필요 |
| **B. 비전 모델 세션** | 새 대화에서 「智譜 GLM-4V-Flash（視覚）」을 선택하고 이미지를 붙여넣어 대화 | 이미지 중심의 다중 턴 대화, 네이티브 `read_image` |
| **C. 파일 + 스킬** | 이미지를 작업공간에 두고 "vision-review로 이 이미지를 읽어줘"라고 말하기 | 일괄 검토, 스크립트화된 작업 |

설명 언어는 메시지 언어를 자동으로 따릅니다(중국어 메시지→중국어 설명, 영어 메시지→영어 설명, 텍스트 없음→중국어).

그냥 이렇게 말하세요:

- 「이 이미지 좀 봐줘 / 이 스크린샷에 시각 버그 있는지 확인해줘」→ `vision-review`
- 「〜한 이미지 생성해줘」→ `media-tools`

## 🗺️ 구성

```
dsh-media-skills/
├── package.json           # dsh.bundle 매니페스트
├── cordis.patch.yml       # 플러그인 레이어
├── index.js               # 스킬 등록 + zhipu-vision 모델 라우트 자동 기록
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
