> **DECISÃO FINAL — 11/11/2026: BF-5.6 A–G ENCERRADA COM RESSALVAS.** O proprietário aprovou explicitamente o fechamento global após a auditoria G. [Termo canônico de fechamento](BF-5_6_FECHAMENTO_GLOBAL_2026-11-11.md) · [auditoria G](BF-5_6G_AUDITORIA_CONSOLIDACAO_2026-11-11.md). Proteções de dados e motor preservadas; G2 e G3 corrigiram acesso orbital semântico e numeração de ADR, sem novos testes locais/Android nem CI (sem cota). Timeouts gráficos/lifecycle, TalkBack, termal/memória, balanceamento, UI/UX restante e editoriais continuam dívidas aceitas, não PASS. **BF-6/BF-7 não iniciadas.** Todos os avisos antigos de que G aguardava aceite são parte da cronologia do plano.

> **BF-5.6G — EXECUÇÃO DA AUDITORIA (11/11/2026):** proprietário autorizou uma única rodada diretamente em `main`, com checkpoints G1–G4. **Executada e documentada com ressalvas**: inventário, revisão de contratos, comando direto acessível ao portal e testes escritos (não executados), correção de colisão de ADR-030→ADR-031, matriz de evidências/parecer. [Auditoria G e parecer de fechamento](BF-5_6G_AUDITORIA_CONSOLIDACAO_2026-11-11.md). BF-5.6A–F e BV-UXC estão integradas; **o encerramento global exige decisão expressa do proprietário**, ainda não concedida por essa autorização de auditoria. CI/3D E2E/TalkBack/termal/balanceamento/UI/UX transversal continuam dívidas; não iniciar BF-6/BF-7. Os trechos inferiores sobre G futura são históricos.

> **FECHAMENTO DE F — 09/11/2026:** A–F integradas à `main`; PR [#48](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/48) autorizada/mesclada no commit `690be5b5798d34e6436610bf9d209ede38629fd7`. O proprietário aprovou no Moto G06 a primeira Arena Viva 3D e seu refinamento R1–R4. [Registro completo do fechamento F e ressalvas](BF-5_6F_FECHAMENTO_2026-11-09.md). **BF-5.6 NÃO ENCERRADA:** G (auditoria integrada) permanece planejada e não iniciada; E2E do portal orbital e timeouts gráficos continuam dívidas, assim como TalkBack/termal/CI, balanceamento TCG e UI/UX transversal do restante do Arcanário. Os trechos anteriores de candidata/autorização/ordem de execução abaixo são históricos.

> **Execução F2 autorizada especificamente em 09/11/2026:** candidata implementada na mesma PR draft #48 da F1; [relatório Arena Viva](BF-5_6F_ARENA_VIVA_IMPLEMENTACAO.md). A missão atual supera somente as notas de “F não autorizada” abaixo. G/fechamento e reforma transversal futura permanecem independentes.

> **DIRETRIZ DE DESIGN DO PROPRIETÁRIO — 09/11/2026, para BF-5.6F e reforma global da UI/UX:** a experiência do Duelo Arcano deve ser **um jogo, não uma página de aplicativo**. **Referência explícita: campo/arena de duelo mobile de Yu-Gi-Oh! Duel Links**, reinterpretado com a identidade original da Biblioteca Viva (não copiar assets, regras ou UI protegida). **Duelo inteiro em uma tela/viewport do Moto G06, sem rolagem vertical ou horizontal da página para jogar**; inimigo, campo, cartas na mão, vida/energia e comandos contextuais precisam caber e ser alcançáveis sem scroll. A mão poderá usar seleção/expansão contextual controlada dentro da viewport, sem cards truncados sem indicação. **Remover textos instrutivos/explicativos permanentes da superfície de gameplay** (ex.: “toque em uma carta...”, “nenhuma ação depende de arrastar”), preferindo linguagem visual de jogos: ícones com estados, animações finitas, realce de alvos, feedback de recursos e ações; nomes, custos, atributos e regras da carta continuam legíveis **sob demanda**, com semântica assistiva preservada. Durante o duelo, **ocultar/substituir dock global**, impedir sobreposição de HUD, respeitar safe areas, manter botão de saída/pausa acessível; inspeção de cartas por overlay/painel que não desloca o campo. O campo 3D deve manter lógica isolada no motor E, recursos sob demanda e sem novo mundo residente pesado. **Gate obrigatório:** no Moto G06 uma partida completa por toque em retrato e paisagem com **zero rolagem da página**, sem controls cobertos, sem instruções permanentes e sem perda de contexto; ações rápidas de invocar, atacar e encerrar turno. A referência Duel Links vale para **composição/ergonomia/apresentação**, não para cópia literal ou substituição do regulamento v1. F e reforma seguem sem implementação autorizada; somente definição de requisitos.

> **Atualização de fechamento E — 09/11/2026:** A–E integradas à `main`, E/PR #47 merge `19eb076a`. A E tem **aceite funcional inicial** no Moto G06, mas não aceite final da experiência: Arcanário todo requer futura reformulação **global** de UI/UX, navegação e ergonomia; cartas SVG geradas proceduralmente continuam abstratas, a aprimorar. Balanceamento do TCG e CI/3D/TalkBack/termal pendentes. [Decisão e dívida detalhada](BF-5_6E_FECHAMENTO_2026-11-09.md). F continua reservada a construção orbital/arena 3D e G a auditoria final, porém a ordem de retrabalho visual deve ser planejada antes de avançar; nenhuma implementação nova autorizada por este registro. Conteúdo abaixo é cronologia.

> **Fechamento de D — 09/11/2026:** A/B/C/D integradas na `main`; D teve [gate Moto G06 6/6 PASS e merge da PR #46](BF-5_6D_FECHAMENTO_2026-11-09.md) em `b3db5d87`. Marco educacional consolidado, **sem fechar a BF-5.6**. E–G continuam planejadas: E TCG, F construção orbital/arena, G auditoria/fechamento. Os limites de direitos ENEM/CNU, CI, E2E Canvas headless e acessibilidade/performance seguem registrados. O corpo abaixo contém decisões e estados históricos de planejamento.

> **Atualização 09/11/2026:** BF-5.6A, B e C **integradas na `main` por autorização expressa** (PRs #43 → #44 → #45), com gate físico A+B+C **parcial**. Os reparos da etiquetagem e contraste foram implementados e integrados, ainda sem reteste Android; molduras B-R1, dados preservados e exportação de backup têm relato positivo no Moto G06. [Gate e ressalvas](BF-5_6ABC_GATE_PARCIAL_REPAROS_2026-11-09.md). **Não interpretar a integração como encerramento completo da fase** nem como aprovação de CI, TalkBack e Canvas. D–G permanecem planejadas; notas históricas abaixo foram preservadas.

> **Execução posterior autorizada — C (08/11/2026):** o proprietário autorizou implementar/publicar a candidata C e os reparos B-R1/B-R2 sobre B/PR #44. [Relatório C](BF-5_6C_PROVACOES_DIAGNOSTICO_IMPLEMENTACAO.md) · [ADR-027](decisions/ADR-027-provacao-taxonomia-diagnostico.md). Próximo gate físico A+B+C; sem merge ou início de D–G. O texto original abaixo é o plano, não descrição do código vigente.

> **Atualização específica de 08/11/2026:** B foi autorizada pelo proprietário e implementada como candidata dependente da A, com gate físico conjunto adiado para A+B; ambas seguem abertas, sem merge/aceite. [Relatório B](BF-5_6B_OFICINA_COLECOES_IMPLEMENTACAO.md). C–G continuam somente planejadas. As restrições de sequência abaixo antecedem essa exceção explícita.

# BF-5.6 — O Arcanário | Plano e contrato de escopo

- Data da decisão: 08/11/2026.
- Estado: **A em candidata por autorização específica de implementação de 08/11/2026; aceite pendente. B–G somente planejadas**. [Relatório A](BF-5_6A_FUNDACAO_IMPLEMENTACAO.md).
- Ordem aprovada: **BF-5 (fechada) → BF-5.5 (fechada com ressalvas) → BF-5.6 (planejada) → BF-6 (RPG/mundo) → BF-7 (consolidação)**.
- Autoridade de modelagem: [ADR-020 revista](decisions/ADR-020-baralhos-e-cartas-globais.md). Este documento descreve objetivos, etapas e gates; contratos de código, formato de pacotes e regras numéricas finais exigem implementação e validação próprias.
- Base de integração: main após fechamento BF-5.5 (#41 e #42). Não reabrir BF-5.5 nem ocultar suas dívidas.

## Visão e princípios

O Arcanário é um subsistema **integrado** à Biblioteca Viva (não aplicativo separado), com acesso próprio e, depois, uma pequena construção orbital no mundo 3D. Sua coleção suporta quatro famílias de cartas:

1. **Combate arcano:** TCG original de duelistas que invocam criaturas, feitiços e artefatos, com cartas oficiais ilustradas/atributos no APK, editor autoral e formatos de partida distintos.
2. **Questões:** múltipla escolha com enunciado, alternativas, resposta correta, explicação, tags e fontes; editor autoral e coleções oficiais de provas/concursos instaladas à parte.
3. **Flashcards:** duas faces livres, integradas aos Estudos existentes, baralhos e revisão.
4. **Lembranças:** cartas decorativas de obras, músicas e registros pessoais, com coleção e personalização; sem poder de combate presumido.

**O TCG e os modos educativos compartilham acervo, oficina, representação e infraestrutura, mas não os mesmos limites de deck, regras ou avaliação.** Questões não precisam de arte individual nem atributos complexos; usam molduras padronizadas legíveis, inclusive para textos longos, tabelas, imagens e rolagem. Arte autoral rica concentra-se nas cartas oficiais de fantasia.

Princípios: local/offline-first; sem contas ou backend inicial; privacidade por padrão; importação segura de conteúdo externo; sem duplicar o mesmo flashcard/questão em cada baralho; acessibilidade e toque equivalentes; performance medida no Moto G06; arquitetura modular que preserve futura publicação online e uso docente sem implementar esses serviços agora.

## Dois marcos de valor

- **Marco 1 — Arcanário Educacional (A–D):** sistema utilizável de cartas, revisão, oficina, questões, tags, diagnósticos, pacotes e coleções. Pode receber aceite e integração próprios antes do TCG.
- **Marco 2 — Arcanário Fantástico (E–G):** TCG estratégico jogável, cartas oficiais/autoriais, combate PvE, apresentação/arena 3D integrada, validação e encerramento da fase.

Não condicionar o Marco 1 ao sucesso do Marco 2. Etapas com PR e gate próprios; não encadear uma pilha extensa de PRs draft. Na medida do possível, cada etapa parte da main atualizada e só segue após integração/aceite correspondente. Sem merges automáticos.

## Etapas planejadas

### A — Fundação, modelagem e migração

- Definir contratos tipados e versionados: cartas discriminadas por tipo, identidade global, revisões, proveniência; baralhos estáticos/dinâmicos, associação muitos-para-muitos, ordenação e filtros; taxonomia e tags; sessões e resultados separados de conteúdo.
- Definir repositórios/portas e comandos na arquitetura domain → application → infrastructure; UI sem acessar Dexie diretamente.
- Promover flashcards existentes de StudyEntry.flashCards? a uma fonte canônica global, com mapa persistente (studyId, legacyCardId) → cardId global; preservar frente/verso integrais, vínculo com Estudos e comandos/telas legados por adaptação. Não usar ID legado isolado.
- Upgrade Dexie **aditivo, idempotente e transacional**, nunca limpar os dados da BF-5.5; rever contrato de backup além do v6 vigente, aceitar backup antigo, testar restauração/rollback e mapear acervo externo separadamente.
- Gate: reabertura, dois estudos com IDs legados iguais, edição pela tela antiga e nova, repetição sem duplicar, falha intermediária/rollback, restore antigo e integridade de dados fictícios aprovados. Sem usar dados pessoais em testes.

### B — Oficina, flashcards globais e Relicário

- CRUD de cartas e baralhos autorais, organização, apresentação, busca e vínculos opcionais com registros.
- Flashcards disponíveis pelo Arcanário e pelo Estudos, com giro/volta, revisão persistente e retomada; decisões finais de algoritmo espaçado podem ser graduais.
- Relicário para cartões de lembranças, texto, imagem local validada e personalização; sem reinterpretar fotos/media dos seis registros automaticamente.
- Exportação/importação autoral local em formato validado; edição protegida, propriedade de mídias, exclusão explícita.
- Gate: criar/editar/organizar/revisar/exportar/restaurar offline; mesma carta não aparece como cópias independentes; preservação ao excluir o estudo de origem e após reiniciar o APK.

### C — Provações, tags e diagnóstico

- Editor de questões autorais: enunciado, alternativas, gabarito, explicação, tags normalizadas, dificuldade opcional, mídias permitidas e revisão.
- Taxonomia hierárquica por área/disciplina/assunto/subassunto/habilidade, com assunto principal e relações secundárias; metadados de prova (ano, banca, instituição, caderno) separados de tags de conhecimento; etiquetas pessoais separadas das classificações editoriais.
- Baralho estático (IDs escolhidos) e dinâmico (filtro salvo); filtros por assuntos, prova, ano, banca, histórico, erros, não respondidas e quantidade da sessão. Sessões usam snapshot imutável de IDs/versões/ordem.
- Motor de múltipla escolha com correção, explicação, pontuação, revisão e histórico de tentativas; distinção entre desempenho, força da evidência e tendência. Não diagnosticar domínio por único acerto; reexposição à mesma questão não equivale a novas questões independentes.
- Relatório local por questão/assunto, orientação de estudo e formato exportável sem compartilhar automaticamente dados privados.
- Gate: criar deck de 10 questões, responder, pausar/reabrir, conferir cálculo, corrigir questão versionada sem reescrever tentativas, filtrar por tags e visualizar relatório após reinício.

### D — Biblioteca de pacotes e acervo oficial expansível

- Manifests de pacotes com IDs/versões/arquivos/integridade, lotes parciais, origem e licença editorial, quantidade esperada/publicada; validação estrita antes de transação e atualização idempotente sem duplicatas.
- Instalação, desinstalação, atualização incremental, reimportação, catálogo local e, opcionalmente, descoberta/download de conteúdos hospedados estaticamente. Sem backend, conta ou dependência de conectividade após instalação.
- Questões oficiais ENEM/concursos por prova, ano, área e caderno; quatro grupos de 45 questões para a estrutura objetiva do ENEM quando completados, respeitando diferentes cadernos/ordenação e variações de língua. Não inferir que todos esses pacotes já estejam produzidos.
- Pacote inicial real pequeno, conferido, apenas após revisão de direitos de redistribuição, enunciados, mídias, gabaritos e tags. Uma edição completa do ENEM ou diversos concursos **não** são condição de aceite.
- Acervo oficial reinstalável separado do backup privado, cujo limite atual é 10 MiB; preservar tentativas/vínculos mesmo com pacote desinstalado, sinalizando indisponibilidade e reintegração segura.
- Gate: instalar lote 1, acrescentar lote 2, repetir operações, rejeitar lote corrompido, reinstalar, consultar offline, medir volume e desempenho sem perder histórico.

### E — TCG estratégico, motor de regras e coleção fantástica

- Definir regulamento v1 determinístico/testável, turnos, estado, custos, combate, zonas, vitória, fadiga e partidas PvE; protótipo de 20 PV, 24 cartas, até 6 de energia e faixas é **experimental**, não parâmetro final aprovado.
- Quatro afinidades criativas: Ruína/Samael, Conhecimento/Aryn, Florescimento/Ytha, Caos/Lua, com cartas neutras e arquétipos próprios.
- Conjunto inicial alvo de aproximadamente 40–60 cartas oficiais ilustradas (quantidade calibrada por escopo/artes/testes), incluidas no APK; editor autoral com atributos e habilidades selecionadas em catálogo estruturado, nunca código executável arbitrário.
- Modos: Oficial (cartas verificadas), Criador (autoria com orçamento/validação, equilíbrio aproximado) e Livre (experimentos). Não prometer competitividade justa de cartas autorais nem multiplayer.
- IA adversária local inicialmente baseada em regras. Equilíbrio observado por simulações e partidas, evitando combos infinitos, vantagem excessiva de iniciativa e regras inconsistentes.
- Gate: partidas completas reproduzíveis com decks diferentes, IA local, habilidades/condições de vitória e cards autorais válidos; testes de propriedade/limites da máquina de estados.

### F — Arena, identidade artística e mundo 3D

- Construção orbital pequena como acesso ao salão/arena; item visual independente sem criar outro mundo residente permanente.
- Rota/página própria, recursos carregados sob demanda, campo e cartas com efeitos 3D onde agregam valor; formulários, textos longos e acessibilidade semântica ficam no React. Evitar manter duas cenas 3D completas desenhando ao mesmo tempo.
- Voltar/retomar, foco, toque, retrato/paisagem, redução de movimento, controles equivalentes para teclado/TalkBack e descarte de recursos.
- NPCs/habitantes podem servir de duelistas PvE nesta fase; campanhas longas e progressão do RPG pertencem ao futuro BF-6 ou fases próprias.
- Gate: entrar pelo mundo, abrir modalidades, concluir duelo e Provação, retornar sem perda de sessão, arte aceita no Moto G06, regressões/fluidez comparadas com a BF-5.5.

### G — Saneamento, auditoria, gates e fechamento

- Validar integridade/backups, pacotes grandes, mídias/textos longos, armazenamento, lifecycle, reabertura, offline, conflito de revisões e ausências de conteúdo, além de acesso e retorno à Biblioteca.
- Gates locais proporcionais: testes de domínio/migração/importação, lint, tipos, build, E2E dirigidos, APK debug, toque/rotação/segundo plano e gate físico no Moto G06. Não repetir testes que não evoluem por timeout nem confundir fixture CSS com verificação Android.
- Acessibilidade humana/TalkBack, memória prolongada, CI global e dívidas anteriores devem permanecer rastreadas se não houver evidência de PASS; aceite artístico e funcional não os apaga.
- Registrar evidências, decisões, riscos residuais, migrações/backup, compatibilidade e merges autorizados. Fechar BF-5.6 **somente mediante aceite explícito**.

## Processo de implementação

- Início: sincronizar com main, ler STATUS/AGENTS/ADR-020, inventariar comandos/backup e abrir a etapa autorizada. Este documento **não** autoriza execução de A–G por si só.
- PR por etapa ou módulo coeso, com revisão, testes dirigidos e aceite; evitar grandes pilhas draft encadeadas. Nenhum merge automático e nenhum teste falso positivo para reduzir cota.
- Alterações de dados requerem plano de recuperação e rollback, compatibilidade com snapshots fictícios, IDs estáveis e política explícita de exclusão.
- Documentar em cada etapa: relatório, impactos no modelo, decisões, limites, gates e alterações no roadmap/status. Trabalho documental não é CI aprovada nem código entregue.

## Futuro fora da BF-5.6

Compartilhamento online de baralhos; contas/turmas; professora criando deck de 10 questões, turma baixando e resolvendo, relatórios enviados com consentimento; correção remota formal mais confiável; rankings e multiplayer PvP; campanhas profundas, recompensas e evoluções vinculadas ao RPG. O modelo deve permitir versões/autoria/origem/exportação e relatórios locais desde já, sem introduzir backend, autenticação ou coleta automática de dados de alunos.

## Pontos pendentes de refinamento antes de implementar

- Esquemas exatos, índices, limites, quota local, formato binário/mídia e política de exclusão.
- Política editorial de direitos das provas, exceções (itens anulados), diferentes cadernos/idiomas e qualidade de tags.
- Regras numéricas finais do TCG, orçamento de habilidades e número/arte das cartas iniciais.
- Formatos de relatório e retenção; critérios estatísticos para domínio; acessibilidade específica.
- Ordem fina das subentregas e gates por PR, ajustada conforme evidência do repositório.

**Resultado original deste plano:** escopo e sequência aprovados sem implementação pela formalização. A candidata A posterior está registrada separadamente; B–G e BF-6/7 permanecem futuros.
## Execução específica posterior — E (09/11/2026)

O proprietário autorizou a implementação contínua E1–E4, commits/push/APK e uma PR draft sobre main `6babce2`, com #46 integrada. [Relatório E](BF-5_6E_TCG_DUELO_ARCANO_IMPLEMENTACAO.md) e [ADR-029](decisions/ADR-029-duelo-arcano-regulamento.md). Não encerra BF-5.6 nem autoriza F/G/BF-6 ou merge. O corpo anterior continua como cronologia/plano.
