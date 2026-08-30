import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Icone } from "./icones.js";

afterEach(cleanup);

describe("ícone da memória", () => {
  it("integração: renderiza um svg com nós de traço próprios", () => {
    const { container } = render(<Icone.Memoria />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.children.length ?? 0).toBeGreaterThan(0);
  });

  it("funcional: honra o tamanho e tem desenho diferente do Histórico", () => {
    const { container } = render(<Icone.Memoria tamanho={22} />);
    expect(container.querySelector("svg")?.getAttribute("width")).toBe("22");

    // um ícone copiado de outro passaria num teste que só contasse nós
    const memoria = container.innerHTML;
    cleanup();
    const historico = render(<Icone.Historico />).container.innerHTML;
    expect(memoria).not.toBe(historico);
  });
});
