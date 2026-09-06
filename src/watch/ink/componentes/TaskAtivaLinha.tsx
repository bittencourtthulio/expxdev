import React from "react";
import { Box, Text } from "ink";
import { barraIndeterminada, decorrido } from "../../desenho/barra.js";
import { cortar } from "../../logica/texto.js";
import { Barra } from "./Barra.js";
import { TextoPapel } from "./TextoPapel.js";
import type { TaskAtiva } from "../../visao/frota.js";

/**
 * A linha de uma task ativa: marca, id, título e — se couber — barra e tempo.
 *
 * Em faixa estreita esta era a linha mais bagunçada da tela: título,
 * dependências, barra, percentual e tempo disputavam a mesma linha e saíam
 * "██████▌░~6536m22" com o "s" na linha seguinte. Agora o título é cortado
 * para caber e os acessórios saem em degraus — primeiro o percentual, depois
 * a barra, por último as dependências. O tempo decorrido é o que NUNCA sai:
 * é o sinal de execução travada, o motivo de a linha existir.
 */
export function TaskAtivaLinha({
  task: a,
  agora,
  largura,
}: {
  task: TaskAtiva;
  agora: Date;
  /** A largura ÚTIL da área que contém a linha. */
  largura?: number | undefined;
}): React.ReactElement {
  const marca = a.bloqueada ? "▸" : "▸";
  const cor = a.bloqueada ? "red" : "cyanBright";

  const tempo =
    a.progresso.iniciadaEm !== null
      ? decorrido(agora.getTime() - a.progresso.iniciadaEm.getTime())
      : "";

  const temSinal = a.progresso.sinais > 0 || a.progresso.fracao > 0.1;
  const pct = Math.round(a.progresso.fracao * 100);

  // Os degraus, do mais largo ao mais estreito.
  const largo = largura === undefined || largura >= 72;
  const medio = largura === undefined || largura >= 52;

  const comBarra = medio;
  const comPct = largo && temSinal;
  const comDeps = largo;

  const larguraBarra = comBarra ? 10 : 0;

  const par = comDeps && a.paralelizavel ? " ‖" : "";
  const dep = comDeps && a.dependeDe.length > 0 ? ` ← ${a.dependeDe.join(",")}` : "";

  const sufixo = `${comPct ? ` ~${String(pct)}%` : ""}${tempo !== "" ? ` ${tempo}` : ""}`;

  // O espaço que sobra para o título depois de tudo que é largura fixa:
  // "▸ " (2), o id, um espaço, a barra e o sufixo, mais uma coluna de folga.
  const fixo =
    2 + a.id.length + 1 + (comBarra ? larguraBarra + 1 : 0) + [...sufixo].length + par.length + dep.length + 1;
  const espacoTitulo = largura === undefined ? undefined : Math.max(6, largura - fixo);

  const titulo = espacoTitulo === undefined ? a.titulo : cortar(a.titulo, espacoTitulo);

  return (
    <Box {...(largura !== undefined ? { width: largura } : {})}>
      <Text color={cor}>
        {marca} {a.id} {titulo}
        {par}
        {dep}
      </Text>
      <Box flexGrow={1} />
      {comBarra ? (
        <>
          {temSinal ? (
            <Barra feitas={pct} total={100} largura={larguraBarra} />
          ) : (
            <TextoPapel papel="atencao">{barraIndeterminada(larguraBarra, agora)}</TextoPapel>
          )}
        </>
      ) : null}
      <Text dimColor>{sufixo}</Text>
    </Box>
  );
}
