# Descoberta de trabalhos e layout de pastas

## Contrato de entrada

O painel recebe um diretório (`--dir`, padrão `./docs`) e procura trabalhos dentro dele.

Layout declarado (`docs/contrato/CONTRATO-expx-schema-v1.md:270-277`):

```
docs/<slug>/                        ← trabalhos do sprintx
docs/manutencao/<OC-ID>-<slug>/     ← trabalhos do runx
docs/relatorios/                    ← histórico
```

Regra de descoberta, literal (`contrato:279`):

> qualquer `ORQUESTRADOR.md` com frontmatter `kind: orquestrador` é um trabalho. Arquivo sem frontmatter válido é ignorado e reportado como "fora do schema", nunca causa crash do parser.

A regra é sobre o **conteúdo**, não sobre o caminho: o que faz um trabalho é o frontmatter, não a pasta em que está. O layout acima descreve onde as skills gravam, não uma restrição de busca.

Estrutura interna de um trabalho, reunindo as três fontes:

```
<pasta-do-trabalho>/
  ORQUESTRADOR.md          kind: orquestrador
  00-BLOQUEIOS.md          kind: bloqueios      (sprintx; runx usa BLOQUEIOS.md)
  00-DECISOES.md           kind: decisoes       (só sprintx; FORA DO CONTRATO — L-02)
  00-AUDITORIA.md          SEM frontmatter      (só sprintx)
  00-OCORRENCIA.md         kind: ocorrencia     (só runx)
  01-CAUSA-RAIZ.md         kind: causa_raiz     (só runx)
  QA.md                    kind: qa             (só runx)
  base/
    00-INDICE.md           kind: base_indice
    00-LACUNAS.md          SEM frontmatter
    <recurso>.md           SEM frontmatter
  sprint-NN/
    sprint.md              kind: sprint
    fases.md               kind: fases
    tasks.md               kind: tasks
```

Arquivos declarados explicitamente **SEM** frontmatter (`sprintx:245-252`, `runx:352-358`): arquivos de recurso/área da base, `base/00-LACUNAS.md`, `00-AUDITORIA.md`. As skills alertam: "não acrescente frontmatter a eles: um `kind` fora deste contrato é uma violação, não uma extensão".

Isso é decisivo para a tela de "fora do schema": esses arquivos **não têm** frontmatter por projeto. Reportá-los como "fora do schema" seria ruído em massa — o painel precisa distinguir "arquivo sem frontmatter que deveria ter" de "arquivo que legitimamente não tem". Nenhuma fonte declara essa distinção como regra do parser — L-23.

## Contrato de saída

Uma lista de trabalhos, cada um com sua pasta, seu `ORQUESTRADOR.md` e os arquivos de estado encontrados dentro dela; mais uma lista de rejeições.

## Limites e cotas

`NÃO DOCUMENTADO`: profundidade máxima da varredura, se deve seguir symlinks, se há pastas a ignorar (`node_modules`, `.git`).

## Erros conhecidos e tratamento

| Caso | Tratamento documentado |
|---|---|
| `ORQUESTRADOR.md` sem frontmatter válido | "fora do schema" (`contrato:279`) |
| Pasta sem `ORQUESTRADOR.md` | `NÃO DOCUMENTADO` — L-13 |
| `docs/` inexistente ou vazio | `NÃO DOCUMENTADO` |
| Dois trabalhos com o mesmo `trabalho_id` | `NÃO DOCUMENTADO` |

## Riscos para a nossa implementação

- **Ruído na tela "fora do schema"** (L-23) é o risco mais direto contra a definição de pronto, que exige "nenhuma violação falsa na tela de conformidade". Um projeto real tem dezenas de arquivos de base sem frontmatter — todos legítimos.
- **`docs/contrato/` é uma pasta que este próprio projeto criou** e não faz parte do layout do contrato. Um painel apontado para o `docs/` deste repositório encontrará `CONTRATO-expx-schema-v1.md`, um `.md` sem frontmatter. Bom caso de fixture.
- **A varredura precisa de um limite de profundidade ou de uma lista de exclusão**; `docs/` de um monorepo pode conter qualquer coisa.
- **Symlinks e ciclos de diretório** travam uma varredura recursiva ingênua.

## Fonte

- `docs/contrato/CONTRATO-expx-schema-v1.md:270-281` — acessado em 2026-08-29
- `~/.claude/skills/sprintx/references/00-schema.md:245-252` e `SKILL.md` (tabela da máquina de estados) — acessado em 2026-08-29
- `~/.claude/skills/runx/references/00-schema.md:352-358` — acessado em 2026-08-29
