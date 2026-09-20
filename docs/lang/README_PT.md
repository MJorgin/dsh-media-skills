<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — revisão e geração de imagens para DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### Skills de revisão e geração de imagens para DeepSeek Harness v0.1.6

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-v0.1.6--alpha.2-4D6BFE)](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.6-alpha.2)
[![No bundled keys](https://img.shields.io/badge/keys-never%20in%20repo-8B5CF6)](#configurar-chaves)
[![Docs](https://img.shields.io/badge/docs-9%20languages-4D6BFE)](README_PT.md)

<br>

Um plugin leve para DSH que contribui com duas skills de mídia no modelo traga-sua-própria-chave (bring-your-own-key):

- 👁️ **`vision-review`** — descreve imagens, executa OCR, revisa capturas de tela e detecta problemas de UI, como texto sobreposto ou estourado, com evidência estruturada opcional.
- 🎨 **`media-tools`** — gera ilustrações, avatares, fundos e banners via SenseNova U1 Fast ou SiliconFlow Kolors.

O plugin usa o ciclo de vida de provider de skills do DSH v0.1.6 e **não aplica patches no núcleo do DSH, não altera configurações de modelo, não registra providers de modelo nem grava configuração oculta**.

[Por que](#por-que) · [Instalar](#instalação) · [Chaves](#configurar-chaves) · [Uso](#uso) · [Manual](#instalação-manual) · [Verificar](#verificação) · [FAQ](#faq)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## Por que

O DeepSeek Harness v0.1.6 já oferece fluxos modernos de anexos e arquivos para modelos que aceitam imagens. Este pacote foca em dois trabalhos complementares que seguem úteis mesmo com o suporte nativo a anexos:

| Necessidade | Skill | Como ajuda |
|---|---|---|
| QA explícita de capturas | `vision-review` | Verifica completude da renderização, sobreposição, estouro, desalinhamento, marcas d'água e consistência visual. |
| OCR e imagem para texto | `vision-review` | Converte capturas, fotos e digitalizações em texto, com contrato JSON estruturado opcional. |
| Failover de providers | `vision-review` | Tenta os motores configurados em uma ordem previsível e relata cada falha. |
| Produção de assets | `media-tools` | Gera arquivos de imagem utilizáveis com uma chave da SenseNova ou da SiliconFlow. |

O roteamento de modelos fica com o DSH e sua interface **Models**. Isso garante compatibilidade com ativar, desativar, desinstalar e reiniciar em tempo de execução no v0.1.6, sem deixar estado global.

## Novidades na v0.1.6

- Registra ambas as skills empacotadas via `ctx.skills.registerProvider(...)`.
- Remove a antiga mutação implícita do `llm-pi-ai` e toda a injeção de rotas de modelo.
- Lê os metadados diretamente de cada `SKILL.md`, evitando divergência de texto.
- Suporta o ciclo de vida em tempo de execução: o registro pertence à fiber do plugin e é removido de forma limpa.
- Patches antigos do núcleo viram material histórico para `<= v0.1.1-rc.2`; a v0.1.6 não precisa deles.
- Adiciona validação estática do manifesto e teste de provider em tempo de execução com contexto falso.

## Instalação

### Opção 1: DSH Plugin Manager

Abra o Plugin Manager do DSH e adicione:

```text
github:MJorgin/dsh-media-skills
```

Depois reinicie o perfil.

### Opção 2: CLI

Para o perfil web comum:

```sh
dsh plugin --profile web add github:MJorgin/dsh-media-skills
```

Substitua `web` pelo perfil de DSH que você usa. Reinicie o perfil após a instalação para montar o novo pacote.

Não exige build: o pacote traz ESM e scripts Python prontos para rodar, sem instalação de dependências nem script `prepare`.

## Configurar chaves

Chaves nunca são armazenadas neste repositório. Os scripts leem primeiro as variáveis de ambiente e depois:

```text
~/.dsh/secrets/media-tools.env
~/.codex/secrets/media-tools.env   # compatibilidade legada
```

O `vision-review` também pode ler chaves compatíveis a partir de:

```text
~/.dsh/.credentials.yaml
```

O `media-tools` lê as variáveis de ambiente e os dois arquivos `media-tools.env`; configure suas chaves explicitamente em um desses locais.

| Chave | Usada por | Observações |
|---|---|---|
| `GLM_API_KEY` | `vision-review` | Motor principal Zhipu `glm-4v-flash`; confira os termos atuais de preço/faixa gratuita. |
| `DEEPSEEK_API_KEY` | `vision-review` | Modelo de visão DeepSeek pago e opcional; também lido do armazenamento de credenciais do DSH. |
| `SILICONFLOW_API_KEY` | Ambas | Qwen3-VL na revisão e Kolors na geração. |
| `SENSENOVA_API_KEY` | Ambas | Modelo de visão SenseNova na revisão e U1 Fast na geração. |
| `GEMINI_API_KEY` | `vision-review` | Fallback opcional do Gemini; algumas redes exigem `GEMINI_PROXY`. |

Exemplo de arquivo de segredos:

```sh
# ~/.dsh/secrets/media-tools.env, recomendado chmod 600
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
SENSENOVA_API_KEY=...
GEMINI_API_KEY=...
```

### Modelos de imagem nativos do DSH

Este plugin não adiciona um modelo ao seletor do DSH. Para uma conversa normal do DSH aceitar imagens nativamente, configure um modelo/provider multimodal nas configurações **Models** do DSH e use o fluxo nativo de anexos.

Use o `vision-review` quando precisar de um fluxo dedicado de revisão/OCR por script, de uma cadeia de failover ou de evidência estruturada, e não apenas de uma resposta multimodal no chat.

## Uso

### Revisão visual

Peça ao DSH para usar o `vision-review` ou execute o script a partir do diretório da skill:

```bash
python3 scripts/vision.py screenshot.png
python3 scripts/vision.py a.png b.png --structured
python3 scripts/vision.py screenshot.png --provider=siliconflow-qwen
python3 scripts/vision.py --doctor
```

O prompt padrão verifica completude da renderização, texto sobreposto/desalinhado/estourado, hierarquia de cores, marcas d'água e bugs visuais óbvios. Para uma tarefa específica, passe um prompt focado:

```bash
python3 scripts/vision.py page.png --prompt="Verifique se botões, títulos e gráficos se sobrepõem e indique as posições"
```

A cadeia de failover só adiciona motores cujas chaves estejam disponíveis. A saída opcional `--structured` inclui resumo, OCR, layout em ordem de leitura, semântica, notas visuais e incertezas.

### Geração de imagens

```bash
python3 skills/media-tools/scripts/generate.py "palácio chinês em um mar de nuvens, realista e cinematográfico, escala grandiosa" palace.jpg 16:9
```

Usa SenseNova quando há `SENSENOVA_API_KEY`; caso contrário, usa SiliconFlow Kolors quando há `SILICONFLOW_API_KEY`. Tamanhos da SenseNova aceitam dimensões exatas ou proporções comuns; o script mapeia para o tamanho suportado mais próximo.

## Instalação manual

Recomenda-se instalar como plugin porque o repositório contém várias skills. O provider de sistema de arquivos da v0.1.6 varre apenas um nível abaixo da raiz de skills; clonar o repositório diretamente em `~/.dsh/skills/` não descobre os `skills/*/SKILL.md` aninhados.

Na instalação manual, vincule cada skill separadamente:

```sh
git clone https://github.com/MJorgin/dsh-media-skills.git ~/.dsh/bundles/dsh-media-skills
mkdir -p ~/.dsh/skills
ln -s ~/.dsh/bundles/dsh-media-skills/skills/vision-review ~/.dsh/skills/vision-review
ln -s ~/.dsh/bundles/dsh-media-skills/skills/media-tools ~/.dsh/skills/media-tools
```

Reinicie o DSH depois de criar os links.

## Verificação

Execute todas as verificações locais:

```sh
npm test
```

Inclui validação do manifesto do bundle, registro/carregamento do provider em tempo de execução por um contexto similar ao DSH, checagem de sintaxe JavaScript e compilação Python dos dois scripts.

## Patches históricos

Os patches antigos do núcleo seguem disponíveis para quem mantém builds legadas do DSH:

- [Notas em chinês](../HARNESS_PATCH.md)
- [English notes](../HARNESS_PATCH_EN.md)

Aplicam-se a builds históricas até `v0.1.1-rc.2`. Novos usuários da v0.1.6 não devem aplicá-los.

## Estrutura do projeto

```text
dsh-media-skills/
├── package.json              # Manifesto do bundle DSH e comandos de teste
├── cordis.patch.yml          # Inserção do plugin Cordis
├── index.js                  # Registra o provider de skills empacotadas
├── skills/
│   ├── vision-review/        # Análise de imagem e QA de capturas
│   └── media-tools/          # Geração de imagens
├── scripts/                  # Ajudantes de validação do bundle
├── examples/                 # Imagens de exemplo e cartão de teste
└── docs/                     # Guias, traduções e notas históricas
```

## FAQ

**Preciso de um patch do núcleo no DSH v0.1.6?**
Não. Configure um modelo multimodal no DSH para conversas nativas com imagem, ou use os scripts para fluxos dedicados de revisão e geração.

**O plugin adiciona um modelo ao seletor automaticamente?**
Não. O DSH v0.1.6 já traz gestão de modelos e plugins; o plugin apenas registra skills e nunca altera a configuração de modelos.

**Todos os providers são gratuitos?**
Preços e faixas gratuitas podem mudar. GLM-4V-Flash e Kolors costumam ser amigáveis à faixa gratuita, enquanto DeepSeek é pago. Confira os termos atuais antes de depender de um fluxo.

**Chaves de API vêm incluídas?**
Não. As chaves ficam no seu ambiente, no armazenamento de credenciais do DSH ou em arquivos locais de segredos.

**Para onde enviar capturas internas sensíveis?**
Apenas para providers aprovados pela sua organização. Não envie documentos internos ao Gemini ou a outros providers externos, a menos que a política da empresa permita.

## Exemplos

<img src="../../examples/generated/fox-forest.jpg" width="30%"> <img src="../../examples/generated/cat-astronaut.jpg" width="30%"> <img src="../../examples/vision-test-card.png" width="30%">

Mais detalhes em [examples/README.md](../../examples/README.md).

## License

[MIT](../../LICENSE)
