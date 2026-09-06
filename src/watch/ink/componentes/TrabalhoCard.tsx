import React from "react";
import { Box, Text } from "ink";
import { percentual } from "../../desenho/barra.js";
import type { EstadoExpx } from "../../fontes/estado-schema.js";
import type { TrabalhoNaFrota } from "../../visao/frota.js";
import { nomeEstagio, situacao } from "../../logica/situacao.js";
import { Arvore } from "./Arvore.js";
import { Barra } from "./Barra.js";
import { TaskAtivaLinha } from "./TaskAtivaLinha.js";
import { TextoPapel } from "./TextoPapel.js";

/**
 * Um bloco de trabalho da frota: título, progresso, contexto (só o corrente)
 * e as tasks ativas.
 *
 * Equivalente Ink de `blocoTrabalho()` em `desenho/painel.ts`. `selecionado`
 * é o destaque de navegação da Sprint C; `expandido` mostra a árvore
 * completa do trabalho embutida no card — o toggle de teclado (`Enter`/
 * `→`/`←`) mora em `useNavegacaoFrota`, este componente só recebe o estado.
 */
export function TrabalhoCard({
  trabalho: t,
  agora,
  estado,
  selecionado = false,
  expandido = false,
}: {
  trabalho: TrabalhoNaFrota;
  agora: Date;
  estado?: EstadoExpx | null;
  selecionado?: boolean;
  expandido?: boolean;
}): React.ReactElement {
  const s = situacao(t, agora);
  const marca = t.corrente ? "▸" : " ";

  return (
    <Box
      flexDirection="column"
      borderStyle={selecionado ? "round" : "single"}
      borderColor={selecionado ? "cyanBright" : "gray"}
      paddingX={1}
    >
      <Box gap={1}>
        <TextoPapel papel={t.corrente ? "destaque" : "neutro"} bold={t.corrente}>
          {marca} {t.trabalho.trabalho_id} · {t.trabalho.expx_tool}
        </TextoPapel>
        <Box flexGrow={1} />
        <TextoPapel papel={s.papel}>
          {t.estagio} {nomeEstagio(t.estagio)} · {s.texto}
        </TextoPapel>
      </Box>

      <Box gap={1}>
        <Barra feitas={t.concluidas} total={t.total} largura={16} />
        <Text>
          {String(t.concluidas)}/{String(t.total)}
        </Text>
        <Text dimColor>{percentual(t.concluidas, t.total)}</Text>
        <Text dimColor>{t.trabalho.titulo}</Text>
      </Box>

      {t.corrente && estado != null ? <LinhaContexto estado={estado} /> : null}

      {t.ativas.map((a) => (
        <TaskAtivaLinha key={a.id} task={a} agora={agora} />
      ))}

      {expandido ? (
        <Box marginTop={1}>
          <Arvore trabalho={t.trabalho} emFoco={t.corrente ? (estado?.task ?? null) : null} />
        </Box>
      ) : null}
    </Box>
  );
}

/** A linha de contexto do trabalho corrente: branch, PR, raio, orçamento. */
function LinhaContexto({ estado }: { estado: EstadoExpx }): React.ReactElement | null {
  const partes: string[] = [];
  if (estado.branch !== null) partes.push(estado.branch);
  if (estado.pr_estado !== null) partes.push(`pr ${estado.pr_estado}`);
  if (estado.raio !== null) partes.push(`raio ${estado.raio}`);
  if (estado.orcamento_arquivos !== null) partes.push(`arq ${estado.orcamento_arquivos}`);
  if (estado.orcamento_linhas !== null) partes.push(`lin ${estado.orcamento_linhas}`);

  if (partes.length === 0) return null;

  return <TextoPapel papel={estado.raio === "alto" ? "erro" : "apagado"}>{partes.join(" · ")}</TextoPapel>;
}
