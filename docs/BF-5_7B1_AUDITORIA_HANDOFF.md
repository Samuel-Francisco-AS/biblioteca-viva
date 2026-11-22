> **AVISO DE ESTADO — 22/11/2026:** este handoff registra a auditoria e as instruções disponíveis no momento da B1. A B1 está concluída. As instruções antigas de CP5/B2.1 e preservação de contratos TCG são históricas e foram superadas pela decisão do proprietário de 12/11 sobre descarte dos dados locais de teste, pelas entregas B2.2–B2.5 e pela integração final na [PR #58](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/58). Para o estado vigente de cada subetapa, consultar [a reconciliação final da BF-5.7B](BF-5_7B_RECONCILIACAO_2026-11-22.md). Não usar os prompts antigos deste handoff como autorização para executar trabalho novo.

---

# BF-5.7B1 — Auditoria técnica do Arcanário e handoff controlado para B2

> **ATUALIZAÇÃO DE AUTORIZAÇÃO — 12/11/2026, após entrega da B2.1:** o proprietário esclareceu que **todos os dados atuais do APK são de teste e podem ser integralmente descartados**. **Revogadas para esta reforma:** obrigatoriedade de preservar `combat`/`combat_match` em backups antigos, manutenção de replay/engine histórico exclusivamente por compatibilidade, fixtures F2/F3 como gate de retirada, migração de partidas/cartas autorais e o bloqueio de B2.2 até aceite da [PR #53](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/53). Este relatório continua servindo como **inventário técnico**; os trechos CP4/CP5 e o prompt antigo são **históricos**, substituídos pela orientação abaixo e pela atualização do [plano BF-5.7B](BF-5_7B_ARCANARIO_REFORMA_PLANO.md). **Nenhum dado foi apagado por esta atualização documental.**

### Handoff revisado — política de corte limpo (substitui CP5 antigo)

1. **B2.2 / análise de reset:** verificar contratos de inicialização (`database.ts`, `createApplication.ts`), esquema, backup e rotas; registrar plano concreto de **inicialização limpa** dos dados atuais e como o usuário saberá que o reset é destrutivo. Evitar abrir schema antigo com parser novo antes do reset; não fazer limpeza parcial que deixe inconsistência.
2. **B2.3 / remover produto TCG:** retirar navegação/rotas do duelo, semeio `ensureCatalogue`, editor e renderizador de combate, arena e imports; URLs antigas devem retornar de maneira previsível ao Portal. Preservar Portal, Acervo, Oficina, Ecos, Provações, Relicário e pacotes educativos.
3. **B2.4 / depurar arquitetura:** depois de resolver acesso à lua orbital (mantê-la como portal do Arcanário, preferencialmente, ou decidir sua remoção), eliminar dependências 3D, CSS, assets, scripts e módulos exclusivos do duelo. Pode remover schemas e motor legados **se não forem mais necessários ao produto novo**; não manter TCG por compatibilidade que deixou de ser requisito.
4. **B2.5 / novas garantias:** testar instalação limpa, funcionamento de flashcards/questões/memórias/treinos, novo backup/restauração, rotas antigas, inatividade de duelos e ausência de importações mortas. Não usar backups pessoais. Testes F2/F3 da PR #53 podem ser descartados/adaptados se verificarem comportamento aposentado.
5. **B2.6 / aceite:** testes locais lint/typecheck/build/Vitest/E2E executáveis e gate Moto G06 quando houver APK. Relatar PASS/FAIL/não executado. Não executar reset real nesta auditoria, não fazer merge sem aceite.

**Nova regra:** o que deve sobreviver é **a integridade e funcionalidade do aplicativo após um início limpo**, não o conteúdo descartável do APK atual. O objetivo é simplificar a arquitetura, sem deixar passivos de TCG espalhados ou enfraquecer validação de dados _novos_.

**Data:** 12/11/2026
**Etapa:** B1 — Inventário, dependências, compatibilidade e decisão de implementação.
**Estado:** **auditoria estática remota concluída, com ressalvas**; B2 ainda **não implementada nem autorizada por este documento**.
**PR documental:** [#52](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/52), branch `docs/bf-5-7b-arcanario-reorientacao`, base `main` verificada em `9abf0c0b058686ff6233525213574095d9ee07cf`.
**Método:** inspeção dos arquivos reais via conector GitHub e busca cruzada de referências; nenhum checkout de execução, build, teste, APK, dado pessoal, CI ou experimento físico. Todos os PASS abaixo se referem **apenas à conclusão da inspeção**, não à execução dos testes existentes.
**Fonte de direção:** [Plano BF-5.7B](BF-5_7B_ARCANARIO_REFORMA_PLANO.md), [issue #50](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/50).
**Destinatário:** Copilot ou outro agente de implementação, com instruções deliberadamente pequenas, explícitas e verificáveis.

> **Conclusão executiva:** a experiência TCG pode ser retirada da navegação e da jogabilidade, **mas não pode ser apagada da modelagem/validação de dados de uma só vez**. Os tipos `combat` e `combat_match`, referências de baralho e validação de replay integram a estrutura global do Arcanário e os backups v11/anteriores. **Separar descontinuação de produto (B2) de descarte físico de dados e do parser legado (decisão futura).** A lua orbital já abre `/arcanario` e pode servir como portal educativo, sujeita a decisão artística.

---

## CP1 — Superfícies, rotas e entradas do Duelo Arcano

**Estado:** inventário estático concluído.

| Superfície                    | Evidência verificada                                                                                                                                                                                                   | Tratamento indicado                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Casca global                  | `src/App.tsx` importa `isArenaRoute` e `arena.css`, cria `arenaActive` e publica `data-arena-route`; rota principal `/arcanario/*` permanece educativa                                                                 | Em B2, remover modo fullscreen de arena **após** encerrar suas rotas e revisar CSS de casca/dock                                                                         |
| Salas                         | `src/features/arcanarium/ArcanariumPage.tsx` define imports lazy de `DuelHall`, `DuelTable`, `DuelDeckEditor`, `DuelRules`, `ArenaDuel`; 5 rotas sob `duelos`; navegação com **11 destinos**, incluindo `Duelo Arcano` | Retirar entrada e substituir rotas legadas por fallback contextual; **não** apagar Portal, Acervo, Ecos, Oficina, Provações, Pacotes, Assuntos, Diagnóstico ou Relicário |
| Portal                        | `ArcanariumPage.tsx` inclui tile `O Duelo Arcano`, links de Provações/Pacotes/Acervo/Ecos/Relicário                                                                                                                    | Retirar tile de duelo, manter caminhos educacionais; reforma hierárquica profunda fica em B3                                                                             |
| Oficina                       | `src/features/arcanarium/Workshop.tsx` seleciona `CombatEditor` via `?tipo=combat` e expõe link `Criar carta de combate`                                                                                               | Não oferecer criação nova de combate; proteger URL antiga e rascunhos. Preservar editores de flashcard, memória e questão                                                |
| Acervo e detalhes             | `Catalogue.tsx` filtra por família, incluindo `combat` por `presentation.ts`; `CardDetail` aceita qualquer `Card` por ID                                                                                               | Filtrar combatentes da experiência ativa **e** bloquear acesso direto por `/arcanario/cartas/:id`, sem excluir o registro persistido                                     |
| Cartas renderizadas           | `ArcanaCard.tsx` **importa estaticamente** `../duel/CombatCard` e renderiza `combat` quando há definição; `presentation.ts` define título/rótulo `combat`                                                              | Desacoplar componente visual de combate, mantendo fallback honesto para conteúdo legado se necessário                                                                    |
| Baralhos                      | `Decks.tsx` já oculta baralhos `deck.combat` na lista comum, mas `DeckEditor` envia esses IDs ao editor de duelo; `ArcanariumService.saveDeck` recusa mistura com combatentes                                          | Impedir navegação para editor aposentado; manter validação de domínio enquanto existirem registros legados                                                               |
| Inicialização do catálogo TCG | `DuelHall.tsx` chama `app.duels.ensureCatalogue()` ao montar. `DuelService.ensureCatalogue()` semeia cartas e decks oficiais ausentes no mesmo repositório do Arcanário                                                | Remover esse efeito de produto e não reinstalar catálogo oficial do TCG ao iniciar a BV; **não** assumir que o catálogo só existe em memória                             |
| Atalho da Biblioteca          | `src/pages.tsx` contém link direto `/arcanario/duelos` e outro para `/arcanario`                                                                                                                                       | Remover atalho de duelo e manter acesso normal ao Arcanário                                                                                                              |

**Rotas de legado a resolver:** `/arcanario/duelos`, `/arcanario/duelos/regras`, `/arcanario/duelos/baralhos/:id`, `/arcanario/duelos/partida/:id`, `/arcanario/duelos/arena/:id`. **Recomendação:** redirecionar de modo previsível para `/arcanario` com `replace` ou exibir estado de descontinuação que ofereça voltar ao Portal; não abrir partida, não quebrar Back e não deixar página em branco.

**Fronteira de produto:** Ecos/flashcards, Provações/questões e Relicário/memórias **não** são combate. A existência de rótulo `memory`, carta decorativa ou baralho educativo não autoriza sua exclusão.

---

## CP2 — Domínio, serviços, Dexie e caminho crítico de backup

**Estado:** dependências inspecionadas; **risco ALTO** para remoção precipitada.

### Modelo efetivo

- `src/domain/arcanarium.ts` mantém `cardContentSchema` com tipos discriminados `flashcard | question | memory | combat`, `cardSchema` com os mesmos tipos; `deckSchema` possui `combat?: combatDeckSchema`, `dynamicCriteriaSchema` aceita tipo `combat` nas versões 1/2 e `cardSessionSchema` possui `combat_match` com `matchSchema`.
- O mesmo `validateArcanarium()` valida **todas** as cartas, versões, referências estáticas de baralhos e sessões. Para `combat_match`, usa `validateMatch()` de `src/domain/duel/engine.ts` e verifica referências congeladas a `cardId + revision`, nomes e definições. Remover apenas os branches `combat` deixaria registros existentes inválidos e poderia inviabilizar leitura e restauração.
- `src/application/duels.ts` contém `DuelService`; `src/app/createApplication.ts` instancia `duels` no runtime. Serviços educativos separados: `ArcanariumService`, `ArcanariumWorkshop`, `ProvationsService`, `EducationalPacksService`, `CardExchange`.
- `src/application/arcanarium.ts` e `src/application/arcanariumWorkshop.ts` ainda possuem condicionais que separam baralhos/cartas de combate de conteúdo educativo. **Não** eliminar essas proteções enquanto o tipo legado puder existir.
- `src/infrastructure/database/arcanariumRepository.ts` lê as mesmas tabelas/índices para todas as modalidades, sem store separado para combate.

### Persistência efetiva

`src/infrastructure/database/schema.ts` define `DATABASE_VERSION = 19`. As tabelas relevantes, criadas a partir da v15 e ampliadas depois, são:

- `arcanariumCards` — carta atual;
- `arcanariumVersions` — revisões imutáveis por `[cardId+revision]`;
- `arcanariumDecks` — baralhos comuns/TCG;
- `studyCardLinks` — vínculo com Estudos;
- `knowledgeTags` — classificações;
- `cardSessions` — revisão, questões e combate;
- `cardMedia` — mídia de cartas/lembranças (v16);
- `educationalPacks` — pacotes de prova (v18).

**Não há tabela exclusiva chamada `duels`** no modelo encontrado. Um `clear()` ou remoção de uma store compartilhada apagaria também dados educativos. `src/infrastructure/database/database.ts` usa upgrades Dexie; não editar versões históricas nem inserir `.clear()` como forma de desinstalação do TCG.

### Backup: barreira obrigatória

1. `src/application/backup.ts`: `BACKUP_FORMAT_VERSION = 11`, limite de **10 MiB**. A restauração tem política `replace`, com opção de backup de segurança.
2. `src/infrastructure/backup/backupCodec.ts`: `inspect()` aceita os formatos **6 a 11**, verifica checksum da representação original e `validateBackupData()` faz **replay do duelo** (`replayDuel`, `validateMatch`) para sessões de combate, além de validar todo o Arcanário. Excluir o motor sem substituto validado quebrará esse caminho.
3. `src/domain/packBackup.ts`: `privateArcanarium()` exclui do backup os decks iniciais oficiais de `packId = "duelo-arcano-v1"` e cartas oficiais não referenciadas, mas **mantém cartas referenciadas por sessões ou baralhos**, versões e vínculos pessoais. Consequência: um backup pode possuir dados TCG legados **mesmo que a UI de duelo tenha sido aposentada**. Não contar com `ensureCatalogue()` para recompor o catálogo depois de removê-lo.
4. `src/infrastructure/backup/dexieBackupStore.ts`: `replace()` valida os dados, limpa **todas as stores participantes** dentro da transação e repõe as estruturas, depois promove flashcards legados e valida o conjunto. Um parser que rejeite `combat_match` antes de iniciar o replace impede a restauração; um descarte silencioso seria pior.
5. `src/application/cardExchange.ts`: troca autoral já restringe exportação/importação a `flashcard` e `memory`; **não** pressupor que esse exportador salva cartas autorais de combate. Se for necessária exportação/arquivo legado, projetar suporte explícito.

**Decisão técnica recomendada para B2:** manter a **compatibilidade de leitura/backup dos tipos antigos**, sem criação/jogabilidade nova. Isso **não** significa manter o duelo visível nem seu runtime gráfico; significa não romper o contrato de dados. Só mais tarde, mediante proposta específica e fixtures verdes, decidir se os validadores legados serão encapsulados num módulo pequeno de compatibilidade, migrados para um arquivo de arquivo morto ou substituídos por uma estratégia versionada de exportação.

**Não observado:** dados reais do dispositivo, frequência de partidas, quantidade de cartas autorais, backups pessoais ou eventual conteúdo de usuário. Nenhuma hipótese sobre o banco do Moto G06 pode substituir testes com dados sintéticos.

---

## CP3 — Mundo 3D, recursos visuais, código pesado e dependências indiretas

**Estado:** inventário estático concluído; performance física **não medida**.

### Mundo e portal

- `src/features/library/three/orbitalArena.ts` cria a lua/observatório selecionável; ID interno `portal:duelo-arcano`, texto da seleção **já** descreve o Portal do Arcanário. Usa `duelArtUrl("unwritten-book")` para a capa do grimório.
- `src/features/library/three/ThreeWorldRuntime.ts` importa `createOrbitalArena` **estaticamente**, adiciona a estrutura ao mundo composto e chama `this.orbital?.update(delta, reduced)` no loop normal. A integração está no mesmo scheduler do mundo, mas ainda possui objetos, textura e atualização.
- `src/pages.tsx` trata seleção de `portal:duelo-arcano` navegando para **`/arcanario`**, não para a arena. `src/features/library/WorldHost.tsx` oferece o botão acessível **Abrir Portal do Arcanário** usando o mesmo ID.
- `src/features/library/three/ThreeWorldInteraction.ts` contém tratamento especial do ID no destaque/volume; `src/features/library/three/worldPickBroadphase.ts` o reconhece; há testes em `ThreeWorldRuntime.d1.test.ts`, `WorldHost.test.tsx`, `orbitalArena.test.ts` e `pages.test.tsx`.
- **Recomendação preferencial (não decisão artística fechada):** preservar a lua como entrada ao Arcanário **educativo**, renomeando gradualmente o identificador sem quebrar picking, destaque ou acesso semântico; retirar a dependência de `duelArtUrl` se o ativo usado deixar de fazer parte do pacote. Alternativa: remover a lua por decisão explícita após avaliar UX/performance. Não simplesmente apagar `orbitalArena.ts`.

### Assets e árvore ativa

- UI/motor do TCG: `src/features/duel/` (incluindo `arena/`), `src/domain/duel/`, `src/application/duels.ts`, `src/features/duel/duel.css`, `src/features/duel/arena/arena.css`.
- Assets públicos: `public/assets/duel/painted/` contém **48 WebP**, somando cerca de **1,98 MB em arquivos-fonte**; `public/assets/duel/` possui também SVGs de cartas. Esses tamanhos **não** são medição de bundle nem de RAM.
- Fontes/artes de desenvolvimento: `assets/duel/source/`, `scripts/generate-duel-art.mjs`, `scripts/simulate-duels.mjs`. Arquivos históricos de arte são diferentes de runtime, mas ainda requerem decisão de manutenção/remoção.
- `src/features/arcanarium/ArcanaCard.tsx` importa o renderer `CombatCard` sem lazy; `Workshop.tsx` importa `CombatEditor` sem lazy. O `App.tsx` importa o CSS da arena no bundle global. Essas ligações impedem tratar a pasta `duel` inteira como exclusivamente lazy.
- `src/features/duel/DuelHall.tsx` dispara o semeio oficial apenas ao entrar na sala. Retirar essa sala deve parar novos semeios pelo fluxo inspecionado; executar busca global antes de afirmar que não resta outro chamador.

**Risco especial:** deixar a lua e remover toda a árvore `duelArt` faria falhar a textura do grimório. Remover sua seleção sem revisar `WorldHost`, `pages`, `ThreeWorldInteraction` e testes deixaria comportamento órfão. Avaliar a economia de renderização **depois** das mudanças, com medição no Moto G06.

---

## CP4 — Cobertura existente, lacunas e gates da retirada

**Estado:** inventário de testes encontrado; **não executado** neste trabalho.

### Suítes e evidências que precisam ser tratadas

| Grupo                  | Arquivos de referência                                                                                                                                                                                                               | Ação em B2                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Domínio e banco global | `src/domain/arcanarium.test.ts`, `src/infrastructure/database/arcanarium.test.ts`, `src/infrastructure/database/schema.test.ts`                                                                                                      | Preservar contratos, revisões e links                                                                                 |
| Combate legado         | `src/infrastructure/database/duels.test.ts`, testes em `src/domain/duel/`                                                                                                                                                            | **Não apagar todos**; converter parte em testes de compatibilidade/arquivo histórico                                  |
| Backups                | `src/infrastructure/backup/backup.test.ts`, `r4Integrity.test.ts`                                                                                                                                                                    | Adicionar fixtures v11 com TCG e restore antigo; manter checksum, replay/validação, rollback                          |
| Arcanário educacional  | `src/features/arcanarium/ArcanariumPage.test.tsx`, `e2e/bf56a-arcanarium.spec.ts`, `bf56b-workshop.spec.ts`, `bf56c-provations.spec.ts`, `bf56d-packs.spec.ts`, `bf57a-arcanarium-scroll.spec.ts`                                    | Gate de regressão obrigatório                                                                                         |
| Duelo/arena            | `e2e/bf56e-duel.spec.ts`, `bf56f-arena.spec.ts`                                                                                                                                                                                      | Atualizar/retirar **expectativas de jogo ativo** apenas após trocar por testes de ausência de duelo e compatibilidade |
| Mundo e navegação      | `e2e/bf56f-orbital-refinement.spec.ts`, `src/features/library/WorldHost.test.tsx`, `src/features/library/three/orbitalArena.test.ts`, `src/pages.test.tsx`, `src/app/interactionContinuity.test.ts`, `src/app/uiActionProbe.test.ts` | Reescrever expectativas de rota/rótulo, mantendo picking, Back, cortina e estado do mundo                             |

**Atenção:** o E2E `bf56f-orbital-refinement.spec.ts` valida explicitamente o link **Duelo Arcano** depois da ida pelo portal, então ficará legitimamente obsoleto; **substituir a asserção por conteúdo educacional do Portal**, não simplesmente pular todo o teste. A quantidade de arquivos encontrados não é resultado de execução. A BF-5.7A teve ressalvas anteriores de CI/E2E; não marcá-las como sanadas.

### Fixtures sintéticas obrigatórias antes de mexer nos schemas

- **F0:** instalação limpa, sem dados TCG; abrir Arcanário, criar/revisar flashcard e resolver questão.
- **F1:** dados mistos (flashcard vinculado a estudo, questão versionada com tentativa, memória com imagem, baralho comum e pacote marcado para restauração). Exportar, inspecionar e restaurar preservando vínculos.
- **F2:** carta `combat` **autoral**, deck `combat` e histórico `combat_match` válido com referências de revisão; fechar/reabrir banco, exportar/importar v11 e confirmar **retenção integral** sem exibição na nova UI.
- **F3:** catálogo oficial TCG parcialmente ou totalmente semeado, sessão histórica que referencia uma carta oficial e backup no formato v11; confirmar regra real de retenção de `privateArcanarium()` e não recriar automaticamente o catálogo após atualização.
- **F4:** amostras artificiais dos formatos v6, v7, v8, v9 e v10 já suportados, com checksums corretos e limites conhecidos; inspecionar/importar/reabrir sem conversão destrutiva. Construir dados sintéticos, **não** usar backup particular.
- **F5:** falha injetada no meio do `replace()` e entrada corrompida; verificar rejeição antes de escrita e rollback, preservando destino.

### Comandos indicados para execução LOCAL pelo agente (não executados por esta auditoria)

```bash
npm run lint
npm run typecheck
npm run build
npm run test:run -- src/domain/arcanarium.test.ts src/infrastructure/database/arcanarium.test.ts src/infrastructure/database/duels.test.ts src/infrastructure/backup/backup.test.ts src/infrastructure/backup/r4Integrity.test.ts src/features/arcanarium/ArcanariumPage.test.tsx src/pages.test.tsx src/features/library/WorldHost.test.tsx
npm run test:e2e -- e2e/bf56a-arcanarium.spec.ts e2e/bf56b-workshop.spec.ts e2e/bf56c-provations.spec.ts e2e/bf56d-packs.spec.ts e2e/bf57a-arcanarium-scroll.spec.ts
npm run packs:check
```

**Regra de evidência:** registrar comando, ambiente, commit, resultado PASS/FAIL/não executado e ressalvas; não somar rodadas sobrepostas como novos testes distintos. Com a cota de GitHub Actions esgotada, evitar disparos inúteis e usar testes locais; o gate físico requer relato do proprietário no Moto G06.

---

## CP5 — Política recomendada, ordem de execução e handoff B2 para Copilot

**Estado:** plano de segurança preparado; implementação e escolha final da política de retenção **pendentes**.

### Decisões já determinadas

- Produto: **retirar TCG, arena de duelo e cartas exclusivas da experiência ativa**. Continuar com flashcards, questões, pacotes educacionais e demais dados pessoais não abrangidos pela decisão.
- O armazenamento pertence ao usuário: **nenhuma exclusão silenciosa de registros históricos/autorais**. Descontinuação visual não é migração de dados.
- O Arcanário deve permanecer acessível por `/arcanario`; a lua orbital **já** aponta para ele. Reuso visual da lua é recomendação, não determinação de design final.
- O modelo de **cartas físicas** segue **B5 conceitual**. Não adicionar `type:"workout"`, tabelas, campos ou cálculos físicos durante B2.
- O conteúdo oficial ENEM/concursos segue planejamento da B4; não importar provas em B2.
- A BF-5.6 encerrada é histórica e **não** deve ser reescrita como se nunca tivesse existido.

### Política segura proposta — validar com o proprietário antes de descarte

**P1 (padrão preferido para B2):** manter tipos e registros TCG legados **somente para leitura e compatibilidade**; não expor em Acervo, Oficina, Baralhos, Portal nem permitir novos combates/semeio. Preservar importação de backups antigos e suas referências; criar uma via futura de visualização/exportação legada se necessário. **Nenhum dado físico é apagado.**

**P2 (etapa futura, NÃO autorizada agora):** elaborar proposta específica de arquivo/exportação e possível expurgo de cartas oficiais, mídias e sessões TCG com inventário por proprietário, confirmação e migração transacional; depois considerar retirar parsers legados se houver contrato versionado que ainda aceite backups históricos. Não pedir ao agente menor para improvisar P2.

### B2 — checkpoints mínimos de implementação (uma entrega verificável por vez)

**B2.0 — Preparação e fronteira:** conferir `git status`, `main` remoto e PR/documentos; ler `AGENTS.md`, este handoff e o plano BF-5.7B; abrir/usar branch de implementação **somente conforme orientação do proprietário**; anotar HEAD e testar baseline sem alterar schema.

**B2.1 — Travas de dados primeiro:** escrever testes sintéticos F0–F5, com destaque para backups v11 contendo carta/deck/sessão de combate e rollback. Não eliminar `combat` dos Zod schemas nem `replayDuel`; manter checks completos. Entregar pequeno commit/teste com evidências antes de qualquer remoção.

**B2.2 — Desligar entradas de duelo:** atualizar `ArcanariumPage.tsx`, `pages.tsx`, `Workshop.tsx`, `Decks.tsx` para remover caminhos de criação/jogo e redirecionar rotas antigas de duelo. Garantir que `DuelHall` deixe de ser montado e portanto `ensureCatalogue()` não rode pelo fluxo normal. **Não** remover ainda tabelas, cartas ou históricos.

**B2.3 — Proteger exibição educacional:** remover `combat` de filtros/resultados ativos de `Catalogue`, impedir detalhamento/edição por URL de IDs de combate e evitar contá-los em indicadores da experiência ativa. Desacoplar imports visuais `CombatCard`/`CombatEditor` quando não houver mais caminhos ativos; manter uma resposta acessível e inequívoca para links antigos. Não ocultar flashcards/questões/memórias, não reescrever seus históricos.

**B2.4 — Retirar fullscreen da arena e preservar o portal:** depois de B2.2/B2.3 verdes, revisar `App.tsx`, `arenaRoute.ts`, CSS, semântica de Back e dock. Se a lua for mantida, mudar apenas a identidade necessária para **Portal educativo**, sem refatorar todo o picking/Three; separar sua textura de `duelArtUrl`. Revisar `WorldHost`, `ThreeWorldRuntime`, `ThreeWorldInteraction`, `worldPickBroadphase` e testes. **Não** remover a lua sem aprovação artística.

**B2.5 — Redução de código/recursos de gameplay:** localizar consumidores restantes com `rg -n 'duel|combat|arena|portal:duelo-arcano' src e2e scripts`. Remover apenas módulos de interface e assets **comprovadamente sem uso**. Manter validadores, schemas, stores e a mínima lógica histórica exigida por backups; se `domain/duel/engine.ts` ainda for importado por `backupCodec.ts` ou `validateArcanarium`, **não apagá-lo**. Não alterar scripts/arte histórica só para reduzir contagem de arquivos.

**B2.6 — Gates e documentação:** executar lint/tipos/build/dirigidos/E2E; revisar Android retrato/paisagem, entrada pelo dock e portal lunar, rotas profundas antigas e restore. Atualizar documentação **vigente** com a decisão de descontinuação e anotar dívidas; manter relatórios BF-5.6 históricos. Abrir revisão, não fazer merge automático.

### Ordem de edição recomendada ao agente

| Prioridade                    | Pacote de arquivos                                                                                                                                                                      | Motivação                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 0 — não mexer antes de testes | `domain/arcanarium.ts`, `domain/duel/contracts.ts`, `domain/duel/engine.ts`, `infrastructure/backup/*`, `infrastructure/database/schema.ts`                                             | Contratos para dados antigos                       |
| 1 — baixa complexidade        | `features/arcanarium/ArcanariumPage.tsx`, `pages.tsx`                                                                                                                                   | Entradas e rotas de duelo                          |
| 2 — média                     | `features/arcanarium/Workshop.tsx`, `Decks.tsx`, `Catalogue.tsx`, `ArcanaCard.tsx`, `presentation.ts`                                                                                   | Criar, filtrar, mostrar e navegar cartas           |
| 3 — média/alta                | `App.tsx`, `features/duel/arena/arenaRoute.ts`, `features/library/three/orbitalArena.ts`, `ThreeWorldRuntime.ts`, `WorldHost.tsx`, `ThreeWorldInteraction.ts`, `worldPickBroadphase.ts` | Fullscreen, portal e seleção 3D                    |
| 4 — alta e condicional        | `app/createApplication.ts`, `application/duels.ts`, `features/duel/**`, assets/arte, testes de duelo                                                                                    | Corte de runtime sem romper validadores históricos |

### Instrução pronta para o Copilot executar somente B2.1

```text
Missão: BF-5.7B2.1 — travas de compatibilidade ANTES de retirar o TCG.
Leia AGENTS.md, docs/BF-5_7B_ARCANARIO_REFORMA_PLANO.md e
docs/BF-5_7B1_AUDITORIA_HANDOFF.md.
Não comece B2.2 nem altere código produtivo nesta missão.

1. Confirme o HEAD/base e o estado da branch; use apenas a branch de
   implementação autorizada, sem merge e sem acionar CI sem cota.
2. Inspecione os schemas atuais, backup v11, privateArcanarium(),
   validateArcanarium() e DexieBackupSnapshotStore.replace().
3. Escreva testes com dados sintéticos dos cenários F0–F5 (adapte apenas
   se houver contrato real que os torne incompatíveis; explique).
   Priorize F2 e F3: carta combat autoral, baralho combat, sessão
   combat_match válida, refs congeladas, export/inspect/restore.
4. Preserve os asserts de checksum, replay, referências, transação e
   rollback; não use banco ou backup real do proprietário.
5. Execute testes dirigidos/lint/typecheck e relate PASS, FAIL e
   não executado literalmente, com comandos e resultados. Não
   "conserte" incompatibilidade apagando dados ou relaxando Zod.
6. Faça commit/push rastreável e registre o gate. PARE após B2.1,
   aguarde revisão. Não remover cartas, duelos, assets ou schemas.
```

**Por que começar aqui:** um agente menor pode executar uma fatia verificável sem perseguir dezenas de referências de uma vez. Quando B2.1 estiver confiável, B2.2 terá um contrato de dados protegido e escopo visual limitado.

### Critérios de parada imediata

- Um backup v11 válido contendo `combat_match` deixa de passar em `inspect()`.
- Alguma versão de carta, `studyCardLink`, tentativa de questão ou mídia autoral some após restore.
- A solução exige `clear()`, `delete()`, `stores({ ...: null })` ou remoção de `combat`/replay de schema **sem** migração especificada e autorização.
- Uma rota de duelo antiga cai em página em branco, loop de redirect ou saída inesperada do app.
- Portal orbital deixa de ser selecionável, entra no duelo ou perde o comando de acessibilidade.
- Build/teste falha e a proposta é apenas excluir o teste ou enfraquecer assert; corrigir causa ou registrar bloqueio.
- Algoritmos de treino, pacotes ENEM/concursos ou RPG aparecem no diff de B2 sem autorização.

---

## Matriz de risco e conclusões

| Risco                                                       | Severidade  | Evidência / mitigação                                                                             |
| ----------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| Backup antigo rejeitado após remover `matchSchema`/engine   | **Crítico** | `backupCodec.ts` valida replay e `domain/arcanarium.ts` valida sessões; fixtures antes da remoção |
| Exclusão indireta de dados educacionais ao limpar tabelas   | **Crítico** | Stores compartilhadas entre modalidades; nenhuma exclusão geral permitida                         |
| Perda de cartas autorais TCG por supor exportação existente | **Alto**    | `cardExchange.ts` exporta só flashcards/memórias; retenção oculta até política explícita          |
| Recriação involuntária do catálogo TCG                      | **Médio**   | `DuelHall` chama `ensureCatalogue()`; não montar a sala nem deixar outra entrada                  |
| Portal lunar quebrado por remoção de arte/ID                | **Alto**    | `orbitalArena` usa `duelArtUrl` e ID em 3D/picking/WorldHost                                      |
| Contadores/listas mostram cartas aposentadas                | **Médio**   | `DexieArcanariumRepository.overview()` conta cartas/decks sem excluir combate                     |
| Links profundos `duelos/*` e testes anteriores quebrados    | **Médio**   | rotas declaradas e testes E2E de duelo/orbital                                                    |
| Suposta melhora de FPS ou APK sem medir                     | **Médio**   | código estático e tamanho de assets não são evidência de FPS/memória ou bundle final              |

**Parecer B1:** o projeto **está apto a iniciar B2.1 (testes preventivos)** mediante autorização específica. **Não está apto a uma exclusão em massa do TCG** nem à remoção imediata dos parsers de dados antigos. A arquitetura permite retirar a experiência ativa por camadas, mantendo funcionalidade educacional e compatibilidade. Não há evidência de execução de teste ou aceite físico desta auditoria.

## Continuidade / links

- [Plano de BF-5.7B](BF-5_7B_ARCANARIO_REFORMA_PLANO.md)
- [BF-5.6G — inventário e dívidas originais](BF-5_6G_AUDITORIA_CONSOLIDACAO_2026-11-11.md)
- [BF-5.6D — pacotes educacionais](BF-5_6D_PACOTES_OFICIAIS_IMPLEMENTACAO.md)
- [BF-5 Parte 2C — ficha viva](BF-5_PARTE2C_ATIVIDADE_FISICA.md)
- [BF-5.7A — fechamento](BF-5_7A_FECHAMENTO_2026-11-12.md)
- [ADR-020 — cartas globais](decisions/ADR-020-baralhos-e-cartas-globais.md)

**Próximo gate solicitado ao agente:** **B2.1, apenas testes preventivos de dados legados, e parada para revisão**.
