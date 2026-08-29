import { z } from "zod";

/**
 * Os dois manifestos do plugin local.
 *
 * O nome do plugin é o que dá namespace aos comandos: com `name: "expx"`, a
 * skill `sprintx` fica disponível como `/expx:sprintx`. Isso foi verificado em
 * execução, não só na documentação — ver
 * `docs/expx-cli/base/09-validacao-marketplace-local.md`.
 *
 * O `source` do marketplace aponta para uma pasta DENTRO da árvore do próprio
 * marketplace. Um `source` que sobe de diretório (`../plugin`) é rejeitado pelo
 * Claude Code com `source: Invalid input` — medido, não suposto. Por isso o
 * plugin mora em `marketplace/plugins/expx/`, e não como irmão do marketplace.
 */

export const NOME_DO_PLUGIN = "expx";
export const NOME_DO_MARKETPLACE = "expx-local";
/** Relativo à raiz do marketplace. Nunca pode conter `..`. */
export const ORIGEM_DO_PLUGIN = "./plugins/expx";

export const PluginJson = z.object({
  name: z.literal(NOME_DO_PLUGIN),
  description: z.string().min(1),
  version: z.string().min(1),
});
export type PluginJson = z.infer<typeof PluginJson>;

export const MarketplaceJson = z.object({
  name: z.literal(NOME_DO_MARKETPLACE),
  owner: z.object({ name: z.string().min(1) }),
  plugins: z
    .array(
      z.object({
        name: z.literal(NOME_DO_PLUGIN),
        source: z.string().refine((s) => !s.includes(".."), {
          message: "source do marketplace nao pode subir de diretorio",
        }),
        description: z.string().min(1),
      }),
    )
    .length(1),
});
export type MarketplaceJson = z.infer<typeof MarketplaceJson>;

export function montarPluginJson(versao: string): PluginJson {
  return {
    name: NOME_DO_PLUGIN,
    description: "Skills do metodo Expx instaladas neste projeto",
    version: versao,
  };
}

export function montarMarketplaceJson(): MarketplaceJson {
  return {
    name: NOME_DO_MARKETPLACE,
    owner: { name: "Expx" },
    plugins: [
      {
        name: NOME_DO_PLUGIN,
        source: ORIGEM_DO_PLUGIN,
        description: "Skills do metodo Expx instaladas neste projeto",
      },
    ],
  };
}
