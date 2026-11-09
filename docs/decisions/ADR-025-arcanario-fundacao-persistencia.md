# ADR-025 — Fundação persistente do Arcanário

- Data: 08/11/2026.
- Estado: implementada em candidata BF-5.6A, sujeita à auditoria e ao aceite do proprietário.
- Complementa, sem reescrever, a [ADR-020](ADR-020-baralhos-e-cartas-globais.md). Substitui o armazenamento editável de flashcards dos itens 7–9 da ADR-016; fólio, foco e tempo de Estudo permanecem.

## Decisão

Dexie v15 acrescenta seis tabelas ao v14, sem alterar os índices anteriores. Cartas têm identidade independente, origem discriminada e revisão. Cada gravação mantém a versão completa imutável em `arcanariumVersions`, incluindo conteúdo e proveniência, e atualiza `arcanariumCards`. Arquivamento explícito é uma nova revisão, sem apagar versões ou referências.

Baralhos são agregados versionados com seleção discriminada. A seleção estática guarda um array ordenado de referências: identidade da associação é o par `(deckId, cardId)`, único no agregado; revisão opcional fixa uma versão. Sem revisão, a associação acompanha o conteúdo atual. O mesmo ID integra diversos baralhos sem cópia editável. A seleção dinâmica persiste critérios v1, sem resolvê-los nesta etapa. Alterar seleção substitui o agregado com revisão esperada; excluir baralho só elimina o agregado.

O mapa `studyCardLinks` usa chave composta `(studyId, legacyCardId)`, ID global, posição e estado ativo. IDs migrados usam namespace `study-flashcard:` seguido do par JSON, uma codificação injetiva; novos IDs usam namespace `local:` e o gerador existente. Colisão causa aborto, nunca sobrescrita. Links inativos são tombstones duráveis e impedem ressurreição do arquivo legado. A proveniência é histórica, não ownership: pode apontar para um Estudo já excluído.

Upgrade e restore usam a mesma promoção transacional. O upgrade preserva cada linha e cada byte do arquivo `StudyEntry.flashCards`; somente tabelas novas e marcador são escritos. Leitura pelo repositório projeta cartas globais com alias legado, ID global e revisão. A gravação geral do Estudo conserva o arquivo original e descarta a projeção recebida. `SaveFlashCard` e `DeleteFlashCard` operam exclusivamente sobre cartas/vínculos globais. Não há dual-write. A tela envia a revisão capturada ao iniciar edição; chamadas antigas sem esse argumento continuam serializadas no contrato adaptado. Novos comandos globais exigem revisão para alterações.

Retirar uma carta no fólio desativa o vínculo; o texto de confirmação explica a permanência no acervo. Excluir Estudo desativa seus vínculos e preserva cartas, baralhos e sessões. Arquivar carta global a oculta da projeção de Estudos, sem apagar o histórico. Exclusão física definitiva e coleta de versões não existem nesta etapa.

`knowledgeTags` separa namespaces editorial e pessoal; hierarquia editorial por níveis, sinônimos, relações e múltiplas referências nas questões. Origem de prova é objeto distinto da classificação. Não há catálogo fictício. Sessões de revisão persistem ordem de IDs/revisões e respostas sequenciais; progresso é derivado dessas respostas, sem contador paralelo. As versões conservam os textos vistos mesmo após edição. Sessões de questões e combate e manifests de pacotes são contratos tipados, sem motores, instalador ou conteúdo distribuído.

Backup v7 inclui o grafo pessoal em `data.arcanarium`. V6 original continua validado/checksummado antes da promoção no restore, inclusive com banco v15 instalado. Mesma política replace protegida, SHA-256 canônico, limite de 10 MiB e escrita atômica. Referências, duplicatas e sequência de revisões são validadas; falha preserva destino. Origens e mapas inativos podem sobreviver a registros excluídos. Nenhum pacote público ou mídia nova é instalado/exportado automaticamente pela A; separação operacional de pacotes reinstaláveis e referências indisponíveis exige o importador da D.

## Consequências e limites

- Há redundância deliberada entre versão atual e histórico, e retenção do arquivo legado imutável. O backup pode atingir 10 MiB; nesse caso a exportação falha explicitamente, sem truncar dados. Remoção futura do arquivo requer migração própria, evidência de restauração e autorização; não é limpeza agendada.
- A fundação valida o grafo em transações de gestão global. Escala de grandes pacotes, paginação e retenção serão medidas quando houver conteúdo real; não há promessa de capacidade baseada em testes sintéticos.
- A revisão anterior não possuía histórico persistente a recuperar. Respostas novas são duráveis; a tela mantém a rodada corrente local e não retoma automaticamente uma rodada interrompida. Retomada e algoritmos espaçados pertencem à B.
- Classificações referenciadas são mantidas; não há exclusão de tags nem diagnóstico. Snapshots editoriais completos de taxonomia/resultados de questões serão definidos na C.
- Sem downgrade de banco ou backup para APK antigo, mudança de versão do aplicativo, backend, conta, sincronização, novas telas ou dados espaciais.
- Gates e roteiro: [relatório da candidata](../BF-5_6A_FUNDACAO_IMPLEMENTACAO.md). Sem aceite físico, merge ou encerramento da A/BF-5.6.
