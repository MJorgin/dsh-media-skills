<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — DeepSeek Harness용 이미지 검토 및 이미지 생성" width="100%">

<br>

# 🎨 dsh-media-skills

### DeepSeek Harness v0.1.6용 이미지 검토·생성 스킬

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-v0.1.6--alpha.2-4D6BFE)](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.6-alpha.2)
[![No bundled keys](https://img.shields.io/badge/keys-never%20in%20repo-8B5CF6)](#키-구성)
[![Docs](https://img.shields.io/badge/docs-9%20languages-4D6BFE)](README_KO.md)

<br>

가벼운 DSH 플러그인으로, 키를 직접 준비하는(bring-your-own-key) 두 개의 미디어 스킬을 제공합니다.

- 👁️ **`vision-review`** — 이미지 설명, OCR, 스크린샷 검토, 텍스트 겹침/넘침 같은 UI 문제 탐지, 선택적 구조화 증거 출력.
- 🎨 **`media-tools`** — SenseNova U1 Fast 또는 SiliconFlow Kolors로 일러스트, 아바타, 배경, 배너 생성.

이 플러그인은 DSH v0.1.6 스킬 프로바이더 라이프사이클을 사용하며, **DSH 코어 패치, 모델 설정 변경, 프로바이더 등록, 숨겨진 설정 기록을 전혀 하지 않습니다**.

[이유](#왜-사용하나요) · [설치](#설치) · [키 구성](#키-구성) · [사용법](#사용법) · [수동 설치](#수동-디렉터리-설치) · [검증](#검증) · [FAQ](#faq)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## 왜 사용하나요

DeepSeek Harness v0.1.6은 이미지 입력을 받는 모델을 위한 최신 첨부파일·파일 워크플로를 이미 지원합니다. 이 번들은 네이티브 첨부 지원으로도 남아 있는 두 가지 보완 작업에 집중합니다.

| 필요 | 스킬 | 도움 |
|---|---|---|
| 명시적 스크린샷 QA | `vision-review` | 렌더링 완전성, 겹침, 넘침, 어긋남, 워터마크, 시각적 일관성 확인. |
| OCR 및 이미지→텍스트 | `vision-review` | 스크린샷·사진·스캔을 텍스트로 변환. 선택적 구조화 JSON 계약. |
| 프로바이더 장애 조치 | `vision-review` | 구성된 엔진을 예측 가능한 순서로 시도하고 각 실패를 보고. |
| 이미지 에셋 제작 | `media-tools` | 구성된 SenseNova 또는 SiliconFlow 키로 실사용 가능한 이미지 파일 생성. |

모델 라우팅은 DSH와 **Models** UI가 담당합니다. 덕분에 v0.1.6의 런타임 활성화·비활성화·제거·재시작과 호환되고 전역 상태를 남기지 않습니다.

## v0.1.6 변경 사항

- `ctx.skills.registerProvider(...)`로 두 개의 번들 스킬을 등록.
- 기존의 암묵적 `llm-pi-ai` 설정 변경과 모든 모델 라우트 시딩 제거.
- 스킬 메타데이터를 각 `SKILL.md`에서 직접 읽어 문구 불일치를 방지.
- 런타임 플러그인 라이프사이클 지원: 등록은 플러그인 fiber가 소유하며 깔끔하게 제거 가능.
- 예전 코어 패치는 `<= v0.1.1-rc.2`용 역사 자료로만 유지. v0.1.6에서는 불필요.
- 정적 manifest 검증과 런타임 fake-context 프로바이더 테스트 추가.

## 설치

### 방법 1: DSH Plugin Manager

DSH Plugin Manager에서 추가합니다.

```text
github:MJorgin/dsh-media-skills
```

그 다음 해당 프로필을 재시작하세요.

### 방법 2: CLI

일반적인 web 프로필의 경우:

```sh
dsh plugin --profile web add github:MJorgin/dsh-media-skills
```

`web`은 실제 사용하는 DSH 프로필로 바꾸세요. 설치 후 해당 프로필을 재시작하면 새 번들이 마운트됩니다.

빌드 단계가 없습니다. 바로 실행 가능한 ESM과 Python 스크립트로 배포되며, 의존성 설치나 `prepare` 스크립트가 없습니다.

## 키 구성

키는 이 저장소에 절대 저장되지 않습니다. 스킬 스크립트는 먼저 환경 변수를 읽은 뒤 다음 파일을 읽습니다.

```text
~/.dsh/secrets/media-tools.env
~/.codex/secrets/media-tools.env   # 레거시 호환
```

`vision-review`는 다음 파일에서도 호환 키를 읽을 수 있습니다.

```text
~/.dsh/.credentials.yaml
```

`media-tools`는 환경 변수와 두 개의 `media-tools.env` 파일을 읽으므로, 그 위치 중 하나에 키를 명시적으로 구성하세요.

| 키 | 사용 스킬 | 비고 |
|---|---|---|
| `GLM_API_KEY` | `vision-review` | 기본 엔진 즈푸 `glm-4v-flash`. 최신 요금·무료 한도 약관 확인 필요. |
| `DEEPSEEK_API_KEY` | `vision-review` | 선택적 유료 DeepSeek 비전 모델. DSH 자격 증명 저장소에서도 읽음. |
| `SILICONFLOW_API_KEY` | 두 스킬 | 검토는 Qwen3-VL, 생성은 Kolors. |
| `SENSENOVA_API_KEY` | 두 스킬 | 검토는 SenseNova 비전 모델, 생성은 U1 Fast. |
| `GEMINI_API_KEY` | `vision-review` | 선택적 Gemini 대비 엔진. 일부 망에서 `GEMINI_PROXY`가 필요할 수 있음. |

secrets 파일 예시:

```sh
# ~/.dsh/secrets/media-tools.env, chmod 600 권장
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
SENSENOVA_API_KEY=...
GEMINI_API_KEY=...
```

### DSH 네이티브 이미지 모델

이 플러그인은 DSH 모델 선택기에 모델을 추가하지 않습니다. 일반 DSH 대화에서 네이티브로 이미지를 받으려면 DSH **Models** 설정에서 멀티모달 모델/프로바이더를 구성한 뒤 DSH 네이티브 첨부 흐름을 사용하세요.

단순 멀티모달 채팅 응답 대신 전용 스크립트 검토/OCR 워크플로, 프로바이더 장애 조치 체인, 구조화 증거가 필요할 때 `vision-review`를 사용하세요.

## 사용법

### 비전 검토

DSH에 `vision-review` 사용을 요청하거나 스킬 디렉터리에서 스크립트를 직접 실행합니다.

```bash
python3 scripts/vision.py screenshot.png
python3 scripts/vision.py a.png b.png --structured
python3 scripts/vision.py screenshot.png --provider=siliconflow-qwen
python3 scripts/vision.py --doctor
```

기본 프롬프트는 렌더링 완전성, 텍스트 겹침/어긋남/넘침, 색 계층, 워터마크, 명백한 시각 버그를 검사합니다. 특정 작업에는 집중된 프롬프트를 전달하세요.

```bash
python3 scripts/vision.py page.png --prompt="버튼, 제목, 차트가 겹치는지 구체적 위치와 함께 지적해 줘"
```

장애 조치 체인에는 해당 키가 사용 가능한 엔진만 참여합니다. `--structured` 출력에는 요약, OCR, 읽기 순서 레이아웃, 의미, 시각 메모, 불확실 항목이 포함됩니다.

### 이미지 생성

```bash
python3 skills/media-tools/scripts/generate.py "운해 속 중국 궁전, 사실적이고 영화감 넘치는 웅장한 구도" palace.jpg 16:9
```

`SENSENOVA_API_KEY`가 있으면 SenseNova를, 없으면 `SILICONFLOW_API_KEY`가 있을 때 SiliconFlow Kolors를 사용합니다. SenseNova 크기는 정확한 치수나 일반적 비율로 전달할 수 있으며, 스크립트가 가장 가까운 지원 크기로 매핑합니다.

## 수동 디렉터리 설치

이 저장소에는 여러 스킬이 들어 있으므로 플러그인 설치를 권장합니다. v0.1.6 파일 시스템 프로바이더는 스킬 루트 아래 한 단계만 스캔하므로, 저장소를 `~/.dsh/skills/`에 바로 클론해도 중첩된 `skills/*/SKILL.md`를 발견하지 못합니다.

수동 설치는 각 스킬을 개별적으로 링크해야 합니다.

```sh
git clone https://github.com/MJorgin/dsh-media-skills.git ~/.dsh/bundles/dsh-media-skills
mkdir -p ~/.dsh/skills
ln -s ~/.dsh/bundles/dsh-media-skills/skills/vision-review ~/.dsh/skills/vision-review
ln -s ~/.dsh/bundles/dsh-media-skills/skills/media-tools ~/.dsh/skills/media-tools
```

링크 생성 후 DSH를 재시작하세요.

## 검증

전체 로컬 검사를 실행합니다.

```sh
npm test
```

DSH 번들 manifest 검증, 유사 DSH 컨텍스트를 통한 런타임 프로바이더 등록/로드, JavaScript 구문 검사, 두 스킬 스크립트의 Python 컴파일 검사를 실행합니다.

## 과거 패치

예전 코어 패치는 구형 DSH 빌드를 유지보수하는 사용자를 위해 남아 있습니다.

- [中文 안내](../HARNESS_PATCH.md)
- [English notes](../HARNESS_PATCH_EN.md)

이 패치는 `v0.1.1-rc.2`까지의 역사적 빌드에만 적용됩니다. v0.1.6 신규 사용자는 적용하지 마세요.

## 프로젝트 구조

```text
dsh-media-skills/
├── package.json              # DSH 번들 manifest와 테스트 명령
├── cordis.patch.yml          # Cordis 플러그인 삽입
├── index.js                  # 번들 스킬 프로바이더 등록
├── skills/
│   ├── vision-review/        # 이미지 분석과 스크린샷 QA
│   └── media-tools/          # 이미지 생성
├── scripts/                  # 번들 검증 헬퍼
├── examples/                 # 예시 이미지와 테스트 카드
└── docs/                     # 설정 가이드, 번역, 역사 자료
```

## FAQ

**DSH v0.1.6에 코어 패치가 필요한가요?**
아니요. DSH에서 멀티모달 모델을 구성하면 네이티브 이미지 대화가 가능합니다. 전용 검토·생성 워크플로에는 스킬 스크립트를 사용하세요.

**플러그인이 모델 선택기에 모델을 자동으로 추가하나요?**
아니요. v0.1.6에는 모델·플러그인 관리가 있으며, 플러그인은 스킬만 등록하고 모델 설정을 변경하지 않습니다.

**모든 프로바이더가 무료인가요?**
요금과 무료 한도 정책은 바뀔 수 있습니다. GLM-4V-Flash와 Kolors는 무료 한도에 우호적이지만 DeepSeek는 유료입니다. 워크플로에 의존하기 전에 프로바이더의 최신 약관을 확인하세요.

**API 키가 포함되어 있나요?**
아니요. 키는 환경 변수, DSH 자격 증명 저장소 또는 로컬 secrets 파일에만 존재합니다.

**민감한 사내 스크린샷은 어디로 보내야 하나요?**
조직이 승인한 프로바이더로만 보내세요. 회사 정책이 허용하지 않는다면 내부 문서를 Gemini 등 외부 프로바이더에 보내지 마세요.

## 예시

<img src="../../examples/generated/fox-forest.jpg" width="30%"> <img src="../../examples/generated/cat-astronaut.jpg" width="30%"> <img src="../../examples/vision-test-card.png" width="30%">

자세한 내용은 [examples/README.md](../../examples/README.md).

## License

[MIT](../../LICENSE)
