# BF-5.5D — Saneamento e conclusão funcional candidata

Esta seção substitui as limitações funcionais da primeira candidata `72db7ff` descritas no histórico abaixo. PR existente #35, base `feat/bf-5-5c-night-lighting`; sem merge, gate físico ou encerramento da BF-5.5.

## Contratos e comportamento atuais

- Contrato `LivingScroll` extraído para `src/contracts/livingScroll.ts`. Aplicação projeta; renderer consome somente contrato neutro. Nenhuma exceção adicionada ao teste arquitetural, nenhuma dependência de Dexie/domínio no renderer.
- `scrollFlightRoutes.ts` deriva superfícies de mesas, armários, bancos e mesas de estar do layout. Valida corredores aéreos no mesmo cômodo contra AABBs de meshes/instâncias reais, com margem para o papel; no runtime inclui prédio, mobiliário, estantes, livros e registros. Rotas bloqueadas não são executadas. Não há voo entre cômodos nem contrato espacial persistido.
- Pergaminhos sobem, atravessam a 2,8 unidades, desaceleram e pousam em **outro móvel**. Destinos ocupados ou já em uso por outro voo são excluídos. Papel com bordas curvas, abertura, inclinação orgânica, orientação gradual e rastro histórico. Grupo Three e identificador permanecem os mesmos. Redução de movimento conclui a rota validada sem animação; pausa congela o tempo visual.
- Pergaminhos em voo não entram nos candidatos da agência. Leases impedem decolagem durante aproximação/manipulação. Retorno da âncora usa superfície de repouso atual, não uma origem antiga. Exclusão por snapshot elimina a árvore/recursos pelo ciclo existente de remount; descarte da agência libera leases antes de apagar tarefas.
- Episódios ambientais disparam reações alternadas: Samael/desconfiança e aura lilás, Aryn/restauração, Ytha/floral, Lua/entusiasmo desajeitado. Usam animações existentes; somente um personagem é elegível por episódio, com janela de 25 s para ficar livre. Trabalho, reservas, encontros, comandos manuais e diálogo não são interrompidos. Episódio consumido não se repete; ausência de espaço para magia usa gesto.
- Canvas e alternativa React usam `annotationKind`, `annotationId` e `from` na rota existente do registro. Fólio de livro e `RecordMemories` abrem a seção, escolhem a aba correta, focam e destacam o item canônico, com rolagem sem animação. Conteúdo removido mostra mensagem local. Nenhum texto pessoal foi adicionado à geometria, aos logs ou à telemetria.
- Seleção dos dez mais recentes, seis categorias convencionais, identidade, schema Dexie v14, backup v6 e dependências preservados. Atualização dos dados ocorre ao retornar à Biblioteca, sem inventar observador de mutações externas concorrentes.

## Reparos e evidências

A violação arquitetural está corrigida. A investigação de picking encontrou câmera incorreta **no teste de C e D**, corrigida sem mudar raycast nem relaxar assertivas. O handoff social/descarte agora libera leases explicitamente; a janela social exata não foi reproduzida nas duas configurações tentadas, limitação mantida na [auditoria](BF-5_5D_AUDITORIA_PRELIMINAR.md).

- Arquitetura dirigida: **6 PASS**.
- Integração da implementação final: **83 PASS em 8 arquivos**, incluindo contratos, agência, voo, Pointer Events no runtime, foco real no fólio, alvo removido e ligação React.
- Regressões A/B/C/WorldHost/repositórios: **47 PASS em 8 arquivos**.
- Complemento de descarte durante voo/transporte e recuperação: **6 PASS em 2 arquivos** (inclui testes já contados; não somar como casos únicos).
- `format:check`, lint, typecheck, build e `git diff --check`: **PASS**. Lint dirigido dos dois testes finais de descarte também PASS. Build mantém aviso conhecido de chunks >500 kB.
- E2E dirigido da luminária: **FAIL em uma tentativa, sem retries**. Após corrigir a câmera do teste, as assertivas de seleção e destaque `living:lamp` passaram; o teste avançou e falhou no feedback temporário “A luz revela uma estrela” (elemento ausente, timeout total de 30 s). Trace preservado localmente em `test-results`, não versionado. A causa dessa falha posterior permanece aberta; não é declarada falha de runner.
- O teste antigo de voo restrito à mesma superfície foi substituído por provas de trajetória contra o prédio real, pouso em móvel distinto, identidade, redução de movimento e exclusão em voo. Não houve relaxamento de assertivas da luminária nem do teste arquitetural.
- CI da candidata anterior: gate unitário FAIL por arquitetura (835 PASS / 1 FAIL reportados), já corrigido localmente. CI do novo HEAD deve ser acompanhada na PR #35; resultados locais não implicam CI global verde.

## Limites de aprovação

Ainda não há observação no Moto G06, TalkBack, avaliação artística ou benchmark físico. Os rigs continuam usando âncoras existentes; o teste de transporte não prova alinhamento anatômico perfeito das mãos. A navegação aérea é deliberadamente restrita a trajetos geometricamente validados entre móveis do mesmo cômodo; sem destino seguro, o pergaminho permanece disponível em repouso. Não houve teste de backup pessoal nem eliminação das dívidas #21–#24. Sem claim de CI global verde. E/F/G não iniciadas.

---

## Histórico da primeira candidata (72db7ff)


05/11/2026. Branch `feat/bf-5-5d-living-scrolls`, base C `8cc12c214f539089cb47566415a66376fa3305d9`. Sem merge, encerramento da BF-5.5 ou aceite artístico/físico. [Auditoria preliminar](BF-5_5D_AUDITORIA_PRELIMINAR.md).

## Implementação e contratos

- `application/livingScrolls.ts` projeta notas/citações reais dos registros book/study/movie/series. Não existe entidade autônoma de resumo; resumos escritos como notas seguem o contrato de nota. Trabalho/atividade física continuam intactos, mas não geram pergaminhos nesta fase.
- Seleção: atualização mais recente (`updatedAt`) decrescente, desempate por ID canônico tipado; deduplicação e limite de dez. IDs `scroll:note:<id>` / `scroll:quote:<id>` distinguem tipos e não se confundem com o segredo BF-4E. A projeção contém somente IDs, categoria, tipo e data; não copia texto nem título. Não escreve dados.
- `pages.tsx` consulta as portas de aplicação ao ativar Biblioteca e produz snapshot imutável. Criação/edição/exclusão nas rotas convencionais são refletidas ao voltar à Biblioteca. Snapshot alterado segue o remount existente do WorldHost; IDs canônicos sobrevivem, estado visual transitório não. Não há assinatura para mutações externas concorrentes enquanto a página permanece ativa.
- Toque seleciona o pergaminho e oferece link ao registro original; índice React oferece a mesma alternativa, inclusive no fallback. IDs removidos do snapshot não oferecem link. A navegação abre o fólio do registro, **não faz scroll/foco automático na anotação específica**. Exclusão concorrente posterior segue o tratamento de registro indisponível existente.
- `livingScrollVisuals.ts`: papel envelhecido, rolos, selo dourado e inscrições abstratas, expansão em voo e rastro. Um grupo selecionável por projeção; sem clones durante manipulação. Superfícies derivadas das mesas/armários existentes, afastadas dos volumes centrais e luminárias. Rotas locais entre dois pontos da mesma superfície, subida/descida suave; não há travessia entre cômodos.
- `ambientMagic.ts`: poeira arcana por ilhas de mobília, círculos e inscrições suspensas com envelope suave. Ciclo de encantamento de 90 segundos de tempo ativo, independente do relógio: 60 s discretos, 30 s de manifestação crescente/decrescente. Nenhuma alteração da autoridade de iluminação C ou do segredo BF-4E.
- Agência B permanece autoridade única: tarefas de pergaminho usam os mesmos leases e navegação, escolhidas entre rotinas livres, depois da prioridade do ritual noturno. Aproximação, orientação, pegar, carregar, colocar, recolher e devolver usam o ciclo existente. Deslocamento curto de 0,5 unidade somente quando validado; caso contrário exame no mesmo ponto. O objeto acompanha a âncora corporal, com interpolação. Não existe transporte entre móveis distante nem rig novo.
- Runtime atualiza tudo no RAF existente, exclui efeitos transitórios dos obstáculos estáticos e mantém recursos sob a árvore do prédio para descarte. Pausa não avança tempo visual; redução de movimento mantém repouso e manifestação discreta estática. Reabertura reconstrói pergaminhos em repouso; não persiste frames/leases. Falha/descarte elimina a árvore visual.

## Verificação executada

- Integração dirigida: **87 testes PASS em 12 arquivos**, incluindo agência real, exclusividade, voo/repouso/identidade, projeção, ligação React, continuidade A, iluminação C, repositórios/backup de checkpoints, WorldHost e runtime D1.
- Primeira rodada encontrou perda do congelamento do snapshot: reparada. Também houve erros no fixture novo (nome do construtor de livro e IDs/modo de ativação da agência), corrigidos sem remover asserts. Lint identificou `async` desnecessário nos mocks novos, corrigido.
- Typecheck e build: **PASS**, aviso conhecido de chunks >500 kB preservado.
- Formato/lint e E2E dirigido: resultados finais registrados abaixo após término.
- Não foram executados APK, Moto G06, TalkBack, teste de backup pessoal, performance física ou rodada E2E global. Schema Dexie v14, backup v6, dependências e configuração não mudaram. Testes de repositórios verificam backup fictício de checkpoints; não encerram dívida #21.

## Limites e pendências explícitas

A candidata não equivale ao aceite integral da direção artística. Abertura do papel é uma expansão simples; falta avaliação humana de materialidade, escala, rastro, legibilidade e impacto das manifestações. Movimentos corporais continuam limitados pelas âncoras/rigs existentes. Rotas locais e transporte curto não representam um sistema completo de circulação aérea entre móveis. Reações específicas dos quatro personagens a episódios mágicos ainda não foram adicionadas; a agência reage à interação física disponível.

O teste integrado novo exercita a agência e o objeto Three, mas usa uma âncora de teste: não comprova contato de mãos nos quatro GLBs. Picking dos novos pergaminhos precisa de E2E WebGL específico e avaliação física; teste React comprova resolução por identidade e ausência de link para seleção removida. Exclusão no meio do voo é tratada pelo descarte/remount do snapshot, sem teste novo E2E dessa transição. Atualização visual troca a cena como no contrato anterior, não reconcilia grupos individualmente entre snapshots.

CI B/C global FAIL permanece separada da D; sem atribuição ao runner. Dívidas #21–#24 e limitações da auditoria permanecem. Gate físico e refinamento artístico acumulados para BF-5.5G. E/F/G não implementadas.

## Resultado final local

- `format:check`, `lint`, `typecheck`, build e `git diff --check`: PASS. Rechecagem após ajustes finais de projeção/índice: 29 testes PASS; após congelar a posição reservada durante aproximação: três testes de voo/agência PASS.
- E2E dirigido `bf4-living.spec.ts`, “tocar a luminária”: **FAIL**, 1 teste, sem retries; esperava `living:lamp`, recebeu `living:table`, seguido por timeout de 30 s. Trace local preservado em `test-results` (ignorado pelo Git). Não classificado como falha de runner.
- Logs da CI C confirmam que **o mesmo cenário já falhava na base**, por timeout; não demonstram o mesmo erro de seleção, portanto a equivalência de causa não foi estabelecida. CI C: 31 PASS / 34 FAIL nos dois shards. A falha local permanece pendente de investigação.
- Revisão final incluiu os pergaminhos entre alvos ambientais prioritários do raycast (sem retirar prioridade de registros à mesma profundidade), congelou a posição de repouso durante reserva e excluiu poeira/inscrições do cálculo de obstáculos.
