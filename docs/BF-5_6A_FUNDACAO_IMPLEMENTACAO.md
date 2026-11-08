# BF-5.6A — Fundação e arquitetura de dados do Arcanário

Data: 08/11/2026. **Candidata para auditoria e validação física; A não concluída/aprovada.** Branch `feat/bf-5-6a-arcanario-foundation`, base `origin/main` **5aab64c**. Checkout inicial limpo. Main já integrava BF-5.5F2 (#41, merge `9c471e0`) e G/fechamento (#42, merge `128218f`). Sem merge, release, alteração da versão do aplicativo ou início de B–G/BF-6/BF-7.

## Entrega e arquitetura

Núcleo global funcional com quatro famílias semânticas discriminadas: flashcard (frente/verso), question (enunciado/alternativas/gabarito/explicação/classificação/origem de prova), memory (texto e referências opcionais a registros) e combat (atributos e referências estruturadas de efeitos). Não há bytes de imagens, scripts de usuário ou renderer no domínio. Questões, combate e pacotes têm contratos, sem renderização própria, correção, instalador ou motor antecipados.

- `domain/arcanarium.ts`: schemas/invariantes puros, revisão de carta e validação do grafo. Histórico exige sequência de revisões, mesma identidade/tipo/origem/data de criação e cronologia coerente.
- `application/arcanariumPort.ts` / `arcanarium.ts`: porta e serviço de criação/consulta/edição/arquivamento de cartas, consulta de versões, gestão de baralhos/classificação, início/resposta de revisão e progresso derivado. Transações e revisão esperada protegem alterações globais.
- `infrastructure/database/arcanariumRepository.ts`: validações na leitura/escrita Dexie. `promoteLegacyFlashCards.ts` é compartilhado pelo upgrade e restore.
- `DexieLibraryEntryRepository`: lê Estudo e vínculos/cartas em transação; entrega projeção compatível ao fólio. Comandos existentes foram adaptados, sem novo editor ou estilo/animação de Estudos.
- Eventos de alteração de Estudos são publicados somente após commit confirmado, inclusive quando uma carta é editada pelo serviço global. Nenhum componente React importa Dexie.

## Persistência efetiva

Dexie **v14 → v15**, adição de seis tabelas; as dez tabelas/índices anteriores permanecem:

| Tabela | Chave/índices | Responsabilidade |
| --- | --- | --- |
| `arcanariumCards` | `&id,type` | Estado atual, conteúdo, origem, revisão, arquivamento |
| `arcanariumVersions` | `&[cardId+revision],cardId` | Snapshots completos imutáveis, adicionados com `add` |
| `arcanariumDecks` | `&id` | Seleção estática ordenada ou critérios dinâmicos versionados |
| `studyCardLinks` | `&[studyId+legacyCardId],studyId,cardId` | Mapa persistente, posição e tombstone |
| `knowledgeTags` | `&id,namespace` | Taxonomia mínima, sem seed fictício |
| `cardSessions` | `&id,kind,startedAt` | Sessões e respostas de revisão; contratos futuros distintos |

Baralhos estáticos guardam referências em array ordenado: o par `(deckId, cardId)` identifica a associação, sem duplicatas. Revisão opcional fixa conteúdo; referência sem revisão acompanha a atual. Alterar ordem/associações exige revisão do agregado. Excluir baralho preserva cartas. Baralhos dinâmicos guardam critérios v1 por tipos e tags, sem executar filtros.

Tags editoriais distinguem área, disciplina, assunto, subassunto e habilidade, com hierarquia validada, sinônimos e relações. Etiquetas pessoais têm namespace próprio. Questões aceitam várias tags, assunto principal e classificações secundárias; ENEM/prova, ano, banca, instituição e caderno ficam em metadados separados. Não há catálogo grande, diagnóstico ou editor de questões.

Sessões usam referências imutáveis de ID/revisão na ordem efetivamente apresentada. Respostas de flashcard são sequenciais, com timestamp; posição esperada impede resposta duplicada. Progresso é uma consulta derivada, sem projeção duplicada. As versões conservam textos vistos após edição/arquivamento; o deck atual não é necessário para interpretar o histórico. Sessões de questões/TCG são contratos separados, ainda sem execução/resultados de seus motores.

## Migração e fonte canônica

1. Validar os registros anteriores sem regravá-los; para cada carta, considerar a chave composta `(studyId, legacyCardId)`.
2. Criar ID determinístico `study-flashcard:` + par JSON. A codificação distingue IDs coincidentes de Estudos diferentes; o namespace `local:` é reservado às novas cartas. Colisão aborta sem sobrescrever.
3. Adicionar carta, versão 1 e mapa/posição na mesma transação. Preservar frente/verso integrais (inclusive espaços e quebras), IDs e todos os outros campos do Estudo.
4. Não reprocessar mapa existente, mesmo inativo. Rollback aborta o upgrade inteiro; reabertura/reexecução não duplicam.
5. Reutilizar a promoção dentro da transação de restore de v6, mesmo em banco já v15. Não depende de novo upgrade.

Após o corte, o arquivo físico `StudyEntry.flashCards` permanece **imutável**, sem dual-write. Leituras pela porta projetam o acervo global naquele campo, conservando o alias legado e acrescentando ID global/revisão. Save geral de Estudo conserva o arquivo físico original e ignora a projeção como fonte de escrita. Novas cartas não são embutidas. Save/DeleteFlashCard alteram somente carta/vínculo global e metadados do Estudo.

A tela captura revisão ao começar uma edição e mantém rascunho diante de erro/conflito. Chamadas legadas sem revisão continuam aceitas e serializadas; a proteção contra edição de uma versão já lida é garantida quando o chamador envia a revisão, como faz o fólio. Consultas/comandos globais estão no composition root para a futura interface, sem nova rota nesta etapa.

O arquivo antigo não tem limpeza programada. Removê-lo exige migração posterior autorizada e evidência de recuperação/compatibilidade. Não existe downgrade para APK antigo; não resolver problemas instalando versão anterior sobre banco v15.

## Exclusão e integridade

- **Retirar carta no fólio:** desativa vínculo; a confirmação informa que o acervo global é preservado. Tombstone impede retorno do texto antigo durante restore/promoção.
- **Excluir Estudo:** desativa seus vínculos, remove registro/dependentes convencionais conforme política anterior e preserva carta, proveniência histórica, versões, decks e revisões.
- **Excluir baralho:** remove somente agregado/associações. **Arquivar carta global:** nova revisão, ocultação na projeção de Estudos; nenhum hard delete de versões/histórico.
- Referências estáticas, revisões, tags/classificação, vínculos ativos e tipos de cartas das revisões são validados. Origem histórica e vínculo inativo podem apontar para Estudo ausente. Referência opcional de lembrança não é ownership do registro.
- Nenhum histórico anterior de flashcard é inventado: a implementação antiga mantinha escolhas apenas em memória.

## Backup e restauração

Formato **v7**, `data.arcanarium` obrigatório na exportação nova: cartas, versões, baralhos, mapas/vínculos (inclusive inativos), classificações e sessões/respostas. Contagens de cartas/baralhos/revisões aparecem na confirmação de restore. A detecção de destino preenchido também considera dados exclusivos do Arcanário.

V6 original continua aceito com SHA-256 sobre o envelope antigo, antes de qualquer transformação. V1–v5 continuam incompatíveis. Validação estrita, detecção de duplicatas e vínculos, checksum canônico, replace protegido, opção de backup de segurança e escrita atômica foram preservados. O adaptador revalida o grafo antes de substituir; promoção e validação final ocorrem na mesma transação, revertendo também falha após clear. V7 com mapa legado ausente é rejeitado, evitando promoção indevida do arquivo antigo.

Limite de **10 MiB mantido**. Versões e arquivo legado consomem espaço deliberadamente; excesso falha explicitamente, sem truncar histórico ou descartar mídia. Nenhum pacote oficial, catálogo ou mídia pública é instalado/exportado automaticamente pela A. Instalação, separação operacional de acervo público reinstalável, conteúdo indisponível e escala de pacotes pertencem à D e precisam de seus próprios contratos/testes. Nenhum backup pessoal real foi usado.

## Verificação e resultados

| Execução | Resultado e interpretação |
| --- | --- |
| Domínio + integração nova + comandos/componente | **16 PASS / 4 arquivos** na rodada corrigida |
| Regressão da área (Dexie, backup, aplicação, composição, componente e Ajustes) | **112 PASS / 21 arquivos** |
| Regressão final da integridade de mapas/restore | **44 PASS / 5 arquivos** após a correção adicional |
| Vitest amplo, única rodada | **1064 PASS / 3 FAIL / 1067 casos, 166 arquivos**. Dois FAIL eram fixtures novas (código de erro esperado e normalização de v6 fictício), corrigidos e comprovados nas rodadas dirigidas. O terceiro é timeout de 5 s do envelope de Ytha, já observado na BF-5.5. |
| Animador isolado, sem alterar código/timeout/asserts | **13 PASS / 1 arquivo**. Não converte a rodada ampla em PASS nem certifica CI global. |
| E2E Estudos + fonte global | **3 PASS**, sem retry: foco/reload, criação/edição/flip/layout, persistência canônica/versões/respostas/retirada após reload |
| E2E de backup web/base vazia | **2 PASS**, sem retry: download real, rejeição de JSON inválido, restore protegido em destino preenchido, restore vazio e reabertura |
| `format:check`, `lint`, `typecheck` finais | **PASS** |
| Build, relatório de build/performance, Android sync/debug finais | **PASS**. Relatório é inventário do build, não medição física. Warning de chunks grandes permanece; sem otimização/alteração 3D. |
| `audio:check`, `git diff --check` | **PASS** |

Cobertura nova: banco v14 vazio, seis tipos intactos, vários flashcards, IDs legados coincidentes, bytes do conteúdo, reabertura/reexecução, upgrade inválido com rollback e recuperação, interrupção transacional, fonte única através das duas APIs, revisão obsoleta, múltiplos decks e ordenação, referências inexistentes, exclusão da origem/baralho, snapshots de revisão, respostas duplicadas, round-trip v7 em destino vazio/preenchido com proteção, v6 checksummado promovido após upgrade, mapa ausente, checksum inválido e falha injetada após clear.

Unitários puros (`domain/arcanarium.test.ts`) validam famílias/taxonomia/manifests. Integração usa **fake-indexeddb/Dexie reais**, fixtures fictícias e transações (não prova armazenamento físico Android). E2E usa Chromium/IndexedDB em origem descartável dedicada, asserts DOM e inspeção das tabelas; não substitui Moto G06/TalkBack.

A rodada ampla foi iniciada antes das últimas correções das fixtures, e não foi repetida integralmente. Nenhum assert antigo foi removido/enfraquecido: expectativas de schema/backup/tabelas foram atualizadas para as versões reais; o teste histórico v10 explicita a promoção ao simular entrada legada após upgrade. Um erro transitório de sintaxe durante edição também foi corrigido antes das rodadas finais. Sem aumento de timeout, retry ou supressão de lint/TS. CI remota será omitida por `[skip ci]` conforme política de cota; sem alegação de CI verde.

## Limites e dívidas transferidas

- B: Oficina/Relicário, acesso visual global, retomada da rodada e algoritmos espaçados. O histórico novo persiste, mas a rodada visual continua local à visita, como antes.
- C: resolução de filtros, editor/correção de questões, resultados, estatística/diagnóstico e snapshots editoriais de taxonomia. Ainda não há avaliações de domínio.
- D: instalador/download/catálogo, mídias próprias, limites de arquivos e referências a conteúdo reinstalável ausente. Manifests atuais não autorizam I/O sem validações adicionais.
- E–G: TCG, IA, artes, campo/arena, auditoria de escala. Sem execução antecipada.
- Memória/termal/TalkBack/CI/E2E globais e ressalvas da BF-5.5 permanecem. Validação de grafo de gestão global lê o acervo local; grande escala deve ser medida com pacotes reais antes de definir índices/paginação/retenção adicionais.

## APK e roteiro Moto G06

APK debug: `android/app/build/outputs/apk/debug/app-debug.apk` (gerado localmente, ignorado pelo Git). Build não equivale a teste no aparelho. APK final: **11.641.875 bytes**, SHA-256 `c47ab3f6604a1b758c1744c3e5073dc7ae74b5c5d4f1d08c8d7e9c1babe32bbd`.

1. Antes de atualizar o aparelho que contém dados, exportar e guardar o backup v6 pelo APK instalado. Não desinstalar/limpar dados nem fazer downgrade.
2. Instalar a candidata como atualização compatível. Abrir Estudos existentes, comparar quantidade/frente/verso e conferir outros cinco tipos, notas, citações, sessões e capas.
3. Criar, editar e retirar uma carta; conferir confirmação de preservação no acervo. Virar/revisar, encerrar, fechar completamente o app e reabrir; verificar conteúdo e ausência de duplicatas/ressurreições.
4. Exportar v7 e conferir o arquivo disponível no destino. Exercitar restore somente em base descartável ou após guardar recuperação, conforme a proteção existente; comparar cartas, registros e contagens após reinício. Importar v6 fictício conhecido depois do upgrade e confirmar promoção única.
5. Verificar retrato/paisagem, teclado/toque, texto aumentado, modo reduzido, foco, ida ao fundo/retorno e fluidez comparada com BF-5.5. Registrar TalkBack separadamente se executado.
6. Registrar versão/commit, ações, PASS/FAIL e sintomas sem conteúdo pessoal. Auditoria global de decks/histórico usa testes/API nesta etapa, pois a interface do Arcanário pertence à B.

**Gate físico e aceite do proprietário: PENDENTES.** Não instalar/restaurar automaticamente em dados pessoais. Não há autorização de merge ou fechamento da A.

## Git e publicação

Commit/PR serão registrados após a revisão final. Branch exclusiva; nenhum commit na main, rebase, assinatura de release, merge ou workflow caro disparado manualmente. APKs, logs temporários e backups de ensaio não integram o Git.
