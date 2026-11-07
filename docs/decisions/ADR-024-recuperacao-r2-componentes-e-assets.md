# ADR-024 — Recuperação R2: componentes espaciais e assets de registros

- **Estado:** aceita para a implementação autorizada R2; aceite artístico/físico pendente.
- **Data:** 2026-11-06.
- **Complementa:** ADR-009/010/011/023; sem nova engine, persistência espacial ou promoção de fixture.
- **Evidências:** [plano e matriz dos 18 achados](../audits/BV_PLANO_RECUPERACAO_EXECUCAO.md).

## Contexto

Decoração detalhada inflava obstáculos/grafos; representações pessoais e sua articulação dependiam de detalhes das factories. O pedido explícito R2 autoriza separar componentes, reduzir trabalho de render e reformar os seis objetos de registro. R2A e R2B foram publicadas na PR draft #38 antes desta reforma; não há merge ou mudança de dados.

## Decisão

1. Volumes físicos, navegação, picking, apoios, manipulação e aproximação são canais locais independentes em `spatialComponents.ts`. Autorias atuais são boxes/compostos simplificados; decoração não cria volumes em roots convertidos. Mesh fallback permanece para fixtures/objetos não convertidos, não para conteúdo novo. Movimentos de folhas/gaveta reservam excursão máxima; ocupação temporária continua separada dos grafos estáticos por montagem/envelope. A agência continua autoridade única dos habitantes, com asas de Ytha intactas.
2. `RecordAsset` descreve tipo/identidade, assetId/factory, dimensões, pivot, escala de normalização, orientação, root visual, materiais, volumes e âncoras. `RECORD_ASSETS` é um registro de factories sem cache de recursos. IDs convencionais e wrappers selecionáveis não derivam do asset nem são substituídos com ele.
3. Substituição visual exige identidade e perfil físico compatíveis com o slot, root independente/desanexado e ownership local. Registros estáticos exigem o mesmo contrato navegável; outro perfil requer nova montagem/revisão física. Um livro em transporte rejeita troca até retornar. Não existem clones persistentes, schema ou tabela de assets.
4. Sessões consomem dimensões, brilho e capacidade de abertura/bounds da capa, sem conhecer variante procedural, nome de mesh ou hinge. A factory padrão mantém campos históricos de authoring, mas o consumidor usa `BookRecordAsset`. Isso permite um futuro adapter GLB compatível sem reescrever picking/sessão; não cria loader/rig genérico.
5. Peças estáticas dos registros são agrupadas por material; a encadernação repete geometrias por instancing em grupos fixo/articulado. Matrizes locais estáticas não são recalculadas a cada render; matrizes mundiais continuam seguindo parent. Geometrias/materiais pertencem ao mesmo owner e são descartados de modo deduplicado. Nenhum compartilhamento global entre registros removíveis.
6. A reforma usa pequenos assets nativos de código, originais e estilizados: códice iluminado, projetor de memória, receptor episódico, fólio de pesquisa, peso de treino com tapete, estojo de ofício. Mobília decorativa, estação de sessão e objeto pessoal continuam entidades distintas. Não há nova funcionalidade para usar ferramentas, operar o projetor ou treinar com o peso.

## Consequências e limites

Troca de aparência respeita identidade, organização, seleção Canvas/React e persistência existentes. Modificar ocupação física continua exigindo revisão do perfil; nenhuma abstração promete que um GLB arbitrário possui sockets/articulação corretos. ADR-010 permanece a autoridade para futuros assets GLB produtivos e R5 continua aberta. As fontes nativas são apropriadas para estas peças pequenas; Blender está disponível, mas não foi necessário produzir/importar GLBs nesta entrega. Isso não substitui eventual autoria adicional exigida pelo aceite humano.

Métricas de host e imagens do runtime completo demonstram redução de trabalho e mudança visual, não desempenho GPU/mobile, TalkBack ou aprovação artística. R3/R4/R5 e o gate Moto G06 permanecem abertos. Não declarar recuperação integral encerrada.

## Refinamento pós-R2 (06/11/2026)

O feedback físico do proprietário motivou o [saneamento focalizado](../audits/BV_SANEAMENTO_POS_R2.md): mesinha de estudos, estojo de ofício aberto, projetor emissivo e dois halteres em suporte substituem apenas as quatro aparências da candidata C. Revisões v2 conservam dimensões, perfil espacial, wrappers/IDs, ownership e batching; série/livro pessoal e stack preservados. Não altera as decisões acima nem inicia R3/R4/R5. Correção do Livro da Estrela elimina disputa de pose entre transporte e animação; é bugfix do controlador existente, sem reescrever a agência. Próximo gate recomendado é novo teste Moto G06; recuperação integral aberta.
