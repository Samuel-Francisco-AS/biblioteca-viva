> **Estado atualizado em 09/11/2026:** implementação da ADR-028 **integrada na `main`** após gate Moto G06 6/6 PASS e merge PR #46 `b3db5d87`; [fechamento com ressalvas](../BF-5_6D_FECHAMENTO_2026-11-09.md). O campo “Estado: implementação candidata” abaixo é registro histórico da redação inicial. E–G permanecem fora do escopo desta ADR.

# ADR-028 — Pacotes educacionais e retenção histórica

- Data: 09/11/2026.
- Estado: implementação candidata BF-5.6D, autorizada expressamente pelo proprietário; sem merge/aceite físico.
- Complementa ADR-020/025/026/027. Não autoriza E–G.

## Contrato

Dexie v18 acrescenta apenas `educationalPacks: &id,status`. O registro de instalação guarda manifesto, lotes/hashes, identidades/revisões e disponibilidade; cartas/revisões continuam globais. Remover altera disponibilidade, nunca resultados, respostas ou revisão. Revisões locais são retidas integralmente nesta versão, inclusive as não referenciadas: não há coleta destrutiva implícita. Espaço de conteúdo retido é apresentado separadamente do tamanho de arquivos instaláveis.

Formato `biblioteca-viva-educational-pack` v1, JSON UTF-8, contém manifesto estrito e mapa caminho→texto JSON de lote. SHA-256 incide sobre os **bytes UTF-8 exatos do texto de cada lote**, sem normalização, BOM ou newline implícito. Manifesto lista hash/tamanho e não participa de seu próprio hash: não há cálculo circular. Fingerprints de questões usam JSON com chaves em ordem lexicográfica UTF-16, arrays preservados, strings JSON, sem campos undefined. Hash detecta alteração em relação ao valor esperado; metadados autodeclarados não autenticam fonte nem licença. Catálogo embarcado e arquivo externo são diferenciados. Envelopes locais têm hashes fixados externamente em `contentHashes.json`; CacheStorage opcional guarda somente esses arquivos públicos, rechecados pelo pin antes de usar, sem conteúdo pessoal. `npm run packs:check` verifica os pins.

Limites: envelope 10 MiB, lote 4 MiB/2.000 revisões, 100 lotes e 10.000 identidades por pacote. Conteúdo textual, duas a cinco alternativas, sem execução de HTML/scripts/SVG/mídia ativa. Links abertos apenas se HTTPS validado. Lotes incluem taxonomia editorial em namespace próprio. Validação de hashes, contagens, versões, direitos declarados e referências ocorre antes da escrita. Colisões/revisões incompatíveis abortam integralmente na transação. Interrupção antes do commit deixa o estado anterior; repetir é a recuperação. Não há flag durável de operação em andamento para ficar presa após encerramento.

Identidade: tupla exame/ano/aplicação/caderno/idioma/número original, prefixo `exam:` e JSON injetivo. Identificador canônico/equivalências opcionais são evidência editorial explícita, nunca deduplicação inferida por número. Ownership de uma identidade não pode ser tomado por outro pacote. Revisões editoriais de lote carregam a cadeia completa; atualizações enviam somente lotes novos/alterados. Correção exige fonte e revisão sequencial, sem alterar revisões antigas. Questões anuladas/sem gabarito e preliminares não entram em novas Provações; sessões anteriores conservam sua própria revisão e resultado.

## Backup

Backup v10 importa originais v6/v7/v8/v9, valida checksum antes de qualquer transformação e mantém 10 MiB/replace protegido/rollback. Projeção privada conserva cartas autorais, taxonomia, decks, sessões e registros de pacotes. Enunciados reinstaláveis não referenciados são excluídos. Se um item público é necessário a sessão ou deck estático pessoal, guarda-se uma única cadeia contígua de revisões dessa identidade, compartilhada pelas referências; não uma cópia por resposta. A cadeia contígua mantém as invariantes de A e a auditoria de correções. Restauro marca pacotes ativos como `restore-required`; os removidos continuam removidos. História funciona sem reinstalação, novas seleções aguardam conteúdo reinstalado. Não há downgrade suportado.

## Editorial e limites

Referência oficial sem comprovação suficiente de redistribuição não é instalável. Conteúdo original demonstrativo se identifica como tal, sem atribuir questões/comentários ao Inep ou banca. Catálogo local funciona sem backend; nenhuma fonte remota é consultada automaticamente. Fonte/declaração de direitos em arquivo externo continuam autodeclaradas. Arte, acessibilidade e desempenho físico exigem Moto G06; ressalvas do gate parcial A+B+C são preservadas.
