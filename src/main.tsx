import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import { createApplication } from "./app/createApplication";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Elemento raiz da aplicação não foi encontrado.");
}

const root = createRoot(rootElement);

function render(
  diagnostics?: Awaited<ReturnType<typeof createApplication>>["diagnostics"],
) {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App diagnostics={diagnostics} />
      </BrowserRouter>
    </StrictMode>,
  );
}

void createApplication()
  .then((application) => render(application.diagnostics))
  .catch(() => {
    console.error("Falha controlada ao inicializar a persistência local.");
    render();
  });
