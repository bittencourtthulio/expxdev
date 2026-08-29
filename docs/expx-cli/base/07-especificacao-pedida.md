# A especificação pedida — subcomandos, lock e update

Área interna. Fonte: os dois arquivos de prompt. Registrado aqui porque é contrato de entrada da feature, não invenção.

## Contrato de entrada

### Subcomandos (promptcli1.md:41-46)

| Comando | Efeito |
|---|---|
| `npx expx init` | instalação interativa no projeto atual |
| `npx expx panel` | sobe o painel lendo o `docs/` do projeto |
| `npx expx add <skill...>` | acrescenta skills à seleção |
| `npx expx remove <skill...>` | remove skills da seleção |
| `npx expx update [skill...]` | atualiza as skills instaladas |
| `npx expx doctor` | diagnostica instalação quebrada |

Regra: "O painel funciona sem init: ele não precisa de nada instalado" (promptcli1.md:48).

### Fluxo do init (promptcli1.md:51-68)

1. Detectar projeto: raiz, versionador, se já existe `.expx/`. Se existir → modo reconfiguração, **nunca apaga sem confirmar**.
2. Seleção múltipla das cinco skills. Regras aplicadas na hora, **avisando sem impedir**:
   - `legadox` e `stackx` são camadas: marcadas sem `sprintx` nem `runx` → avisar e pedir confirmação.
   - `mergex` junto com `sprintx` ou `runx` → dispara os patches de integração.
3. Perguntar o harness: Claude Code, OpenCode, ou os dois.
4. Perguntar se instala o painel como devDependency.
5. Buscar cada skill no seu repositório, na versão alvo.
6. Montar o plugin local em `.expx/`.
7. Configurar o harness escolhido.
8. Validar e relatar.

### Estrutura criada (promptcli1.md:71-87)

```
.expx/
  expx-lock.json
  marketplace/.claude-plugin/marketplace.json
  plugin/
    .claude-plugin/plugin.json      name: "expx"
    skills/<só as selecionadas>/
    commands/<só as correspondentes>/
.claude/settings.json               mesclado, nunca sobrescrito
.opencode/commands/                 se OpenCode for escolhido
```

Todo o `.expx/` é commitado; o CLI garante que nenhuma regra de `.gitignore` o esteja ignorando.

### Merge do settings.json (promptcli1.md:90-94)

- Backup com data antes de tocar.
- Mescla apenas as chaves necessárias, preservando todo o resto.
- Nunca sobrescreve o arquivo inteiro.
- Conflito com valor existente: mostra os dois e pergunta.
- JSON inválido: não tenta consertar, avisa e sai.

### O lock (promptcli2.md:13-18)

`.expx/expx-lock.json` registra, por skill: **nome, repositório, referência alvo (tag ou branch), identificador de commit resolvido, data da resolução, versão do CLI que gravou.**

Commitado junto com `.expx/`. Quem clona recebe as skills já em disco e não precisa de rede nem de `init`.

### Resolução de versão (promptcli2.md:20-24)

Por padrão: **a maior tag de versão semântica** do repositório. Sem tag nenhuma → cai para a branch padrão e **avisa explicitamente** que aquela skill não está travada. Nunca segue a branch padrão em silêncio quando existe tag.

### O que o update faz (promptcli2.md:27-52)

1. Descobre a versão alvo de cada skill instalada.
2. Compara com o lock; skill em dia é reportada e **não é tocada**.
3. **Detecta modificação local**: disco divergente do lock → NÃO sobrescreve; lista os arquivos alterados e pede decisão: manter o local, substituir, ou salvar o local ao lado antes de substituir.
4. Mostra resumo por skill antes de aplicar: versão atual, versão nova, o que mudou (CHANGELOG do repositório quando existir; na ausência, títulos dos commits entre as duas referências).
5. Sinaliza incompatibilidade de `expx-schema` e **não aplica** aquela skill.
6. Pede confirmação. Aplica.
7. Remonta o plugin do zero, reescreve o lock, roda a validação.
8. Relata o que subiu, o que ficou, o que foi bloqueado.

O update **nunca** muda a seleção de skills nem a escolha de harness.

Flags (promptcli2.md:55-65): sem argumento (todas), `<skill...>`, `--check`, `--to <ref>`, `--latest`, `--yes`. Sem interatividade e sem `--yes`: mostra o que faria e sai sem aplicar.

### Rollback (promptcli2.md:68-73)

Antes de aplicar, guardar a versão anterior de cada skill alterada dentro de `.expx/`, para existir um comando de desfazer. **Alternativa aceita se ficar caro para a v1**: reverter pelo versionador, já que `.expx/` é commitado — nesse caso o CLI é OBRIGADO a dizer isso na saída do update, e a decisão fica registrada em `00-DECISOES.md`.

### Busca e falhas (promptcli2.md:83-94)

| Situação | Comportamento exigido |
|---|---|
| repositório inacessível | avisa qual, segue com as demais, registra a ausência. **Nunca aborta tudo** |
| sem rede, com lock e skills em disco | segue com o que está em disco |
| sem rede, sem nada em disco | explica o que falta e sai sem alterar nada |
| tag inexistente com `--to` | erro claro, nada é alterado |
| repositório privado | usa a credencial de git já configurada. **Nunca pede token, nunca armazena** |
| limite de requisição da API | mensagem clara, sem estado corrompido pela metade |

**Toda escrita é atômica na prática: montar em pasta temporária e trocar ao final.**

### O doctor verifica (promptcli2.md:97-107)

`.expx/` existe; lock legível; skills do lock presentes em disco; divergência disco↔lock; skill não travada por `--latest`; `plugin.json` e `marketplace.json` válidos com name `expx`; nenhuma skill referenciando caminho fora da própria pasta; `settings.json` válido apontando para o marketplace local; colisão de nome entre Claude Code e OpenCode; comandos esperados presentes; compatibilidade CLI↔estrutura. Cada achado com correção sugerida e, quando seguro, oferta de corrigir.

## Contrato de saída

Definição de pronto (promptcli2.md:142-148):

1. `init` num projeto limpo, três skills, os dois harnesses, comandos funcionando com namespace no Claude Code e sem no OpenCode.
2. `update` trazendo versão nova de uma skill, com resumo do que mudou e confirmação antes de aplicar.
3. `update` detectando modificação local e não sobrescrevendo.
4. `doctor` diagnosticando corretamente um projeto propositalmente quebrado.

## Limites e cotas

Fora de escopo na v1 (promptcli2.md:110-115): executar Claude Code ou OpenCode a partir do CLI; publicar plugin em marketplace remoto; interface gráfica; instalação global fora de projeto; autenticação própria, gestão de token, telemetria; criar ou editar skills.

Fixtures exigidas como fase própria e cedo (promptcli2.md:151-156): projeto limpo; com `.expx/` existente; `settings.json` ausente, válido com outras chaves, e inválido; skill inacessível; sem rede com lock; sem rede sem lock; skill com caminho relativo para fora da própria pasta; colisão de nome entre harnesses; repositório sem tag; skill modificada localmente; lock escrito por versão mais nova do CLI.

## Erros conhecidos e tratamento

Ver a tabela de "Busca e falhas" acima — é o contrato de erro da feature.

## Riscos para a nossa implementação

1. **Decisão de rollback está em aberto por desenho** (promptcli2.md:68-73 oferece as duas saídas). É pergunta da F2.
2. **"Detecta modificação local" exige um mecanismo de integridade** (hash por arquivo? hash da árvore?) que o prompt não especifica. Pergunta da F2.
3. **"O que mudou" via CHANGELOG ou títulos de commit** exige acesso à API do GitHub ou clone com histórico — decide o método de busca. Pergunta da F2.
4. `npx expx@latest update` implica que o pacote publicado se chame `expx`, mas promptcli2.md:122 diz "Pacote: @expx/cli, binário expx". `npx expx` e `npx @expx/cli` são coisas diferentes no npm. Lacuna registrada.

## Fonte

`promptcli1.md` (102 linhas), `promptcli2.md` (156 linhas) — lidos em 2026-08-29.
