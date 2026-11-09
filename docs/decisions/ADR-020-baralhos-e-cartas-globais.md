# ADR-020 — Baralhos e cartas globais: revisão para o Arcanário

- Decisão original: 04/11/2026.
- Revisão de escopo: **08/11/2026**, após concepção do Arcanário com o proprietário.
- Estado: **aceita como diretriz arquitetural de planejamento da BF-5.6; sem implementação de schema, migração, regras de TCG ou arena**.
- Complementa ADR-016 (Estudos/flashcards), ADR-019 (mídias), ADR-023 (sequência anterior) e [Plano BF-5.6](../BF-5_6_ARCANARIO_PLANO.md).
- Mudança explícita da proposta de 04/11: uma carta **não possui mais um único deckId obrigatório**. Ela tem identidade independente e participa de zero, um ou muitos baralhos.

## Contexto verificado na main em 08/11/2026

- Dexie v14 e backup v6 seguem vigentes, com dados convencionais e seis tipos de registros; não existem contas, backend ou sincronização.
- StudyEntry.flashCards? embute até 1.000 cartas por estudo, com frente até 4.000 e verso até 8.000 caracteres. IDs de flashcards são locais ao estudo. SaveFlashCard/DeleteFlashCard atualizam a entrada em transação, com evento após commit.
- Revisão de flashcards existente apresenta frente/verso e roda na UI, sem histórico global de repetição/agenda independente; o contrato atual é canônico **até uma migração implementada e validada**.
- A ADR original tratava apenas baralhos globais de memória. A BF-5.6 aprovada amplia esse escopo para questões, cartas decorativas, TCG e pacotes oficiais.

## Decisão: entidades e fronteiras

1. **Card:** ID global estável, tipo discriminado (flashcard, questão, lembrança, combate), revisões/estado editorial, autoria/origem opcional, dados próprios validados. Não embutir bytes de mídias grandes nem HTML/código arbitrário.
2. **Deck:** ID global, nome, modalidade, apresentação, proprietário/origem, versão e política de seleção. Deck estático associa IDs/versionamento/ordem; deck dinâmico guarda filtros, resolvidos sob demanda pelo acervo instalado. Um Card pode compor vários decks; associação em entidade/índice próprio, sem duplicar a carta.
3. **CardPack/Manifest:** pacote reinstalável, identidade/versionamento, origem/licença, arquivos, hashes e contagens esperadas/publicadas. Atualizações incrementais idempotentes com validação prévia e transação. Conteúdo oficial diferente de registros pessoais privados.
4. **KnowledgeTaxonomy/CardTag:** catálogo versionado por área, disciplina, assunto, subassunto e habilidade, com IDs estáveis, sinônimos e distinção de assunto primário/secundários; meta de prova (ano, banca, caderno) não é tag de domínio. Etiquetas pessoais separadas de classificação oficial.
5. **Session/Attempt/Review:** atividade e respostas independentes de deck e conteúdo vivo; guardar IDs de carta, versão/snapshot necessário para auditar correção, ordem, alternativas apresentadas, respostas e resultados. Revisão de flashcards e duelo TCG são sessões diferentes.
6. **UserProgress/Report:** derivados de tentativas e revisões; não reescrever histórico diante de edição de questão/gabarito/tag. Recalcular projeções explicitamente, preservar evidência de versões. Distinguir acerto, força da evidência, dificuldade, variedade e tendência; múltiplas tags não multiplicam uma tentativa.
7. **TCG ruleset:** motor determinístico puro separado dos dados e da UI; atributos, habilidades e custos em operações validadas, sem execução de scripts de usuário; regras/versionamento de partida e formatos Oficial, Criador, Livre independentes dos decks de questões.

Os nomes acima são contratos conceituais, não nomes ou índices de tabelas já implementadas. Definir schema, limites e evolução de dados na etapa A. O TCG tem escopo de duelista invocador (criaturas/feitiços/artefatos), não combate direto de avatar como regra principal.

## Distribuição e separação de dados

- APK inclui **coleção inicial oficial do TCG com arte e atributos**. Cartas de provas usam visual padronizado para leitura e são distribuídas em **pacotes opcionais instaláveis**. Concluída a instalação, toda prática funciona offline.
- Pacotes de questões podem ser entregues por lotes, atualizados e reinstalados sem duplicar Cards nem apagar resultados. Novos itens de conteúdo compatível não devem exigir alterar o código. Não assumir que todo pacote está completo; manifest informa progresso editorial.
- Exemplo almejado: ENEM por ano e quatro áreas de 45 itens, respeitando cadernos, ordenação e línguas estrangeiras. Identidade da questão independente do número no caderno; gabarito/versão revisados e fontes rastreáveis. Direitos de redistribuição e qualidade editorial precisam de checagem antes de publicar.
- Acervo público reinstalável e mídias opcionais fora do backup pessoal monolítico v6 (atualmente 10 MiB); dados próprios, vínculos, filtros, resultados e mapas de migração cobertos pelo futuro contrato de backup. Backup antigo válido deve seguir importável.
- Compartilhamento e relatórios de turma são futuros. Arquivos importados são não confiáveis, exigem validação estrita/limites de mídias/checksum; nada é enviado a terceiros sem ação explícita.

## Migração dos flashcards e integridade

- Mapear (studyId, legacyCardId) → cardId global em estrutura durável, para tolerar IDs repetidos entre estudos. Guardar origem opcional e texto integral, sem modificar IDs dos estudos.
- Planejar upgrade Dexie aditivo, atômico e repetível; não apagar campos legados no primeiro upgrade. No corte de produção, adaptar comandos e telas existentes à **única fonte editável canônica**, proibindo dual-write permanente.
- A carta global não depende do ciclo de exclusão do estudo: exclusão de origem remove vínculo, não o acervo; exclusão de deck define explicitamente o destino das associações, sem cascade inesperado.
- Abrangência obrigatória dos testes: colisões de IDs legados, upgrades interrompidos/retomados, rollback, reabertura, exportação/restauração, dados inválidos, pacote reimportado, conteúdo desinstalado com relatório preservado e correção de gabarito sem adulterar tentativas.
- Nunca testar migração com banco pessoal do proprietário. Eventos apenas após commit. Domain não importa React, Dexie ou Three; application coordena; infrastructure implementa portas; UI não acessa Dexie.

## Apresentação, modos e campo 3D

- Acesso pelo fluxo React primeiro. Na etapa F, construção orbital simples abre rota/arena independente sob demanda; WorldHost e runtime do mundo recebem só referência neutra, nunca enunciados/versos pessoais ou mídias pesadas.
- Cartas educativas priorizam leitura, sem proporção fixa quando o enunciado exigir espaço; suportam toque, seleção de alternativas, correção, labels/foco, movimento reduzido, reabertura e retrato/paisagem.
- Cartas de fantasia aceitam animações/efeitos 3D e arte original sem depender de cada frame para persistir estado. Não manter renderização contínua de duas cenas completas ao mesmo tempo.
- Questões/flashcards, lembranças e TCG compartilham infraestrutura de coleção, **não** limites de partida. Duelos educativos híbridos são modalidade opcional e não fonte de vantagem competitiva permanente no formato TCG oficial.
- Números iniciais do TCG (PV, energia, cartas por deck, zona/cópias) são hipóteses para prototipar na E; não fixados por esta ADR. Não exigir multiplayer, torneio, campanhas completas, contas, backend ou sincronização na BF-5.6.

## Consequências e estados futuros

- A BF-5.6 divide-se em **A fundação; B oficina/Relicário/flashcards; C Provações/tags/diagnóstico; D pacotes/acervo; E TCG; F arena/artes; G auditoria/fechamento**, conforme plano.
- Dois marcos integráveis: Educacional (A–D) e Fantástico (E–G). Cada PR/etapa exige testes proporcionais e gate explícito; erros da BF-5.5, CI, HUD paisagem, memória e TalkBack permanecem dívidas, não resultados silenciosamente aprovados.
- Não foi implementada nenhuma tabela, migração, jogo, pacote ou rede por esta revisão. A execução da BF-5.6A requer tarefa/autorização específica.
- Visão futura preservada: professor cria deck próprio, alunos importam e respondem, exportam ou enviam resultados com diagnóstico, e professor analisa a turma; contas/permissões/consentimento de menores/correção formal segura são trabalhos futuros, não compromissos de segurança offline.

## Registro da alteração da ADR-020 original

A recomendação de 04/11 permanece rastreável no histórico Git. Mantêm-se a separação domínio/aplicação/infraestrutura, o mapa de IDs legados, migração aditiva, backup compatível e acesso convencional antes do Canvas. **Substituem-se**: a relação exclusiva Card→Deck por associação muitos-para-muitos; a limitação a memória por quatro tipos de carta; e a exclusão de jogos/pontuação (agora autorizados como **escopo de planejamento** da BF-5.6, não como funcionalidades entregues).
## Complemento rastreável — BF-5.6E (09/11/2026)

A autorização específica E evolui a família `combat`, sem segundo acervo, preservando identidade/revisão e associação muitos-para-muitos. Metadados TCG de baralho guardam contagens, e sessões separam regras/resultados educativos e de combate. Regulamento, contratos de efeitos, snapshots, IA e dados estão na [ADR-029](ADR-029-duelo-arcano-regulamento.md). Texto de planejamento acima preservado; sem arena F ou merge automático.
