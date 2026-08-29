import type { JSX } from "react";

/**
 * Ícones no traço dos codicons do VS Code: grade de 16, stroke 1.2,
 * sem preenchimento. Inline para não depender de fonte externa — a CSP do
 * ambiente de publicação bloqueia webfonts de terceiros.
 */
function Svg({ children, tamanho = 16 }: { children: React.ReactNode; tamanho?: number }): JSX.Element {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const Icone = {
  Painel: (p: { tamanho?: number }): JSX.Element => (
    <Svg {...p}>
      <rect x="1.8" y="2.3" width="12.4" height="11.4" rx="1.2" />
      <path d="M1.8 6.1h12.4M6.4 6.1v7.6" />
    </Svg>
  ),
  Conformidade: (p: { tamanho?: number }): JSX.Element => (
    <Svg {...p}>
      <path d="M8 1.8 13.6 4v3.7c0 3-2.3 5.6-5.6 6.5C4.7 13.3 2.4 10.7 2.4 7.7V4z" />
      <path d="M5.9 8.1 7.3 9.6l2.9-3.2" />
    </Svg>
  ),
  Relatorio: (p: { tamanho?: number }): JSX.Element => (
    <Svg {...p}>
      <path d="M9.2 1.8H4.1a1 1 0 0 0-1 1v10.4a1 1 0 0 0 1 1h7.8a1 1 0 0 0 1-1V5.5z" />
      <path d="M9.2 1.8v3.7h3.7M5.6 8.4h4.8M5.6 10.9h3.2" />
    </Svg>
  ),
  Historico: (p: { tamanho?: number }): JSX.Element => (
    <Svg {...p}>
      <circle cx="8" cy="8" r="6.1" />
      <path d="M8 4.4V8l2.5 1.6" />
    </Svg>
  ),
  Alerta: (p: { tamanho?: number }): JSX.Element => (
    <Svg {...p}>
      <path d="M7.1 2.5 1.6 12a1 1 0 0 0 .9 1.5h11a1 1 0 0 0 .9-1.5L8.9 2.5a1 1 0 0 0-1.8 0z" />
      <path d="M8 6.2v3.1M8 11.4h.01" />
    </Svg>
  ),
  Feature: (p: { tamanho?: number }): JSX.Element => (
    <Svg {...p}>
      <path d="M8 1.9 9.8 5.6l4.1.6-3 2.9.7 4.1L8 11.3l-3.6 1.9.7-4.1-3-2.9 4.1-.6z" />
    </Svg>
  ),
  Ocorrencia: (p: { tamanho?: number }): JSX.Element => (
    <Svg {...p}>
      <rect x="4.6" y="5.4" width="6.8" height="7.4" rx="3.4" />
      <path d="M6.2 4.3a1.8 1.8 0 0 1 3.6 0M2.6 7.4h2M11.4 7.4h2M2.6 10.7h2M11.4 10.7h2" />
    </Svg>
  ),
  Seta: ({ aberta }: { aberta: boolean }): JSX.Element => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d={aberta ? "M4 6l4 4 4-4z" : "M6 4l4 4-4 4z"} />
    </svg>
  ),
  Bloqueio: (p: { tamanho?: number }): JSX.Element => (
    <Svg {...p}>
      <circle cx="8" cy="8" r="6.1" />
      <path d="M3.7 3.7l8.6 8.6" />
    </Svg>
  ),
  Copiar: (p: { tamanho?: number }): JSX.Element => (
    <Svg {...p}>
      <rect x="5.6" y="5.6" width="8" height="8" rx="1" />
      <path d="M10.4 5.6V3.4a1 1 0 0 0-1-1H3.4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.2" />
    </Svg>
  ),
  Cliente: (p: { tamanho?: number }): JSX.Element => (
    <Svg {...p}>
      <circle cx="8" cy="5.4" r="2.7" />
      <path d="M2.9 13.6a5.1 5.1 0 0 1 10.2 0" />
    </Svg>
  ),
  Baixar: (p: { tamanho?: number }): JSX.Element => (
    <Svg {...p}>
      <path d="M8 2.4v7.4M5.1 7.1 8 9.9l2.9-2.8M2.6 12.2v1.2h10.8v-1.2" />
    </Svg>
  ),
};
