# AGENTS.md — Regras de contribuição automatizada

## Antes de alterar

1. Leia `docs/STATUS.md` e `docs/00_LEIA-ME.md`.
2. Leia o documento da área e a decisão mais recente em `docs/DECISIONS.md`.
3. Confira `docs/ROADMAP.md` e o prompt ativo em `docs/EXECUTION_PLAN.md`.
4. Inspecione código, testes e scripts reais; documentação não substitui evidência.
5. Se houver contradição, preserve a decisão mais recente e pare a parte conflitante.

## Arquitetura

- dependências apontam para dentro;
- `domain` não importa React, Phaser, Dexie, Capacitor, DOM ou browser;
- `application` orquestra domínio e portas;
- `infrastructure` implementa portas e valida dados externos antes de devolvê-los;
- React e Phaser não acessam Dexie;
- Phaser recebe `LibraryViewModel`, emite interações tipadas e não decide negócio;
- dados persistidos são a fonte de verdade;
- entidade/anotação, atividade e marco aplicável pertencem à mesma transação; eventos saem somente após commit;
- conteúdo recorrente usa catálogos/manifests validados.

## Escopo e qualidade

- implemente apenas o pedido e não antecipe blocos;
- não crie conta, backend, sincronização, tipos de mídia além dos seis já implementados, salas temáticas novas ou múltiplos mundos; o W1 vigente limita-se a dois espaços neutros efêmeros conectados;
- não faça refatoração global, abstração sem uso, diretório vazio ou dependência preventiva;
- preserve TypeScript estrito; não use `any`, `@ts-ignore`, casts cegos ou lint desativado para ocultar erro;
- erros não são ignorados silenciosamente;
- mudança de schema exige migração e teste; mudança de comportamento exige regressão e documentação.

## Dados, segurança e privacidade

- nunca versione segredo, keystore, senha, token, backup pessoal ou exportação real;
- `VITE_*` não é segredo;
- fixtures e E2E usam conteúdo claramente fictício;
- logs não contêm títulos, autores, notas, citações, diálogos, backup ou caminho sensível;
- valide todo arquivo externo e mantenha permissões Android mínimas;
- diagnósticos permanecem restritos a DEV/build interno e sem conteúdo pessoal.

## Testes e comandos

Use `npm ci` para instalação reproduzível. Para E2E local, instale uma vez `npx playwright install chromium`.

Ao final de código, execute conforme o escopo:

```text
npm run format
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run audio:check
npm run build
npm run performance:report
npm run test:e2e
npm run android:sync
npm run android:build:debug
git diff --check
git status --short
```

Playwright é web/Chromium; não substitui Android real. Não alegue teste manual, aparelho, TalkBack, áudio percebido ou performance física sem execução humana registrada.

## Android e Git

Não configure assinatura, keystore ou release sem escopo explícito. Nunca execute sem pedido do usuário: `git commit`, push, tag, rebase, force push, exclusão de branch, `reset --hard` ou mudança de versão. Status, diff e histórico são permitidos.

Checkpoints técnicos podem ser commitados quando explicitamente autorizados após automação e documentação. Um checkpoint não aprova prompt ou gate humano. G4 e G7–G10 permanecem abertos até evidência humana; não marque checklist pendente como executada.

## Documentação e parada

Atualize `STATUS`, `ROADMAP`, `TEST_PLAN` e os documentos afetados. Preserve história verdadeira. Use `docs/templates/GATE_REPORT_TEMPLATE.md` no relatório final.

Pare a alteração conflitante e relate quando houver risco de perda, migração destrutiva não prevista, credencial necessária, mais de um subsistema central novo, diff não revisável ou falha anterior fora do escopo. Não improvise em dados pessoais ou release.
