/** Espelho dos tipos que a API serve. A UI não recalcula nada: só renderiza. */

export type Suite = "verde" | "vermelha" | "nao_executada";
export type StatusTask = "pendente" | "em_andamento" | "concluida" | "bloqueada";
export type StatusTrabalho = "nao_iniciado" | "em_andamento" | "bloqueado" | "concluido";

export type Task = {
  id: string;
  titulo: string;
  fase: string;
  status: StatusTask;
  objetivo: string;
  teste_regressao?: string | null;
  teste_integracao?: string | null;
  teste_funcional?: string | null;
  criterio_aceite?: string | null;
  depende_de: string[];
  paralelizavel: boolean;
  concluida_em: string | null;
  suite: Suite;
  arquivo: string;
  linha: number | null;
};

export type Fase = {
  id: string;
  titulo: string;
  status: StatusTrabalho;
  criterio_saida?: string | null;
  paralelizavel: boolean;
  paralela_com: string[];
  tasks: Task[];
  progresso: number;
};

export type Sprint = {
  sprint_id: string;
  titulo: string;
  status: StatusTrabalho;
  criterio_saida: string | null;
  riscos: string[];
  fases: Fase[];
  tasks: Task[];
  progresso: number;
};

export type Bloqueio = {
  id: string;
  task: string | null;
  aberto_em: string;
  resolvido_em: string | null;
  descricao: string;
  aberto: boolean;
  trabalho_id: string;
};

export type Trabalho = {
  trabalho_id: string;
  titulo: string;
  pasta: string;
  arquivo: string;
  expx_tool: "sprintx" | "runx";
  tipo_trabalho: "feature" | "ocorrencia";
  tipo_ocorrencia: string | null;
  estagio: string;
  status: StatusTrabalho;
  criado_em: string;
  atualizado_em: string;
  concluido_em: string | null;
  caminho_critico: string[];
  sprints: Sprint[];
  progresso: number;
  bloqueios: Bloqueio[];
};

export type Violacao = {
  tipo: string;
  trabalho_id: string;
  alvo: string;
  arquivo: string;
  linha: number | null;
  detalhe: string;
};

export type Rejeicao = {
  arquivo: string;
  motivo: string;
  detalhe: string;
  linha: number | null;
};

export type EntradaHistorico = {
  oc_id: string;
  titulo: string;
  tipo_ocorrencia: string;
  fechado_em: string;
  modulo_afetado: string[];
  pasta: string;
  tecnico: Record<string, unknown> | null;
  uso: Record<string, unknown> | null;
};

/**
 * A memória do projeto: a projeção enxuta do índice que o memox grava em
 * `.expx/memoria/indice.json`.
 *
 * É `null` sempre que não há índice — e isso é o caso COMUM, não um erro: o
 * índice é local e gitignorado, então um clone recém-feito não tem nenhum. A
 * tela trata ausência como estado legítimo (decisão D-02).
 *
 * Espelho de `src/parser/memoria/tipos.ts`. Os dois andam juntos; quem prova
 * isso é `ui/src/tipos-memoria.test.ts`, em runtime, porque o cast da fixture
 * apagaria a divergência.
 */

export type EntradaMemoria = {
  trabalho_id: string;
  titulo: string | null;
  data: string | null;
  tipo: string | null;
  ferramenta: string | null;
  causa: string | null;
  papel: string;
  artefato: string;
};

export type Regressao = {
  arquivos: string[];
  trabalho_anterior: string;
  data_anterior: string | null;
  trabalho_posterior: string;
  data_posterior: string | null;
  evidencia: string;
  origem_causa: string | null;
  origem_alteracao: string | null;
};

/** Vínculo que NÃO virou regressão, com o motivo — a prova de que o índice não inventa relação. */
export type Coincidencia = {
  arquivos: string[];
  trabalhos: string[];
  motivo: string;
};

export type ArquivoDeRisco = {
  arquivo: string;
  trabalhos: number;
  ultimo_trabalho_em: string | null;
  reprovacoes_qa: number;
  regressoes: number;
  zona_de_risco: string | null;
  divida: string | null;
  risco_divida: string | null;
  faixa_atencao: string | null;
  entradas: EntradaMemoria[];
};

export type ModuloMemoria = {
  modulo: string;
  trabalhos: number;
  ultimo_trabalho_em: string | null;
  reprovacoes_qa: number;
  regressoes: number;
  arquivos: string[];
};

/** Artefato onde o memox detectou segredo. O valor já foi redigido na origem. */
export type Contaminado = {
  artefato: string;
  tipos: string[];
};

export type Memoria = {
  gerado_em: string;
  versao: number;
  totais: {
    trabalhos: number;
    arquivos: number;
    modulos: number;
    regressoes: number;
    coincidencias: number;
    artefatos_contaminados: number;
  };
  arquivos_de_risco: ArquivoDeRisco[];
  regressoes: Regressao[];
  coincidencias: Coincidencia[];
  contaminados: Contaminado[];
  modulos: ModuloMemoria[];
};

export type Estado = {
  raiz: string;
  trabalhos: Trabalho[];
  bloqueios: Bloqueio[];
  historico: EntradaHistorico[];
  rejeicoes: Rejeicao[];
  violacoes: Violacao[];
  /** `null` quando não há índice de memória — o caso comum num clone (D-02). */
  memoria: Memoria | null;
  lido_em: string;
};

export const ESTAGIOS_SPRINTX = ["f1", "f2", "f3", "f4", "f5", "f6"] as const;
export const ESTAGIOS_RUNX = ["e1", "e2", "e3", "e4", "e5"] as const;

export const ROTULO_ESTAGIO: Record<string, string> = {
  f1: "F1 Ingestão", f2: "F2 Descoberta", f3: "F3 Plano",
  f4: "F4 Orquestrador", f5: "F5 Auditoria", f6: "F6 Execução",
  e1: "E1 Investigação", e2: "E2 Plano", e3: "E3 Fix", e4: "E4 QA", e5: "E5 Relatório",
};

/** Planejamento x execução vem do estágio, não do status (decisão D-26). */
export const ESTAGIOS_PLANEJAMENTO = new Set(["f1", "f2", "f3", "f4", "f5", "e1", "e2"]);
