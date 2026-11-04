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


## Gate final dirigido — restauração e histórico (sem aceite antecipado)

A CI 41832993749 fechou em **18 PASS / 30 FAIL** (9/15 em cada shard), enquanto o gate de **732 unitários, lint, tipos, áudio, build e performance passou**. A adaptação inicial de BF-4 não resolveu o conjunto; houve novas esperas por controles durante bootstrap e pelo renderizador WebGL de software.

O código do fluxo de restauração usa `DexieBackupSnapshotStore.replace` em transação `rw` atômica; a interface de sucesso só aparece após `ImportBackup.execute` retornar. Porém, a antiga asserção E2E procurava o livro depois de visitar a Biblioteca WebGL, o que misturava teste de persistência e navegação gráfica. Agora a suíte diferencia **registro restaurado diretamente no IndexedDB**, permanência após `reload` e representação na Coleção, sem uma passagem obrigatória pelo Canvas; o teste ainda valida substituição, preferências e ausência de registro excluído. Resultado ainda a validar em CI. Falha de qualquer um desses três passos é bloqueante.

O E2E de ficha de treino mantém as asserções originais e passa a verificar o histórico concreto antes do resumo derivado; a ausência de sessão continua bloqueante. O helper de exploração aguarda estado `ready/failed` antes de abrir bússola/painéis, evitando toggles no meio da montagem. Testes de cena antigos que usam coordenadas, projeção e 30s em Chromium software continuam exigindo classificação individual; não serão silenciados.

**Decisão de merge:** não há autorização para merge; enquanto restauração e histórico não estiverem comprovados, classificar a PR como não pronta. A BF-5 continua aberta após futura integração para refinar formulários.

## Parecer de saneamento final — revisão de integridade (04/11/2026)

- **Código de produção:** nenhuma alteração nesta rodada final. Preservados CSS visual, Dexie, Android, cena 3D e formulários.
- **Testes e CI:** após sanar o mock de WorldHost, a CI 41832993749 confirmou **732/732 unitários PASS**, format/lint/tipos/áudio/build/performance PASS. E2E amplos continuaram **18 PASS / 30 FAIL**; a maioria dos erros de BF-4 decorre de UI redesenhada ou incompatibilidade dos testes com um navegador WebGL software, mas não podemos generalizar essa causa para todos.
- **Backup e restauração:** `DexieBackupSnapshotStore.replace` usa transação atômica e os unitários de importação/exportação passaram. O E2E foi reforçado para verificar explicitamente dados do IndexedDB antes e depois de reload, além de renderização na Coleção, evitando usar o mundo 3D como pré-requisito do teste de integridade. **A confirmação E2E desse novo gate ainda é pendente.**
- **Histórico de treino:** o E2E agora verifica a existência da sessão salva antes do resumo calculado, sem alterar os critérios funcionais de aceite. Resultado E2E dirigido ainda pendente.
- **Exploração acessível:** helper aguarda estado ready/fallback antes de abrir os controles semanticamente. A UI de produção não foi modificada.
- **Higiene:** Prettier aplicado automaticamente aos três arquivos E2E, e o workflow temporário de formatação se removeu. A CI do commit final deve concluir para confirmar o resultado.
- **Classificação de merge:** **bloqueado** até confirmação de integridade de backup, histórico e navegação crítica ou autorização explícita do proprietário para ressalvas não críticas. Os testes legados não devem ser apagados nem contornados silenciosamente.
- **Após merge:** BF-5 permanece aberta. Refinamento dos formulários e da UX em uma nova PR; a direção artística BF-5R6 permanece aprovada.

**Observação:** esta auditoria é deliberadamente conservadora; não declara o conjunto E2E verde nem reparos em produção sem evidência de defeito de produção.
