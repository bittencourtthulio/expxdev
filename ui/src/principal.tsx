import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import "./estilo.css";

const raiz = document.getElementById("painel");
if (raiz) createRoot(raiz).render(<StrictMode><App /></StrictMode>);
