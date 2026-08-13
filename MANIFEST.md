# Manifesto do pacote documental

Este manifesto indexa a documentação inicial do repositório Biblioteca Viva, já inicializado na branch `main`.

## Arquivos raiz

- `README.md` — apresentação e entrada pública;
- `AGENTS.md` — regras obrigatórias do Codex e agentes;
- `CONTRIBUTING.md` — fluxo humano de contribuição;
- `CHANGELOG.md` — histórico de versões;
- `MANIFEST.md` — este índice.
- `capacitor.config.ts` — identidade do aplicativo e diretório do build web usado pelo Capacitor;
- `android/` — projeto Android nativo versionado, incluindo Gradle Wrapper e módulo `app`.
- `src/domain/` — domínio puro de livros, anotações, eventos, erros e schemas de fronteira, com API pública em `index.ts` e testes Node.
- `src/application/` — portas, atividades, erros, DTOs, consultas e comandos que coordenam o domínio, com fakes apenas nos testes Node.
- `src/infrastructure/` — banco Dexie, schemas persistidos, repositórios, transação, diagnóstico, event bus e adapters de plataforma.
- `src/app/createApplication.ts` — composition root explícito dos adapters e casos de uso; `DevelopmentDiagnostics.tsx` é o painel técnico restrito a desenvolvimento e builds diagnósticos internos.

## Documentos canônicos

- `docs/PLANO_MESTRE.md` — visão longa original;
- `docs/ARCHITECTURE.md` — análise completa de stack e arquitetura;
- `docs/EXECUTION_PLAN.md` — 11 blocos e 19 prompts completos.
- `docs/REFINEMENT_PLAN.md` — plano operacional das rodadas de refinamento pós-protótipo.

## Documentos operacionais

- `docs/00_LEIA-ME.md`;
- `docs/STATUS.md`;
- `docs/VISION.md`;
- `docs/PRODUCT.md`;
- `docs/DATA_MODEL.md`;
- `docs/UX_FLOWS.md`;
- `docs/ROADMAP.md`;
- `docs/TEST_PLAN.md`;
- `docs/SECURITY.md`;
- `docs/PRIVACY.md`;
- `docs/ACCESSIBILITY.md`;
- `docs/ART_DIRECTION.md`;
- `docs/ASSET_REGISTRY.md`;
- `docs/AUDIO.md`;
- `docs/CONTENT_GUIDE.md`;
- `docs/PERFORMANCE.md`;
- `docs/ANDROID_RELEASE.md`;
- `docs/MAINTENANCE.md`;
- `docs/DECISIONS.md`;
- `docs/RISK_REGISTER.md`;
- `docs/GLOSSARY.md`.

## Modelos

- `docs/templates/ADR_TEMPLATE.md`;
- `docs/templates/CODEX_PROMPT_TEMPLATE.md`;
- `docs/templates/GATE_REPORT_TEMPLATE.md`;
- `docs/templates/MANUAL_TEST_REPORT_TEMPLATE.md`;
- `docs/templates/RELEASE_CHECKLIST.md`.

## Estado técnico

Os Prompts 1–19 estão tecnicamente implementados. A primeira rodada integrada no Moto G06 confirmou partes do ciclo e originou a fase descrita em `docs/REFINEMENT_PLAN.md`; ela não aprovou G4 ou G7–G10. G5 e G6 permanecem aprovados, G11 não foi iniciado e a versão continua `0.2.0-alpha.1`. Os comandos, rotas e caminhos reais estão registrados em `README.md`, `AGENTS.md` e `docs/STATUS.md`.
