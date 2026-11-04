# BF-5 — Auditoria de integração e organização da PR #20

**Data:** 2026-11-04. **Referência:** `62a228de21d2005ac934409f8e9af040cb20fce6`. **Estado:** gate de saneamento antes de qualquer merge. O proprietário avaliou o APK R9 como satisfatório provisoriamente e autorizou auditoria/reparos/organização, **não** o merge ou o encerramento da BF-5. A fase continua após futura integração para refinar interface e formulários.

## Estado inicial conhecido

- PR #20: 34 commits à frente de main, 215 arquivos modificados, incluindo 50 artefatos em `artifacts/`. Não reescrever histórico nem excluir provas sem classificação de uso.
- CI atual do commit R9: 731 PASS e 1 FAIL em `src/pages.test.tsx`. O teste tem estado compartilhado `latestWorldHostProps`; a correção abaixo reinicia o mock por caso. A hipótese deve ser confirmada pela nova CI, não considerada comprovada por simples leitura.
- E2E amplo R9: 20 PASS / 27 FAIL; 14 em BF-4, oito em shell/leitura/seleção 3D, quatro em BF-5 e um em fluxo geral. Falhas históricas **não** são automaticamente aceitas. Alguns fluxos passaram isoladamente, mas ainda podem falhar sob contenção.
- Sete imports CSS e ~7.405 linhas: `styles.css` (base), cinco camadas históricas e `styles-atelier.css` (identidade aprovada). Há repetição de seletores para dock, botões, cartões, editores e diálogo.

## Intervenção inicial — sem mudanças visuais pretendidas

1. Corrigido vazamento de estado entre testes: `beforeEach` limpa as props globais do mock `WorldHost` no arquivo de testes. Nenhuma mudança no comportamento de produção.
2. Consolidadas cinco folhas intermediárias da BF-5, **sem alterar as declarações ou sua ordem**, em `src/styles-legacy.css`. Importação passa a `styles.css` → `styles-legacy.css` → `styles-atelier.css`. Blocos comentados com origem permitem revisão futura. O total de regras e o visual não foram propositalmente modificados. Isto **não** é remoção de código morto nem prova de equivalência em Android.
3. CI repartida em gate estático/unitário/build e dois shards E2E independentes, sem retries durante triagem, com traces de falhas preservados por curto período. Não reduz assertivas nem permite passar CI com E2E quebrado; torna as falhas visíveis sem um timeout acumulado de ~20 minutos.
4. Preservados: identidade BF-5R6, recursos Android R9, Dexie v9, backup v6, Three.js, questões narrativas, navegação e dados.

## Próximos gates necessários

- **Confirmado na CI 41831072924:** format, lint, TS, áudio, build web/performance e **732/732 unitários PASS**. A falha unitária de snapshot não reapareceu após limpar o mock por teste.
- **Nova leitura E2E na CI 41831072924:** 21 PASS / 27 FAIL em 48 cenários (shard 1: 10/14; shard 2: 11/13), sem timeout global do job. Logs comprovam falhas de painéis acessíveis recolhidos em BF-4, cabeçalho antigo ausente e algumas timeouts de screenshots/software renderer; também mostram falha não classificada de restauração de backup e casos de navegação/teclado que exigem investigação. Nenhum dos 27 FAIL é aceito automaticamente.\n- **Reparo de testes históricos:** helper acessível abre bússola e exploração sem manipular CSS/DOM artificialmente, reaplicado a testes BF-4 de habitantes, objetos vivos e seleção em coleção cheia. A verificação desses ajustes ainda exige novo gate.\n- Triar traces E2E por causa: **seletor legado ou área recolhida**, **jogo/runtime**, **fluxo funcional de dados**, **sincronização/timeout de fixture**. Reproduzir dirigidos por grupo; não tocar no runtime sem prova.
- Revisar CSS duplicado **por responsabilidade** após capturas equivalentes; qualquer remoção de regra exige equivalência visual/ergonômica em retrato/paisagem e aprovação do proprietário. A compactação estrutural atual preserva a cascata integralmente.
- Auditar conteúdo dos `artifacts/` para reter capturas de referência e não versionar arquivos transitórios de teste.
- Antes de merge: pendências classificadas, regressões críticas reparadas, build Android verificado, documentação e PR atualizadas, autorização explícita do proprietário.

## Critérios de aceitação e compromisso pós-merge

A integração da PR #20 é independente do encerramento da BF-5. Após autorização de merge, iniciar refino de formulários e UI em nova PR, com escopo e critérios próprios. Nenhuma falha ou dívida técnica é aceita por omissão.

**Sem merge nesta intervenção.**
