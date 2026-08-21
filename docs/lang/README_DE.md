<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — Kostenloses Bildlesen und Bildgenerierung für DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### *Bilder direkt ins Chatfeld einfügen — kostenloses Vision-Modell, Bildlesen und Bildgenerierung.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)

<br>

Gib [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) „Augen“ und einen „Pinsel“ —
zwei kostenlose Skills, ein kostenloses Vision-Modell und das Einfügen von Bildern, ganz ohne hartkodierte Keys.

[Funktionen](#-funktionen) · [Schnellstart](#-schnellstart) · [Nutzung](#-nutzung) · [Vision-Einrichtung](../SETUP_VISION.md)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## ✨ Funktionen

| Funktion | Beschreibung | Modell | Kosten |
|---|---|---|---|
| 🖼️ Bild-Einfügen mit Auto-Beschreibung | In **rein textbasierten** Sitzungen (z. B. deepseek-v4-pro) bekommt die Eingabeleiste einen „Bild hinzufügen“-Button (Bildsymbol); eingefügte Bilder werden vom Vision-Modell automatisch als Text beschrieben und an das aktuelle Modell übergeben | Zhipu GLM-4V-Flash | Kostenlos |
| 🧠 Vision-Modell-Route | Nach der Installation erscheint **automatisch** „智譜 GLM-4V-Flash（視覚）“ im Modell-Auswahlmenü; in neuen Unterhaltungen direkt über Bilder sprechen | Zhipu GLM-4V-Flash | Kostenlos |
| 👁️ `vision-review` | Bilder/Screenshots analysieren, erkennen, beschreiben; visuelle UI-Bugs finden (Überlappung, Überlauf, Fehlausrichtung); Wasserzeichen/Logos erkennen; Bilder in Text umwandeln. Engine-Kette: GLM-4V-Flash → DeepSeek-V4-Flash-Vision-Exp (gleicher Schlüssel wie der Agent, optional kostenpflichtig) → SenseNova / SiliconFlow / Gemini | GLM-4V-Flash＋DeepSeek-Vision-Exp＋SenseNova＋Gemini | Kostenlos (DeepSeek optional kostenpflichtig) |
| 🎨 `media-tools` | Bilder, Illustrationen, Avatare, Hintergründe und Banner generieren | SiliconFlow Kolors | Kostenlos, ohne Wasserzeichen |

> ⚠️ Ehrlicher Hinweis: Das Bild-Einfügen mit Auto-Beschreibung steckt im **Kern** von DeepSeek Harness (die Bildannahme-Logik in `api-proxy`). Dieses Bundle liefert die **Modell-Route + Skills**; das Vision-Modell funktioniert mit jedem DSH-Build, die Auto-Beschreibung erfordert jedoch einen Build mit dieser Kernunterstützung. So erkennst du es: FAQ Q1.

## ⚡ Schnellstart

1. Bundle installieren:

   ```sh
   dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
   ```

2. **Zuerst kostenlos einen Key holen**: Registrieren auf [open.bigmodel.cn](https://open.bigmodel.cn) → **API Keys** (glm-4v-flash ist kostenlos). Für die Generierung zusätzlich einen bei [siliconflow.cn](https://siliconflow.cn) erstellen (Kolors ist kostenlos). Dann hinterlegen — Web-GUI (**Einstellungen → Modelle** → das **API-Key**-Feld des zhipu-vision-Anbieters) oder Credentials-Datei:

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <dein Zhipu-Key>
   ```

3. `dsh web` **vollständig neu starten** und die Seite mit `Cmd+Shift+R` hart neu laden.

4. Prüfen: Im Modell-Auswahlmenü erscheint **智譜 GLM-4V-Flash（視覚）**. Unterstützt dein Build das Bild-Einfügen, zeigt die Eingabeleiste einen 🖼️ **„Bild hinzufügen“-Button** — füge in einer beliebigen Sitzung ein Bild ein, es kommt als Textbeschreibung an.

Komplette Anleitung, Funktionsweise und Fehlerbehebung: **[../SETUP_VISION.md](../SETUP_VISION.md)**

## 🔑 Keys

Keys werden **nie in diesem Repo gespeichert**. Die Skripte lesen in dieser Reihenfolge: Umgebungsvariablen → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env` (Legacy-Fallback). Die Vision-Modell-Route liest `GLM_API_KEY` aus dem DSH-Credential-Speicher.

Bezugsquellen (beide kostenlos): Zhipu — [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys (glm-4v-flash). SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → API Keys (Kolors).

```sh
# ~/.dsh/secrets/media-tools.env (chmod 600, eine KEY=value pro Zeile)
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 Nutzung

Drei Wege, Bilder zu lesen:

| Weg | So geht's | Wann |
|---|---|---|
| **A. Direkt einfügen (empfohlen)** | In beliebiger Sitzung 🖼️-Button klicken / ziehen / einfügen und senden | Alltägliche Bildfragen — kein Speichern, kein Modellwechsel |
| **B. Vision-Modell-Sitzung** | Neue Unterhaltung, 智譜 GLM-4V-Flash（視覚） wählen, Bilder einfügen und chatten | Mehrstufige Gespräche über Bilder, natives `read_image` |
| **C. Dateien + Skill** | Bild in den Workspace legen und sagen: „lies dieses Bild mit vision-review“ | Stapelprüfung, geskriptete Abläufe |

Die Beschreibungssprache folgt deiner Nachrichtensprache (chinesische Nachricht → chinesische Beschreibung; englische → englische; kein Text → Chinesisch).

Einfach sagen:

- „Schau dir dieses Bild an / prüfe diesen Screenshot auf visuelle Bugs“ → `vision-review`
- „Erzeuge ein Bild von …“ → `media-tools`

## 🗺️ Struktur

```
dsh-media-skills/
├── package.json           # dsh.bundle-Manifest
├── cordis.patch.yml       # Plugin-Ebene
├── index.js               # registriert Skills + legt zhipu-vision-Route an
├── skills/
│   ├── vision-review/     # Bildlesen
│   └── media-tools/       # Bildgenerierung
├── docs/
│   ├── SETUP_VISION.md    # Vision-Einrichtung (Chinesisch)
│   ├── SETUP_VISION_EN.md # detailed setup guide (English)
│   └── lang/              # READMEs in weiteren Sprachen
├── scripts/make-banner.py # regeneriert docs/social-preview.png
└── docs/social-preview.png
```

## 🤝 Mach mit im DSH-Plugin-Ökosystem

Die DeepSeek-Harness-Entwicklervorschau befindet sich noch in der Testphase für Harness-Entwickler; Kern-Plugins und Basis-APIs werden weiter iteriert. Wir freuen uns darauf, gemeinsam mit Entwicklern weltweit die Obergrenzen der Intelligenz zu erkunden — auf offener, wiederverwendbarer und kombinierbarer Open-Source-Infrastruktur.

- [dsh-plugin-Thema](https://github.com/topics/dsh-plugin)
- [Schnellstart](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [DeepSeek-Harness-Repo](https://github.com/deepseek-ai/deepseek-harness)

> Tagge dieses Repo mit [`dsh-plugin`](https://github.com/topics/dsh-plugin), damit andere es finden.

## 📄 Lizenz

[MIT](../../LICENSE)
