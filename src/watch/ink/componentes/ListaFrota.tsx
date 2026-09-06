import React from "react";
import { Box, Text } from "ink";
import type { TrabalhoNaFrota } from "../../visao/frota.js";
import { situacao } from "../../logica/situacao.js";
import { Pipeline } from "./Pipeline.js";
import { TextoPapel } from "./TextoPapel.js";

/**
 * A coluna da esquerda: a frota inteira, duas linhas por trabalho.
 *
 * Substitui a pilha de cards com borda que o painel usava. O card dava a cada
 * trabalho o mesmo peso visual e a mesma altura generosa, então três
 * trabalhos abertos já empurravam a atividade para fora da tela — quem
 * acompanha uma execução ficava rolando para achar o que estava rodando.
 *
 * Aqui cada trabalho ocupa altura fixa e mínima: identidade e situação numa
 * linha, a esteira do pipeline na outra. O detalhe caro (tasks ativas,
 * árvore, atividade) mora na coluna da direita e só existe para UM trabalho —
 * o selecionado. É a troca que faz a lista caber e o detalhe respirar.
 */
export function ListaFrota({
  frota,
  agora,
  selecionado,
  largura,
}: {
  frota: TrabalhoNaFrota[];
  agora: Date;
  selecionado: number | null;
  largura: number;
}): React.ReactElement {
  return (
    <Box
      flexDirection="column"
      width={largura}
      flexShrink={0}
      borderStyle="round"
      borderColor="gray"
      borderTop={false}
      borderBottom={false}
      borderLeft={false}
      paddingRight={1}
    >
      <Text dimColor> FROTA</Text>

      {frota.map((t, i) => {
        const s = situacao(t, agora);
        const aqui = selecionado === i;

        return (
          <Box flexDirection="column" key={t.trabalho.trabalho_id} marginTop={i === 0 ? 0 : 1}>
            <Box width="100%">
              {/* A barra vertical marca a seleção sem gastar uma linha de
                  borda: é o mesmo truque de lista de aplicação de terminal. */}
              <Text color={aqui ? "cyanBright" : "gray"}>{aqui ? "▌" : " "}</Text>
              <Text> </Text>
              <TextoPapel papel={t.corrente ? "destaque" : "neutro"} bold={aqui || t.corrente}>
                {t.trabalho.trabalho_id}
              </TextoPapel>
              <Box flexGrow={1} />
              <TextoPapel papel={s.papel}>{s.texto}</TextoPapel>
              <Text> </Text>
            </Box>

            <Box>
              <Text>{aqui ? <Text color="cyanBright">▌</Text> : " "}</Text>
              <Text> </Text>
              <Text dimColor>{t.trabalho.expx_tool} </Text>
              <Pipeline ferramenta={t.trabalho.expx_tool} estagio={t.estagio} rotular="nenhum" />
              <Text dimColor>
                {" "}
                {String(t.concluidas)}/{String(t.total)}
              </Text>
              {t.trabalho.divergente ? <Text color="red"> DIVERGENTE</Text> : null}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
