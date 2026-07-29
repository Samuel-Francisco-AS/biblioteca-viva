# AGENTS.md — Regras para agentes e Codex

Este arquivo governa qualquer tarefa automatizada no repositório Biblioteca Viva.

## 1. Antes de alterar qualquer arquivo

1. Leia `docs/STATUS.md`.
2. Leia `docs/00_LEIA-ME.md`.
3. Leia o documento específico da área alterada.
4. Inspecione o código e os scripts reais; não presuma APIs, pastas ou comandos.
5. Confirme que a tarefa corresponde ao bloco e prompt ativos.

## 2. Fonte de verdade por assunto

- estado atual: `docs/STATUS.md`;
- visão: `docs/VISION.md`;
- escopo vigente: `docs/PRODUCT.md`;
- arquitetura e dependências: `docs/ARCHITECTURE.md`;
- modelo de dados: `docs/DATA_MODEL.md`;
- UX: `docs/UX_FLOWS.md`;
- execução: `docs/ROADMAP.md` e `docs/EXECUTION_PLAN.md`;
- testes: `docs/TEST_PLAN.md`;
- segurança e privacidade: `docs/SECURITY.md` e `docs/PRIVACY.md`;
- acessibilidade: `docs/ACCESSIBILITY.md`;
- arte, áudio e conteúdo: `docs/ART_DIRECTION.md`, `docs/ASSET_REGISTRY.md`, `docs/AUDIO.md` e `docs/CONTENT_GUIDE.md`;
- decisões: `docs/DECISIONS.md`.

Havendo contradição, pare a alteração conflitante, relate o ponto e preserve a decisão mais recente registrada em `docs/DECISIONS.md`.

## 3. Limites de escopo

- Faça apenas o trabalho solicitado.
- Não antecipe blocos futuros.
- Não reestruture o projeto inteiro para resolver uma tarefa local.
- Não crie abstrações sem uso atual ou próximo já aprovado.
- Não adicione dependências “por precaução”.
- Não crie diretórios vazios para simular arquitetura.
- Não implemente conta, backend, sincronização, filmes, séries, estudos, IA ou múltiplas salas no protótipo.

## 4. Regras de arquitetura

- Dependências apontam para dentro.
- `domain` não importa React, Phaser, Dexie, Capacitor, DOM ou APIs do navegador.
- `application` orquestra casos de uso e depende de domínio e portas.
- `infrastructure` implementa portas.
- React e Phaser não acessam Dexie diretamente.
- Phaser recebe uma projeção pronta e emite interações tipadas; não decide regras de negócio.
- Dados persistentes são fonte de verdade; stores de UI não substituem o banco.
- Conteúdo deve ser orientado a dados quando a adição frequente for requisito.

## 5. Qualidade de código

- TypeScript em modo estrito.
- Não use `any`, `@ts-ignore`, desativação global de lint ou casts cegos para silenciar erros.
- Erros não podem ser capturados e ignorados silenciosamente.
- Nomes devem expressar o domínio.
- Funções e componentes devem ter responsabilidade compreensível.
- Comentários explicam motivo, risco ou contrato; não narram sintaxe óbvia.
- Mudanças de schema exigem migração e teste.
- Mudanças em comportamento exigem testes e atualização documental correspondente.

## 6. Segurança e privacidade

- Nunca grave segredos em `VITE_*`, código, documentação ou fixtures.
- Nunca adicione keystore, senha, token, backup pessoal ou arquivo exportado ao Git.
- Valide dados externos e arquivos importados.
- Não registre títulos, notas, citações ou conteúdo pessoal em logs.
- Mantenha permissões Android mínimas.

## 7. Operações Git proibidas ao agente

Não execute sem pedido explícito do usuário:

- `git commit`;
- `git push`;
- criação de tag;
- rebase;
- `reset --hard`;
- force push;
- exclusão de branch;
- alteração de versão de release.

O agente pode inspecionar `git status`, `git diff` e histórico.

## 8. Validação obrigatória

### Comandos disponíveis

- `npm run dev` — inicia o servidor de desenvolvimento;
- `npm run build` — verifica TypeScript e gera o build web;
- `npm run preview` — serve localmente o build gerado;
- `npm run lint` — executa ESLint;
- `npm run typecheck` — verifica os projetos TypeScript;
- `npm run test` — executa Vitest em modo interativo;
- `npm run test:run` — executa Vitest uma vez;
- `npm run format` — formata apenas código e arquivos técnicos listados no script;
- `npm run format:check` — verifica a formatação desse mesmo conjunto.
- `npm run android:sync` — compila a aplicação web e sincroniza os arquivos e plugins com Android;
- `npm run android:open` — abre `android/` no Android Studio;
- `npm run android:run` — sincroniza e executa no aparelho Android conectado;
- `npm run android:build:debug` — sincroniza e gera o APK debug com `android/gradlew`.

Ao final de uma tarefa de código, execute os scripts disponíveis equivalentes a:

- formatação ou `format:check`;
- lint;
- typecheck;
- testes;
- build;
- `git diff --check`;
- `git status --short`.

Não afirme que um teste manual foi realizado quando ele depende do usuário, Android Studio ou aparelho físico.

## 9. Relatório final obrigatório

Informe:

1. arquivos criados e modificados;
2. comportamento implementado;
3. decisões tomadas e justificativas;
4. dependências adicionadas;
5. comandos e testes executados, com resultados;
6. testes manuais pendentes;
7. riscos, limitações e débitos conhecidos;
8. documentação atualizada;
9. estado de `git status --short`;
10. confirmação de que não fez commit, tag ou push.

Use `docs/templates/GATE_REPORT_TEMPLATE.md` como referência.

## 10. Critério de parada

Pare e relate em vez de improvisar quando:

- o pedido contradizer uma decisão aprovada;
- for necessária migração destrutiva não prevista;
- houver risco de perda de dados;
- credenciais forem necessárias;
- a tarefa exigir mais de um subsistema central novo;
- o diff deixar de ser razoavelmente revisável;
- o build ou testes revelarem falha anterior fora do escopo.

Parar não significa abandonar: entregue o que foi possível validar e descreva o bloqueio com precisão.
