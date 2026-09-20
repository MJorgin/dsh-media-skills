<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — Bildprüfung und Bildgenerierung für DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### Skills für Bildprüfung und Bildgenerierung in DeepSeek Harness v0.1.6

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-v0.1.6--alpha.2-4D6BFE)](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.6-alpha.2)
[![No bundled keys](https://img.shields.io/badge/keys-never%20in%20repo-8B5CF6)](#schlüssel-konfigurieren)
[![Docs](https://img.shields.io/badge/docs-9%20languages-4D6BFE)](README_DE.md)

<br>

Ein leichtes DSH-Plugin mit zwei Media-Skills nach dem Prinzip „bring your own key":

- 👁️ **`vision-review`** — Bilder beschreiben, OCR ausführen, Screenshots prüfen, UI-Probleme wie überlappenden oder überlaufenden Text erkennen und optional strukturierte Belege ausgeben.
- 🎨 **`media-tools`** — Illustrationen, Avatare, Hintergründe und Banner über SenseNova U1 Fast oder SiliconFlow Kolors generieren.

Das Plugin nutzt die Skill-Provider-Laufzeit von DSH v0.1.6 und **patcht den DSH-Kern nicht, ändert keine Modelleinstellungen, registriert keine Modellanbieter und schreibt keine versteckte Konfiguration**.

[Warum](#warum) · [Installieren](#installation) · [Schlüssel](#schlüssel-konfigurieren) · [Verwendung](#verwendung) · [Manuell](#manuelle-verzeichnisinstallation) · [Prüfen](#überprüfung) · [FAQ](#faq)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## Warum

DeepSeek Harness v0.1.6 bringt bereits moderne Anhang- und Datei-Workflows für Modelle mit Bildeingabe. Dieses Bundle konzentriert sich auf zwei ergänzende Aufgaben, die auch darüber hinaus nützlich bleiben:

| Bedarf | Skill | Nutzen |
|---|---|---|
| Explizite Screenshot-QA | `vision-review` | Prüft Rendering-Vollständigkeit, Überlappungen, Überläufe, Versätze, Wasserzeichen und visuelle Konsistenz. |
| OCR und Bild-zu-Text | `vision-review` | Wandelt Screenshots, Fotos und Scans in Text um, optional mit strukturiertem JSON-Vertrag. |
| Provider-Failover | `vision-review` | Probiert konfigurierte Engines in vorhersehbarer Reihenfolge und meldet jeden Fehlversuch. |
| Bildasset-Erstellung | `media-tools` | Erzeugt verwendbare Bilddateien über einen konfigurierten SenseNova- oder SiliconFlow-Schlüssel. |

Das Modellrouting bleibt bei DSH und der **Models**-Oberfläche. Dadurch ist das Plugin mit Aktivieren, Deaktivieren, Deinstallieren und Neustart zur Laufzeit in v0.1.6 kompatibel, ohne globalen Zustand zu hinterlassen.

## Änderungen in v0.1.6

- Registriert beide gebündelten Skills über `ctx.skills.registerProvider(...)`.
- Entfernt die alte implizite `llm-pi-ai`-Einstellungsmutation und das gesamte Einspeisen von Modellrouten.
- Liest Metadaten direkt aus jeder `SKILL.md`, sodass Texte nicht auseinanderlaufen.
- Unterstützt die Plugin-Laufzeit: Die Registrierung gehört zum Plugin-Fiber und lässt sich sauber entfernen.
- Alte Kernpatches bleiben nur als historisches Material für `<= v0.1.1-rc.2`; v0.1.6 braucht sie nicht.
- Ergänzt statische Manifest-Prüfung und einen Laufzeit-Test mit simuliertem Kontext.

## Installation

### Option 1: DSH Plugin Manager

Öffne den DSH Plugin Manager und füge hinzu:

```text
github:MJorgin/dsh-media-skills
```

Anschließend das Profil neu starten.

### Option 2: CLI

Für das übliche Web-Profil:

```sh
dsh plugin --profile web add github:MJorgin/dsh-media-skills
```

Ersetze `web` durch dein tatsächlich genutztes DSH-Profil. Starte das Profil nach der Installation neu, damit das Bundle gemountet wird.

Kein Build-Schritt nötig: Das Paket enthält sofort lauffähiges ESM und Python-Skripte, ohne Dependency-Installation oder `prepare`-Skript.

## Schlüssel konfigurieren

Schlüssel werden niemals in diesem Repository gespeichert. Die Skripte lesen zuerst Umgebungsvariablen, dann:

```text
~/.dsh/secrets/media-tools.env
~/.codex/secrets/media-tools.env   # Legacy-Kompatibilität
```

`vision-review` kann kompatible Schlüssel zusätzlich hieraus lesen:

```text
~/.dsh/.credentials.yaml
```

`media-tools` liest Umgebungsvariablen und die beiden `media-tools.env`-Dateien; konfiguriere seine Schlüssel explizit an einer dieser Stellen.

| Schlüssel | Verwendet von | Hinweise |
|---|---|---|
| `GLM_API_KEY` | `vision-review` | Primär-Engine Zhipu `glm-4v-flash`; aktuelle Preis-/Freikontingent-Bedingungen prüfen. |
| `DEEPSEEK_API_KEY` | `vision-review` | Optionales kostenpflichtiges DeepSeek-Visionsmodell; wird auch aus dem DSH-Anmeldespeicher gelesen. |
| `SILICONFLOW_API_KEY` | Beide | Qwen3-VL für Prüfung, Kolors für Generierung. |
| `SENSENOVA_API_KEY` | Beide | SenseNova-Visionsmodell für Prüfung, U1 Fast für Generierung. |
| `GEMINI_API_KEY` | `vision-review` | Optionaler Gemini-Fallback; in manchen Netzen ist `GEMINI_PROXY` nötig. |

Beispiel für eine Secrets-Datei:

```sh
# ~/.dsh/secrets/media-tools.env, empfohlen chmod 600
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
SENSENOVA_API_KEY=...
GEMINI_API_KEY=...
```

### Native DSH-Bildmodelle

Dieses Plugin fügt der DSH-Modellauswahl kein Modell hinzu. Damit eine normale DSH-Konversation nativ Bilder annimmt, konfiguriere in den DSH-**Models**-Einstellungen ein multimodales Modell bzw. einen entsprechenden Anbieter und nutze den nativen Anhang-Fluss.

Verwende `vision-review`, wenn du einen skriptgestützten Prüf-/OCR-Workflow, eine Failover-Kette oder strukturierte Belege brauchst statt nur einer multimodalen Chat-Antwort.

## Verwendung

### Visuelle Prüfung

Bitte DSH, `vision-review` zu verwenden, oder führe das Skript aus dem Skill-Verzeichnis aus:

```bash
python3 scripts/vision.py screenshot.png
python3 scripts/vision.py a.png b.png --structured
python3 scripts/vision.py screenshot.png --provider=siliconflow-qwen
python3 scripts/vision.py --doctor
```

Der Standard-Prompt prüft Rendering-Vollständigkeit, überlappenden/falsch positionierten/überlaufenden Text, Farbhierarchie, Wasserzeichen und offensichtliche visuelle Bugs. Für eine konkrete Aufgabe einen fokussierten Prompt übergeben:

```bash
python3 scripts/vision.py page.png --prompt="Prüfe, ob sich Buttons, Titel und Diagramme überlappen, und nenne die Positionen"
```

An der Failover-Kette nehmen nur Engines mit verfügbarem Schlüssel teil. Die optionale Ausgabe `--structured` enthält Zusammenfassung, OCR, Layout in Lesereihenfolge, Semantik, visuelle Notizen und Unsicherheiten.

### Bildgenerierung

```bash
python3 skills/media-tools/scripts/generate.py "Chinesischer Palast in einem Wolkenmeer, realistisch und filmisch, monumentale Komposition" palace.jpg 16:9
```

Mit `SENSENOVA_API_KEY` wird SenseNova verwendet, sonst bei vorhandenem `SILICONFLOW_API_KEY` SiliconFlow Kolors. SenseNova-Größen akzeptieren exakte Maße oder gängige Verhältnisse; das Skript wählt die nächste unterstützte Größe.

## Manuelle Verzeichnisinstallation

Wegen der mehreren Skills empfehlt sich die Plugin-Installation. Der Dateisystem-Provider von v0.1.6 scannt nur eine Ebene unterhalb des Skill-Wurzelverzeichnisses; ein direkter Klon des Repositories nach `~/.dsh/skills/` entdeckt die verschachtelten `skills/*/SKILL.md` daher nicht.

Bei manueller Installation jeden Skill einzeln verlinken:

```sh
git clone https://github.com/MJorgin/dsh-media-skills.git ~/.dsh/bundles/dsh-media-skills
mkdir -p ~/.dsh/skills
ln -s ~/.dsh/bundles/dsh-media-skills/skills/vision-review ~/.dsh/skills/vision-review
ln -s ~/.dsh/bundles/dsh-media-skills/skills/media-tools ~/.dsh/skills/media-tools
```

DSH nach dem Anlegen der Links neu starten.

## Überprüfung

Alle lokalen Prüfungen ausführen:

```sh
npm test
```

Enthalten sind DSH-Bundle-Manifest-Prüfung, Laufzeit-Registrierung/-Ladung über einen DSH-ähnlichen Kontext, JavaScript-Syntaxprüfung und Python-Kompilierung beider Skill-Skripte.

## Historische Patches

Die alten Kernpatches bleiben für Nutzer älterer DSH-Builds erhalten:

- [Hinweise auf Chinesisch](../HARNESS_PATCH.md)
- [English notes](../HARNESS_PATCH_EN.md)

Sie gelten für historische Builds bis `v0.1.1-rc.2`. Neue v0.1.6-Nutzer sollten sie nicht anwenden.

## Projektstruktur

```text
dsh-media-skills/
├── package.json              # DSH-Bundle-Manifest und Testbefehle
├── cordis.patch.yml          # Cordis-Plugin-Einfügung
├── index.js                  # Registriert den gebündelten Skill-Provider
├── skills/
│   ├── vision-review/        # Bildanalyse und Screenshot-QA
│   └── media-tools/          # Bildgenerierung
├── scripts/                  # Bundle-Prüfhilfen
├── examples/                 # Beispielbilder und Testkarte
└── docs/                     # Setup-Anleitungen, Übersetzungen, Historie
```

## FAQ

**Brauche ich auf DSH v0.1.6 einen Kernpatch?**
Nein. Konfiguriere in DSH ein multimodales Modell für native Bildgespräche oder nutze die Skripte für dedizierte Prüf- und Generierungs-Workflows.

**Fügt das Plugin automatisch ein Modell zur Modellauswahl hinzu?**
Nein. DSH v0.1.6 bringt Modell- und Plugin-Verwaltung mit; das Plugin registriert nur Skills und ändert keine Modelleinstellungen.

**Sind alle Anbieter kostenlos?**
Preise und Freikontingente können sich ändern. GLM-4V-Flash und Kolors waren freikontingentfreundlich, DeepSeek ist kostenpflichtig. Vor der Abhängigkeit von einem Workflow aktuelle Bedingungen prüfen.

**Sind API-Schlüssel enthalten?**
Nein. Schlüssel bleiben in deiner Umgebung, im DSH-Anmeldespeicher oder in lokalen Secrets-Dateien.

**Wohin mit sensiblen internen Screenshots?**
Nur zu von deiner Organisation freigegebenen Anbietern. Interne Dokumente nicht an Gemini oder andere externe Anbieter senden, solange die Unternehmensrichtlinie es nicht erlaubt.

## Beispiele

<img src="../../examples/generated/fox-forest.jpg" width="30%"> <img src="../../examples/generated/cat-astronaut.jpg" width="30%"> <img src="../../examples/vision-test-card.png" width="30%">

Mehr Details: [examples/README.md](../../examples/README.md).

## License

[MIT](../../LICENSE)
