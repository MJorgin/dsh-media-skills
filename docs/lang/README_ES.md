<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — Lectura y generación de imágenes gratis para DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### *Añade a DeepSeek Harness skills reutilizables de revisión visual y generación de imágenes — verificado con Desktop 0.2.0-rc.2.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)
[![Harness](https://img.shields.io/badge/Harness-0.2.0%20verified%20%7C%200.2.1--rc.2%20source%20checked-4D6BFE)](../DESKTOP_0.2.md)

<br>

Dale a [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) «ojos» y un «pincel»:
Aporta dos skills en tiempo de ejecución y una cadena de alternancia de visión con tus propias claves. Se verificó en ejecución con Desktop **0.2.0-rc.2**; el tag **dsh-v0.2.1-rc.2** se comprobó a nivel de fuente con el mismo contrato de provider, sin claves incluidas.

[Capacidades](#-capacidades) · [Inicio rápido](#-inicio-rápido) · [Compatibilidad](#-compatibilidad) · [Uso](#-uso) · [Guía de visión](../SETUP_VISION.md)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## ✨ Capacidades

| Capacidad | Qué hace | Modelo | Coste |
|---|---|---|---|
| 🖼️ Adjuntos nativos de imagen | En Desktop 0.2 / v0.1.6+ puedes pegar, arrastrar o seleccionar imágenes cuando la **ruta activa admite imágenes**; la ruta por defecto `deepseek-flash` las admite. Las rutas de solo texto devuelven `MODEL_DOES_NOT_SUPPORT_IMAGES`; ya no se usa la antigua transcripción automática. | `deepseek-flash` por defecto o una ruta de visión configurada | Según el proveedor seleccionado |
| 🔀 Cadena de alternancia visual | Para flujos con rutas de archivo, `vision-review` puede usar GLM-4V-Flash, DeepSeek Vision, Qwen3-VL, SenseNova, Gemini y endpoints OpenAI-compatibles personalizados. | Claves y rutas propias | Capas gratuitas o proveedores opcionales |
| 👁️ `vision-review` | Analiza imágenes y capturas locales, hace OCR, detecta marcas de agua/logos y errores visuales de UI, y puede emitir evidencia JSON estructurada. Admite rutas largas, lotes y `--structured`. | GLM-4V-Flash + proveedores visuales opcionales | Capas gratuitas GLM/SiliconFlow; otros opcionales |
| 🎨 `media-tools` | Generar imágenes, ilustraciones, avatares, fondos y banners | SenseNova U1 Fast → SiliconFlow Kolors | Gratis, sin marca de agua |

> ⚠️ Nota importante: en Desktop 0.2 los adjuntos nativos solo se admiten si el modelo activo declara `inputModalities: ["text", "image"]`. No hace falta **ningún parche del núcleo**, no modifiques un `app.asar` firmado y el bundle no escribe ajustes de modelos. Con una ruta de solo texto, usa `vision-review` con una ruta de imagen local.

## ⚡ Inicio rápido

1. Instala el bundle:

   ```sh
   dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
   ```

2. **Claves**:
   - **Desktop 0.2 / v0.1.6+**: no necesitas claves para instalar: los dos skills se registran en tiempo de ejecución y la ruta por defecto `deepseek-flash` admite imágenes nativas. Las claves para la cadena del skill (`GLM_API_KEY`, `SILICONFLOW_API_KEY`, `GEMINI_API_KEY` opcional) van en `~/.dsh/secrets/media-tools.env`; las rutas adicionales se configuran en **Ajustes → Modelos**.
   - **Versiones preliminares antiguas (≤ v0.1.1)**: la lectura pegada y la ruta visual de entonces podían usar el `DEEPSEEK_API_KEY` existente del agente. Ese comportamiento de transcripción automática no aplica a Desktop 0.2.

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <tu clave>
   ```

3. **Reinicia por completo** `dsh web` y haz un refresco forzado (`Cmd+Shift+R`).

4. Verifica: **`vision-review`** y **`media-tools`** aparecen en la lista de skills. En Desktop 0.2 selecciona una ruta con capacidad visual, como **`deepseek-flash`**, antes de enviar un adjunto nativo; una ruta de solo texto devuelve `MODEL_DOES_NOT_SUPPORT_IMAGES` y no describe la imagen automáticamente.

Guía completa, funcionamiento y resolución de problemas: **[../SETUP_VISION.md](../SETUP_VISION.md)**

## 🔑 Claves

Las claves **nunca se guardan en este repo**. La cadena independiente de `vision-review` lee, en orden: variables de entorno → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env` (respaldo legado). La antigua ruta GLM automática solo corresponde a ≤ v0.1.1; en Desktop 0.2 / v0.1.6+ las rutas se gestionan en **Ajustes → Modelos**.

Fuentes de claves para los motores del skill (capas gratuitas según los términos del proveedor): Zhipu — [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys (glm-4v-flash). SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → API Keys (Kolors). Google Gemini es opcional para la cadena de alternancia.

```sh
# ~/.dsh/secrets/media-tools.env (chmod 600, una KEY=value por línea)
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 Uso

Tres formas de leer imágenes:

| Forma | Cómo | Cuándo |
|---|---|---|
| **A. Adjunto nativo (recomendado)** | Selecciona una ruta con capacidad visual (`deepseek-flash` por defecto), luego pulsa 🖼️ / arrastra / pega la imagen y envíala | Preguntas visuales cotidianas |
| **B. Sesión con modelo visual** | En una conversación nueva elige `deepseek-flash` o una ruta GLM/Qwen/SenseNova configurada y adjunta imágenes | Conversaciones visuales nativas de varios turnos |
| **C. Archivos + skill** | Coloca la imagen en el workspace y di «lee esta imagen con vision-review», o ejecuta `scripts/vision.py` con una ruta | Revisión por lotes, OCR/QA estructurado y rutas de solo texto |

Los adjuntos nativos se envían directamente al modelo visual seleccionado. En `vision-review` puedes indicar idioma y formato en el mensaje, o usar `--structured`.

También puedes decir:

- «Mira esta imagen / revisa esta captura en busca de bugs visuales» → `vision-review`
- «Genera una imagen de …» → `media-tools`

## 🔌 Compatibilidad

| Versión de DSH | Estado |
|---|---|
| Desktop **0.2.0-rc.2** | **Verificado en ejecución.** Plugin de runtime estándar; ambos skills se registran con `ctx.skills.registerProvider()`. Los adjuntos nativos solo se admiten con `inputModalities: ["text", "image"]`; la ruta por defecto `deepseek-flash` los admite. Sin parches del núcleo ni escritura de ajustes. |
| Tag **dsh-v0.2.1-rc.2** | **Código fuente comprobado.** `@deepseek-ai/dsh-skill@0.2.1-rc.2` mantiene la factory del provider, `list()`/`get()`, los campos de candidate y la admisión de imágenes. No había localmente un Desktop rc.2 empaquetado para una prueba completa de arranque. |
| **v0.1.6** | Mantiene el mismo ciclo de provider soportado; las rutas opcionales GLM/SiliconFlow/SenseNova/Gemini se configuran en **Ajustes → Modelos**. |
| v0.1.1 y versiones preliminares anteriores | Comportamiento histórico solamente. No apliques parches antiguos del núcleo a builds firmados de Desktop 0.2. |

Consulta las [notas de compatibilidad de Desktop 0.2](../DESKTOP_0.2.md) para la lista completa de comprobaciones.

### Coexistencia con ModLens

Este bundle puede instalarse junto a [ModLens](https://github.com/liustack/modlens), pero Desktop 0.2 ya no incluye el antiguo fallback de transcripción automática de api-proxy. Elige deliberadamente el flujo de pegar-a-ruta de ModLens o `pasteToPath: false` para enviar adjuntos nativos a un modelo visual. La comparación histórica en chino está en [../COMPARE_MODLENS.md](../COMPARE_MODLENS.md).

## 🗺️ Estructura

```
dsh-media-skills/
├── package.json           # manifiesto dsh.bundle
├── cordis.patch.yml       # capa de plugin
├── index.js               # registra los dos skills mediante el ciclo DSH v0.1.6+ / Desktop 0.2 provider
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
