import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./app/configureZodRuntime";
import { App } from "./App";
import { createApplication } from "./app/createApplication";
import { AppErrorBoundary } from "./app/AppErrorBoundary";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Elemento raiz da aplicação não foi encontrado.");
}

const root = createRoot(rootElement);

function render(application?: Awaited<ReturnType<typeof createApplication>>) {
  root.render(
    <StrictMode>
      <AppErrorBoundary>
        <BrowserRouter>
          <App
            application={application}
            diagnostics={application?.diagnostics}
          />
        </BrowserRouter>
      </AppErrorBoundary>
    </StrictMode>,
  );
}

void createApplication()
  .then((application) => render(application))
  .catch(() => {
    console.error("Falha controlada ao inicializar a persistência local.");
    render();
  });
