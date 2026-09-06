import React from "react";
import { Box, Text } from "ink";
import { percentual } from "../../desenho/barra.js";
import type { TrabalhoNaFrota } from "../../visao/frota.js";
import { esquerdaDireita } from "../../logica/texto.js";
import { Barra } from "./Barra.js";

/**
 * A faixa do topo: identidade à esquerda, régua do projeto à direita.
 *
 * Tudo numa linha SÓ, montada por corte e não por espaçador flexível. A
 * versão anterior punha cinco `<Text>` separados por `<Box flexGrow={1}/>`;
 * numa faixa lateral de 64 colunas o Ink não tinha espaço para todos e
 * quebrava as palavras no meio — "exp watct31 trabalho" e "31/6" com o "8"
 * na linha de baixo. Aqui a conta é explícita e o que não cabe some, na
 * ordem inversa da importância.
 */
export function Cabecalho({
  frota,
  largura,
}: {
  frota: TrabalhoNaFrota[];
  largura: number | undefined;
}): React.ReactElement {
  const feitas = frota.reduce((s, t) => s + t.concluidas, 0);
  const total = frota.reduce((s, t) => s + t.total, 0);
  const emCurso = frota.filter((t) => t.ativas.length > 0).length;

  // A largura útil, fora o `paddingX`. Sem largura conhecida (não há TTY),
  // nada é cortado: o motor antigo é quem atende esse caso.
  const util = largura === undefined ? undefined : Math.max(1, largura - 2);

  // O contexto à direita encolhe em degraus, do mais dispensável ao menos:
  // primeiro perde o "em curso", depois vira só o percentual. O que nunca
  // sai é a proporção — é a única coisa que responde "onde estamos".
  const cheio = `${String(feitas)}/${String(total)} tasks · ${String(emCurso)} em curso`;
  const medio = `${String(feitas)}/${String(total)} · ${String(emCurso)} em curso`;
  const curto = `${String(feitas)}/${String(total)}`;

  const direita =
    util === undefined || util >= 52 ? cheio : util >= 38 ? medio : curto;

  // A barra só entra quando sobra espaço de verdade: espremida em três
  // colunas ela vira ruído, e o percentual já diz o mesmo.
  const comBarra = util === undefined || util >= 44;
  const larguraBarra = comBarra ? 12 : 0;

  return (
    <Box
      borderStyle="round"
      borderColor="gray"
      borderTop={false}
      borderLeft={false}
      borderRight={false}
      paddingX={1}
      {...(largura !== undefined ? { width: largura } : {})}
    >
      <Text bold color="cyanBright">
        expx
      </Text>
      {comBarra ? (
        <>
          <Text> </Text>
          <Barra feitas={feitas} total={total} largura={larguraBarra} />
        </>
      ) : null}
      <Text dimColor>
        {util === undefined
          ? ` ${direita}`
          : // "expx" (4) mais a barra e seus dois espaços já saíram da conta.
            esquerdaDireita("", `${direita}  ${percentual(feitas, total)}`, Math.max(1, util - 4 - (comBarra ? larguraBarra + 1 : 0)))}
      </Text>
    </Box>
  );
}
