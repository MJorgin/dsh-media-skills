<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — Kostenloses Bildlesen und Bildgenerierung für DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### *Gib DeepSeek Harness wiederverwendbare Bildprüfungs- und Bildgenerierungs-Skills — verifiziert mit Desktop 0.2.0-rc.2.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)
[![Harness](https://img.shields.io/badge/Harness-0.2.0%20verified%20%7C%200.2.1--rc.2%20source%20checked-4D6BFE)](../DESKTOP_0.2.md)

<br>

Gib [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) „Augen“ und einen „Pinsel“ —
Es bringt zwei Runtime-Skills sowie eine eigene Vision-Failover-Kette mit, wurde mit Desktop **0.2.0-rc.2** lauffähig geprüft und der aktuelle Tag **dsh-v0.2.1-rc.2** wurde quelltextseitig gegen denselben Provider-Vertrag geprüft — ohne hartkodierte Keys.

[Funktionen](#-funktionen) · [Schnellstart](#-schnellstart) · [Kompatibilität](#-kompatibilität) · [Nutzung](#-nutzung) · [Vision-Einrichtung](../SETUP_VISION.md)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## ✨ Funktionen

| Funktion | Beschreibung | Modell | Kosten |
|---|---|---|---|
| 🖼️ Native Bildanhänge | Auf Desktop 0.2 / v0.1.6+ kannst du Bilder einfügen, ziehen oder auswählen, wenn die **aktuelle Route Bilder unterstützt** – die Standardroute `deepseek-flash` tut das. Rein textliche Routen lehnen Anhänge mit `MODEL_DOES_NOT_SUPPORT_IMAGES` ab; die alte Auto-Beschreibungs-Weiterleitung existiert auf diesem Pfad nicht. | Standard `deepseek-flash` oder eigene Vision-Route | Gemäß gewähltem Anbieter |
| 🔀 Vision-Failover-Kette | Für Dateipfad- und Skript-Workflows prüft `vision-review` wahlweise GLM-4V-Flash, DeepSeek Vision, Qwen3-VL, SenseNova, Gemini und eigene OpenAI-kompatible Endpunkte. | Eigene Keys und Routen | Kostenlose Kontingente oder optionale Anbieter |
| 👁️ `vision-review` | Analysiert lokale Bilder und Screenshots, erkennt OCR-Text, Wasserzeichen/Logos sowie visuelle UI-Fehler und kann strukturierte JSON-Beweise ausgeben. Lange Pfade, Stapelprüfungen und `--structured` werden unterstützt. | GLM-4V-Flash + optionale Vision-Anbieter | GLM/SiliconFlow kostenlose Tarife, weitere optional |
| 🎨 `media-tools` | Bilder, Illustrationen, Avatare, Hintergründe und Banner generieren | SenseNova U1 Fast → SiliconFlow Kolors | Kostenlos, ohne Wasserzeichen |

> ⚠️ Wichtiger Hinweis: Auf Desktop 0.2 werden Bildanhänge nur zugelassen, wenn das aktive Modell `inputModalities: ["text", "image"]` meldet. Es ist **kein Kern-Patch** nötig, signierte `app.asar`-Dateien dürfen nicht verändert werden, und das Bundle schreibt keine Modell-Einstellungen. Für eine textliche Route rufe `vision-review` mit einem lokalen Bildpfad auf.

## ⚡ Schnellstart

1. Bundle installieren:

   ```sh
   dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
   ```

2. **Keys**:
   - **Desktop 0.2 / v0.1.6+**: Für die Installation ist kein Key nötig — beide Skills registrieren sich zur Laufzeit, und die Standardroute `deepseek-flash` unterstützt native Bildanhänge. Keys für die Skill-Failover-Kette (`GLM_API_KEY`, `SILICONFLOW_API_KEY`, optional `GEMINI_API_KEY`) gehören in `~/.dsh/secrets/media-tools.env`; zusätzliche Routen konfigurierst du selbst in **Einstellungen → Modelle**.
   - **Ältere Vorschauversionen (≤ v0.1.1)**: Paste-Lesen und die damalige Vision-Route konnten den vorhandenen `DEEPSEEK_API_KEY` des Agenten nutzen. Dieses automatische Transkriptionsverhalten gilt nicht für Desktop 0.2.

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <dein Zhipu-Key>
   ```

3. `dsh web` **vollständig neu starten** und die Seite mit `Cmd+Shift+R` hart neu laden.

4. Prüfe: **`vision-review`** und **`media-tools`** erscheinen in der Skill-Liste. Auf Desktop 0.2 wähle vor einem nativen Anhang eine bildfähige Route wie **`deepseek-flash`**; eine reine Textroute gibt `MODEL_DOES_NOT_SUPPORT_IMAGES` zurück und beschreibt das Bild nicht automatisch.

Komplette Anleitung, Funktionsweise und Fehlerbehebung: **[../SETUP_VISION.md](../SETUP_VISION.md)**

## 🔑 Keys

Keys werden **nie in diesem Repo gespeichert**. Die eigenständige `vision-review`-Kette liest in dieser Reihenfolge: Umgebungsvariablen → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env` (Legacy-Fallback). Die automatische alte GLM-Routeneinrichtung gilt nur für ≤ v0.1.1; auf Desktop 0.2 / v0.1.6+ bleiben Routen in **Einstellungen → Modelle** deine Entscheidung.

Key-Quellen für die Skill-Engines (kostenlose Tarife nach Anbieterbedingungen): Zhipu — [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys (glm-4v-flash). SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → API Keys (Kolors). Google Gemini ist optional und kann in die Failover-Kette einbezogen werden.

```sh
# ~/.dsh/secrets/media-tools.env (chmod 600, eine KEY=value pro Zeile)
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 Nutzung

Drei Wege, Bilder zu lesen:

| Weg | So geht's | Wann |
|---|---|---|
| **A. Nativer Anhang (empfohlen)** | Wähle eine bildfähige Route (Standard `deepseek-flash`), dann auf 🖼️ klicken / Bild ziehen / einfügen und senden | Alltägliche multimodale Bildfragen |
| **B. Bildfähige Modell-Sitzung** | Neue Unterhaltung, `deepseek-flash` oder eine konfigurierte GLM/Qwen/SenseNova-Route wählen und Bilder anhängen | Mehrrundige native Bildgespräche |
| **C. Dateien + Skill** | Bild im Workspace ablegen und „lies dieses Bild mit vision-review“ sagen oder `scripts/vision.py` mit einem Pfad aufrufen | Stapelprüfung, strukturiertes OCR/QA, Text-Routen |

Native Anhänge gehen direkt an das gewählte bildfähige Modell. Für `vision-review` kannst du Antwortsprache und Ausgabeformat im Prompt angeben oder `--structured` verwenden.

Einfach sagen:

- „Schau dir dieses Bild an / prüfe diesen Screenshot auf visuelle Bugs“ → `vision-review`
- „Erzeuge ein Bild von …“ → `media-tools`

## 🔌 Kompatibilität

| DSH-Build | Status |
|---|---|
| Desktop **0.2.0-rc.2** | **Laufzeitgeprüft.** Standard-Runtime-Plugin; beide Skills registrieren sich über `ctx.skills.registerProvider()`. Native Anhänge werden nur bei `inputModalities: ["text", "image"]` zugelassen; die Standardroute `deepseek-flash` unterstützt das. Keine Kern-Patches oder Einstellungs-Schreibvorgänge. |
| Tag **dsh-v0.2.1-rc.2** | **Quelltext geprüft.** `@deepseek-ai/dsh-skill@0.2.1-rc.2` behält Provider-Factory, `list()`/`get()`, Candidate-Felder und die Bildzulassung bei. Lokal war kein paketierter rc.2-Desktop-Build für einen vollständigen Starttest verfügbar. |
| **v0.1.6** | Gleicher unterstützter Provider-Lebenszyklus; optionale GLM/SiliconFlow/SenseNova/Gemini-Routen konfigurierst du in **Einstellungen → Modelle**. |
| v0.1.1 und ältere Vorschauversionen | Nur historisches Verhalten. Alte Kern-Patches nicht auf signierte Desktop-0.2-Builds anwenden. |

Siehe [Desktop-0.2-Kompatibilitätsnotizen](../DESKTOP_0.2.md) für die vollständige Prüfliste.

### ModLens-Koexistenz

Das Bundle kann zusammen mit [ModLens](https://github.com/liustack/modlens) installiert werden, aber Desktop 0.2 enthält nicht mehr die alte api-proxy-Auto-Transkription. Wähle bewusst zwischen ModLens’ Paste-zu-Pfad-Workflow und `pasteToPath: false`, damit native Anhänge an ein bildfähiges Modell gehen. Der historische Vergleich liegt auf Chinesisch unter [../COMPARE_MODLENS.md](../COMPARE_MODLENS.md).

## 🗺️ Struktur

```
dsh-media-skills/
├── package.json           # dsh.bundle-Manifest
├── cordis.patch.yml       # Plugin-Ebene
├── index.js               # registriert die zwei Skills über die DSH v0.1.6+ / Desktop 0.2-Provider-Laufzeit
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
