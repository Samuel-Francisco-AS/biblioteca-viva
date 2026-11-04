import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./app/configureZodRuntime";
import { App } from "./App";
import { createApplication } from "./app/createApplication";
import { AppErrorBoundary } from "./app/AppErrorBoundary";
import { startupNow } from "./startupPerformance";
import {
  completeStartupExperience,
  describeStartup,
} from "./startupExperience";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Elemento raiz da aplicação não foi encontrado.");
}

const root = createRoot(rootElement);

function render(application?: Awaited<ReturnType<typeof createApplication>>) {
  const shellStartedAt = startupNow();
  root.render(
    <StrictMode>
      <AppErrorBoundary>
        <BrowserRouter>
          <App
            application={application}
            diagnostics={application?.diagnostics}
            shellStartedAt={shellStartedAt}
          />
        </BrowserRouter>
      </AppErrorBoundary>
    </StrictMode>,
  );
}

describeStartup("Preparando as memórias da Biblioteca…");
void createApplication()
  .then((application) => {
    describeStartup("Despertando o santuário…");
    render(application);
  })
  .catch(() => {
    console.error("Falha controlada ao inicializar a persistência local.");
    render();
    completeStartupExperience();
  });
