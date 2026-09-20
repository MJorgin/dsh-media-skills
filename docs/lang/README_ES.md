<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — revisión y generación de imágenes para DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### Habilidades de revisión y generación de imágenes para DeepSeek Harness v0.1.6

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-v0.1.6--alpha.2-4D6BFE)](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.6-alpha.2)
[![No bundled keys](https://img.shields.io/badge/keys-never%20in%20repo-8B5CF6)](#configurar-claves)
[![Docs](https://img.shields.io/badge/docs-9%20languages-4D6BFE)](README_ES.md)

<br>

Un plugin ligero para DSH que aporta dos habilidades multimedia de tipo «trae tu propia clave» (bring-your-own-key):

- 👁️ **`vision-review`** — describe imágenes, ejecuta OCR, revisa capturas de pantalla y detecta problemas de UI como texto solapado o desbordado, con opción de evidencia estructurada.
- 🎨 **`media-tools`** — genera ilustraciones, avatares, fondos y banners mediante SenseNova U1 Fast o SiliconFlow Kolors.

El plugin usa el ciclo de vida de proveedores de habilidades de DSH v0.1.6 y **no parchea el núcleo de DSH, ni modifica la configuración de modelos, ni registra proveedores de modelos, ni escribe configuración oculta**.

[Por qué](#por-qué) · [Instalar](#instalación) · [Claves](#configurar-claves) · [Uso](#uso) · [Manual](#instalación-manual) · [Verificar](#verificación) · [FAQ](#faq)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## Por qué

DeepSeek Harness v0.1.6 ya incorpora un flujo moderno de archivos y adjuntos para los modelos que aceptan imágenes. Este paquete se centra en dos tareas complementarias que siguen siendo útiles con el soporte nativo de adjuntos:

| Necesidad | Habilidad | Cómo ayuda |
|---|---|---|
| QA explícito de capturas | `vision-review` | Revisa integridad de renderizado, solapamientos, desbordes, desalineación, marcas de agua y coherencia visual. |
| OCR e imagen a texto | `vision-review` | Convierte capturas, fotos y escaneos en texto, con un contrato JSON estructurado opcional. |
| Conmutación por error | `vision-review` | Prueba los motores configurados en un orden predecible e informa cada fallo. |
| Producción de recursos visuales | `media-tools` | Genera archivos de imagen utilizables con una clave de SenseNova o SiliconFlow. |

El enrutado de modelos queda en manos de DSH y su interfaz **Models**. Por eso es compatible con la activación, desactivación, desinstalación y reinicio en tiempo real de v0.1.6 sin dejar estado global.

## Novedades en v0.1.6

- Registra ambas habilidades mediante `ctx.skills.registerProvider(...)`.
- Elimina la antigua mutación implícita de `llm-pi-ai` y toda la inyección de rutas de modelo.
- Lee los metadatos directamente de cada `SKILL.md`, evitando desajustes de texto.
- Soporta el ciclo de vida en tiempo real: el registro pertenece al fiber del plugin y se elimina limpiamente.
- Los parches antiguos del núcleo quedan como material histórico para `<= v0.1.1-rc.2`; v0.1.6 no los necesita.
- Añade validación estática del manifiesto y una prueba en tiempo real con un contexto simulado.

## Instalación

### Opción 1: DSH Plugin Manager

Abre el Plugin Manager de DSH y añade:

```text
github:MJorgin/dsh-media-skills
```

Después reinicia el perfil.

### Opción 2: CLI

Para el perfil web habitual:

```sh
dsh plugin --profile web add github:MJorgin/dsh-media-skills
```

Sustituye `web` por el perfil de DSH que uses. Reinícialo tras la instalación para montar el nuevo paquete.

No requiere compilación: el paquete incluye ESM y scripts Python listos para ejecutarse, sin instalación de dependencias ni script `prepare`.

## Configurar claves

Las claves nunca se guardan en este repositorio. Los scripts leen primero las variables de entorno y después:

```text
~/.dsh/secrets/media-tools.env
~/.codex/secrets/media-tools.env   # compatibilidad legacy
```

`vision-review` también puede leer claves compatibles desde:

```text
~/.dsh/.credentials.yaml
```

`media-tools` lee las variables de entorno y los dos archivos `media-tools.env`; configura sus claves explícitamente en una de esas ubicaciones.

| Clave | La usa | Notas |
|---|---|---|
| `GLM_API_KEY` | `vision-review` | Motor principal Zhipu `glm-4v-flash`; verifica las condiciones actuales de precio/capa gratuita. |
| `DEEPSEEK_API_KEY` | `vision-review` | Modelo visual DeepSeek de pago opcional; también se lee del almacén de credenciales de DSH. |
| `SILICONFLOW_API_KEY` | Ambas | Qwen3-VL para revisión y Kolors para generación. |
| `SENSENOVA_API_KEY` | Ambas | Modelo visual SenseNova para revisión y U1 Fast para generación. |
| `GEMINI_API_KEY` | `vision-review` | Respaldo opcional de Gemini; algunas redes requieren `GEMINI_PROXY`. |

Ejemplo de archivo de secretos:

```sh
# ~/.dsh/secrets/media-tools.env, recomendado chmod 600
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
SENSENOVA_API_KEY=...
GEMINI_API_KEY=...
```

### Modelos de imagen nativos de DSH

Este plugin no añade ningún modelo al selector de DSH. Para que una conversación normal de DSH acepte imágenes de forma nativa, configura un modelo/proveedor multimodal en los ajustes **Models** de DSH y usa el flujo de adjuntos nativo.

Usa `vision-review` cuando necesites un flujo de revisión/OCR por script, una cadena de conmutación por error o evidencia estructurada, en lugar de solo una respuesta multimodal.

## Uso

### Revisión visual

Pide a DSH que use `vision-review`, o ejecuta el script desde el directorio de la habilidad:

```bash
python3 scripts/vision.py screenshot.png
python3 scripts/vision.py a.png b.png --structured
python3 scripts/vision.py screenshot.png --provider=siliconflow-qwen
python3 scripts/vision.py --doctor
```

El prompt por defecto revisa integridad de renderizado, texto solapado/desalineado/desbordado, jerarquía de color, marcas de agua y errores visuales evidentes. Para una tarea concreta, pasa un prompt enfocado:

```bash
python3 scripts/vision.py page.png --prompt="Comprueba si botones, títulos y gráficos se solapan, indicando la posición"
```

A la cadena de conmutación solo se unen motores cuya clave esté disponible. La salida opcional `--structured` incluye resumen, OCR, diseño en orden de lectura, semántica, notas visuales e incertidumbres.

### Generación de imágenes

```bash
python3 skills/media-tools/scripts/generate.py "palacio chino entre un mar de nubes, realista y cinematográfico, escala grandiosa" palace.jpg 16:9
```

Se usa SenseNova si hay `SENSENOVA_API_KEY`; si no, SiliconFlow Kolors cuando hay `SILICONFLOW_API_KEY`. Los tamaños de SenseNova admiten dimensiones exactas o ratios habituales; el script los asigna al tamaño soportado más cercano.

## Instalación manual

Se recomienda la instalación como plugin porque este repositorio contiene varias habilidades. El proveedor de sistema de archivos de v0.1.6 solo escanea un nivel bajo la raíz de habilidades, así que clonar el repositorio directamente en `~/.dsh/skills/` no detecta los `skills/*/SKILL.md` anidados.

Para instalar manualmente, enlaza cada habilidad por separado:

```sh
git clone https://github.com/MJorgin/dsh-media-skills.git ~/.dsh/bundles/dsh-media-skills
mkdir -p ~/.dsh/skills
ln -s ~/.dsh/bundles/dsh-media-skills/skills/vision-review ~/.dsh/skills/vision-review
ln -s ~/.dsh/bundles/dsh-media-skills/skills/media-tools ~/.dsh/skills/media-tools
```

Reinicia DSH después de crear los enlaces.

## Verificación

Ejecuta todas las comprobaciones locales:

```sh
npm test
```

Incluye validación del manifiesto del bundle, registro/carga en tiempo real del proveedor mediante un contexto similar a DSH, comprobación de sintaxis JavaScript y compilación Python de ambos scripts.

## Parches históricos

Los parches antiguos del núcleo se conservan para quien mantenga builds legacy de DSH:

- [Notas en chino](../HARNESS_PATCH.md)
- [English notes](../HARNESS_PATCH_EN.md)

Aplican a builds históricas hasta `v0.1.1-rc.2`. Los nuevos usuarios de v0.1.6 no deben aplicarlos.

## Estructura del proyecto

```text
dsh-media-skills/
├── package.json              # Manifiesto del bundle DSH y comandos de prueba
├── cordis.patch.yml          # Inserción del plugin Cordis
├── index.js                  # Registra el proveedor de habilidades
├── skills/
│   ├── vision-review/        # Análisis de imágenes y QA de capturas
│   └── media-tools/          # Generación de imágenes
├── scripts/                  # Utilidades de validación del bundle
├── examples/                 # Imágenes de ejemplo y tarjeta de prueba
└── docs/                     # Guías, traducciones y notas históricas
```

## FAQ

**¿Necesito un parche del núcleo en DSH v0.1.6?**
No. Configura un modelo multimodal en DSH para conversaciones nativas con imágenes, o usa los scripts para flujos dedicados de revisión y generación.

**¿El plugin añade un modelo al selector automáticamente?**
No. DSH v0.1.6 ya gestiona modelos y plugins; el plugin solo registra habilidades y nunca cambia la configuración de modelos.

**¿Todos los proveedores son gratuitos?**
Los precios y capas gratuitas pueden cambiar. GLM-4V-Flash y Kolors han sido favorables a la capa gratuita, mientras que DeepSeek es de pago. Revisa las condiciones actuales antes de depender de un flujo.

**¿Se incluyen claves de API?**
No. Las claves permanecen en tu entorno, en el almacén de credenciales de DSH o en archivos locales de secretos.

**¿Dónde enviar capturas internas sensibles?**
Solo a proveedores aprobados por tu organización. No envíes documentos internos a Gemini u otros proveedores externos salvo que la política de la empresa lo permita.

## Ejemplos

<img src="../../examples/generated/fox-forest.jpg" width="30%"> <img src="../../examples/generated/cat-astronaut.jpg" width="30%"> <img src="../../examples/vision-test-card.png" width="30%">

Más detalles en [examples/README.md](../../examples/README.md).

## License

[MIT](../../LICENSE)
