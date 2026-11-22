# Modelo de dados — estado vigente e contratos históricos

> **Estado vigente — 22/11/2026:** Dexie v19 permanece como versão do banco ativo. O formato de backup atual é v12 educativo, preservando os dados do Arcanário e rejeitando explicitamente payloads TCG antigos/incompatíveis. O Duelo Arcano/TCG foi removido do produto ativo; não há tabelas/sessões de combate como contrato vigente. Não inferir downgrade, limpeza automática ou migração destrutiva. A identidade isolada `biblioteca-viva-bf57` foi estabelecida na trilha BF-5.7B; a retirada do TCG não autoriza apagar outros bancos/backups do usuário.
>
> **Como ler este arquivo:** as descrições das migrações Dexie v15–v18 e dos formatos de backup v7–v11 abaixo registram a evolução histórica das entregas BF-5.6. O detalhamento de `content.combat`, `deck.combat`, `combat_match` e backup v11 descreve o antigo TCG e está retirado, não devendo orientar novas gravações. Os contratos educativos que continuam no produto devem ser conferidos contra os tipos, migrações, codecs e testes presentes na `main`; este resumo não substitui inspeção do código.
>
> BF-5.7 permanece aberta. A–B concluídas/encerradas com ressalvas; C planejada, não iniciada; D–H não iniciadas. [Issue #50](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/50) · [reconciliação BF-5.7B](BF-5_7B_RECONCILIACAO_2026-11-22.md)

---

> **F2 — 09/11/2026:** evolução apenas de apresentação; Dexie v19, backup v11 e snapshots/replay E permanecem inalterados, sem dados espaciais ou migração. [ADR-030](decisions/ADR-030-arena-viva-apresentacao-lifecycle.md).

## BF-5.6E — Dexie v19 / backup v11 (candidata)

V19 mantém integralmente tabelas/índices v18 e grava apenas o marcador de schema. `content.combat?` v1 fornece tipo (criatura/feitiço/artefato), afinidade, custo, atributos exclusivos de criatura, palavras-chave, até duas habilidades com até dois efeitos tipados, flavor e artId seguro. `attributes/effects` reservados da A continuam legíveis; novas cartas executáveis usam o catálogo tipado, sem scripts. `deck.combat?` v1 guarda modo, afinidade e contagens por identidade da seleção estática, sem duplicar cartas. `combat_match.duel?` fotografa os dois decks e suas revisões, instâncias, mãos/ordem/campo/cemitério, recursos/vida/fadiga, turno/fase principal, PRNG, efeitos/durações, comandos/eventos e resultado. Placeholders antigos não ganham resultados inventados.

Backup v11 importa originais v6–v10, conferindo checksum antes de transformação. Retém cartas pessoais, decks pessoais e partidas completas; omite decks iniciais e cartas oficiais reinstaláveis sem referência pessoal. Cadeias referenciadas por deck/sessão são compartilhadas; snapshots preservam interpretação após edição/arquivamento. Artes públicas não entram no envelope. Grafo e replay são conferidos. Limite de 10 MiB bloqueia explicitamente excesso sem apagar/truncar dados. Replace protegido, rollback e ausência de downgrade preservados. [Contrato v1](decisions/ADR-029-duelo-arcano-regulamento.md).

> **BF-5.6D — candidata em implementação (09/11/2026):** execução D1/D2/D3 autorizada; Dexie v18 aditivo e backup v10 (importa v6–v9, 10 MiB). [Contrato e resultados](BF-5_6D_PACOTES_OFICIAIS_IMPLEMENTACAO.md). A+B+C integradas com gate parcial, reparos físicos pendentes; sem merge D, encerramento BF-5.6 ou E–G. Notas abaixo são cronologia.

## BF-5.6D — contrato executável

V18 mantém as 17 tabelas v17 e acrescenta `educationalPacks` (`&id,status`): manifesto v1, lotes/hashes/bytes/contagens, assurance de origem e itens com identidade/revisão/fingerprint. Disponibilidade é separada de `archived`; remover não cria revisão nem apaga respostas. Revisões locais são integralmente retidas nesta candidata, com custo explicitado. Questões recebem estado editorial opcional (válida/anulada/sem chave), natureza do gabarito e fontes/canonicalId/equivalências explícitas; gabarito ausente só é admitido para estado não corrigível. Filtros v2 recebem `packId?`; contrato v1 continua legível. Manifesto inclui esperado/publicado, completude, direitos e variantes.

Backup v10 conserva dados privados, registros de pacotes e cadeias das cartas públicas referenciadas por sessões/decks estáticos, sem copiar todo catálogo. Pacotes ativos restauram como `restore-required`; removidos continuam removidos. Arquivos públicos/CacheStorage não entram no envelope. V6–v9 originais são conferidos antes de transformação. 10 MiB/rollback/replace protegido e ausência de downgrade permanecem. [ADR-028](decisions/ADR-028-pacotes-educacionais-retencao.md).

## BF-5.6C — Dexie v17, backup v9 (candidata)

V17 mantém tabelas/índices v16 e atualiza somente o marcador. Questão recebe identificação, dificuldade e proveniência opcionais, sem modificar versões antigas. Critérios dinâmicos v1 continuam executáveis; v2 acrescenta filtros reais. `question_session.trial?` v1 guarda estado, revisão concorrente, posição, respostas/correções e snapshot de taxonomia. As referências fixadas de questões preservam alternativas e gabarito. Placeholders antigos sem trial não ganham resultados. Backup v9 inclui esses contratos, importa originais v6/v7/v8, mantém checksum/10 MiB/replace e rollback. Sem downgrade. Troca autoral v1 continua Ecos/lembranças; relatório JSON v1/CSV é exportação distinta do backup. [ADR-027](decisions/ADR-027-provacao-taxonomia-diagnostico.md).

## BF-5.6B — Dexie v16, backup v8 (candidata)

Upgrade aditivo v15→v16: `cardMedia` (`&id,cardId`) contém imagens JPEG locais pertencentes a cartas de lembrança; `media` de capas permanece independente. Conteúdo opcional versionado: aparência (tema/moldura), título do flashcard, categoria e `imageId` da lembrança. Bytes fora das cartas/settings, retidos enquanto qualquer revisão os referencia. Referências a registros são opcionais e toleram exclusão da origem. Backup v8 inclui `cardMedia`, continua importando originais v6/v7 e mantém 10 MiB/replace protegido. Troca autoral v1 é cópia de conteúdo atual/revisão fixada com novos IDs, sem histórico/vínculos privados. [ADR-026](decisions/ADR-026-arcanario-oficina-midias-troca.md). Contratos anteriores abaixo são históricos.

## BF-5.6A — contrato da candidata (08/11/2026)

Dexie **v15 aditiva** preserva as dez tabelas v14 e acrescenta:

| Tabela | Chave e índices | Conteúdo |
| --- | --- | --- |
| `arcanariumCards` | `&id,type` | Estado atual das quatro famílias, origem, revisão e arquivamento |
| `arcanariumVersions` | `&[cardId+revision],cardId` | Versões completas imutáveis |
| `arcanariumDecks` | `&id` | Agregado com referências estáticas ordenadas ou critérios dinâmicos v1 |
| `studyCardLinks` | `&[studyId+legacyCardId],studyId,cardId` | Mapa durável, ordem e vínculo ativo/tombstone |
| `knowledgeTags` | `&id,namespace` | Classificação editorial/pessoal, níveis, sinônimos e relações |
| `cardSessions` | `&id,kind,startedAt` | Revisões e respostas; contratos distintos para questões/partidas |

`StudyEntry.flashCards` físico é arquivo legado preservado, sem novas edições. Na leitura pela porta, o mesmo campo é uma projeção do acervo global, com `globalCardId` e `revision`; não é regravado no Estudo. Exclusão do Estudo/vínculo preserva cartas e histórico. Revisão guarda IDs/versões/ordem; progresso deriva das respostas. Sem histórico anterior inventado, sem agenda espaçada ou retomada automática de rodada.

Backup vigente **v7**, `data.arcanarium` estrito, grafo e versões validados; importa **v6** original, promovendo cartas durante o restore mesmo após o upgrade. SHA-256, replace protegido e 10 MiB mantidos. Sem conteúdo oficial/mídia nova automático, sem downgrade. [ADR-025](decisions/ADR-025-arcanario-fundacao-persistencia.md) · [relatório](BF-5_6A_FUNDACAO_IMPLEMENTACAO.md). Contratos anteriores abaixo são baselines históricos.

> **R4 — candidata de 07/11/2026:** main base `d5eb469` integra PRs #32–#38 e aceites físicos dirigidos R2/R3/segurança. R4A–D implementadas na PR draft #39; gates estáticos, 935 unitários, web e APK debug locais PASS. Dados/sessões separados, diagnóstico opt-in e integridade v6 reforçada. Playwright dirigido **3 PASS/1 FAIL** (seleção R2 por deadline, causa não atribuída); sem aprovação física R4 ou CI global verde. [Autoridade canônica e evidências](audits/BV_RECUPERACAO_R4.md). BF-5.5 parcial; R5, F2B/F2C e BF-5.5G não iniciadas. Notas anteriores são cronologia.

## BF-5 Parte 2F — contrato vigente

Dexie **v14**, mesmas dez tabelas/índices v13, marcador atualizado sem reescrever dados. `WorkEntry` mantém `work` e IDs, com metadados opcionais e `plan?` limitado: etapas/tarefas/diário/seleção explícita de próxima tarefa. IDs internos estáveis, ordem em arrays e revisão do agregado; comandos exigem revisão esperada e relêem/gravam em transação, eventos pós-commit. Ownership e duplicatas validados estritamente. Excluir etapa preserva tarefas; excluir proprietário elimina o conjunto e dependentes anteriores. Sessões/notas/mídia e projeção 3D preservadas. Perfil `physical.profile.v1` aceita peso/gênero/preferência visual opcionais; apenas peso entra em MET. Avaliações continuam `BookEntry.rating` / `catalog.rating` inteiras 1–5, sem campo novo.

Backup permanece **v6**, com mesmo envelope/checksum, restore protegido e limite de 10 MiB; valida novos campos opcionais pelo schema compartilhado e importa v6 antigo sem alteração de checksum. Downgrade não suportado. [ADR-021: escolha do agregado, limites e invariantes](decisions/ADR-021-empreitadas-atlas-avaliacoes.md). Contratos anteriores abaixo são baselines precedentes.

# BF-5 Parte 2E — capas generalizadas (2026-11-04)

Dexie **v13 aditiva**, mesmas dez tabelas/índices v12, apenas marcador atualizado. `RecordImage` / `RecordImagesPort` ampliam ownership de `media: &entryId` para Livro, Filme e Série; aliases anteriores de poster preservados. Uma imagem JPEG local normalizada por registro, fora do domínio e das projeções 3D. Limites da Parte 2D mantidos: fonte JPEG/PNG até 10 MiB/24 MP, resultado até 1600 px e 350.000 caracteres; dimensões/cabeçalho estritos. Backup **v6** mantém mídia opcional, checksum, ownership e restore atômico, agora incluindo livros. Sem originais, fundos efêmeros ou PNGs do ateliê; limite global 10 MiB pode recusar muitas capas. V6 antigo sem mídia restaura sem capas; downgrade não suportado. [ADR-019](decisions/ADR-019-controles-internos-capas-atelie.md) · [contrato e validação](BF-5_PARTE2E_CONTROLES_CAPAS_ATELIE.md).

Flashcards seguem embutidos no estudo. A [ADR-020](decisions/ADR-020-baralhos-e-cartas-globais.md) recomenda a evolução global futura, sem tabelas ou migração de cartas nesta entrega. Contratos v12 e anteriores abaixo são baselines precedentes.

# BF-5 Parte 2D — contrato aditivo vigente (2026-11-04)

Dexie **v12** preserva v11 e adiciona `media: &entryId` (uma imagem JPEG normalizada/limitada por obra); nove tabelas anteriores intocadas. `MovieEntry.catalog?` e `SeriesEntry.catalog?` guardam classificação, desejos, intenção, estreia/data assistida civis, gênero/ano/avaliação e temporadas opcionais. `movie`/`series`, sessões, IDs, revisões e seis projeções mantidos. Backup **v6**, com `data.media?` opcional e estrito, checksum/ownership/restore atômico; v6 antigo sem mídia continua aceito. Originais, fundos temporários e banners não entram no backup. [Campos, limites e compatibilidade](BF-5_PARTE2D_ENTRETENIMENTO.md) · [ADR-018](decisions/ADR-018-entretenimento-catalogo-midia-local.md). Notas v11 e anteriores abaixo descrevem os baselines precedentes.

# BF-5 Parte 2C — contrato vigente de Atividade Física (2026-11-04)

Dexie **v11 aditiva**, mesmas tabelas/índices v10; upgrade só atualiza marcador. `PhysicalActivityEntry.schedule?` guarda datas civis inclusivas e dias da semana; `workoutDays?` guarda uma execução por data com snapshots-base, grupos reais séries × alvo, unidade, check, duração/intensidade/nota e estimativa opcionais. Categoria aditiva `resistance`; categorias antigas preservadas. Perfil global opcional/removível em `settings[physical.profile.v1]`, somente peso. Backup **v6** conserva envelope/checksum, aceita campos opcionais e valida perfil estritamente. Reabertura/upgrade/round-trip/restore incluem contratos novos e antigos. Aplicativo antigo não suporta downgrade. [Modelagem completa, limites e método](BF-5_PARTE2C_ATIVIDADE_FISICA.md) · [ADR-017](decisions/ADR-017-ficha-viva-e-estimativa-local.md). Sessões antigas não são reinterpretadas em checks; dados de Estudo v10 mantidos.

## BF-5 Parte 2B — contrato aditivo vigente

Dexie **v10**, mesmas tabelas e índices da v9, upgrade sem reescrever linhas. Estudo recebe `flashCards?: readonly {id, front, back}[]` e `studyTimeBaselineSeconds?: number`; sessão de estudo recebe `focusDurationSeconds?: number`. Campos opcionais, com validação estrita, sem mudança da versão do pacote. Backup **v6** inclui esses campos no envelope existente e mantém aceitação dos backups anteriores. Não há downgrade garantido para APK antigo. Baseline preserva tempo anterior ausente do histórico; acumulado soma baseline e segundos das sessões concluídas. Metas mantêm minutos/sessões e saturam no total. [ADR-016: limites, compatibilidade e fórmulas](decisions/ADR-016-estudo-folio-pomodoro-cartas.md). Seções v8/v9 abaixo descrevem os baselines anteriores.

# Modelo de dados

## BF-5R5 — evolução aditiva vigente

Dexie **v9** mantém as nove tabelas e índices v8. O upgrade v8→v9 só atualiza o marcador; não limpa dados. `PhysicalActivityEntry.exercises?` e `PhysicalActivitySession.exercises?` contêm uma lista estrita de exercícios (nome; séries, repetições, kg, segundos e observação opcionais). O comando de sessão captura a ficha atual; edições futuras não reescrevem execuções anteriores. A lista pode ser vazia e continua opcional para registros antigos. Sessões manuais/editadas aceitam duração zero para tempo não informado; não se atribui duração fictícia.

Backup continua **v6** com campos opcionais estritamente validados, checksum e fluxo protegido existentes. V6 de banco v8 continua válido. Aplicativos antigos não entendem novos campos; não assumir importação para versão anterior. A versão de pacote/APK não mudou. Sem dados espaciais novos. [ADR-015](decisions/ADR-015-bf5r5-residencia-e-fichas.md). A seção v8 abaixo descreve o baseline anterior.


## Dados convencionais

`LibraryEntry` é uma união discriminada de Livro, Filme, Série, Estudo, Atividade física e Trabalho. Notas e citações referenciam registros; etiquetas e favoritos organizam conteúdo; sessões registram duração e resultados; atividades sustentam histórico; settings guardam preferências.

O schema Dexie v8 possui:

```text
libraryEntries
notes
quotes
activities
tags
sessions
settings
metadata
milestones
```

A migração v7→v8 remove as tabelas espaciais antigas e limpa todos os dados de desenvolvimento anteriores. Novos dados criados em v8 persistem normalmente após fechamento e reabertura.

Marcos guardam apenas dez fatos convencionais, sem rewards, grants, decoração, diálogo ou efeito no mundo.

## Mundo

Nenhum estado espacial é persistido: `PlacedObject` e `WorldStructureState` não existem no schema ativo. O novo contrato espacial será projetado do zero em trabalho futuro.

## Backup

O formato vigente é v6. Ele inclui somente dados convencionais, usa política de substituição, validação estrita, limite de tamanho, detecção de duplicatas e checksum SHA-256 sobre representação canônica. Restore revalida e escreve em transação; backup de segurança continua disponível para destino preenchido.

Backups v1–v5 são deliberadamente incompatíveis com o baseline pós-reset e são rejeitados antes de qualquer escrita.
