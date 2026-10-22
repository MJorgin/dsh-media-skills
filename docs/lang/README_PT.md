<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — Leitura e geração de imagens grátis para o DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### *Dê ao DeepSeek Harness skills reutilizáveis de revisão e geração de imagens — verificado no Desktop 0.2.0-rc.2.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)
[![Harness](https://img.shields.io/badge/Harness-0.2.0%20verified%20%7C%200.2.1--rc.2%20source%20checked-4D6BFE)](../DESKTOP_0.2.md)

<br>

Dê ao [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) «olhos» e um «pincel» —
Ele adiciona dois skills em runtime e uma cadeia de failover de visão com suas próprias chaves. Foi verificado em runtime no Desktop **0.2.0-rc.2**, e a tag **dsh-v0.2.1-rc.2** teve o mesmo contrato de provider verificado no código-fonte, sem chaves embutidas.

[Recursos](#-recursos) · [Início rápido](#-início-rápido) · [Compatibilidade](#-compatibilidade) · [Uso](#-uso) · [Guia de visão](../SETUP_VISION.md)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## ✨ Recursos

| Recurso | O que faz | Modelo | Custo |
|---|---|---|---|
| 🖼️ Anexos nativos de imagem | No Desktop 0.2 / v0.1.6+, você pode colar, arrastar ou escolher imagens quando a **rota ativa suporta imagens**; a rota padrão `deepseek-flash` suporta. Rotas somente texto retornam `MODEL_DOES_NOT_SUPPORT_IMAGES`; a transcrição automática antiga não é mais usada. | `deepseek-flash` padrão ou uma rota de visão configurada | Conforme o provedor selecionado |
| 🔀 Cadeia de failover de visão | Em fluxos com caminho de arquivo, o `vision-review` pode usar GLM-4V-Flash, DeepSeek Vision, Qwen3-VL, SenseNova, Gemini e endpoints compatíveis com OpenAI. | Suas chaves e rotas | Planos gratuitos ou provedores opcionais |
| 👁️ `vision-review` | Analisa imagens e capturas locais, faz OCR, detecta marcas de água/logos e falhas visuais de UI, e pode emitir evidências JSON estruturadas. Suporta caminhos longos, lotes e `--structured`. | GLM-4V-Flash + provedores de visão opcionais | Planos gratuitos GLM/SiliconFlow; outros opcionais |
| 🎨 `media-tools` | Gerar imagens, ilustrações, avatares, fundos e banners | SenseNova U1 Fast → SiliconFlow Kolors | Grátis, sem marca d'água |

> ⚠️ Observação importante: no Desktop 0.2, anexos nativos só são aceitos quando o modelo ativo declara `inputModalities: ["text", "image"]`. **Não é necessário patch no núcleo**, não altere um `app.asar` assinado e o bundle não grava configurações de modelo. Em uma rota somente texto, use `vision-review` com um caminho local de imagem.

## ⚡ Início rápido

1. Instale o bundle:

   ```sh
   dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
   ```

2. **Chaves**:
   - **Desktop 0.2 / v0.1.6+**: não são necessárias chaves para instalar — os dois skills são registrados em runtime, e a rota padrão `deepseek-flash` suporta conversas nativas com imagem. As chaves para a cadeia do skill (`GLM_API_KEY`, `SILICONFLOW_API_KEY`, `GEMINI_API_KEY` opcional) ficam em `~/.dsh/secrets/media-tools.env`; rotas adicionais são configuradas em **Configurações → Modelos**.
   - **Versões prévias antigas (≤ v0.1.1)**: a leitura colada e a rota de visão da época podiam usar a `DEEPSEEK_API_KEY` já existente do agente. Esse comportamento de transcrição automática não se aplica ao Desktop 0.2.

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <sua chave>
   ```

3. **Reinicie totalmente** o `dsh web` e faça uma atualização forçada (`Cmd+Shift+R`).

4. Verifique: **`vision-review`** e **`media-tools`** aparecem na lista de skills. No Desktop 0.2, selecione uma rota com suporte a imagem, como **`deepseek-flash`**, antes de enviar um anexo nativo; uma rota somente texto retorna `MODEL_DOES_NOT_SUPPORT_IMAGES` e não descreve a imagem automaticamente.

Guia completo, funcionamento e solução de problemas: **[../SETUP_VISION.md](../SETUP_VISION.md)**

## 🔑 Chaves

As chaves **nunca são armazenadas neste repositório**. A cadeia independente do `vision-review` lê, nesta ordem: variáveis de ambiente → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env` (fallback legado). A antiga rota GLM automática vale apenas para ≤ v0.1.1; no Desktop 0.2 / v0.1.6+, as rotas ficam em **Configurações → Modelos**.

Onde obter chaves para os motores do skill (limites gratuitos conforme os termos do provedor): Zhipu — [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys (glm-4v-flash). SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → API Keys (Kolors). Google Gemini é opcional na cadeia de failover.

```sh
# ~/.dsh/secrets/media-tools.env (chmod 600, uma KEY=value por linha)
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 Uso

Três formas de ler imagens:

| Forma | Como | Quando |
|---|---|---|
| **A. Anexo nativo (recomendado)** | Selecione uma rota com suporte a imagem (padrão `deepseek-flash`), clique em 🖼️ / arraste / cole e envie | Perguntas visuais do dia a dia |
| **B. Sessão com modelo de visão** | Em uma nova conversa, escolha `deepseek-flash` ou uma rota GLM/Qwen/SenseNova configurada e anexe imagens | Conversas visuais nativas com vários turnos |
| **C. Arquivos + skill** | Coloque a imagem no workspace e peça “leia esta imagem com vision-review”, ou execute `scripts/vision.py` com um caminho | Revisão em lote, OCR/QA estruturado e rotas somente texto |

Anexos nativos vão diretamente ao modelo visual selecionado. No `vision-review`, indique idioma e formato no pedido ou use `--structured`.

Basta dizer:

- «Olhe esta imagem / verifique este screenshot em busca de bugs visuais» → `vision-review`
- «Gere uma imagem de …» → `media-tools`

## 🔌 Compatibilidade

| Build do DSH | Status |
|---|---|
| Desktop **0.2.0-rc.2** | **Verificado em runtime.** Plugin de runtime padrão; os dois skills são registrados por `ctx.skills.registerProvider()`. Anexos nativos são aceitos apenas com `inputModalities: ["text", "image"]`; a rota padrão `deepseek-flash` suporta. Sem patches no núcleo nem gravação de configurações. |
| Tag **dsh-v0.2.1-rc.2** | **Fonte verificada.** `@deepseek-ai/dsh-skill@0.2.1-rc.2` mantém a factory do provider, `list()`/`get()`, os campos de candidate e a admissão de imagem. Não havia localmente um build Desktop rc.2 empacotado para um teste completo de inicialização. |
| **v0.1.6** | Mesmo ciclo de provider suportado; rotas opcionais GLM/SiliconFlow/SenseNova/Gemini são configuradas em **Configurações → Modelos**. |
| v0.1.1 e versões prévias anteriores | Comportamento apenas histórico. Não aplique patches antigos do núcleo aos builds assinados do Desktop 0.2. |

Veja as [notas de compatibilidade do Desktop 0.2](../DESKTOP_0.2.md) para a lista completa de verificações.

### Coexistência com ModLens

O bundle pode ser instalado com [ModLens](https://github.com/liustack/modlens), mas o Desktop 0.2 não tem mais o fallback antigo de transcrição automática do api-proxy. Escolha deliberadamente o fluxo colar-para-caminho do ModLens ou `pasteToPath: false` para enviar anexos nativos a um modelo visual. A comparação histórica em chinês está em [../COMPARE_MODLENS.md](../COMPARE_MODLENS.md).

## 🗺️ Estrutura

```
dsh-media-skills/
├── package.json           # manifesto dsh.bundle
├── cordis.patch.yml       # camada de plugin
├── index.js               # registra os dois skills pelo runtime de provider DSH v0.1.6+ / Desktop 0.2
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
