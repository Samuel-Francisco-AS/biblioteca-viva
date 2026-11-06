# BF-5.5F — Resposta às sessões e ações reais

**Início da implementação:** 05/11/2026. **Estado:** candidata F1 + núcleo físico F2A (F2 parcial), **sem aceite final**, sem merge e sem avaliação física. Base: BF-5.5E (PR #36), dependente da stack BF-5.5A–D (PRs #32–35).

## F2A — Livro original em movimento (06/11/2026)

**Checkpoint funcional candidato; entrega F2 parcial.** O núcleo de leitura física e uma visita de leitura em pé estão implementados. Recolhimento nas mãos, deslocamento até assento e leitura sentada **não estão implementados**. F2B/F2C permanecem pendentes; nenhum gate G iniciado.

### Propriedade e percurso

- A ocorrência canônica `reading-book:<entryId>` é resolvida no mapa existente. O mesmo wrapper, meshes, representação, seleção e acesso ao registro sobrevivem à retirada/transporte/retorno. Não há clone, nova ocorrência nem confusão com `living:book`.
- `sessionBookVisuals.ts` assume exclusivamente a transformação do wrapper enquanto `sessionControlled` estiver ativo; a reconciliação de slots não disputa essa pose. A capa original ganha uma dobradiça procedural. O bloco de páginas permanece o mesmo: **não há animação de folhas individuais, dedos ou rig esquelético novo**.
- Retirada frontal mantendo orientação, elevação, rotação gradual, voo pelas passagens existentes, descida sobre a mesa de estar A (`bf4-prop:2`), abertura de capa e emissão âmbar discreta. A mesa é independente da disponibilidade dos habitantes.
- Cada segmento usa o volume varrido do livro, incluindo envelope conservador durante rotação, contra meshes/instâncias reais. A navegação aérea reaproveita pisos/passagens da navegação existente: não atravessa lacunas externas entre cômodos. Os quatro cantos do volume fechado precisam de apoio detectado por raycast. A abertura é verificada contra a geometria.
- Aro vazado: colisão do toro usa envelopes de arcos conservadores para preservar o vão central real. Corrigida também a consulta de segmento de comprimento zero, necessária para rotação no lugar; não lançar raio de direção nula.
- Habitantes são obstáculos dinâmicos para o livro; o envelope do livro próximo ao piso também entra na navegação dos habitantes. Sem trajeto/apoio livre, aguarda na origem com nova tentativa espaçada; não teletransporta nem reduz envelopes.

### Coordenação, pausa e recuperação

- Usa o **mesmo `InteractionCoordinator` da agência**: proprietário `session` reserva livro e superfície; a visita reserva `reader:<instanceId>`. Não existe segundo sistema de leases nem movimento de personagem fora da agência.
- Pergaminho repousando ou destinado à mesa impede a partida. O livro espera voos em curso; durante seu transporte novos voos de pergaminho aguardam. A reserva da mesa impede pouso concorrente até a devolução.
- Leitura tem prioridade sobre rotina casual. A seleção considera preferências de leitura, distância, disponibilidade, espaço e rota; protege diálogo, ação manual, encontros, recuperação, experimentos e manipulação já reservada. A visita usa o gesto `work` próprio do rig, orientada ao livro sobre a mesa. Não equivale a contato anatômico das mãos nem a sentar.
- Sessão pausada durante o voo termina o pouso seguro e fecha a capa; retomada reabre o mesmo volume. Conclusão reconhece imediatamente o fato confirmado, retira a oportunidade da agência, fecha a capa e percorre a rota inversa. Cancelamento em transporte reverte continuamente, sem callback tardio.
- `sessionId`/revisão rejeitam reaplicação obsoleta, incluindo sessão encerrada. Pausa de aba/background congela o tempo do runtime. Movimento reduzido não inicia voos; se ativado durante transporte, executa devolução contínua sem efeitos ornamentais adicionais.
- Descarte/WebGL perdido libera leases e restaura a pose de origem antes de descartar a árvore; reabertura consulta F1 novamente, sem persistir frames nem reservas. Exclusão/alteração do snapshot segue o lifecycle F1 de descarte/remontagem; troca técnica de representação de estante libera propriedade antes de reconciliar slots.
- Contrato F1, seis categorias, Dexie v14 e backup v6 preservados; nenhum texto adicional, consulta Dexie ou log pessoal no renderer.

### Evidências do checkpoint

- **81 testes PASS / 11 arquivos** na rodada dirigida: sessões de aplicação confirmadas em IndexedDB de teste → `SessionChanged` → página, referência estável de snapshot, conclusão em outra aba, WorldHost/Canvas residente, runtime real com renderer de teste, seleção/highlight, contexto perdido, três estantes reais, cancelamento/pausa/retomada/reabertura, indisponibilidade de NPC, movimento reduzido, navegação, leases e regressões de livros/pergaminhos/agência.
- Testes executam os estados intermediários, sem posicionar manualmente o livro no destino. Três partidas de estantes A/C/D e retornos completos usam o layout produtivo `LIBRARY_SHELVES`.
- Falhas de desenvolvimento corrigidas: fixture inicial usava posições legadas BF-2; mock de consulta final recebia string em vez de `{id}`; raio de comprimento zero no giro gerava falso bloqueio no runtime. A suposta obstrução lateral do teste legado **não é evidência de bloqueio no layout produtivo**.
- `npm run format:check`, `npm run lint`, `npm run typecheck` e `git diff --check`: **PASS**. Após o ajuste final que protege experimentos e libera leitor indisponível, o teste dirigido da agência passou novamente (1 PASS, já contado). Build/rodada ampla/CI da candidata serão registrados separadamente; sem presumir aprovação.
- WebGL real, inspeção artística, Moto G06 e TalkBack não foram validados por esses testes.

### CI de base e cadeia Git

Checkout inicialmente limpo na E; `fetch --prune origin`, criação da branch local rastreando F e atualização `--ff-only` confirmaram `9e5f51ef826799a340c82d907befbb58c08e7ac5`. PR #37 draft, base E `3ca9366`, preservadas.

CI F1 [42153944878](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42153944878): **estáticos/unitários/áudio/build/performance SUCCESS; E2E 31 PASS / 35 FAIL** (shard 1: 16/17; shard 2: 15/18). Logs incluem Canvas/UI, seleção/navegação, status ambíguo no ateliê e seletor inválido no backup. A main tinha 17/14 falhas por shard segundo o histórico fornecido; quantidade/nome coincidentes não provam a causa. Não foi demonstrado bloqueante de sessões F1 nesses logs; nenhuma auditoria geral ou relaxamento de asserts/timeouts foi feito.

A fundação F1 também existe na main por histórico independente. **Não houve merge/cherry-pick da main.** Na integração futura da stack, comparar os contratos/projeção F1 equivalentes e reconciliar o conteúdo preservando a cadeia #32–#37; essa nota não autoriza merge nem mudança de base.

### Pendências por checkpoint

- **F2A:** ampliar a encenação de leitura para recolhimento/anexação às mãos e assento, com contato e deslocamento comprovados; avaliar visualmente a abertura/ritmo do livro e os gestos. Não declarar a leitura sentada entregue.
- **F2B — não implementado:** cadeira com ocupação exclusiva, aproximação/sentar/escrever/levantar, estudo distinto, cancelamento e liberação.
- **F2C — não implementado:** respostas físicas próprias de trabalho/treino e atmosfera de entretenimento além do sinal F1. A bancada correta de trabalho é `bf4-prop:16`; o mapeamento F1 ainda aponta para a ilha de estar `bf4-prop:15`, pendência para F2C.
- **G — não iniciado:** aceite artístico/físico, ergonomia e fluidez no Moto G06 continuam reservados.

## F1 — Entrega direta

1. **Contrato neutro de sessão confirmada.** `src/contracts/worldSessionActivity.ts` contém exclusivamente `sessionId`, `entryId`, `entryType`, `instanceId`, `kind`, `status` e `revision`. Não recebe títulos, anotações, exercícios ou outros textos pessoais. Produzido por `projectWorldSessionActivity` somente a partir de `Session` persistida e do registro correspondente; sessão concluída, inexistente ou registro ausente/incompatível projetam `null`.
2. **Fundação independente na main.** A projeção e seus testes foram incorporados separadamente à `main`, sem puxar BF-5.5A–E para a branch principal. A branch F inclui o mesmo contrato/fonte para compilação sobre a base E e reconciliação posterior.
3. **Ponte de dados na Biblioteca.** `src/pages.tsx` busca a sessão aberta pela consulta existente, observa `SessionChanged` após persistência, refaz a projeção após retorno à Biblioteca e descarta resultados assíncronos obsoletos. Para uma mudança de sessão que não altera os registros, preserva a referência do snapshot do mundo para **não desmontar o Canvas e não perder autonomia/continuidade**.
4. **Runtime sem Dexie.** `WorldHost` passa a atividade confirmada ao runtime montado via método opcional `applyWorldSession`, inclusive na inicialização. Alterar a sessão não provoca reconstrução do renderer. O runtime recebe apenas o contrato mínimo, sem consultas a banco, callbacks de formulário ou cópias de registros.
5. **Resposta ambiental inicial.** `sessionWorldVisuals.ts` utiliza **o mesmo grupo 3D** para uma runa/luz discreta sobre uma peça de mobília existente por tipo: leitura, entretenimento, estudo, treino e trabalho. Ativa com sessão confirmada, enfraquece quando pausada, desaparece quando não há sessão. Não é selectable nem simula falsa posse do livro. Recursos fazem parte da árvore de cena e são liberados com ela.

## Testes e verificações

- Testes dirigidos de identidade canônica, ausência de conteúdo privado, sessão pausada, retomada, conclusão, entrada removida e distinção de estudos/trabalhos.
- Teste do sinal da sessão: todas as cinco categorias, reaplicação no mesmo grupo, mudança para pausa, desaparecimento e descarte.
- **CI e testes de integração permanecem obrigatórios.** Os resultados definitivos da candidata devem ser registrados pelo GitHub; não presumir PASS dos arquivos novos ou do aplicativo físico.
- A CI global da BF-5.5E anterior tinha gates estáticos/unitários/build PASS, com shards E2E FAIL em 18 e 19 cenários; consultar a causa por cenário antes de atribuir regressão à F. A limitação de Ytha na rota lateral do livro B continua documentada.

## F2 — Tarefas deliberadamente reservadas ao Codex

- **Leitura física do mesmo livro** `entryId`: decidir identidade e autoridade única do volume da estante, transporte até mesa/poltrona, abertura, brilho, seleção/picking, reserva/assento e retorno; não criar clone visual.
- **Estudo com habitantes:** prioridade de sessão real, ocupação segura da cadeira, sentar, consultar, escrever, levantar e cancelar sem furar reservas ou atravessar mobiliário.
- **Trabalho/treino:** manipulação dos equipamentos corretos, gestos característicos e reações dos quatro personagens sem falsa sessão, de acordo com os rigs atuais.
- **Entretenimento:** reação contextual (filme/série) sem inventar uma sessão não registrada.
- **Concorrência e recuperação:** duas atividades, pausa/retomada, exclusão de entrada, mudança de abas, reinício, WebGL indisponível, fallback semântico e gates E2E físicos dirigidos; preservar o contrato F1.

## Restrições

Não alterar Dexie, backup, schemas, identidades, material pessoal nem merge automático. A BF-5.5G continua responsável pela avaliação física/artística no Moto G06. Não declarar a BF-5.5F concluída até as ações físicas e suas provas de integração serem entregues.
