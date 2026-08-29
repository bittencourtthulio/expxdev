import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Colisão de nome de skill entre os diretórios que o OpenCode varre.
 *
 * O OpenCode descobre skills em `.claude/skills/` E em `.opencode/skills/`. Se a
 * mesma `name` aparecer nos dois, a duplicata é resolvida por last-writer-wins
 * e só um aviso no log — ou seja, silenciosamente, e por um critério que a
 * documentação não promete manter.
 *
 * O `init` evita isso instalando as skills apenas em `.claude/skills/`. Este
 * verificador existe para o caso de a cópia extra aparecer por outro caminho
 * (instalador antigo, cópia manual, outra ferramenta).
 */

export type Colisao = {
  nome: string;
  caminhos: string[];
};

/** Onde o OpenCode procura skills dentro do projeto. */
const DIRETORIOS_DE_SKILL = [
  join(".claude", "skills"),
  join(".opencode", "skills"),
  join(".agents", "skills"),
];

export function detectarColisoes(raiz: string, nomes: readonly string[]): Colisao[] {
  const saida: Colisao[] = [];
  for (const nome of nomes) {
    const caminhos = DIRETORIOS_DE_SKILL.map((d) => join(raiz, d, nome)).filter((c) => existsSync(c));
    if (caminhos.length > 1) saida.push({ nome, caminhos });
  }
  return saida;
}
