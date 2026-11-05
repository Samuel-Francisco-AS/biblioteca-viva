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
