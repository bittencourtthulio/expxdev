# Lacunas da base — memox-painel

Uma linha por lacuna, com onde foi procurado. Toda lacuna aqui vira pergunta obrigatória na F2.

| # | Lacuna | Onde procurei |
|---|---|---|
| L-01 | O tamanho máximo esperado de `.expx/memoria/indice.json` num projeto real não é documentado. O único exemplo tem 6 trabalhos e ~26 KB; não há afirmação sobre projeto com centenas de trabalhos. | README do MemoX, `TEMPLATE-config.md`, `memox.py` (`gravar_indice`) |
| L-02 | Não há contrato declarado de compatibilidade para `versao` do índice além de `VERSAO_INDICE = 1`. O que o consumidor deve fazer diante de `versao: 2` não está escrito. | `memox.py:35`, README do MemoX, `exemplos/indice.exemplo.json` |
| L-03 | O motor não declara garantia de escrita atômica de `indice.json`. `gravar_indice` abre e escreve; se há `os.replace` ou escrita em temporário, não está afirmado na documentação. | `memox.py:901-914`, README do MemoX |
| L-04 | Não há especificação do enum de `faixa_atencao_frequente` e de `entrega.faixa`. O exemplo só exibe o valor `"alta"`. | `exemplos/indice.exemplo.json`, README do MemoX (seção mergex) |
| L-05 | Não há especificação do enum de `papel` em `por_arquivo`/`por_modulo`. O exemplo exibe `alterado`, `impactado` e `modulo`. | `exemplos/indice.exemplo.json` |
| L-06 | Não há lista fechada dos tipos de segredo em `artefatos_contaminados`. O exemplo exibe `chave_api` e `token_github`. | `exemplos/indice.exemplo.json`, `memox.py` (`redigir`) |
| L-07 | A estrutura de `fora_do_indice` não é observável: está `[]` no único exemplo disponível. | `exemplos/indice.exemplo.json` |
| L-08 | Não existe hoje, no CLI expxdev, nenhum mecanismo de instalação de hooks — nem código, nem teste, nem fixture. Não há precedente a seguir. | `src/plugin/montagem.ts`, `src/harness/settings.ts`, `src/harness/instalar.ts`, `fixtures/cli/` |
| L-09 | O `mesclarSettings` não trata a chave `hooks`. Não há decisão registrada sobre como evitar entrada duplicada em reinstalação. | `src/harness/settings.ts`, `docs/expx-cli/00-DECISOES.md` |
| L-10 | Não está documentado se o observador do painel deve ignorar `.expx/`. O regex atual cobre `node_modules`, `.git` e `dist`; o efeito de a reindexação gravar em `.expx/memoria/` durante a observação não foi medido. | `src/servidor/observador.ts`, `docs/expx-panel/base/12-atualizacao-ao-vivo.md` |
| L-11 | Não há catálogo das variáveis CSS `--vscode-*` usadas pelo painel; elas aparecem espalhadas nos arquivos de tela. | `ui/src/estilo.css`, arquivos em `ui/src/telas/` |
| L-12 | Não está documentado se `memox` deve ser tratado como `camada: true` no catálogo do CLI. O README do MemoX diz que ele "não tem fluxo próprio", mas `ehCamada` impõe exigir sprintx/runx junto, e essa consequência não foi decidida. | `src/nucleo/catalogo.ts`, `src/cli/selecao.ts`, README do MemoX |
