import React from "react";
import { Box, Text } from "ink";
import type { LinhaEvento } from "../../../parser/esquema/evento.js";
import { desde } from "../../logica/rodape.js";
import { cortar } from "../../logica/texto.js";
import { TextoPapel } from "./TextoPapel.js";

/**
 * A barra de status: atalhos à esquerda, saúde da execução à direita.
 *
 * Como o cabeçalho, é uma linha só e nunca duas — a versão com espaçadores
 * flexíveis quebrava "trabalho" em "traba"/"lho" e emendava "lendo o plano"
 * dentro de "1 violacao em aviso" numa faixa de 64 colunas.
 *
 * Em coluna estreita os atalhos perdem o rótulo e ficam só as teclas: quem
 * já sabe navegar reconhece `↑↓ ⏎ q`, e quem não sabe descobre alargando a
 * janela. É melhor que a alternativa, que era não ler nada.
 */
export function BarraStatus({
  eventos,
  violacoesAviso,
  degradado,
  agora,
  largura,
  compacta = false,
}: {
  eventos: LinhaEvento[];
  violacoesAviso: number;
  degradado: boolean;
  agora: Date;
  largura?: number | undefined;
  /** Sem a régua e sem a margem: em janela baixa cada linha conta. */
  compacta?: boolean;
}): React.ReactElement {
  const ultimo = eventos[0];
  const util = largura === undefined ? undefined : Math.max(1, largura - 2);

  // Os avisos têm prioridade sobre o relógio: "1 violacao" é acionável,
  // "ultimo evento há 4 min" é ambiente.
  const avisos: string[] = [];
  if (degradado) avisos.push("sem estado.json");
  if (violacoesAviso > 0) {
    avisos.push(
      violacoesAviso === 1 ? "1 violacao" : `${String(violacoesAviso)} violacoes`,
    );
  }
  const relogio =
    ultimo !== undefined ? desde(new Date(ultimo.ts), agora) : "sem eventos";

  const atalhosLongos = "↑↓ trabalho   ⏎ plano   q sair";
  const atalhosCurtos = "↑↓ ⏎ q";
  const largo = util === undefined || util >= 56;
  const atalhos = largo ? atalhosLongos : atalhosCurtos;

  const direita = [...avisos, relogio].join(" · ");

  return (
    <Box
      {...(compacta
        ? {}
        : {
            borderStyle: "round" as const,
            borderColor: "gray",
            borderBottom: false,
            borderLeft: false,
            borderRight: false,
            marginTop: 1,
          })}
      paddingX={1}
      {...(largura !== undefined ? { width: largura } : {})}
    >
      <Text color="cyanBright" bold>
        {atalhos}
      </Text>
      <Box flexGrow={1} />
      <TextoPapel papel={avisos.length > 0 ? "atencao" : "apagado"}>
        {util === undefined
          ? direita
          : // O que sobra depois dos atalhos e de um espaço de respiro.
            cortar(direita, Math.max(0, util - [...atalhos].length - 2))}
      </TextoPapel>
    </Box>
  );
}
