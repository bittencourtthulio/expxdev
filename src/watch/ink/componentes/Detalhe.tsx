import React from "react";
import { Box, Text } from "ink";
import type { EstadoExpx } from "../../fontes/estado-schema.js";
import type { TrabalhoNaFrota } from "../../visao/frota.js";
import { percentual } from "../../desenho/barra.js";
import { balancoDe, proximaTask } from "../../logica/balanco.js";
import type { OrcamentoAltura } from "../../logica/altura.js";
import { posicaoNaTrilha } from "../../logica/pipeline.js";
import { situacao } from "../../logica/situacao.js";
import { cortar, esquerdaDireita } from "../../logica/texto.js";
import { Arvore } from "./Arvore.js";
import { Atividade } from "./Atividade.js";
import { Barra } from "./Barra.js";
import { Pipeline } from "./Pipeline.js";
import { TaskAtivaLinha } from "./TaskAtivaLinha.js";
import { Secao } from "./Secao.js";
import { TextoPapel } from "./TextoPapel.js";

/**
 * A coluna da direita: tudo sobre UM trabalho — o selecionado na frota.
 *
 * A ordem das seções é a ordem das perguntas de quem acompanha uma execução:
 * onde no método (pipeline), quanto andou (progresso e balanço), o que roda
 * agora (tasks ativas), o que vem depois (próxima em aberto) e o que
 * aconteceu (atividade). A árvore completa fica sob o toggle porque é a
 * única seção de altura imprevisível.
 */
export function Detalhe({
  trabalho: t,
  agora,
  estado,
  expandido,
  largura,
  orcamento,
}: {
  trabalho: TrabalhoNaFrota;
  agora: Date;
  estado: EstadoExpx | null;
  expandido: boolean;
  largura: number | undefined;
  /** Quantas linhas cada seção elástica pode gastar nesta janela. */
  orcamento?: OrcamentoAltura | undefined;
}): React.ReactElement {
  const s = situacao(t, agora);
  const b = balancoDe(t.trabalho);
  const pos = posicaoNaTrilha(t.trabalho.expx_tool, t.estagio);
  const proxima = proximaTask(t.trabalho);
  // Em janela baixa o espaço entre seções vira conteúdo (ver `logica/altura.ts`).
  const espaco = orcamento?.folgado ?? true;
  const apertado = orcamento?.apertado ?? false;
  // A área ÚTIL: a largura recebida menos as duas colunas de `paddingX`. É o
  // que as linhas que alinham à direita precisam saber — `width="100%"`
  // resolveria contra a caixa COM padding e vazaria duas colunas à direita.
  const util = largura === undefined ? undefined : Math.max(1, largura - 2);

  return (
    <Box
      flexDirection="column"
      paddingX={1}
      {...(largura !== undefined ? { width: largura } : {})}
    >
      {/* Identidade do trabalho — uma linha, cortada, nunca quebrada. */}
      <Box {...(util !== undefined ? { width: util } : {})}>
        <Text bold color="cyanBright">
          {util === undefined
            ? t.trabalho.titulo
            : cortar(t.trabalho.titulo, Math.max(8, util - [...s.texto].length - 2))}
        </Text>
        <Box flexGrow={1} />
        <TextoPapel papel={s.papel} bold>
          {s.texto}
        </TextoPapel>
      </Box>
      {apertado ? null : (
        <Box>
          <Text dimColor>
            {util !== undefined && util < 52
              ? t.trabalho.trabalho_id
              : `${t.trabalho.trabalho_id} · ${t.trabalho.tipo_trabalho}`}
          </Text>
          {t.corrente && (util === undefined || util >= 52) ? (
            <Text color="cyanBright"> · corrente</Text>
          ) : null}
          {t.trabalho.divergente ? <Text color="red"> · DIVERGENTE</Text> : null}
        </Box>
      )}

      {/* Onde no pipeline do framework */}
      <Secao
        titulo={
          pos !== null
            ? `${t.trabalho.expx_tool.toUpperCase()}  ${String(pos.passo)}/${String(pos.total)}`
            : t.trabalho.expx_tool.toUpperCase()
        }
        largura={util}
        espacoAntes={espaco}
      />
      <Box>
        <Pipeline ferramenta={t.trabalho.expx_tool} estagio={t.estagio} />
      </Box>
      {/* Quanto andou, e a forma do que sobrou */}
      {apertado ? null : <Secao titulo="PROGRESSO" largura={util} espacoAntes={espaco} />}
      <Box>
        <Barra
          feitas={t.concluidas}
          total={t.total}
          largura={util === undefined || util >= 52 ? 20 : 12}
        />
        <Text>
          {" "}
          {String(t.concluidas)}/{String(t.total)}
        </Text>
        <Text dimColor> {percentual(t.concluidas, t.total)}</Text>
      </Box>
      {b.total > 0 && !apertado ? (
        util !== undefined && util < 52 ? (
          // Faixa estreita: a forma curta diz o mesmo em um terço do espaço.
          <Box>
            <Text color="green">✓{String(b.concluidas)}</Text>
            <Text dimColor> </Text>
            <Text color={b.emAndamento > 0 ? "yellow" : "gray"}>▸{String(b.emAndamento)}</Text>
            {b.bloqueadas > 0 ? (
              <>
                <Text dimColor> </Text>
                <Text color="red">!{String(b.bloqueadas)}</Text>
              </>
            ) : null}
            <Text dimColor> ○{String(b.pendentes)}</Text>
          </Box>
        ) : (
          <Box>
            <Text color="green">✓ {String(b.concluidas)} concluidas</Text>
            <Text dimColor> · </Text>
            <Text color={b.emAndamento > 0 ? "yellow" : "gray"}>
              ▸ {String(b.emAndamento)} em andamento
            </Text>
            {b.bloqueadas > 0 ? (
              <>
                <Text dimColor> · </Text>
                <Text color="red">! {String(b.bloqueadas)} bloqueadas</Text>
              </>
            ) : null}
            <Text dimColor> · </Text>
            <Text dimColor>○ {String(b.pendentes)} em aberto</Text>
          </Box>
        )
      ) : null}

      {t.corrente && estado != null ? <LinhaContexto estado={estado} /> : null}

      {/* O que roda agora */}
      {t.ativas.length > 0 ? (
        <Box flexDirection="column">
          <Secao titulo="EM EXECUCAO" largura={util} espacoAntes={espaco} />
          {(orcamento === undefined ? t.ativas : t.ativas.slice(0, orcamento.tasks)).map((a) => (
            <TaskAtivaLinha key={a.id} task={a} agora={agora} largura={util} />
          ))}
          {orcamento !== undefined && t.ativas.length > orcamento.tasks ? (
            // Quem não coube é CONTADO, nunca omitido em silêncio: sumir com
            // uma task em andamento faz a tela mentir sobre o paralelismo.
            <Text dimColor>
              {"  "}+{String(t.ativas.length - orcamento.tasks)} em execucao
            </Text>
          ) : null}
        </Box>
      ) : null}

      {/* O que vem depois */}
      {proxima !== null && (orcamento?.folgado ?? true) ? (
        <Box marginTop={t.ativas.length > 0 ? 0 : 1}>
          <Text dimColor>
            {util === undefined
              ? `  proxima ○ ${proxima.id} ${proxima.titulo}`
              : cortar(`  proxima ○ ${proxima.id} ${proxima.titulo}`, util)}
          </Text>
        </Box>
      ) : null}

      {/* O que aconteceu */}
      <Box flexDirection="column">
        <Secao titulo="ATIVIDADE" largura={util} espacoAntes={espaco} />
        <Atividade
          eventos={t.eventos}
          largura={util}
          {...(orcamento !== undefined ? { limite: orcamento.atividade } : {})}
        />
      </Box>

      {/* A árvore completa, sob o toggle */}
      {expandido ? (
        <Box flexDirection="column">
          <Secao titulo="PLANO" largura={util} espacoAntes={espaco} />
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

  return (
    <TextoPapel papel={estado.raio === "alto" ? "erro" : "apagado"}>
      {partes.join(" · ")}
    </TextoPapel>
  );
}
