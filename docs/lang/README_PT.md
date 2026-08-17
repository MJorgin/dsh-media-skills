<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — Leitura e geração de imagens grátis para o DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### *Cole imagens direto no chat — modelo de visão, leitura e geração de imagens grátis.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)

<br>

Dê ao [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) «olhos» e um «pincel» —
duas skills grátis, um modelo de visão grátis e leitura de imagens coladas, sem chaves hardcoded.

[Recursos](#-recursos) · [Início rápido](#-início-rápido) · [Uso](#-uso) · [Guia de visão](../SETUP_VISION.md)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## ✨ Recursos

| Recurso | O que faz | Modelo | Custo |
|---|---|---|---|
| 📎 Leitura de imagens coladas | Em sessões **somente texto** (ex.: deepseek-v4-pro), a barra de entrada ganha um botão «Adicionar imagem» (clipe); imagens coladas são descritas pelo modelo de visão e entregues ao modelo atual como texto | Zhipu GLM-4V-Flash | Grátis |
| 🧠 Rota de modelo de visão | Após instalar, adiciona **automaticamente** «智譜 GLM-4V-Flash（視覚）」 ao seletor de modelos; use em conversas novas para falar sobre imagens | Zhipu GLM-4V-Flash | Grátis |
| 👁️ `vision-review` | Analisar / reconhecer / descrever imagens e capturas de tela; encontrar bugs visuais de UI (sobreposição, estouro, desalinhamento); detectar marcas d'água/logos; transformar imagens em texto | Zhipu GLM-4V-Flash | Grátis |
| 🎨 `media-tools` | Gerar imagens, ilustrações, avatares, fundos e banners | SiliconFlow Kolors | Grátis, sem marca d'água |

> ⚠️ Nota honesta: a leitura de imagens coladas vive no **núcleo** do DeepSeek Harness (a lógica de admissão de imagens em `api-proxy`). Este bundle entrega a **rota de modelo + skills**; o modelo de visão funciona em qualquer build do DSH, mas a comodidade da auto-descrição exige um build com esse suporte. Como saber: FAQ Q1.

## ⚡ Início rápido

1. Instale o bundle:

   ```sh
   dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
   ```

2. **Primeiro consiga a chave grátis**: cadastre-se em [open.bigmodel.cn](https://open.bigmodel.cn) → **API Keys** (glm-4v-flash é grátis). Para gerar, crie também uma em [siliconflow.cn](https://siliconflow.cn) (Kolors é grátis). Depois configure — GUI web (**Configurações → Modelos** → o campo **API Key** do provedor zhipu-vision) ou arquivo de credenciais:

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <sua chave>
   ```

3. **Reinicie totalmente** o `dsh web` e faça uma atualização forçada (`Cmd+Shift+R`).

4. Verifique: o seletor de modelos mostra **智譜 GLM-4V-Flash（視覚）**. Se o seu build suportar a leitura de imagens coladas, a barra de entrada mostra um botão 📎 **Adicionar imagem** — cole uma imagem em qualquer sessão e ela chegará como descrição em texto.

Guia completo, funcionamento e solução de problemas: **[../SETUP_VISION.md](../SETUP_VISION.md)**

## 🔑 Chaves

Chaves **nunca são armazenadas neste repo**. Os scripts leem, em ordem: variáveis de ambiente → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env` (fallback legado). A rota do modelo de visão lê `GLM_API_KEY` do armazenamento de credenciais do DSH.

Onde obter (ambas grátis): Zhipu — [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys (glm-4v-flash). SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → API Keys (Kolors).

```sh
# ~/.dsh/secrets/media-tools.env (chmod 600, uma KEY=value por linha)
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 Uso

Três formas de ler imagens:

| Forma | Como | Quando |
|---|---|---|
| **A. Colar diretamente (recomendado)** | Em qualquer sessão, clique no botão 📎 / arraste / cole uma imagem e envie | Perguntas do dia a dia sobre imagens — sem salvar arquivos nem trocar de modelo |
| **B. Sessão com modelo de visão** | Nova conversa, escolha 智譜 GLM-4V-Flash（視覚）, cole imagens e converse | Conversas de várias rodadas sobre imagens, `read_image` nativo |
| **C. Arquivos + skill** | Coloque a imagem no workspace e diga «leia esta imagem com vision-review» | Revisão em lote, fluxos com scripts |

O idioma da descrição segue o da sua mensagem (mensagem em chinês → descrição em chinês; em inglês → em inglês; sem texto → chinês).

Basta dizer:

- «Olhe esta imagem / verifique este screenshot em busca de bugs visuais» → `vision-review`
- «Gere uma imagem de …» → `media-tools`

## 🗺️ Estrutura

```
dsh-media-skills/
├── package.json           # manifesto dsh.bundle
├── cordis.patch.yml       # camada de plugin
├── index.js               # registra skills + cria a rota zhipu-vision
├── skills/
│   ├── vision-review/     # leitura de imagens
│   └── media-tools/       # geração de imagens
├── docs/
│   ├── SETUP_VISION.md    # guia de visão (chinês)
│   ├── SETUP_VISION_EN.md # detailed setup guide (English)
│   └── lang/              # READMEs em outros idiomas
├── scripts/make-banner.py # regenera docs/social-preview.png
└── docs/social-preview.png
```

## 🤝 Junte-se ao ecossistema de plugins DSH

A prévia de desenvolvedores do DeepSeek Harness ainda está em fase de testes para desenvolvedores do Harness; os plugins principais e as APIs base seguirão evoluindo. Esperamos explorar os limites superiores da inteligência junto com desenvolvedores do mundo todo, sobre infraestrutura de código aberto, aberta, reutilizável e combinável.

- [Tópico dsh-plugin](https://github.com/topics/dsh-plugin)
- [Início rápido](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [Repositório do DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

> Marque este repo com o tópico [`dsh-plugin`](https://github.com/topics/dsh-plugin) para que outros o descubram.

## 📄 Licença

[MIT](../../LICENSE)
