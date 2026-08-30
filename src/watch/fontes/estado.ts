import { readFileSync } from "node:fs";
import { join } from "node:path";
import { EstadoExpx } from "./estado-schema.js";

/**
 * Lê `.expx/estado.json` a partir da raiz do projeto.
 *
 * Falha SEMPRE para `null`, nunca lança. A regra 1 do contrato `expx-estado`
 * declara o arquivo "derivado e descartável; apagá-lo não pode quebrar nada" —
 * e o watch inteiro depende disso: a tolerância a falha "estado.json inválido
 * cai para leitura direta do plano" é justamente este `null`.
 *
 * A leitura é de uma vez só porque o contrato exige escrita atômica (regra 3:
 * temporário + rename). Não existe janela de leitura parcial: ou o arquivo
 * antigo inteiro, ou o novo inteiro.
 *
 * Versão diferente de 1 é `null` de propósito (decisão D-12): o `EstadoExpx`
 * declara `expx_estado: z.literal(1)`, então um arquivo de versão futura
 * reprova no parse como qualquer outro defeito, e quem chama vai para o plano.
 */
export function lerEstadoExpx(raizProjeto: string): EstadoExpx | null {
  let bruto: string;
  try {
    bruto = readFileSync(join(raizProjeto, ".expx", "estado.json"), "utf8");
  } catch {
    return null; // ausente, sem permissão, é um diretório: tudo é "não há estado"
  }

  let dados: unknown;
  try {
    dados = JSON.parse(bruto);
  } catch {
    return null;
  }

  const r = EstadoExpx.safeParse(dados);
  return r.success ? r.data : null;
}
