# Contrato `designx` v1 — camada de design para sprintx e runx

Documento compartilhado pelas skills e pelo painel. Guarde no repositório do
painel e referencie nas skills.

---

## O que designx é

`designx` é uma **camada** — como `stackx`, `legadox`, `memox` e `prodx`.
Sozinha não faz nada. Ela modifica o comportamento de `sprintx` e `runx`
quando o projeto tem um design system detectado ou cartografiado.

Designx define **como** detectar, auditar e integrar design. Não define
**qual** design system usar — isso é conteúdo que vem de fora (uma skill
como `saas-panel-design-system`) ou é gerado internamente (cartografia
visual do projeto existente).

### Princípio

> **Se o projeto tem UI, tem design system.** Se não tem declarado, a
> cartografia descobre. Se tem inconsistência, a auditoria aponta. Em
> nenhum caso designx impede o trabalho — ele instrui, avisa e audita.

---

## 1. Detecção

Designx procura um design system nesta ordem de prioridade:

| Prioridade | Caminho | Confiança |
|---|---|---|
| 1 | `docs/design-system/DESIGN-SYSTEM.md` com frontmatter válido | alta |
| 2 | Skill `saas-panel-design-system` (ou equivalente) no lock do `.expx/` | alta |
| 3 | Nenhum dos acima | cartografia automática |

### Regras de detecção

1. **Prioridade 1 ou 2 encontrada** → designx usa o DS encontrado como
   referência de auditoria. Origem: `usuario` ou `skill_instalada`.

2. **Nenhum DS encontrado** → designx dispara **cartografia visual** (§2).
   O DS gerado tem origem `cartografia_automatica` e `consistente: false`
   quando há drift.

3. **Designx ausente no projeto** → nada muda. A ausência de designx nunca
   trava, avisa ou modifica comportamento de sprintx/runx.

4. **Mais de um DS encontrado** → prioridade 1 vence. Se os dois são
   prioridade 1, o mais recente (por `atualizado_em`) vence. O outro é
   registrado no rastro como `design_system_conflito`.

---

## 2. Cartografia visual

Quando nenhum design system é encontrado, o agente `cartografo-visual`
analisa o projeto existente e gera um `DESIGN-SYSTEM.md` candidato.

### O que o cartografo analisa

| Área | O que procura | Comando de detecção |
|---|---|---|
| Tokens CSS | Variáveis `--*` em CSS/SCSS | `grep -rn "\-\-[a-z]" src/**/*.css` |
| Cores | Valores hex, rgb, hsl em componentes | `grep -rnE "#[0-9a-fA-F]{3,8}\|rgb\|hsl" src/**/*.tsx` |
| Tipografia | font-family, pesos, tamanhos | `grep -rn "font-family\|font-size\|text-\[" src/` |
| Espaçamento | Padrão de gap/padding/margin | Analisar classes Tailwind em uso |
| Componentes | Primitivas existentes, reutilização | Listar `src/components/ui/` |
| Padrões de tela | Layouts recorrentes | Analisar imports e estrutura de páginas |
| Bordas vs sombras | Elevação predominante | `grep -rn "shadow\|border" src/**/*.tsx` |
| Dark mode | Se existe, como está | Verificar `dark:` classes, theme provider |
| Framework visual | Tailwind, CSS modules, etc. | `package.json` + configs |

### Regras da cartografia

1. **Leitura apenas.** O agente não escreve arquivos. Gera o conteúdo como
   saída textual; quem grava é o hook `designx-cartografa` (§4).

2. **Nada inventado.** Se não encontrou, diz "não encontrado". Se
   encontrou inconsistência, aponta com `arquivo:linha`.

3. **Drift é listado, não corrigido.** A cartografia espelha o estado
   atual, incluindo os problemas. Correção é decisão humana.

4. **Falha aberta.** Se o agente não conseguir rodar (projeto vazio, sem
   UI, erro de leitura), designx se comporta como inerte — sem DS, sem
   auditoria, sem trava.

### O DESIGN-SYSTEM.md gerado

```yaml
---
expx_schema: 1
expx_tool: designx
kind: design_system
nome: <projeto>-design-system
versao: 0.1.0
origem: cartografia_automatica
stack: [react, tailwind]
auditavel: true
consistente: false
drift_detectado: 4
criado_em: 2026-08-30
atualizado_em: 2026-08-30
---
```

O campo `consistente` é `true` quando `drift_detectado` é 0. Se é `false`,
o painel mostra o aviso de que o DS precisa de revisão antes de ser usado
como referência de auditoria.

### Ciclo de vida

```
[1] Ausente
     ↓ cartografa
[2] Cartografiado (consistente: false)
     ↓ usuário corrige drift
[3] Cartografiado (consistente: true)
     ↓ ou: usuário substitui por DS declarado
[4] Declarado (origem: usuario)
     ↓ sprintx auditando
[5] Violacoes detectadas → painel mostra
```

---

## 3. Integração com sprintx

### F1 — Ingestão

1. Designx verifica se DESIGN-SYSTEM.md existe (§1).
2. Se não existe → dispara cartografia (§2), grava o arquivo.
3. Lê o DS e gera `RESUMO.md` em `docs/design-system/`:
   - Tokens disponíveis
   - Componentes prontos
   - Padrões de tela documentados
   - Tom estético declarado
4. Sprintx carrega o RESUMO.md como contexto para as fases seguintes.

### F2 — Descoberta

Cada PROPOSTA de feature verifica se o DS já resolve o que está sendo
proposto. Instrução na skill: "antes de propor UI nova, consulte
RESUMO.md. Se o DS tem componente ou padrão que resolve, referencie-o."

### F3 — Plano

Tasks que tocam UI carregam campos novos no frontmatter:

```yaml
tasks:
  - id: T-01.01
    titulo: Listagem de clientes
    design_refs: [padrao-lista, componente-busca]
    tom_estetico: denso-operacional
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `design_refs` | `string[]` | não | Componentes/padrões do DS referenciados |
| `tom_estetico` | enum | não | Intenção visual da task (§6) |

### F4 — Orquestração

O orquestrador declara dependências de design:

```yaml
orquestrador:
  design_system_detectado: saas-panel-design-system
  design_audit_necessario: true
  tom_estetico_global: denso-operacional
```

### F5 — Auditoria

O agente `auditor-design` (§5) roda como gate adicional. Lê o plano e
responde: "este plano viola o design system ou as boas práticas?"

Se `design_audit_necessario: true` e o agente reprova, a sprint não avança
até a reprovação ser resolvida — mesmo padrão do `auditor-plano`.

### F6 — Execução

O implementador lê o RESUMO.md antes de escrever UI. Instrução na skill:
"leia os padrões antes de criar componente. Copie de assets quando
possível, não reescreva do zero."

---

## 4. Integração com runx

### E1 — Investigação

Se `tipo_ocorrencia` é `melhoria-ui` ou `melhoria-ux`, o investigador
consulta o DS para verificar se o comportamento atual é uma violação do
padrão. O achado entra na causa raiz como evidência.

### E2 — Plano

O fix de UI referencia o padrão correto do DS no campo `design_refs`.

### E3 — Fix

O implementador segue o padrão do DS ao corrigir. Se o DS não tem
componente para o caso, cria seguindo as boas práticas (§7).

### E4 — QA

O checklist de QA inclui itens de design quando a ocorrência é visual:

- [ ] Tokens utilizados, não hex hardcoded
- [ ] Componente segue o padrão do DS
- [ ] Estado vazio/loading/error cobertos
- [ ] Acessibilidade preservada

### E5 — Relatório

O relatório técnico acrescenta campo:

```yaml
relatorio_tecnico:
  violacao_design: true
  padrao_violado: padrao-detalhe-modal
```

---

## 5. Hooks

### `designx-cartografa` — Primeira detecção

```
Evento: PreToolUse
Matcher: ferramenta = Bash (expx init ou primeiro uso de sprintx)
Handler: hooks/designx/designx-cartografa.sh
```

| Modo | Comportamento |
|---|---|
| `bloqueio` (padrão) | Impede que o trabalho prossiga sem DS. Se a cartografia falhar, registra o erro e permite com aviso |
| `aviso` | Registra no rastro, não bloqueia |
| `desligado` | Não roda |

**Modo padrão:** `bloqueio` — a ausência de DS quando designx está ativo
é um problema que precisa ser resolvido antes de seguir. Exceção à regra
universal de que hooks de método nascem em aviso: este hook nasce em
bloqueio porque sem DS a auditoria de design não tem referência, e
auditar sem referência é violação falsa (a pior coisa que um hook pode
fazer).

**Falha aberta:** se o cartografo não conseguir rodar, o hook registra o
erro no rastro e sai com 0. O trabalho continua sem DS, com aviso.

### `designx-audit` — Auditoria contínua

```
Evento: PostToolUse
Matcher: ferramenta = Write | Edit
Handler: hooks/designx/designx-audit.sh
```

| Modo | Comportamento |
|---|---|
| `aviso` (padrão) | Registra no rastro, não bloqueia |
| `bloqueio` | Exit 2 com a violação |
| `desligado` | Não roda |

**Modo padrão:** `aviso` — regra universal. Só promove a bloqueio depois
de semanas sem falso positivo.

**O que verifica:**
1. Lê o caminho do arquivo alterado
2. Verifica se está no escopo de UI (`*.tsx`, `*.css`, `src/components/`)
3. Se DS está detectado, verifica:
   - Tokens CSS usam variáveis, não hex hardcoded
   - Componentes reutilizam primitivas do DS
   - Padrão de tela é seguido

### `designx-token-check` — Verificação pesada (sob demanda)

```
Evento: PreToolUse
Matcher: ferramenta = Bash (build, lint)
Handler: hooks/designx/designx-token-check.sh
```

Verifica se o CSS output contém violações (cor hardcoded, variável
ausente). Mais pesado — ativado com `--full` ou sob demanda, não roda em
toda chamada.

---

## 6. Agentes

### `cartografo-visual`

```markdown
---
name: cartografo-visual
description: Analisa um projeto existente e extrai o vocabulario visual em uso
tools: Read, Glob, Grep
---
```

**Ferramentas:** somente leitura.

**Prompt:**

```
Voce e o cartografo visual do designx. Sua tarefa e analisar um projeto
e extrair o vocabulario visual que ja esta em uso.

NAO invente nada. NAO sugira melhorias. NAO corrija drift.
Apenas descreva o que existe, com evidencia (arquivo:linha).

Para cada area, responda:
- O que foi encontrado
- Onde foi encontrado (arquivo:linha)
- Se e consistente com o resto do projeto

Areas para analisar:
1. Tokens CSS (variaveis --*)
2. Cores (hex, rgb, hsl em uso)
3. Tipografia (fontes, pesos, tamanhos)
4. Espacamento (padrao de gap/padding/margin)
5. Componentes (quais existem, quais sao reutilizados)
6. Padroes de tela (listas, detalhes, forms, dashboards)
7. Bordas vs sombras (elevacao)
8. Dark mode (se existe, como)
9. Framework visual (Tailwind, CSS modules, etc.)

Seja exaustivo. Se nao encontrar algo, diga "nao encontrado".
Se encontrar inconsistencia, aponte com arquivo:linha.
```

**Quando roda:**
- Na primeira ativação de designx quando não há DS

**Não roda quando:**
- DESIGN-SYSTEM.md já existe
- Projeto não tem UI (não há o que cartografar)

### `auditor-design`

```markdown
---
name: auditor-design
description: Audita conformidade contra o design system e boas praticas de UI
tools: Read, Glob, Grep
---
```

**Ferramentas:** somente leitura. Mesmo padrão do `auditor-plano` e
`revisor-testes` — quem audita não corrige.

**Prompt:**

```
Voce e o auditor-design do designx. Sua tarefa e auditar codigo de UI
contra o design system do projeto e as boas praticas de design.

Leia o DESIGN-SYSTEM.md e o RESUMO.md em docs/design-system/.
Leia os arquivos de UI identificados nas design_refs das tasks.
Compare: tokens usados, componentes reutilizados, padroes seguidos.

Para cada achado, classifique:
- bloqueio: violacao direta de regra nao-negociavel do DS
- alto: uso de padrao que o DS proibe
- medio: inconsistencia que nao quebra mas causa drift
- baixo: melhoria sugestiva, nao bloqueante

Nao corrija. Apenas liste com arquivo:linha e a regra violada.
Emite veredito: aprovado ou reprovado com lista de violacoes.
```

**Quando roda:**
- sprintx F5 (auditoria do plano) — gate adicional
- runx E4 (QA) — quando `tipo_ocorrencia` é `melhoria-ui` ou `melhoria-ux`
- Sob demanda: `expx design-audit <trabalho_id>`

**Não roda quando:**
- O trabalho não toca UI
- Não há design system detectado nem cartografiado
- `design_audit_necessario: false` no orquestrador

---

## 7. Boas práticas — as 14 regras

Toda regra tem evidência: o que acontece sem ela. Violar uma regra é
violação do método, não preferência de estilo.

Derivadas do cruzamento entre `saas-panel-design-system`,
`frontend-design` (Anthropic) e método Expx.

### Regras de estrutura (bloqueio)

| # | Regra | Bug sem ela | Detecção |
|---|---|---|---|
| B1 | Paginação adaptativa, nunca fixa | Tela pela metade em monitor grande | `grep -rn "PAGE_SIZE" src` |
| B2 | Detalhe em modal com seções, nunca drawer | Usuário não consegue comparar registros | `grep -rn "Sheet" src` |
| B3 | Sub-navegação em rail, nunca tabs | Perda de contexto em painel denso | `grep -rn "Tabs" src/pages` |
| B4 | Estado vazio dentro da tabela | Usuário fica preso sem saída | Inspecionar retorno antecipado |
| B5 | Ação destrutiva = AlertDialog com nome | Delete acidental sem confirmação | `grep -rn "window.confirm" src` |

### Regras de estilo (alto)

| # | Regra | Bug sem ela | Detecção |
|---|---|---|---|
| A1 | hex hardcoded = proibido | Dark mode inutilizável | `grep -rnE "#[0-9a-fA-F]{6}" src` |
| A2 | Vocabulário fechado de cores de destaque | Coesão visual perdida | Verificar cores fora do token map |
| A3 | Fonte de display não-genérica | Toda tela parece a mesma | `grep -rn "font-family.*Inter" src` |
| A4 | Solid accent com variante dark | Cor desaparece em fundo escuro | `grep -rn "text-primary" src \| grep -v dark` |
| A5 | Loading/error/empty sempre cobertos | Tela quebrada sem feedback | Inspecionar componentes de lista |

### Regras de qualidade visual (médio)

| # | Regra | Bug sem ela | Detecção |
|---|---|---|---|
| M1 | Um tom estético declarado por task | Mistura de estilos na mesma feature | Campo `tom_estetico` ausente |
| M2 | Animação com propósito, não enfeite | Ruído visual que cansa | `grep -rn "transition" src` sem critério |
| M3 | Densidade: controles h-9, rows ~52px | Painel parece landing page | Medir altura de componentes |
| M4 | Números comparáveis com tabular-nums | Coluna de valores bagunçada | `grep -rn "tabular-nums" src` |

### Valores de `tom_estetico`

| Valor | Significado | Quando usar |
|---|---|---|
| `denso-operacional` | Painel SaaS, controles h-9, borders | CRMs, admin, analytics |
| `editorial` | Conteúdo longo, tipografia expressiva | Blogs, docs, wikis |
| `minimalista-refinado` | Espaço generoso, poucos elementos | Landing pages, portfolios |
| `brutalista` | Raw, sem polimento, function over form | Ferramentas internas, hackathons |

---

## 8. Extensões ao expx-schema

### Campo `expx_tool` — valores aceitos

`sprintx` · `runx` · `buildx` · **`designx`**

`designx` é aceito apenas para os kinds `design_system` e `design_audit`.
Os outros kinds continuam restritos a `sprintx`, `runx` e `buildx`.

### Campo `ferramenta` no rastro — valores aceitos

Adicionar **`designx`** à lista existente.

### Campo `evento` no rastro — valores novos

| Evento | Quem grava |
|---|---|
| `design_system_cartografado` | hook `designx-cartografa` |
| `design_audit_executado` | agente `auditor-design` |
| `design_violacao_detectada` | hook `designx-audit` |

### Campos novos opcionais

| Campo | Kind | Tipo | Descrição |
|---|---|---|---|
| `design_refs` | `tasks` | `string[]` | Componentes/padrões do DS referenciados |
| `tom_estetico` | `tasks` | enum | Intenção visual da task |
| `design_deps` | `orquestrador` | `string[]` | Tasks que dependem de design system |
| `violacao_design` | `relatorio_tecnico` | `boolean` | Se a ocorrência era violação de design |
| `padrao_violado` | `relatorio_tecnico` | `string` | Qual padrão do DS foi violado |

---

## 9. Novos kinds

### `design_system` — `docs/design-system/DESIGN-SYSTEM.md`

```yaml
---
expx_schema: 1
expx_tool: designx
kind: design_system
nome: saas-panel-design-system
versao: 1.2.0
origem: usuario
stack: [react, tailwind, shadcn-ui]
tokens: docs/design-system/tokens.css
componentes: docs/design-system/componentes/
padroes: docs/design-system/padroes/
auditavel: true
consistente: true
drift_detectado: 0
criado_em: 2026-08-30
atualizado_em: 2026-08-30
---
```

| Campo | Obrigatório | Descrição |
|---|---|---|
| `nome` | sim | Identificador do DS |
| `versao` | sim | Versão semântica |
| `origem` | sim | `usuario` · `skill_instalada` · `cartografia_automatica` |
| `stack` | sim | Frameworks visuais do DS |
| `tokens` | não | Caminho relativo para tokens CSS |
| `componentes` | não | Caminho relativo para componentes |
| `padroes` | não | Caminho relativo para padrões de tela |
| `auditavel` | sim | Se `true`, designx audita contra este DS |
| `consistente` | sim | Se `true`, sem drift detectado na cartografia |
| `drift_detectado` | sim | Número de inconsistências encontradas |

### `design_audit` — `docs/design-system/AUDIT.md`

```yaml
---
expx_schema: 1
expx_tool: designx
kind: design_audit
trabalho_id: exportacao-csv-relatorios
auditado_em: 2026-08-30
veredito: aprovado
violacoes: 0
avisos: 2
regra_mais_frequente: token_nao_utilizado
escopo: src/components/relatorios/
---
```

| Campo | Obrigatório | Descrição |
|---|---|---|
| `trabalho_id` | não | `null` para auditoria geral do projeto |
| `veredito` | sim | `aprovado` · `reprovado` |
| `violacoes` | sim | Número de bloqueios encontrados |
| `avisos` | sim | Número de achados de severidade média/baixa |
| `regra_mais_frequente` | sim | Regra mais violada no escopo |
| `escopo` | sim | Diretório ou arquivos auditados |

---

## 10. Violações no painel

Novas violações adicionadas ao parser de conformidade:

| Violação | Severidade | O que significa |
|---|---|---|
| `design_system_ausente` | aviso | Trabalho toca UI mas não há DS declarado nem cartografiado |
| `token_hardcoded` | alto | Componente usa cor/spacing hardcoded em vez de variável |
| `componente_nao_padronizado` | alto | UI criada do zero quando o DS já tem componente equivalente |
| `padrao_ignorado` | médio | Tela criada sem seguir padrão de tela do DS |
| `tom_estetico_inconsistente` | médio | Task tem `tom_estetico` diferente do `tom_estetico_global` |
| `design_refs_ausente` | baixo | Task toca UI mas não declara `design_refs` |

---

## 11. Integração com o painel

### Seção Design

Nova seção no painel, ao lado de **Memória**:

| Estado | O que mostra |
|---|---|
| DS ausente, designx inativo | Nada — designx não está instalado |
| DS ausente, designx ativo | "Execute a cartografia visual para começar" |
| DS cartografiado, `consistente: false` | "DS gerado — X inconsistências. Resolva antes de auditar" |
| DS cartografiado, `consistente: true` | "DS ativo — conformidade: XX%" |
| DS declarado | "DS ativo — conformidade: XX%" |

### Grid de violações

Ordenado por frequência (não por severidade), porque a regra mais
violada é a que mais precisa de atenção. Cada violação mostra:

- Regra violada
- Número de ocorrências
- Arquivo mais recente
- Link para o histórico

### Filtro

- Por período (exceto `design_system_ausente`, que não respeita período)
- Por severidade
- Por trabalho

---

## 12. Integração com o CLI

### `expx init`

```bash
npx expxdev init --skills sprintx,runx,mergex,designx --harness claude,opencode --yes
```

O `init` com `designx`:

1. Verifica se há DS no projeto (pela detecção em §1)
2. Se não há: instala designx e avisa "nenhum design system detectado — a
   cartografia rodará na primeira ativação"
3. Se há: monta o plugin com hooks e agentes
4. Configura o harness com `auditor-design` e `cartografo-visual`

### `expx design-audit`

```bash
npx expx design-audit <trabalho_id>    # audita um trabalho
npx expx design-audit --all            # audita tudo
npx expx design-audit --scope src/     # limita o escopo
```

Roda o `auditor-design` sob demanda. Resultado é gravado em
`docs/design-system/AUDIT.md` e aparece no painel.

### `expx design-cartography`

```bash
npx expx design-cartography            # gera DESIGN-SYSTEM.md
npx expx design-cartography --force    # regenera mesmo se já existe
```

Roda o `cartografo-visual` sob demanda. Útil para regenerar o DS após
mudanças grandes no projeto.

---

## 13. Regras que todo hook de designx obedece

1. **Rápido.** Roda em toda chamada de ferramenta. Acima de 200 ms, o dev
   sente. A cartografia é a exceção: roda uma vez, pode ser lenta.
2. **Silencioso quando passa.** Só fala quando barra ou avisa.
3. **Falha aberta, exceto cartografia.** Hook de método que quebra não pode
   travar o trabalho. A cartografia é exceção parcial: se falhar, o
   trabalho continua sem DS com aviso — mas o hook registra a falha.
4. **Sem rede.** Nada de chamada externa no caminho de uma chamada de
   ferramenta.
5. **Mensagem acionável.** O stderr vai para o modelo: diz o que fazer,
   não só o que está errado.
6. **Sem estado próprio.** Toda decisão sai de arquivo já existente —
   `DESIGN-SYSTEM.md`, `RESUMO.md`, `tasks.md`.
7. **Sempre grava no rastro**, inclusive quando permite.

---

## 14. O que designx NÃO faz

| Não faz | Por quê |
|---|---|
| Não cria UI | É camada de verificação, não de implementação |
| Não edita componentes existentes | Quem implementa é o sprintx/runx |
| Não escolhe o design system | Quem escolhe é o time |
| Não força upgrade de DS | Versão é declarada, não imposta |
| Impede trabalho sem DS | Sem DS = inerte, nunca trava (exceto cartografia) |
| Substitui auditoria de código | `revisor-testes` e `qa` continuam existindo |
| Gera screenshots ou mockups | É uma camada de método, não de ferramenta visual |

---

## 15. Ordem de implementação

1. Adicionar `designx` ao enum `expx_tool` e `ferramenta`
2. Adicionar kinds `design_system` e `design_audit` ao schema
3. Implementar detecção no parser (`src/parser/descoberta/`)
4. Implementar `cartografo-visual` como agente
5. Implementar hook `designx-cartografa`
6. Implementar `auditor-design` como agente
7. Implementar hook `designx-audit`
8. Integrar com sprintx (F1, F3, F5, F6)
9. Integrar com runx (E1, E3, E4, E5)
10. Adicionar violações de design ao `regras.ts`
11. Estender painel com seção Design
12. Integrar com `expx init` e novos subcomandos

---

## 16. Decisões

| ID | Decisão | Razão |
|---|---|---|
| DX-01 | Cartografia nasce em `bloqueio`, não `aviso` | Sem DS a auditoria não tem referência — auditar sem referência é violação falsa |
| DX-02 | `cartografo-visual` é leitura apenas | Mesmo padrão de `auditor-plano`; quem grava é o hook |
| DX-03 | `tom_estetico` é opcional | Nem toda task precisa declarar intenção visual — só tasks de UI |
| DX-04 | DS cartografiado com `consistente: false` é válido | O DS espelha o estado atual; correção é decisão humana, não do agente |
| DX-05 | `design_audit` sem `trabalho_id` audita o projeto inteiro | Auditoria geral é caso de uso legítimo (after cartography) |
| DX-06 | Boas práticas vivem no contrato, não em documento paralelo | Seguiria padrão do CONVENCOES.md — uma única fonte |
| DX-07 | `designx` não grava estado de trabalho | Só `sprintx`, `runx` e `buildx` gravam; `designx` grava `design_system` e `design_audit` |

---

## Histórico

| Data | Mudança |
|---|---|
| 2026-08-30 | Documento criado. Define detecção, cartografia, integração com sprintx/runx, hooks, agentes, 14 boas práticas e extensões ao schema. |
