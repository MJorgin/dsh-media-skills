<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — Lectura y generación de imágenes gratis para DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### *Pega una imagen directamente en el chat: modelo de visión, lectura y generación de imágenes gratis.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)

<br>

Dale a [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) «ojos» y un «pincel»:
dos skills gratuitas, un modelo de visión gratuito y lectura de imágenes pegadas, sin claves hardcodeadas.

[Capacidades](#-capacidades) · [Inicio rápido](#-inicio-rápido) · [Uso](#-uso) · [Guía de visión](../SETUP_VISION.md)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## ✨ Capacidades

| Capacidad | Qué hace | Modelo | Coste |
|---|---|---|---|
| 🖼️ Lectura de imágenes pegadas | En una sesión **de solo texto** (p. ej. deepseek-v4-pro), la barra de entrada gana un botón «Añadir imagen» (icono de imagen); las imágenes pegadas son descritas por el modelo de visión y entregadas al modelo actual como texto (**desde v0.1.1, DeepSeek-V4-Flash-Vision-Exp por defecto**) | v0.1.1: DeepSeek-Vision-Exp · rc.7/8: Zhipu GLM-4V-Flash | GLM gratis; DeepSeek facturado a tu saldo (por defecto en v0.1.1) |
| 🧠 Ruta de modelo de visión | Tras instalar, **automáticamente** añade «智譜 GLM-4V-Flash（視覚）」 al selector de modelos; úsalo en una conversación nueva para hablar sobre imágenes | Zhipu GLM-4V-Flash | Gratis |
| 👁️ `vision-review` | Analizar / reconocer / describir imágenes y capturas; detectar bugs visuales de UI (solapamientos, desbordes, desalineaciones); detectar marcas de agua/logos; convertir imágenes a texto. Cadena de motores: GLM-4V-Flash → DeepSeek-V4-Flash-Vision-Exp (misma clave que el agente, de pago opcional) → SenseNova / SiliconFlow / Gemini | GLM-4V-Flash＋DeepSeek-Vision-Exp＋SenseNova＋Gemini | Gratis (DeepSeek de pago opcional) |
| 🎨 `media-tools` | Generar imágenes, ilustraciones, avatares, fondos y banners | SenseNova U1 Fast → SiliconFlow Kolors | Gratis, sin marca de agua |

> ⚠️ Nota honesta: la lectura de imágenes pegadas vive en el **núcleo** de DeepSeek Harness (la lógica de admisión de imágenes y el hook `agent/pre-step` de auto-descripción; en v0.1.2 se eliminó el antiguo paquete `api-proxy` y el código se movió a `packages/api/session-controller`). Los parches del núcleo se incluyen para rc.7/rc.8/v0.1.1-rc.1/rc.2/**v0.1.2-alpha.3** ([HARNESS_PATCH](../HARNESS_PATCH_EN.md)). Este bundle aporta la **ruta de modelo + skills**; el modelo de visión funciona en cualquier build de DSH, pero la comodidad de auto-descripción requiere un build con ese soporte. Cómo saberlo: FAQ Q1.

## ⚡ Inicio rápido

1. Instala el bundle:

   ```sh
   dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
   ```

2. **Claves**: **en v0.1.1-rc.1+ (incluida la serie v0.1.2-alpha) no hace falta ninguna clave extra** — la lectura de imágenes pegadas y la ruta de visión usan el `DEEPSEEK_API_KEY` existente del agente. Para los motores gratuitos (o rc.7/rc.8): primero consigue la clave gratis — regístrate en [open.bigmodel.cn](https://open.bigmodel.cn) → **API Keys** (glm-4v-flash es gratis). Si también quieres generar, crea otra en [siliconflow.cn](https://siliconflow.cn) (Kolors es gratis). Luego configúrala — GUI web (**Ajustes → Modelos** → el campo **API Key** del proveedor zhipu-vision) o archivo de credenciales:

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <tu clave>
   ```

3. **Reinicia por completo** `dsh web` y haz un refresco forzado (`Cmd+Shift+R`).

4. Verifica: el selector de modelos muestra **智譜 GLM-4V-Flash（視覚）**. Si tu build soporta la lectura de imágenes pegadas, la barra de entrada muestra un botón 🖼️ **Añadir imagen** — pega una imagen en cualquier sesión y llegará como descripción de texto.

Guía completa, funcionamiento y resolución de problemas: **[../SETUP_VISION.md](../SETUP_VISION.md)**

## 🔑 Claves

Las claves **nunca se guardan en este repo**. Los scripts leen, en orden: variables de entorno → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env` (fallback legado). La ruta del modelo de visión lee `GLM_API_KEY` del almacén de credenciales de DSH.

Dónde conseguirlas: en v0.1.1+ usa el DEEPSEEK_API_KEY existente del agente (sin claves extra). Motores gratuitos: Zhipu — [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys (glm-4v-flash). SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → API Keys (Kolors).

```sh
# ~/.dsh/secrets/media-tools.env (chmod 600, una KEY=value por línea)
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 Uso

Tres formas de leer imágenes:

| Forma | Cómo | Cuándo |
|---|---|---|
| **A. Pegar directamente (recomendado)** | En cualquier sesión, pulsa el botón 🖼️ / arrastra / pega una imagen y envíala | Preguntas cotidianas sobre imágenes: sin guardar archivos ni cambiar de modelo |
| **B. Sesión con modelo de visión** | Conversación nueva, elige 智譜 GLM-4V-Flash（視覚）, pega imágenes y conversa | Conversaciones de varias rondas sobre imágenes, `read_image` nativo |
| **C. Archivos + skill** | Pon la imagen en el workspace y di «lee esta imagen con vision-review» | Revisión por lotes, flujos con scripts |

El idioma de la descripción sigue al de tu mensaje (mensaje en chino → descripción en chino; en inglés → en inglés; sin texto → chino).

También puedes decir:

- «Mira esta imagen / revisa esta captura en busca de bugs visuales» → `vision-review`
- «Genera una imagen de …» → `media-tools`

## 🗺️ Estructura

```
dsh-media-skills/
├── package.json           # manifiesto dsh.bundle
├── cordis.patch.yml       # capa de plugin
├── index.js               # registra skills + siembra la ruta zhipu-vision
├── skills/
│   ├── vision-review/     # lectura de imágenes
│   └── media-tools/       # generación de imágenes
├── docs/
│   ├── SETUP_VISION.md    # guía de visión (chino)
│   ├── SETUP_VISION_EN.md # detailed setup guide (English)
│   └── lang/              # READMEs en otros idiomas
├── scripts/make-banner.py # regenera docs/social-preview.png
└── docs/social-preview.png
```

## 🤝 Únete al ecosistema de plugins de DSH

La vista previa para desarrolladores de DeepSeek Harness sigue en fase de pruebas para desarrolladores de Harness; los plugins principales y las APIs base seguirán iterando. Esperamos explorar juntos los límites superiores de la inteligencia, con desarrolladores de todo el mundo, sobre infraestructura de código abierto, abierta, reutilizable y componible.

- [Topic dsh-plugin](https://github.com/topics/dsh-plugin)
- [Inicio rápido](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [Repo de DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

> Etiqueta este repo con [`dsh-plugin`](https://github.com/topics/dsh-plugin) para que otros lo descubran.

## 📄 Licencia

[MIT](../../LICENSE)
