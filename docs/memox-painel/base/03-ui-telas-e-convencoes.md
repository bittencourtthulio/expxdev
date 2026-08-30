# UI do painel — telas, navegação e convenções

## Contrato de entrada

`App` (`ui/src/App.tsx`) monta o shell inteiro. Ele obtém o estado via `usarEstado()` e passa às telas.

O tipo `Secao` é uma união fechada de literais:

```ts
type Secao = "dashboard" | "trabalhos" | "conformidade" | "historico" | "schema";
```

e a lista `SECOES` associa cada id a um rótulo e um ícone:

```ts
{ id: "conformidade", rotulo: "Conformidade", Ic: Icone.Conformidade }
```

Acrescentar uma seção exige, no mínimo: um membro na união `Secao`, uma entrada em `SECOES`, um ícone em `ui/src/icones.tsx`, e um bloco de renderização condicional em `<main className="editor">`.

### Assinatura das telas

Cada tela recebe props próprias, mas o padrão das que respeitam o filtro global é:

```ts
{ estado: Estado; periodo: Periodo; aoMudarPeriodo: (p: Periodo) => void }
```

`Conformidade` e `Historico` seguem exatamente isso. `ForaDoSchema` recebe só `estado` — porque rejeição não tem data para filtrar. `Detalhe` recebe `estado`, `id` e `aoVoltar`.

O `App` passa `recortado` (estado já filtrado pelo período) às telas que filtram, e `estado` cru às que não filtram (`ForaDoSchema`, `Detalhe`).

## Contrato de saída

JSX. As telas não devolvem dado; renderizam.

### Componentes compartilhados (`ui/src/comuns.tsx`)

| Componente | Uso |
|---|---|
| `PageHeader` | `{ trilha?, titulo, sub?, acoes?, abas? }` — cabeçalho de toda tela |
| `FiltroPeriodo` | `{ periodo, aoMudar, hoje? }` — presets + intervalo custom |
| `BotaoBaixar` | `{ nome, conteudo: () => string, tipo?, children }` — exporta arquivo |
| `Vazio` | `{ titulo, texto }` — estado vazio |
| `Etiqueta` | `{ tipo?, children }` — badge |
| `Barra` | `{ valor: number }` — progresso 0..1 |

### Estrutura padrão de uma tela

Observada em `Conformidade.tsx` e `Historico.tsx`:

```
<>
  <PageHeader titulo=... sub=... acoes={<BotaoBaixar .../>} />
  <div className="conteudo">
    <FiltroPeriodo periodo={periodo} aoMudar={aoMudarPeriodo} />
    {vazio ? <Vazio .../> : <>filtros + tabelas</>}
  </div>
</>
```

Filtros por facetas usam `<div className="filtros">` com `<label>` e botões `aria-pressed`, alternando entre "filtro ativo" e `null`.

### Exportação CSV

`Conformidade.tsx` traz o padrão exato:

```ts
const esc = (c: string): string => (/[",\n;]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
```

Separador `;`, cabeçalho na primeira linha, `String(n)` para números, `""` para `null`.

## Limites e cotas

- Contadores na activitybar: `contagens` mapeia seção → número; só aparece se `> 0` (`App.tsx`).
- A statusbar mostra contagens de trabalhos, violações e fora-do-schema, e colore quando `> 0` usando `var(--vscode-editorWarning-foreground)` / `var(--vscode-editorError-foreground)`.
- Paleta: variáveis `--vscode-*` (tema VS Code). NÃO DOCUMENTADO um catálogo completo dessas variáveis no repositório; as usadas aparecem nos arquivos de tela e em `ui/src/estilo.css`.

## Erros conhecidos e tratamento

- `erro !== null` → notificação "não foi possível carregar o projeto".
- `estado === null` → "carregando…".
- `conexao === "caida"` → faixa de aviso no topo do `<main>`, mantendo a tela visível.

Nenhuma tela lança. Todas têm caminho para estado vazio.

## Riscos para a nossa implementação

1. **A UI não pode recalcular.** `tipos.ts` declara: "A UI não recalcula nada: só renderiza." Ordenação, contagem e classificação de risco pertencem ao servidor.
2. **Ícone novo é obrigatório.** `Icone` tem 12 membros (`Painel, Conformidade, Relatorio, Historico, Alerta, Feature, Ocorrencia, Seta, Bloqueio, Copiar, Cliente, Baixar`). Uma seção "Memória" precisa de um novo, no mesmo estilo SVG.
3. **O filtro de período é global por decisão.** `periodo.ts` justifica: "o time raciocina em 'o que aconteceu neste mês'". Uma tela nova que ignore o período quebra essa expectativa — a menos que, como `ForaDoSchema`, ela não tenha data a filtrar.
4. **`recortar()` filtra por chaves conhecidas.** Ele reconstrói o estado filtrando `trabalhos`, `historico`, `bloqueios` e `violacoes`. Uma chave nova passa intacta pelo spread `...estado` — ou seja, **não é filtrada por período automaticamente**. Se a memória tiver que respeitar o período, `recortar` precisa ser alterado.
5. **Teste de tela usa fixture compartilhada.** `ui/src/telas/fixture.ts` exporta `estadoFixture()` e `estadoRuimFixture()`. Uma chave nova no `Estado` precisa existir nessas fixtures, ou os testes existentes quebram na tipagem.

## Fonte

- `ui/src/App.tsx`, `ui/src/comuns.tsx`, `ui/src/tipos.ts`, `ui/src/periodo.ts`, `ui/src/icones.tsx` — acessados em 2026-08-29
- `ui/src/telas/Conformidade.tsx`, `ui/src/telas/telas.test.tsx` — acessados em 2026-08-29
