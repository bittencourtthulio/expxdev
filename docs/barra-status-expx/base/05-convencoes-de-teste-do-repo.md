# Convenções de teste do repositório (stack e padrões reais)

## Contrato de entrada

Runner: **vitest 4** (`package.json:devDependencies`). Comando: `npm test` → `vitest run` (`package.json:scripts.test`). Typecheck separado: `npm run typecheck` → `tsc --noEmit` nos dois tsconfig.

Três projetos vitest (`vitest.config.ts`):

| Projeto | `include` | `environment` | `testTimeout` |
|---|---|---|---|
| `servidor` | `src/**/*.test.ts` menos cli/teste/nucleo/plugin/harness/update/doctor | node | 20000 |
| `cli` | `src/{cli,teste,nucleo,plugin,harness,update,doctor}/**/*.test.ts` | node | 120000 |
| `ui` | `ui/src/**/*.test.{ts,tsx}` | jsdom | 20000 |

O timeout de 120s do projeto `cli` tem justificativa no arquivo: "Estes testes clonam repositorios git de verdade em pasta temporaria. Sob a carga da suite completa em paralelo, 30s nao bastam: o teste falhava por timeout, nunca por assercao."

**Teste de código novo em `src/cli/`, `src/harness/` ou `src/doctor/` cai automaticamente no projeto `cli`.** Nada a configurar.

## Contrato de saída

Nomenclatura observada em `src/doctor/verificadores.test.ts:28-33` e `src/teste/layouts-fixture.test.ts:18-24`: os testes trazem o prefixo do tipo, batendo com o contrato da task da sprintx:

```ts
it("integração: cada fixture quebrada produz o achado que a nomeia", ...)
it("funcional: o layout embutido põe o SKILL.md sob .claude/skills e o plano sob skill/", ...)
```

Arquivo de teste ao lado do arquivo testado: `verificadores.ts` / `verificadores.test.ts`. Imports com extensão `.js` (ESM: `"type": "module"`).

## Limites e cotas

- Node `>=20.19.0` (`package.json:engines`).
- Dependências de runtime: `chokidar`, `ws`, `yaml`, `zod` (`package.json:dependencies`). **Zod já está disponível** para validar o `estado.json` no lado Node.
- `files` publicados no npm: `dist`, `ui/dist`, `nucleo`, `README.md`, `LICENSE` (`package.json:files`). **Um template de script que o CLI precise emitir tem de estar sob um desses caminhos, ou embutido no código TypeScript** — caso contrário não vai no pacote publicado.

## Erros conhecidos e tratamento

Padrão de isolamento em disco (`src/teste/projeto-temporario.ts:19-28`):

```ts
projetoTemporario("fixtures/cli/projeto-limpo")  // copia a fixture para mkdtemp
```

com `afterEach` chamando `descartar()` (`src/doctor/verificadores.test.ts:9-15`). A justificativa (`projeto-temporario.ts:5-12`): "O CLI escreve de verdade... testá-lo exige um projeto real, não um mock de fs. Copiar a fixture para uma pasta temporária mantém as fixtures do repositório intactas: um teste que sobrescreve a origem contamina todos os outros."

Fixtures existentes em `fixtures/cli/`: `projeto-limpo`, `projeto-com-expx`, `settings-valido`, `settings-ausente`, `settings-invalido`, `quebrado-gitignore`, `quebrado-lock-futuro`, `quebrado-skill-fora`.

`fixtures/cli/settings-valido/.claude/settings.json` já traz configuração de usuário a preservar:

```json
{
  "permissions": { "allow": ["Bash(npm test)"] },
  "env": { "MINHA_VAR": "valor-do-usuario" },
  "enabledPlugins": ["outro-plugin@outro-marketplace"]
}
```

**Nenhuma fixture atual tem `statusLine`.** A fixture "settings.json com barra de terceiro já configurada" pedida no escopo é nova.

## Riscos para a nossa implementação

1. Medir tempo de execução de um script num teste é medida sujeita a ruído de máquina e de CI. Um teste que reprova por lentidão de runner produz falha intermitente — exatamente o que o comentário do `vitest.config.ts` diz que já aconteceu com timeout. O critério de aceite precisa ser folgado ou a medição precisa viver no `doctor`/relatório, não num assert apertado.
2. Testar um script `.sh` a partir do vitest exige `execFileSync`/`spawnSync` com stdin — já há precedente de `execFileSync("git", [...], { encoding: "utf8" })` em `src/teste/layouts-fixture.test.ts:12`.
3. O template do script precisa ir para o pacote npm. Embutir como string no TypeScript é o caminho que já funciona sem tocar em `files`.

## Fonte

`vitest.config.ts`, `package.json`, `src/teste/projeto-temporario.ts`, `src/doctor/verificadores.test.ts`, `src/teste/layouts-fixture.test.ts`, `fixtures/cli/settings-valido/.claude/settings.json` — lidos em 2026-08-30
