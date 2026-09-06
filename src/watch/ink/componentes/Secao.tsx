import React from "react";
import { Box, Text } from "ink";

/**
 * O cabeçalho de uma seção — o que dá hierarquia à tela.
 *
 * Uma TUI parece terminal quando tudo tem o mesmo peso: `EM EXECUCAO` e o
 * conteúdo abaixo dela saíam com a mesma cor, o mesmo brilho e o mesmo
 * tamanho, e o olho não encontrava onde uma coisa acaba e outra começa —
 * lia como saída de comando, não como página.
 *
 * O que uma página faz e um terminal não costuma fazer: o título é mais fraco
 * que o conteúdo, não mais forte. Rótulo de seção é infraestrutura de leitura,
 * não informação — quem lê procura a task, não a palavra "EM EXECUCAO". Então
 * ele fica apagado, em maiúscula, com um filete que ocupa o resto da linha:
 * a régua horizontal separa os blocos sem gastar uma linha em branco, que é
 * o recurso caro numa faixa de vinte linhas.
 */
export function Secao({
  titulo,
  largura,
  espacoAntes = true,
}: {
  titulo: string;
  /** A largura útil, para o filete alcançar a borda. */
  largura?: number | undefined;
  /**
   * A linha em branco antes do título. É o primeiro recurso a ser cortado em
   * janela baixa: cinco seções custam cinco linhas, que numa faixa de vinte
   * é um quarto da tela — e o filete já separa os blocos sozinho.
   */
  espacoAntes?: boolean;
}): React.ReactElement {
  // O filete come o que sobra depois do título e de um espaço de cada lado.
  const sobra =
    largura === undefined ? 0 : Math.max(0, largura - [...titulo].length - 1);

  return (
    <Box marginTop={espacoAntes ? 1 : 0}>
      <Text dimColor bold>
        {titulo}
      </Text>
      <Text dimColor> {"─".repeat(sobra)}</Text>
    </Box>
  );
}
