## 2026-11-05 — BF-5.5F, fundação confirmada de sessões (F1)

- Contrato de sessão ativa/pausada sem dados pessoais no renderer; reconciliação por `SessionChanged`, reabertura e mudança de abas.
- Primeiro sinal mágico posicionado sobre a mobília real para leitura, estudo, trabalho, atividade física e entretenimento; sem objetos duplicados ou animações falsas.
- [Relatório BF-5.5F](docs/BF-5_5F_RELATORIO.md). F2 física reservada ao Codex; sem merge, fechamento ou aceite físico da F.

## 2026-11-05 — BF-5.5E, candidata de mobília

- Estantes com colunas/coroas, lombadas encadernadas e variação determinística; mesas de estudo, poltronas, bancos, armários, plantas e luminárias remodelados.
- Bancada de ofício em E e estação de treino em D com madeira, couro, metal e pedra; preservadas funções narrativas e registros pessoais.
- Luz emitida nas cúpulas, âncoras compartilhadas e pontos de repouso compatíveis com a geometria; transporte do livro cenográfico usa tampo real sem capa duplicada.
- [Relatório BF-5.5E](docs/BF-5_5E_RELATORIO.md). Sem aceite artístico/físico, merge ou início de F/G.

> **BF-5.5D — saneamento na PR draft #35:** contrato neutro, liberação de leases no handoff/descarte, voo validado entre móveis, reações dos quatro habitantes e acesso à anotação/citação específica. [Relatório vigente](docs/BF-5_5D_RELATORIO.md). Sem merge, CI global verde ou aceite físico; avaliação Moto G06 acumulada para G. E/F permanecem futuras.

> **BF-5.5D — candidata em revisão (05/11/2026):** magia ambiental independente do relógio e até dez projeções de notas/citações, com voo local, interação pela agência B e acesso ao registro original. Base C `8cc12c2`; sem merge ou aceite físico. Limites (rotas locais, rig, foco da anotação e validação WebGL) e evidências no [relatório](docs/BF-5_5D_RELATORIO.md). BF-5.5 permanece aberta; refinamento físico em G e E/F ainda pendentes.

## 2026-11-05 — BF-5.5C (candidata)

- Noite com preenchimento lunar azulado e nove luminárias existentes efetivamente luminosas, sem novos seletores ou mobília.
- Ritual de acendimento integrado à agência, reservas exclusivas e fallback luminoso independente dos NPCs.
- Checkpoint local idempotente do ritual na tabela `settings`, sem migração Dexie ou backup; segredo da luminária manual BF-4E preservado.
- [Relatório e pendências físicas](docs/BF-5_5C_RELATORIO.md). PR draft #34 sobre #33, sem merge ou aprovação física/CI global.

## 2026-11-05 — BF-5 integrada e encerrada no escopo aprovado (com ressalvas)

- Integração ordenada das PRs [#25](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/25) a [#30](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/30) na `main`, preservando os commits de merge; merge final `1df8adad`.
- Coleção e Livros: seleção tátil confirmada, fólio, progresso, anotações/citações, capas, avaliações por estrelas e PNG.
- Estudo: pomodoro persistido, caderno e cartas locais. Atividade Física: ficha-base, execuções adaptáveis, frequência, MET e Atlas Clássico de seis gravuras com dissolução.
- Entretenimento: catálogo, subformatos, favoritos/desejos, estreias e compartilhamento; Trabalho: Empreitadas, etapas/tarefas, progresso real e diário. Controles DOM próprios para opções/datas; ateliê compartilhado.
- Dexie v14 aditiva; backup v6 compatível com arquivos anteriores, sem downgrade garantido. Mundo 3D e seis tipos técnicos preservados.
- **Aceite do proprietário no Moto G06 para o observado, não gate completo:** CI da PR #30 com estáticos/unitários/build PASS e E2E global FAIL. Pendências de backup, sessões, E2E/Canvas/TalkBack e saneamento CSS rastreadas em #21–#24. Sem beta ou publicação.
- [**Decisão de fechamento, histórico e dívidas**](docs/BF-5_FECHAMENTO_2026-11-05.md). As entradas “candidata” abaixo são cronologia das entregas antes da integração.

## BF-5 — Atlas clássico projetado, candidata 2026-11-05

- Substituído atlas articulado por seis gravuras originais estáticas masculinas/femininas, com rotação contemplativa, dissolução, pausa e avanço manual.
- Removidos rig SVG, motor/controles de poses e estilos órfãos. Movimento reduzido, viewport/visibilidade e falha de imagem têm tratamento próprio.
- Perfil, MET, treinos, gráfico, Empreitadas e avaliações preservados. Sem migração, dependência ou versão nova. [Entrega](docs/BF-5_ATLAS_CLASSICO_PROJETADO.md). BF-5 aberta, aceite humano pendente.

## BF-5 Parte 2F — candidata, 2026-11-05

- Trabalho reconstruído como Empreitadas: etapas, tarefas, progresso real, próxima ação explícita e diário; sessões e notas anteriores preservadas.
- Atlas Vivo com duas gravuras articuladas originais e quatro movimentos, escolha visual voluntária, pausa/pose estática e movimento reduzido. MET preservado.
- Cinco estrelas em Livros/Entretenimento e formulários; atualização/remoção direta e opção de estrelas Canvas nos banners 4:5, 9:16 e 1:1.
- Dexie v14 aditiva, backup v6 antigo/novo e revisão concorrente. BF-5 aberta, sem aceite artístico/físico. [Entrega](docs/BF-5_PARTE2F_EMPREITADAS_ATLAS_AVALIACOES.md).

## BF-5 Parte 2E — candidata (2026-11-04)

- Seletores internos com confirmação/cancelamento e Voltar; calendário DOM para datas em formulários, atividade física, entretenimento e sessões. Filtros/Ajustes e duração de foco também deixam de abrir seletores nativos.
- Capas locais persistentes para livros e entretenimento, com prévia, substituição e remoção explícitas; Dexie v13 aditiva e backup v6 com ownership validado.
- Ateliê compartilhado offline: modos anteriores, PNG 4:5/9:16/1:1, composições/molduras, capa/fundo, título/trecho/mensagem, alinhamento/posição e escurecimento; prévia do arquivo real e entrega Android existente.
- ADR de evolução dos flashcards para baralhos/cartas globais; sem migração ou minigame nesta entrega.
- BF-5 aberta; causa Android e correção física ainda dependem da validação Moto G06. [Relatório](docs/BF-5_PARTE2E_CONTROLES_CAPAS_ATELIE.md).

## 2026-11-04 — BF-5 Parte 2D (candidata)

- Entretenimento reúne filmes/séries visualmente e adiciona Anime/Animação unitários ou episódicos, desejos, favoritos, estreias civis e acompanhamento. Cinco grupos na Coleção/cadastro/Arquivo/Resumo, seis tipos técnicos e mundo preservados.
- Fólio cinematográfico com poster local, progresso/temporadas, avaliação e diário por minuto/episódio. Compositor offline exporta PNG 4:5/9:16 com mensagem, fundo escolhido, duas composições, prévia real e entrega Android.
- Dexie v12 aditiva, mídia limitada em tabela separada e backup v6 compatível. Sem nova dependência ou versão de pacote. [Contrato, verificações e limitações](docs/BF-5_PARTE2D_ENTRETENIMENTO.md). BF-5 aberta, sem merge ou aceite físico/artístico.

## 2026-11-04 — BF-5 Parte 2C (candidata)

- Atividade Física reconstruída como ficha-base reutilizável com período/dias, metas de séries por repetições/tempo e ordenação. Rádios visíveis substituem o seletor nativo de categoria afetado pela tela branca Android.
- Fólio contínuo com execução diária editável/checks, gráfico mensal de presença/volume e painel corporal editorial; notas/organização/exclusão discretas e contraste destrutivo corrigido.
- Perfil físico local opcional/removível em Ajustes e estimativa calórica aproximada por MET com parâmetros históricos preservados. Dexie v11 aditiva e backup v6 compatível com dados anteriores.
- Candidata encadeada à PR #26; BF-5 aberta, sem merge ou aceite físico/artístico. [Relatório](docs/BF-5_PARTE2C_ATIVIDADE_FISICA.md).

## BF-5 — Parte 2B: fólio de estudo (2026-11-04, candidata)

- Estudo reconstruído em uma superfície contínua com foco circular, tempo acumulado, caderno e revisão de flash cards com flip e deslizamento.
- Pomodoro por timestamps persistidos, limite de foco e recuperação após retorno/reabertura; horas deixam de ser digitadas diretamente nessa tela. Tempo anterior preservado.
- Cartas locais editáveis e backup v6 mantido; Dexie v10 aditiva preserva dados v9. Exclusão ganha contraste explícito e conserva confirmação.
- [Relatório, validações e limites](docs/BF-5_PARTE2B_ESTUDO.md). BF-5 aberta, sem merge automático ou aceite físico.

## BF-5 — Parte 2: fólio de leitura (2026-11-04, candidata)

- Cards da Coleção deixam de mudar de cor no início do toque/scroll; abertura e teclado usam ativação confirmada.
- Livros recebem superfície contínua, estado contextual, marcador com entrada direta/±, notas e citações unificadas com páginas e organização/sessões em ações secundárias.
- Exportação PNG 4:5 de resumo ou citação escolhida, prévia real, ajuste de trecho sem alterar dados, compartilhamento nativo e alternativa de salvamento. Sem nova dependência, schema ou formato de backup.
- [Relatório e limites](docs/BF-5_PARTE2_FOLIO.md). BF-5 aberta, sem aceite físico ou merge desta candidata.

## BF-5 — Integração do Códice Iluminado à main com dívidas (2026-11-04)

- PR #20 integrada por merge commit `f1829919fc54fe2ece62ffe1a82fe7054362a179`, preservando o histórico e sem declarar encerramento da BF-5.
- Direção artística R6, carga progressiva R8, ícone Android R9, mundo residente e CSS legado reorganizado incorporados à main.
- Gates estáticos/build e 732 testes unitários PASS; E2E amplo final 21 PASS / 27 FAIL, **não aprovado**, com aceitação expressa de dívida técnica para a integração.
- Issues abertas: #21 backup/restauração, #22 histórico de sessões, #23 E2E/WebGL/RPG e #24 refinamento dos formulários/UI.
- Formalização em [docs/BF-5_INTEGRACAO_PR20.md](docs/BF-5_INTEGRACAO_PR20.md). BF-5 permanece aberta para uma segunda parte em nova PR.

## BF-5R9 — 2026-11-04

- Corrigida recuperação da capa e de rotas sob demanda, preservando navegação e mundo residente.
- Coleção consulta dados canônicos sem reapresentar conteúdo antigo; vibração acompanha clique confirmado e tolera falhas da ponte.
- Novo ícone Android original de códice e chama, adaptive, redondo, monocromático e legado.
- BF-5 permanece aberta para avaliação física e técnica final.

## BF-5R8 — entrada progressiva (candidata, 2026-11-04)

- Capa artesanal mínima antes do bootstrap e remoção condicionada à primeira área utilizável; sem temporizador de navegação.
- Abas secundárias divididas em chunks, carregamento oportunista e indicação temática apenas em espera real.
- Retorno à Coleção com snapshot visual recente e reconsulta canônica; toque tátil na liberação válida com prevenção de pulso duplicado.
- R8 permanece candidata na PR #20 draft, sem merge, sem testes físicos ou aprovação CI nesta entrega.

# Changelog

## BF-5R7 — Performance, Latência e Fluidez (2026-11-04)

- Preservado o Códice Iluminado; pan evita projeção redundante e resize ignora dimensões idênticas já válidas.
- Feedback visual acompanha o gesto e cancela ao rolar; hover das fichas limitado a mouse, mantendo foco e toque.
- Comandos rápidos não perdem pulso por debounce global; links de fichas também solicitam feedback na ativação. Latência percebida Android ainda requer medição física.
- Evidências, gates e pendências: [relatório R7](docs/BF-5R7_RELATORIO.md). BF-5 permanece aberta.


## BF-5R6 — Códice Iluminado (2026-11-04)

- Reconstrução de linguagem visual de toda a aplicação com fundo ameixa noturna, fólio claro, tinta, gravuras SVG próprias e superfícies artesanais; substituição de frontispícios, dock, seleção de categorias, listagens, editores e controles visuais de todas as áreas.
- Bridge Android nativa para toque leve e confirmação, com respeito às preferências do sistema e fallback opcional no browser.
- Campos e capítulos com ergonomia de manuscrito, contraste, navegação com teclado e reduzido movimento. Contratos de dados, mundo, narrativa e seis categorias preservados.
- Relatório em [BF-5R6_RELATORIO.md](docs/BF-5R6_RELATORIO.md). Sem aprovação artística/hardware ou merge.


## BF-5R5 — candidata (2026-11-04)

- Biblioteca retém a cena pausada entre abas, preserva câmera sem mudanças de conteúdo representado e permite tentar novamente após falha WebGL. Pátio e gestos R4 preservados.
- Fichas de força/mobilidade com exercícios, séries/repetições/carga/tempo; execuções datadas guardam o treino realizado. Banco v9 aditivo, compatibilidade de dados v8 e backup v6 preservada.
- Série prioriza temporada/episódio e histórico de episódios; filme recebe exibições/reencontros, estudo uma trilha e trabalho passos com resultado. Sessões manuais têm tempo opcional; histórico exibe resultados/notas/páginas e frequência de prática.
- Notas/citações contextuais nos detalhes, controles/disclosures mais suaves, diálogo/HUD/dock coesos e vibração leve opcional por capacidade, respeitando movimento reduzido.
- Diagnósticos e apresentação de habitantes isolados de React; contagem da cena acompanha diagnósticos em vez de cada frame. Sem alegação de desempenho físico aprovado. BF-5 aberta, PR #20 draft. [Relatório](docs/BF-5R5_RELATORIO.md).


## BF-5R4 — reconstrução de experiência candidata (2026-11-03)

- Removido zoom por proporção da R3; pátio exterior real e câmera ortográfica recuada para preservar profundidade durante exploração.
- Arrastes curtos passam a aplicar o delta que ultrapassa o limiar de tap imediatamente.
- Reconstruídos os seis editores por capítulos/contexto; erro de edição preserva o preenchimento.
- Papel/tinta/latão, gravuras locais, superfícies específicas por área e chegada curta sem stagger. Sem schema, dependências ou alterações de backup.
- [Relatório, limitações e testes](docs/BF-5R4_RELATORIO.md); candidata sem aceite humano e com fluidez entre abas ainda pendente.


## BF-5R3 — câmera de abertura e composição do compêndio (2026-11-03)

- O mundo composto passou a abrir em enquadramento mais aproximado em retrato, evitando margens excessivas que pareciam uma chapa do canvas; zoom manual, pan, orientação e panorama em paisagem permanecem disponíveis.
- Reformulação estrutural da Coleção (fichas de artefato compactas e símbolos semânticos apenas decorativos), apresentação do detalhe de registro e identidade contextual das demais abas.
- Hierarquias e transições leves em `src/styles-ritual.css`, com suporte a redução de movimento, toque e telas estreitas, sem novos dados ou dependências.
- Adicionados testes de câmera e E2E de Coleção/Detalhes, [relatório](docs/BF-5R3_RELATORIO.md) e documentação de ressalvas. Ainda sem aceite visual físico ou merge da PR #20.


## BF-5R2 — imersão sem chapa e interações táteis (2026-11-03)

- Retirado gradiente inferior em tela inteira da Biblioteca; mantida apenas vinheta superior com canvas 100dvh.
- Redesenhados estados de pressão/touch de controles, formulários e filtros, CTAs responsivos em retrato e acentos mágicos discretos.
- Transições de rota simplificadas para transform/opacidade sem blur de página, removendo backdrops filtrados custosos.
- Acrescentados teste E2E focalizado e [relatório BF-5R2](docs/BF-5R2_RELATORIO.md). Não há prova física de eliminação de engasgos; código enviado à PR #20 draft, sem merge.


## BF-5R1 — intervenção remota na candidata rejeitada (2026-11-03)

- Proprietário rejeitou o acabamento e a ergonomia da primeira PR #20 no Moto G06. A correção atua na própria branch draft, sem merge.
- Implantado novo sistema visual arcano em `src/styles-arcane.css`, sigilo SVG editorial, dock flutuante de medalhões, biblioteca full-viewport com bússola para ferramentas acessíveis sob demanda e planos de diálogo RPG mais expressivos.
- Atualizados teste unitário e E2E para a descoberta das alternativas via hub; acrescentado roteiro de avaliação da candidata em `docs/BF-5R1_RELATORIO.md`.
- Nenhum schema, dado, motor narrativo, backend ou dependência alterado. Teste físico e novo resultado CI ainda não obtidos nesta alteração.


## BF-5 — candidata de apresentação (2026-11-03)

- Biblioteca com canvas na área do viewport, alternativas recolhidas e narrativa em sobreposição acima do dock.
- Categorias diretas e lista compacta na Coleção; composição editorial no Arquivo e Resumo; atalhos de seções em Ajustes.
- Paleta compartilhada, tratamento de toque, movimento reduzido e Back/Escape de narrativa e exploração.
- Sem mudança de schema, backup, domínio ou motor narrativo. Candidata sem aceite humano; ver relatório BF-5.

## BF-5 — direção visual global (somente documentação; 2026-11-03)

- Publicado [Guia de Direção Visual Global — Fantasia Sobrenatural Editorial](docs/BF-5_DIRECAO_VISUAL_GLOBAL.md), abrangendo as cinco abas com identidade compartilhada, atmosferas distintas, linguagem de materiais/luz, interação ao toque, transições, ergonomia e contenção de efeitos mágicos.
- Registrado o conceito de fantasia sobrenatural aprovado pelo usuário, mantendo paleta, tipografia, formas, animações e composição específicas como propostas para posterior validação visual.
- Apenas documentação na `main`, sem PR, alteração de produção, assets, dependências, APK, novo gate físico ou resolução das ressalvas de BF-4.

## BF-5 — manifesto e contrato conceitual da tela Biblioteca (somente documentação; 2026-11-03)

- Criado [manifesto criativo e contrato funcional](docs/BF-5_BIBLIOTECA_MANIFESTO_CONTRATO.md) para a tela principal: mundo 3D em tela cheia, dock inferior estilizado, HUD contextual, interações/diálogos em linguagem RPG e caminho exploratório rumo a uma experiência com identidade de game.
- Separados elementos de direção já escolhidos pelo usuário e propostas visuais/interativas ainda sujeitas a discussão; preservadas funções convencionais e alternativas acessíveis, sem antecipar sistemas novos da BF-6.
- Apenas planejamento/documentação na `main`, sem PR, código de produção, assets, schema, backup, APK ou validação física nova; ressalvas e CI anteriores inalteradas.

## Replanejamento pós-BF-4 — BF-5, BF-6 e BF-7 (somente documentação; 2026-11-03)

- Aprovada a ordem **BF-5 — reforma global de UI/UX**, **BF-6 — aprimoramento do Mundo Vivo/RPG/animações/interatividade** e **BF-7 — consolidação funcional/assistiva** (responsabilidade da antiga BF-5), conforme [ADR-014](docs/decisions/ADR-014-replanejamento-pos-bf4.md).
- **Método BF-5:** uma grande reforma de interface integrada seguida de refinamentos sucessivos com validação humana, **sem exigir implementação em checkpoints pequenos**; design e detalhes técnicos ainda serão planejados, sem autorização de código nesta alteração.
- Preservadas as exceções da BF-4: CI global FAIL, issues #4/#11/#15, TalkBack, R-19, folio Lua, finais não testados exaustivamente e desempenho sustentado. Nenhum runtime, asset, dependência, schema, backup, teste ou versão modificado.


## BF-4G / BF-4 — concluídas no escopo dirigido com exceção CI (2026-11-03)

- Consolidação documental dos contratos B–F, matriz de evidências e roteiro curto Moto G06 em `docs/BF-4G_RELATORIO.md`.
- Sem alteração de comportamento, arte, versão, schema ou backup. **BF-4G/BF-4 fechadas no escopo funcional dirigido**: auditoria independente favorável; gate Moto G06 **6/6 PASS**; usuário autorizou merge da [PR #18](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/18). [CI 41570848247](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41570848247) **FAIL global** (708 Vitest PASS; 30 E2E PASS, 3 FAIL, 1 flaky). #4/#11/#15, folio Lua, R-19, TalkBack e testes sustentados permanecem pendentes. BF-5 e refinamentos de UI/UX e personagens/RPG seguem futuros; sem beta/release. [Fechamento](docs/BF-4G_RELATORIO.md).

## BF-4F4 — concluída no escopo dirigido, com exceção CI (2026-11-02)

- Quatro histórias individuais completas e A Noite da Fenda Lilás em cinco atos, com escolhas, pistas, colaboração, consequências e epílogos distintos, inteiramente offline.
- Conversa pelo toque nos habitantes ou React, diário de sessão, adiamento/retomada, teclado/foco e leitura sem WebGL.
- Gestos coordenados com a autonomia, vínculos narrativos separados dos encontros espontâneos, props restauráveis e atmosfera própria da fenda nos cinco cômodos.
- Progresso somente nesta visita; nenhum registro, schema, backup, dependência ou versão alterado. **Fechamento dirigido autorizado:** usuário confirmou questões/escolhas funcionais no Moto G06 e apresentou seis capturas do painel RPG e Fenda Lilás; sem confirmação física individual de todos os cinco finais. [CI PR #17](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41550602711) FAIL global (23 E2E PASS, 11 FAIL), novos E2E F4 2/2 PASS. Merge expressamente autorizado por exceção CI; BF-4F1–F4 concluídas no recorte dirigido, BF-4G pendente. UI/UX e refinamento de personagens/RPG/diálogos/interatividade reservados para fases futuras próprias. [Relatório](docs/BF-4F4_RELATORIO.md).

## BF-4F3 — concluída no escopo dirigido, com exceções CI e Lua (2026-11-02)

- Samael, Aryn, Ytha e Lua escolhem atividades, circulam pelos cinco cômodos, repousam e se aproximam espontaneamente; seis relações mudam por atrito, cooperação e reconhecimento durante a sessão.
- Lua pode chamuscar um folio de treino fictício e aceitar ajuda para repará-lo; nada altera os seis tipos de registro ou o Segredo do Pergaminho.
- Habitantes recolhido oferece atividades/localização, acontecimentos e vínculos sem pontuação; controles F2 interrompem e coordenam as rotinas. Pausa, movimento reduzido e falha WebGL possuem texto fiel e não simulam percursos.
- 690 Vitest, novo E2E F3 remoto e gates de código/build PASS. Moto G06: Autonomia, Convivência e Integração PASS; **Acidente de Lua NÃO TESTADO** fisicamente. [CI #41542040077](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41542040077) **FAIL global** (21 E2E PASS, 10 FAIL, 1 flaky); ressalva assumida por autorização explícita de encerramento e merge da [PR #16](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/16). TalkBack, R-19, cota sustentada, BF-4G e dívida #4/#11/#15 continuam; BF-4F4 é próxima. [Fechamento](docs/BF-4F3_RELATORIO.md).


## BF-4F2 — concluída no escopo dirigido (2026-11-02)

- Habitantes articulados: repouso, passos com deslocamento local, giro, reação, cumprimento, atividades e magia cenográfica; Lua recupera postura após conjuração instável.
- Controles contextuais no painel Habitantes, feedback textual de ação/carga/indisponibilidade/movimento reduzido.
- Clips finitos e transições no RAF existente; fontes Blender e GLBs atualizados sem skinning ou dependências novas. **Gate físico/artístico dirigido PASS**: reações e ações React confirmadas no Moto G06 sem regressão/perda de fluidez percebida; simplicidade aceita para F2.

**Integração autorizada:** o usuário aprovou o encerramento e merge da [PR #14](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/14) com [CI 41532160557](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41532160557) **FAIL: 20 E2E PASS, 10 FAIL, 1 flaky**, incluindo quatro casos novos F2 em [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15); #4/#11 continuam abertas. **Diretriz:** primazia artística e criativa, sem restrição preventiva por receio do Moto G06; otimização de gargalos demonstrados, testes proporcionais e sem loops de timeout consumindo cota.

## BF-4F1 — concluída no escopo dirigido (2026-11-02)

- Quatro habitantes 3D com fontes editáveis, microgesto e seleção canvas/React no mundo composto.
- IDs de personagem independentes dos registros; fallback textual sem WebGL.
- Arte e validação física pendentes, especialmente aura de Samael e asas de Ytha. Sem fechamento F1.

Mudanças observáveis da Biblioteca Viva seguem a estrutura do Keep a Changelog. O registro bruto anterior à reorganização documental, incluindo checkpoints intermediários, está preservado em `docs/history/legacy/CHANGELOG_LEGACY.md`.

## [Não lançado]

**Fechamento BF-4F1 (2026-11-02):** quatro modelos iniciais de Samael, Aryn, Ytha e Lua aprovados no Moto G06; seleção canvas/React confirmada e [PR #13](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/13) autorizada a merge. Microgestos rígidos de cabeça apenas; **F2** permanece responsável por animação corporal e gestos, F3 por IA local, F4 por quests. [CI 41520167206](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41520167206): gates não E2E PASS, 667 unitários; E2E final FAIL (20 PASS, 6 FAIL, 1 flaky), sem alegação de CI global PASS. [Relatório](docs/BF-4F1_RELATORIO.md).


### BF-4F — Plano técnico de F1–F4 sem preflight isolado (documental; 2026-11-02)

- [Plano técnico BF-4F](docs/BF-4F_PLANO_TECNICO.md) aprovado: **F1** produz os quatro habitantes integrados com verificação de GLB/rigging/ownership durante a criação do personagem definitivo, **F2** entrega animações, **F3** autonomia/relações, **F4** diálogos RPG/quests.
- **Sem spike/preflight de autoria separado**, sem criação de engine de avatares genérica ou benchmark experimental descartável; preservar avaliações visuais e técnicas dentro do trabalho útil. Próxima tarefa autorizável ao Codex é implementar **somente BF-4F1**, com sync seguro, commit, push e PR sem merge.
- **Documentação apenas:** nenhum modelo, asset, código de produção, teste executado ou PR da BF-4F foi criado nesta atualização.


### BF-4F — Concepção narrativa e quatro habitantes (documental; 2026-11-02)

- Documento canônico dos **quatro habitantes sobrenaturais** (Samael, Aryn, Ytha e Lua): raça/altura, silhuetas, aparências, personalidade, hábitos e horário, poderes, repertório de animações, seis relações mútuas, quatro quests individuais e arcos compartilhados.
- [ADR-013](docs/decisions/ADR-013-bf-4f-quatro-habitantes-rpg.md) substitui o antigo alvo de três habitantes por quatro e define **conversa offline por três ou quatro respostas predefinidas**, efeitos narrativos/autorizados, desenvolvimento de relações e quests RPG, **sem LLM**. [Concepção completa](docs/BF-4F_CONCEPCAO_HABITANTES.md).
- Somente documentos alterados: **sem personagem/modelo/IA/quest codificado, build, teste físico ou BF-4F encerrada**.


### BF-4E — Objetos vivos concluídos no escopo dirigido, exceção CI (2026-11-02)

- Dez famílias de objetos vivos com animações, iluminação, estados de sessão e sequência do Segredo do Pergaminho em quatro etapas nos cinco cômodos. Após rejeição da UX inicial com botões, interação primária por toque direto; atmosfera contextual por horário local/estudo/descoberta; React recolhido como alternativa acessível.
- **Gate Moto G06:** toque, pan, zoom e seleção sem regressões percebidas; segredo completo 4/4, com imagens do progresso. Após hotfix, o usuário confirmou melhora dos alvos de toque de pergaminho/livro, direção correta da gaveta E e desaparecimento da faixa após 4 segundos. Encerramento e merge da [PR #12](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/12) expressamente autorizados.
- **Exceção CI:** [41438324911](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41438324911) **FAIL global** com 661/661 Vitest, formato/lint/tipos/áudio/build/performance PASS e **20/24 E2E PASS**; coleção cheia 1280/390 px ([#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11)) e `r4-shell` interação/dez ciclos ([#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4)) seguem abertas. Sem CI verde, TalkBack PASS, benchmark sustentado ou release. [Relatório final](docs/BF-4E_RELATORIO.md).


### BF-4E — Registro histórico da visão criativa (2026-11-02)

- Documentada a proposta de dez famílias de objetos interativos, animações de props, iluminação real, eventos interdependentes, três atmosferas e um pequeno segredo encadeado nos cinco cômodos. Sem implementação, teste, APK ou merge de feature; o próximo passo é o prompt Codex sob [contrato BF-4E](docs/BF-4E_VISAO_CONTRATO.md).


### BF-4D — Organização espacial encerrada com exceção CI (2026-11-02)

- Distribui as três estantes em três cômodos, reorganiza os 13 slots de registros nos cinco ambientes e compõe os mesmos 18 conjuntos de mobília junto às áreas de leitura, estudo e descanso.
- Reserva circulação e aproximações livres, preservando passagens, seleção canvas/React, 70 livros, overflow e navegação. Define zonas/pontos declarativos para futuras atividades, sem executá-las.
- **Fechamento BF-4D:** auditoria independente e gate visual/físico dirigido no Moto G06 aprovados (quatro capturas; arraste, zoom, seleção, orientação sem regressões relatadas). [CI PR #10/41405622312](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41405622312) **FAIL** com 645 Vitest PASS e 19/21 E2E PASS, timeouts de `r4-shell` histórico ([#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4)) e E2E novo BF-4D coleção cheia ([#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11)). Usuário aceitou explicitamente ambas as dívidas e autorizou merge; **CI não foi aprovada**. R-19/TalkBack e BF-4E–G pendentes; sem benchmark sustentado ou release. [Relatório final](docs/BF-4D_RELATORIO.md).

### BF-4C — ampliação, mobília e fechamento dirigido com exceção CI (2026-11-02)

- Amplia os cinco cômodos e as quatro passagens, com exploração por pan/zoom sobre os pisos reais.
- Acrescenta 18 conjuntos de mesas, assentos, tapetes, luminárias, plantas e armários; mantém registros selecionáveis e tamanhos originais.
- **Fechamento BF-4C:** auditoria estática sem bloqueantes e aprovação visual/física dirigida no Moto G06 (nove capturas; pan/zoom/seleção, retrato↔paisagem, segundo plano/retorno sem regressões relatadas). A [CI da PR #9, run 41387959550](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41387959550), terminou **FAIL**, com 638 Vitest PASS e **18/19 E2E PASS**, timeout no `r4-shell` histórico; encerramento e merge autorizados **por exceção formal**, mantendo issue #4 aberta. Representações de registros com posições provisórias ficam para organização BF-4D, sem prometer editor livre de móveis. R-19 e TalkBack permanecem pendentes; sem benchmark sustentado, beta ou release. [Relatório final](docs/BF-4C_RELATORIO.md).

### BF-4B — Ambiente dos cinco cômodos — 2026-11-01

- Biblioteca funcional recebe assoalhos com juntas, pedra, painéis bordô/verde, molduras, pilastras, latão e luz quente em todos os cinco ambientes neutros.
- Mantidos os quatro acessos, três estantes, livros/registros, seleção e navegação ortográfica. Detalhes repetidos usam instâncias por material com descarte por montagem.
- **Fechamento dirigido (2026-11-02):** auditoria e [CI PR #8](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41379918451) PASS, APK recompilado instalado e avaliação visual/funcional PASS no Moto G06. Faixas de latão coplanares corrigidas com teste. Leve tremulação/borramento de paredes em movimento adiada como ressalva R-19 não bloqueante; reforma UI React/Three.js futura. Issue #4 e TalkBack seguem abertos; sem benchmark sustentado, beta ou release. [Fechamento BF-4B](docs/BF-4B_RELATORIO.md).


### BF-3F/BF-3 — Fechamento físico-funcional dirigido, com exceção CI — 2026-11-01

- BF-3F finalizada em duas rodadas no Moto G06: 5/5 PASS para toque nas três estantes/destaque, controles Próximo/Anterior, pan/pinch/zoom, rotação e background/resume; 6/6 PASS para seis categorias e representações, seleção canvas/React, abertura/edição/retorno e inspeção visual/fluidez. Evidência humana registrada na [issue #5](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/5); sem falhas relatadas.
- A captura física mostra runtime `running`, 12 selecionáveis, aproximadamente 60,0 FPS e 16,7 ms de frame médio no instante da coleta. Observação qualitativa/pontual, sem benchmark sustentado, stress, aprovação de arte final ou comprovação do SHA exato embutido no APK.
- BF-3 encerrada **somente no escopo técnico-funcional e físico dirigido**, por decisão de aceitar a CI intermitente como dívida separada. A CI da `main` [41277733624](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41277733624) falhou no E2E `r4-shell` (17/18); PR experimental #3 fechado sem merge, causa inconclusiva e [issue #4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4) permanece aberta. Não declarar gate CI verde nem release/beta aprovado.
- Sem alteração de código, runtime, dados, schema, dependências ou assets no fechamento. TalkBack segue obrigatório antes do primeiro recorte real/beta; BF-4 e P3D-B2–F continuam fora do escopo até decisão própria.

### BF-3E3/BF-3E — Gate técnico aprovado — 2026-11-01

- A suíte E2E da Biblioteca verifica abertura, edição e retorno dos seis tipos: livros no fluxo BF-2 já existente e os outros cinco tipos no cenário ampliado da E3. O teste do shell acompanha o título semântico vigente e preserva o acesso à Coleção.
- O E2E de memória espera a confirmação observável da pausa antes de recarregar, mantendo a verificação de persistência. A corrida anterior é possível; a causa específica das falhas históricas remotas permanece incerta.
- Gate local e CI remota do PR #2 confirmados: format:check, lint, typecheck, 78 arquivos/635 testes Vitest, audio:check, build, performance:report e 18 E2E aprovados. GitHub Actions `41272609003` passou no commit `4aef4088df4944cedab2f80551dc52c5be379a25`. O aviso de chunks acima de 500 kB permanece; o relatório é estático, não um benchmark Android.
- Auditoria independente da Luna concluída com PASS técnico em 2026-11-01, sem bloqueantes no PR #2; BF-3E fechada no escopo técnico. BF-3F segue aberta para validação integrada e física. Não houve novo APK, aprovação visual integrada, Android físico ou TalkBack neste checkpoint; BF-3 não está concluída.

### BF-3E2 — Interface dos seis tipos e seleção bidirecional — 2026-09-24

- Biblioteca organiza os seis tipos do snapshot E1 em listas semânticas, com título, tipo, link de abertura e indicação de representação; mantém autor e fluxo dos livros BF-2.
- Seleção visual só é oferecida para instâncias do catálogo real com runtime pronto; canvas → React valida identidade contra catálogo e snapshot. Overflow mantém acesso convencional e falha 3D não é apresentada como overflow.
- Detalhe e edição preservam a origem Biblioteca (`/`) para retorno; corrigida a perda da origem na edição dos cinco tipos não livro. E2E dirigido com dados fictícios comprova seis tipos, seleção React, abertura, edição e retorno.
- Validação local: 10 arquivos/149 testes Vitest dirigidos, `reading-area` 5/5 E2E, `r4-shell` 6/6 E2E, format:check, lint, typecheck e build passaram. O aviso de chunks acima de 500 kB permanece. E3, auditoria independente, BF-3F, Android físico, TalkBack e avaliação visual integrada seguem pendentes.

### BF-3E1 — Consulta agregada e ponte React → runtime — 2026-09-23

- Biblioteca consulta os seis tipos uma vez por montagem e entrega o snapshot neutro ao runtime normal; a lista, seleção, abertura e fallback dos livros permanecem disponíveis.
- Gate local: 6 arquivos/93 testes dirigidos, 78 arquivos/630 testes Vitest, format:check, lint, typecheck e build passaram; o aviso de chunks acima de 500 kB permanece. E2/E3 e as validações humanas continuam pendentes.
- Correção pós-auditoria: os E2E `r4-shell` agora verificam a rota composta vazia, catálogo das três estantes e um ponto de picking realmente alcançável na viewport, mantendo seleção, highlight, gestos, orientação e dez remontagens. O teste `p1-memory` passou isolado após a falha oscilante observada na CI remota; sessões e persistência não foram alteradas.
- Revalidação local da correção: `r4-shell` 6/6, `p1-memory` isolado 1/1, E2E completo 17/17, format:check, lint e typecheck passaram. A nova CI remota e a microauditoria do diff ainda dependem de publicação externa.

### BF-3D3 — Robustez e fechamento técnico da D — 2026-09-23

- testes dirigidos consolidam rollback da composição, falha após criar edifício e registros, attach parcial da interação, falha WebGL terminal, descarte repetido, isolamento de montagens, seleção obsoleta, callbacks tardios, 13 registros, 70 livros, três estantes, overflow, caminho legado e F5; a prova pós-auditoria D2 de picking BF-2 no mundo composto integra a regressão;
- corrigido vazamento de listener no canvas quando o construtor de `ThreeWorldInteraction` falha durante o attach; a própria interação agora remove listeners já registrados antes de propagar o erro, e o runtime preserva a falha de mount pública e o descarte terminal;
- gate local: 6 arquivos/85 testes dirigidos, 78 arquivos/626 testes Vitest, format:check, lint, typecheck, audio:check, build, performance:report e 17 E2E passaram. O build mantém aviso de chunks acima de 500 kB; o relatório mostra 634.053 bytes iniciais e 659.439 bytes no chunk dinâmico Three. Não são medidas físicas;
- D3/D recebem PASS técnico local. A apresentação visual integrada, bounds F3/oclusão, BF-3E/3F, Android físico e TalkBack permanecem pendentes; BF-3 não está concluída.

### BF-3D2 — Catálogo, picking e seleção — 2026-09-23

- wrappers anexados dos cinco novos tipos entram no catálogo e no raycast com `instanceId`, `entryId` e rótulo textual identificável; seleção por canvas ou ID recebe highlight e limpa o anterior ao trocar ou invalidar a seleção;
- preservados os 70 livros e três estantes BF-2, o caminho legado, overflow sem root/seleção, descarte isolado e F5 sem conteúdo BF. A ponte React e a alternativa convencional dos novos tipos seguem para BF-3E; robustez consolidada e fechamento D seguem para BF-3D3;
- a sobreposição projetada entre uma série e estante exige toque na parte visível; apresentação integrada, ergonomia, Android e TalkBack não foram aprovados.
- gate técnico local: format:check, lint, typecheck, 78 arquivos/622 testes Vitest, build e 17 E2E passaram; os E2E cobrem a rota BF-2 atual, pois a ponte React dos cinco tipos ainda pertence à BF-3E.

### BF-3D1 — Integração por squash do PR #1 e PASS técnico dirigido — 2026-09-23

- entrada opcional de `LibraryWorldSnapshot` no runtime normal, exclusiva da entrada legada `readingAreaBooks`; a categoria `book` reutiliza BF-2 e F5 ignora inclusive snapshots inválidos;
- construção e wrappers procedurais para os placements BF-3C anexados somente no caminho composto, com ownership da montagem, descarte terminal, rollback de criação parcial e ausência de roots para overflow. A geometria técnica F1 não é empilhada sobre o edifício quando o snapshot composto está presente; BF-2 legado e F5 conservam o caminho anterior;
- os novos registros seguem não selecionáveis até BF-3D2. As correções dirigidas cobriram indicadores de proxies, primeiro quadro com zoom 0,7 e provas de identidade, rollback de geometria/material e montagens independentes. Duas auditorias Codex e microverificação final aprovaram tecnicamente a D1; a CI do HEAD aprovado passou integralmente, inclusive E2E. A `main` recebeu o squash `6b613e2`; D2 é a próxima execução, D3 segue pendente. Bounds F3 do piso técnico, apresentação visual/oclusão/ergonomia, Android e TalkBack permanecem sem PASS.

### BF-3C3/BF-3C — Consolidação e fechamento — 2026-09-22

- registrado PASS humano da hipótese 3 nos cenários A/B/C, com ressalva de fidelidade à referência 2D; hipóteses 1 e 2 permaneceram FAIL visual dirigido;
- promovidos os cinco cômodos neutros, a construção procedural com quatro passagens e o layout inicial de 13 slots derivados a contratos reutilizáveis independentes da prévia. Overflow permanece ordenado e sem root;
- acrescidas provas com Box3 real para construção, fábricas, passagens, paredes, 13 representações, três estantes e 70 livros BF-2, além de ordem, identidade, imutabilidade, ownership e descarte. Gate local: 77 arquivos/616 testes, format:check, lint, typecheck, audio:check e build;
- removidos HTML, bootstrap, renderer, cenários sintéticos e módulos BF-3C3 temporários; preservada a referência PNG documental. BF-3D permanece não iniciada; Android, TalkBack, ergonomia, seleção e arte final não foram aprovados.

### BF-3C3 — Hipótese 3, correção dirigida da planta — 2026-09-22

- registrado o FAIL visual da hipótese 2 especificamente na planta retangular subdividida; a legibilidade das representações foi preservada;
- refeita a construção procedural da prévia como núcleo central BF-2 e quatro salas periféricas deslocadas, com pisos separados e quatro passagens abertas. A imagem 2D orienta somente topologia e hierarquia; seus nomes/temas não são contrato e os cômodos continuam semanticamente neutros;
- redistribuídos os 13 placements determinísticos nos novos volumes, mantendo A/B/C em 5/13/13 e overflow 0/0/4, sem representação 3D para excedentes. Ajustado o zoom inicial da prévia; pan, wheel focal, pinch/pan e ownership/cleanup permanecem. Novo gate humano pendente; BF-3C3/BF-3C seguem em andamento.

### BF-3C3 — Segunda hipótese multiambiente isolada — 2026-09-22

- substituída a prévia de sala única por construção procedural com cinco cômodos conectados e semanticamente neutros, piso, paredes baixas e passagens. A composição BF-2 segue na prévia sem alteração produtiva;
- ampliadas as cinco fábricas reais e a autoridade de dimensões. O layout puro temporário deriva 13 slots (2 filme, 2 série, 3 estudo, 3 atividade física, 3 trabalho), com distribuição descartável por cômodo, determinismo e overflow sem root;
- cenários A/B/C agora exibem 5/13/13 placements e 0/0/4 excedentes. O instrumento mantém pan, wheel focal e pinch/pan, cleanup de roots, observer, interação e renderer; não há seleção, integração produtiva ou persistência espacial. Novo gate humano pendente, sem concluir BF-3C3/BF-3C.

### BF-3C3 — Prévia visual temporária isolada — 2026-09-22

- adicionada somente para inspeção humana a entrada Vite `bf3c3-preview.html`, separada da rota Biblioteca e do build produtivo corrente. Ela projeta registros convencionais fictícios e determinísticos pela BF-3B, usa as cinco fábricas C1 e os placements C2 reais, e mostra cena de referência, estantes BF-1 e 18 livros fictícios BF-2;
- os cenários são baixa densidade (5 placements), capacidade completa (37: 6/7/8/9/7) e overflow (37 placements, excedentes somente filme 2 e estudo 2). O painel de desenvolvimento expõe contagens e excedentes não recebem root, mesh, slot ou posição;
- a prévia reutiliza câmera/navegação Three vigentes para pan, zoom focal e pinch, sem integrar `LibraryPage`, `WorldHost`, `ThreeWorldRuntime`, consultas, Dexie, F1, F5, picking ou seleção BF-3D. Sua root de registros é descartada na troca de cenário e todo o instrumento libera roots, interação, observer e renderer no unload. O gate visual humano continua pendente; BF-3C3 e BF-3 não estão concluídas.
- correção de fronteira: geração/projeção dos registros sintéticos e o bootstrap temporário ficam fora de `three/`; o renderer da prévia recebe somente snapshots/resultados neutros. O teste arquitetural permanece inalterado e continua impedindo dependência do renderer em domínio, application, infraestrutura ou Dexie;
- primeiro gate humano da C3: pan e pinch funcionaram normalmente, porém a composição de sala única recebeu FAIL dirigido porque as cinco novas representações ficaram pequenas demais e não eram reconhecíveis com segurança no enquadramento normal. A ausência de seleção permanece esperada até BF-3D;
- autorizada nova hipótese C3 com cinco cômodos procedurais conectados e semanticamente neutros. A distribuição atual dos tipos entre cômodos será apenas uma configuração da prévia: os espaços não terão categoria/etiqueta nem regra que impeça futura reorganização pelo usuário. A capacidade de 37 deixa de ser objetivo visual; novos slots serão derivados depois de priorizar legibilidade.

### BF-3C2 — Layout determinístico, bounds e overflow — 2026-09-22

- adicionados contrato puro de slots/placements/overflow e zona complementar provisória para os cinco `modelTypeId` BF-3B. A capacidade é derivada de 37 slots: filme 6, série 7, estudo 8, atividade física 9 e trabalho 7; os 70 slots de livros permanecem exclusivos da área BF-2;
- a distribuição preserva ordem lógica e identidade (`modelTypeId`, `instanceId`, `entryId`), rejeita configuração/IDs inválidos e devolve excedentes ordenados sem root, geometria, material, catálogo, picking ou posição fictícia. As dimensões C1 foram extraídas para uma única autoridade renderer-free compartilhada com o layout;
- testes `Box3` cobrem os envelopes reais das cinco fábricas, limites da zona, não interseção entre ocorrências e contra estantes, 70 livros e proxies técnicos efetivamente modelados. Não houve integração com runtime, React, consulta, câmera, cena, Dexie, schema, backup ou persistência espacial; BF-3C3 passa a ser o próximo checkpoint e o gate visual humano continua pendente.

### BF-3C1 — Contrato breve e cinco representações isoladas — 2026-09-22

- adicionadas fábricas Three.js isoladas para os cinco `modelTypeId` semânticos BF-3B: painel audiovisual (`movie-record`), três casos de mídia (`series-record`), caderno (`study-record`), marcador neutro de percurso (`physical-activity-record`) e pasta/arquivos (`work-record`); cada uma preserva exatamente `entryId` e `instanceId`, retorna root local não anexada e usa recursos próprios por chamada;
- os bounds reais, testados por `Box3`, são respectivamente 0,720 × 0,480 × 0,240 m; 0,660 × 0,500 × 0,200 m; 0,560 × 0,132 × 0,400 m; 0,460 × 0,590 × 0,400 m; e 0,600 × 0,300 × 0,400 m (largura × altura × profundidade). O descarte por `disposeObjectTree()` é deduplicado e isolado;
- não foram alterados snapshot BF-3B, livros/estantes BF-2, runtime, cena, câmera, layout, slots, capacidade, overflow, React, consulta, Dexie, schema, backup, fixtures F1/F4, F5, dependências ou persistência espacial. BF-3C2 passa a ser o próximo checkpoint; o gate visual humano permanece exclusivamente na C3.

### BF-3B — Projeção neutra dos cinco tipos restantes — 2026-09-22

- adicionado o snapshot TypeScript puro e imutável das seis categorias convencionais, ordenadas por `ENTRY_TYPES`; `book` reutiliza sem alteração a projeção BF-2, enquanto os cinco tipos restantes expõem somente os metadados documentados, `modelTypeId` e `instanceId` semânticos;
- a projeção ordena cada categoria por `createdAt` e `id`, rejeita `entryId` duplicado no conjunto completo e confirma unicidade de `instanceId`, sem mutar os registros de entrada;
- não foram alterados runtime, layout, geometria, `LibraryPage`, consultas, Dexie, schema, backup, dependências, persistência espacial ou cenários F5. BF-3C passa a ser a próxima etapa autorizável.

### BF-2E/BF-2 — Fechamento da primeira área de leitura — 2026-09-21

- encerradas BF-2E e BF-2 no escopo técnico-funcional e físico dirigido: o roteiro humano no Moto G06 confirmou a Biblioteca com livros reais, seleção alternada por canvas e React, abertura/edição/retorno, pan, pinch, zoom, rotação e background/resume com responsividade adequada; é observação qualitativa, não benchmark ou teto de capacidade;
- os volumes procedurais permanecem pequenos no enquadramento geral, mas são selecionáveis e foram aceitos pelo usuário para o escopo funcional atual. TalkBack humano continua como dívida obrigatória antes do fechamento do primeiro recorte real e de beta/release aplicável.

### BF-2E — Gate integrado da primeira área de leitura — 2026-09-21

- corrigido o ciclo de `LibraryPage` para associar snapshot, erro, catálogo e seleção à instância vigente de `application`; uma consulta antiga não pode sobrescrever a próxima montagem nem expor estado anterior durante o carregamento;
- atualizado o corpus E2E para a Área de leitura funcional e criado fluxo real com cadastro convencional, projeção, seleção React → runtime → controles, abertura pelo `entryId`, edição, retorno, overflow de 71 livros e ciclos de rota. O seed de 70 livros é exclusivo do contexto Playwright descartável `127.0.0.1:4173`; o reuso de servidor agora é opt-in;
- a cena normal não contém F1, enquanto F5 continua isolado e validado pelos testes de runtime. A capacidade inicial vigente é 70 (24 + 25 + 21), com 70 representados e um excedente acessível somente pela lista no cenário dirigido;
- confirmado o gate técnico web e gerado APK debug funcional para validação humana dirigida no Moto G06. A aceitação humana anterior no navegador cobre a escala procedural, a retirada da mesa oclusiva, a organização da sala, a ausência da pirâmide funcional e a visibilidade de livros reais; ela não aprova Android físico, TalkBack, arte final ou GLBs produtivos.

### BF-2D-BOOK-VIS-FIX — Volumes de leitura mais legíveis — 2026-09-21

- ampliadas as quatro variantes procedurais de `book-volume` para reforçar sua leitura no enquadramento normal, preservando cores, estrutura simples, identidade determinística e recursos próprios;
- o envelope máximo agora é 0,225 × 0,400 × 0,360 m (largura × altura × profundidade). As estantes derivam 24 + 25 + 21 = 70 slots iniciais; relayout BF-1D, ordem determinística e overflow continuam derivados da configuração vigente;
- a geometria real das três estantes e das quatro variantes passou por testes de bounds e de slots adjacentes. A confirmação visual humana no navegador continua pendente; câmera, composição da sala, seleção, query e persistência não foram alteradas.

### BF-2D-VIS-FIX — Área de leitura desobstruída — 2026-09-21

- removida a fixture visual F1 da área de leitura normal, preservando-a exclusivamente nos cenários diagnósticos F5;
- mesas e bancos foram deslocados para as laterais da sala, deixando a frente das estantes e os primeiros níveis de livros livres no enquadramento atual. Câmera, slots, seleção, query e persistência não foram alterados.

### BF-2D — Ponte React/aplicação e fluxo funcional — 2026-09-21

- a rota Biblioteca agora recebe somente o contrato estreito de `listBookEntries`, carrega um snapshot por montagem, reutiliza `projectReadingAreaBooks()` e o entrega ao `WorldHost`; carregamento, armazenamento indisponível e falha pública segura não são apresentados como coleção vazia;
- a lista React mantém todos os livros acessíveis por `entryId`, inclusive overflow, e oferece seleção no ambiente apenas para ocorrências confirmadas pelo catálogo do runtime. Seleção canvas → React preserva `entryId` e permite abrir o registro convencional sem mover foco;
- `WorldHost` ganhou ponte neutra para snapshot, seleção, catálogo e status, sem remontar o mundo em mudança de seleção. Falha WebGL mantém os links convencionais; não houve query no renderer, atualização live, schema, backup ou persistência espacial;
- F5 agora ignora também a validação do snapshot BF quando `performanceScenario` está presente, preservando o corpus diagnóstico mesmo diante de entrada BF estruturalmente inválida. BF-2E continua necessária para o gate integrado e fechamento.

### BF-2C — Integração com runtime, lifecycle e seleção — 2026-09-21

- extraído `ReadingAreaBook` para contrato neutro e injetável no `ThreeWorldRuntime`; Three recebe somente o snapshot lógico, sem `BookEntry`, application, Dexie, query ou React, e BF-2D continua responsável por fornecer registros reais;
- estreitada a identidade de `bookshelf` para `ProceduralBookshelfIdentity`; `book-volume` continua exigindo `entryId`, enquanto estantes não o exigem;
- slots agora são derivados da configuração atual de variantes. BF-1D reconcilia deterministicamente wrappers de livros, catálogo, picking e highlight; overflow não mantém root nem seleção e pode retornar quando a capacidade cresce;
- livros visíveis são irmãos da representação substituível da estante, selecionáveis pelo próprio `instanceId` e notificam `entryId`. Não houve persistência espacial, schema, backup, GLB, cache, instancing, navegação ou alteração funcional da página Biblioteca; F5 continua isolado.

### BF-2B — Livro procedural e layout determinístico da área de leitura — 2026-09-21

- ampliado o contrato procedural com `book-volume` e uma fábrica isolada de volume vertical, com quatro variantes discretas determinísticas, associação convencional `entryId` obrigatória e recursos próprios por chamada liberáveis por `disposeObjectTree()`;
- adicionados slots locais derivados das três estantes atuais: 89 posições em ordem declarativa, níveis de baixo para cima e esquerda para direita, com capacidade derivada, duplicidade explícita e overflow que preserva a ordem;
- slots futuros pertencem semanticamente ao wrapper estável da estante, não à root descartável da representação BF-1D. Não houve integração com runtime, seleção, React/aplicação, schema, backup, persistência espacial, GLB, loader, cache ou outra categoria de registro; BF-2C–E permanecem não iniciadas.

### BF-2A — Contrato e projeção dos livros reais — 2026-09-21

- adicionada a projeção neutra e determinística de `BookEntry` para ocorrências futuras `ReadingAreaBook`, com tipo visual `book-volume`, `entryId` preservado, `instanceId` estável `reading-book:${entryId}`, título, autor opcional e progresso de leitura disponível;
- a projeção ordena por `createdAt` e `id`, não muta os livros de origem e rejeita `entryId` duplicado antes de produzir ocorrências com o mesmo `instanceId`;
- não foram adicionados geometria procedural de livros, slots/layout, integração com `WorldHost`/`ThreeWorldRuntime`, seleção, carregamento da rota Biblioteca, schema, backup, persistência espacial ou outra categoria de registro. BF-2B permanece não iniciada.

### BF-1D — Substituição procedural, descarte e gate integrado — 2026-09-21

- adicionada troca síncrona e específica de uma representação `bookshelf` em montagem viva, preservando identidade lógica, posição, wrapper selecionável, catálogo, rótulo e demais estantes; a variante ativa é inerte e entradas/falhas inválidas preservam a representação válida;
- a nova root é preparada, anexada e assumida antes do descarte único da anterior; o unmount descarta somente a substituta ainda possuída, sem acumular roots em trocas repetidas ou remontagens;
- a seleção ativa preserva ID, datasets, controles React e picking, enquanto o `Box3Helper` anterior é liberado e recriado para os novos bounds; F5 continua sem composição e sem operação de troca;
- passaram o gate integrado técnico: format, lint, typecheck, 546 testes Vitest, build e 6 E2E da rota Biblioteca. Não foram adicionados GLB, `AssetManager`, cache, persistência espacial, remoção pública de estantes ou controles React de variante.

### BF-1C-FIX — Correção geométrica e variantes visuais — 2026-09-21

- corrigidas faces coincidentes e interseções internas das estantes BF-1C, reconstruindo fundo recuado, prateleiras legíveis, laterais, base e moldura sem mascaramento por renderer;
- adicionadas as variantes determinísticas equilibrada, alta/escura e larga/clara, preservando `modelTypeId` e os três IDs lógicos; `reading-shelf-03` passou para `[3, 0, -2.1]` após a prova de colisão com banco F1;
- preservados catálogo, seleção, lifecycle e F5. Após `493c887`, o gate visual humano no navegador aprovou as três estantes e variantes sem as deformidades, linhas ou perdas de definição antes reportadas; isto não aprova TalkBack, Android físico ou arte final.

### BF-1C — Integração estática com runtime e seleção — 2026-09-21

- a experiência normal da Biblioteca agora anexa a composição procedural de três estantes nas posições provisórias aprovadas; cada uma preserva seu `instanceId`, recebe rótulo legível, seleção por toque/clique e pelos controles React e o destaque visual existente;
- a montagem Three possui a root da composição e a libera por `disposeObjectTree()` no descarte ou falha de montagem; raízes e recursos continuam isolados em novas montagens;
- cenários F5 reconhecidos por `performanceScenario` continuam sem a composição e sem mudança de corpus, catálogo ou métricas diagnósticas; a fixture F1 técnica permanece visível na experiência normal. Não houve associação a registros, persistência espacial, substituição dinâmica, GLB produtivo, cache ou `AssetManager`; BF-1D passa a ser a próxima etapa.

### BF-1B — Composição declarativa e posicionamento determinístico — 2026-09-21

- adicionadas definições declarativas Three-independentes e a primeira composição de três estantes `bookshelf`, nas posições provisórias `[-3, 0, -2]`, `[0, 0, -2]` e `[3, 0, -2]`;
- separadas a root local da fábrica e o wrapper de instância que recebe posição; a composição valida `instanceId` duplicado antes de criar recursos e é liberada integralmente por `disposeObjectTree()`;
- cobertos por testes determinismo, ausência de mutação das definições, isolamento de recursos entre composições e descarte deduplicado. Não houve integração ao runtime, à rota Biblioteca, à seleção, a registros reais ou à persistência espacial; BF-1C passa a ser a próxima etapa.

### BF-1A — Contrato mínimo e primeira fábrica procedural — 2026-09-21

- adicionada fábrica TypeScript/Three.js isolada para `bookshelf`, com identidade lógica de tipo de modelo, instância e associação convencional opcional; cada chamada cria uma root própria, em identidade, com geometria local apoiada em `Y=0` e materiais simples;
- cobertos por testes dirigidos a geometria reconhecível, bounds, transforms, isolamento entre roots e descarte deduplicado de recursos compartilhados dentro da mesma root via `disposeObjectTree()`;
- não foram alterados runtime, `referenceScene`, interação, fixtures F1/F4, cenários F5, GLB, Dexie, backup, persistência espacial, seleção produtiva, composição ou substituição dinâmica. BF-1B passa a ser a próxima etapa.

### BF-0 — Biblioteca Funcional Primeiro — 2026-09-20

- registrada a ADR-011 e replanejada a sequência para BF-1–BF-5: conteúdo procedural/provisório primeiro, integração progressiva à Biblioteca funcional e possibilidade futura de substituição por GLB definitivo;
- preservados a conclusão técnica F0–F6, P3D-A, P3D-B1 e a proveniência do candidato `bookshelf`; P3D-B2–F ficaram adiados, não concluídos nem cancelados, condicionados à necessidade de ingestão/substituição GLB;
- mantidos React como superfície semântica de operações essenciais, Dexie v8 e backup v6 sem estado espacial; não houve mudança de runtime, assets, fixtures, domínio, aplicação, persistência, dependências ou testes de produção;
- mantida como bloqueante a dívida humana de TalkBack para o fechamento do primeiro recorte real, com remediação e validação física incremental futura no Moto G06, sem budgets preventivos.

### P3D-B1 — Proveniência e organização documental de `bookshelf` — 2026-09-20

- registrado `bookshelf` como candidato `grounded/static` distinto do fixture experimental `f4-b-quaternius-bookshelf`, com origem/autoria Quaternius, licença CC0 1.0 Universal e hashes da fonte upstream, licença e referência F4 preservadas;
- documentado que `upstream/Bookshelf.original.blend` é a fonte de partida e que a referência normalizada da F4 é somente histórica; B1 não criou fonte canônica normalizada, GLB produtivo, loader, catálogo, cache ou alteração de runtime;
- P3D-B permanece em andamento: B2 criará a fonte canônica editável normalizada, B3 fará exportação e validação, e B4 fará a promoção final.

### P3D-A — Contrato produtivo e estrutura do Pipeline 3D v1 — 2026-09-17

- criada a ADR-010 e promovido `ASSET_PIPELINE.md` à autoridade técnica do Pipeline 3D v1: GLB 2.0 autocontido, `GLTFLoader`/Three.js, fonte editável rastreável, normalização no asset, estados documentais e invariantes bloqueantes de promoção;
- definida somente como estrutura planejada para P3D-B a separação entre `assets/3d/source/<asset-id>/` e `src/features/library/three/assets/`; fixtures continuam técnicos e nenhum asset F1/F4 foi promovido;
- mantidos sem implementação assets produtivos, diretórios, scripts, automação de checker/export, loader/ownership produtivos, `AssetManager`, cache, codecs, budgets, catálogo, mundo real ou persistência espacial. P3D-B passa a ser o próximo checkpoint com um único asset canônico manual ponta a ponta.

### F5-C — Consolidação, guardrails iniciais e gate final — 2026-09-17

- consolidado o envelope físico F5 no Moto G06: o corpus diagnóstico até F4 ×4 é capacidade observada, não teto de calls, triângulos, geometrias, texturas, objetos, PSS ou Graphics;
- definidos apenas gatilhos provisórios de remedição — conteúdo simultâneo materialmente além do corpus, remount interno na ordem de um segundo ou nova carga de renderização — sem hard budget numérico, otimização avançada, Pipeline 3D, `AssetManager` ou persistência espacial;
- mantido o harness versionado e exclusivo de `VITE_ENABLE_DIAGNOSTICS=true` para regressão futura; F6 passa a ser a próxima fase autorizada. Não houve nova validação física nesta consolidação.

### F5-B — Stress físico, loading e limites — 2026-09-17

- coletada evidência física no Moto G06 para os três cenários diagnósticos, incluindo loading/remount, FPS/frame médio em repouso, memória ADB, estado térmico, interação humana, orientação, background/resume e sessão de aproximadamente 15 minutos no corpus ×4;
- corrigida a CSP para permitir `blob:` em `connect-src`, pois o `GLTFLoader` usa URLs blob para as imagens embutidas dos GLBs; após o fix, os mapas F4 aparecem no aparelho e as métricas distinguem mapas materiais de recursos WebGL reportados por `renderer.info`;
- nenhum budget, otimização avançada, asset novo, manager, streaming, catálogo ou arquitetura produtiva foi adotado. F5 continua em execução: F5-C consolidará as evidências e definirá limites iniciais somente se justificáveis.

### F5-A — Baseline e cenário de carga — 2026-09-15

- adicionado somente ao build de diagnóstico um seletor temporário que recria o `ThreeWorldRuntime` real com baseline F1, corpus F4 e corpus F4 ×4; o build normal mantém a fixture técnica;
- reutilizadas métricas de RAF e `renderer.info`, com identificação e progresso do cenário; os quatro fixtures registrados são a única fonte de assets, sem dependência do laboratório F4 ou da variante Poly Haven 512;
- nenhum budget físico, otimização avançada, asset manager, cache, catálogo, persistência espacial ou Pipeline 3D produtivo foi criado. O APK debug de diagnóstico segue para a validação física F5-B no Moto G06.

### F5-A-FIX — seletor diagnóstico Android — 2026-09-16

- substituído o `<select>` cujo picker WebView ocultava as opções no Moto G06 por três botões DOM com `aria-pressed` e estado ativo anunciado; a troca preserva o mesmo remount do runtime;
- o harness permanece exclusivo de `VITE_ENABLE_DIAGNOSTICS=true`; nenhuma métrica, asset, budget ou arquitetura produtiva mudou;
- o APK corrigido ainda não recebeu validação física e esta correção não inicia F5-B.

### F4-F — Contrato experimental de assets 3D concluído — 2026-09-15

- consolidada a evidência F4-A–E: autoria/preflight, geometria/eixos, materiais/UV/texturas, lifecycle/ownership/disposal e custo/otimização experimental;
- preservados quatro fixtures registrados e testes de contrato; confirmados laboratório e variante 512 como evidência externa não autoritativa, sem dependência para F5;
- nenhum pipeline produtivo, `AssetManager`, asset final, budget, codec ou mudança de runtime foi criado. F5 — performance e validação Android física — passa a ser a próxima fase.

### F4-E-CLOSE — Custo e compressão experimental concluídos — 2026-09-15

- consolidada a evidência E1–E4: o baseline dos quatro fixtures identificou Poly Haven como outlier de textura, e a variante laboratorial 512 reduziu seu GLB de 5.828.612 para 711.352 bytes (-87,796%) e a estimativa RGBA8 base de 12 para 3 MiB (-75%);
- preservadas geometry, índices, UV, transforms, hierarchy, material e metallic/roughness compartilhado, com `GLTFLoader` real de `three@0.185.1`; o gate humano foi PASS com leve desfoque em comparação próxima, considerado aceitável e não bloqueante para o uso ortográfico/2.5D;
- nenhum fixture registrado, runtime, dependência, decoder ou extensão foi alterado. Não foram adotados budget 512×512, KTX2/Basis, Draco, Meshopt, quantização ou Pipeline 3D definitivo; F4-F passa a ser o próximo checkpoint.

### F4-E3/E4 — Variante de textura e comparação objetiva concluídas experimentalmente — 2026-09-14

- criada somente no laboratório a variante Poly Haven 512: GLB 5.828.612 → 711.352 bytes (-87,796%), imagens codificadas -88,013% e estimativa RGBA8 base 12 → 3 MiB (-75%);
- comprovadas geometry, índices, UV, transforms, hierarchy, material e metallic/roughness compartilhado inalterados, com parse real do `GLTFLoader` de `three@0.185.1` e sem extensão, decoder, dependência ou mudança de runtime;
- gate humano A/B aprovou a variante para o uso ortográfico/2.5D pretendido: houve leve desfoque em comparação próxima, considerado não bloqueante; identidade visual, material e leitura geral foram preservados;
- removidos o harness, teste e cópia Vite temporários após o gate. Nenhum fixture registrado, produção ou `ASSET_REGISTRY.md` foi alterado; 512×512 não é budget, asset final ou Pipeline 3D definitivo.

### F4-E1/E2 — Baseline de custo, diagnóstico e hipótese experimental — 2026-09-14

- medidos diretamente os quatro GLBs F4-B, com SHA-256 confirmado contra o registry: o corpus soma 5.901.424 bytes e Poly Haven concentra 98,766%, dos quais 5.814.197 bytes são suas três imagens 1024×1024; a geometria inteira do corpus soma 66.240 bytes lógicos;
- separado payload de estrutura/estimativa: as imagens de Poly Haven somam estimativa RGBA8 base de 12 MiB, que não é medição de GPU, heap, RAM, Android ou performance física;
- selecionada somente a hipótese de variante offline de resolução das texturas Poly Haven para F4-E3/E4, mantendo material/UV e comparação objetiva com o original. KTX2/Basis, Draco, Meshopt, budgets ou pipeline final não foram adotados;
- não houve alteração de asset, runtime, produção, dependência, arquitetura ou benchmark físico.

### F4-D-CLOSE — Loading, unload e ownership/disposal concluídos experimentalmente — 2026-09-14

- consolidada a evidência experimental de ownership único, transferência única, unload seletivo/idempotente com host vivo, disposal real, repetição, isolamento A/B e deduplicação intrárvore;
- confirmados cancelamento lógico, descarte/liberação de callbacks stale, falha individual recuperável e owner terminal; o gate F4-B/C/D aprovou 4 arquivos/20 testes e a suíte unitária integral aprovou 67 arquivos/510 testes, sem retries ou falhas;
- não foram alterados `ThreeWorldRuntime`, produção ou assets, nem criados `AssetManager`, registry, cache, abort físico ou arquitetura definitiva; F4-E — Custo e compressão experimental — passa a ser o próximo checkpoint.

### F4-D4 — assíncrono em voo, abandono, callbacks tardios e erros — 2026-09-13

- estendida a prova isolada com roots Quaternius F4-B reais, SHA-256 registrado, `GLTFLoader` de `three@0.185.1` e `disposeObjectTree()` reais; um double exclusivo do teste controlou somente a ordem de callbacks;
- comprovados abandono lógico, transferência única, descarte/liberação única de sucessos tardios ou adicionais, erro individual recuperável, erro tardio inerte e owner encerrado com operação em voo, preservando host e sentinel;
- não foram alterados `ThreeWorldRuntime`, produção ou assets, nem criados abort físico, cancelamento de rede, API permanente, `AssetManager`, cache ou registry; F4-D5 passa a ser o próximo checkpoint para regressão, consolidação e fechamento da F4-D.

### F4-D3 — repetição, isolamento e disposal — 2026-09-13

- estendida a prova isolada com `GLTFLoader` de `three@0.185.1`, `THREE.Scene` e `disposeObjectTree()` reais: unload repetido de KayKit ficou inerte depois de uma única liberação, e três ciclos com roots e recursos distintos não acumularam ownership ou children de asset;
- comprovados owners experimentais locais independentes para Poly Haven e Kenney no mesmo host: descarregar Poly Haven libera somente seus recursos e preserva Kenney até seu unload próprio; a `Texture` compartilhada por metallic/roughness no Poly Haven emitiu um único evento `dispose`;
- não foram alterados `ThreeWorldRuntime`, produção ou assets, nem criados API permanente, `AssetManager`, cache, sharing interasset ou referência contada; F4-D4 passa a ser o próximo checkpoint para assíncrono em voo, abandono, callbacks tardios e erros.

### F4-D2 — Load, attach e unload mantendo o host vivo — 2026-09-13

- adicionada prova isolada com KayKit F4-B real, SHA-256 registrado, `GLTFLoader` de `three@0.185.1`, `THREE.Scene` e `disposeObjectTree()` reais;
- comprovados owner experimental local, attach da root, unload com disposal observado de geometry/material/texture, sentinel preservado e novo load/attach no mesmo host;
- não foram alterados `ThreeWorldRuntime`, produção ou assets, nem criados API permanente, `AssetManager`, cache, renderer ou política de concorrência; F4-D3 passa a ser o próximo checkpoint.

### F4-D1 — Auditoria e contrato experimental de loading/unload/ownership — 2026-09-13

- auditado o caminho real do fixture F1: `GLTFLoader` entrega o root ao runtime, a montagem é seu único owner registrado até o disposal terminal e não existe unload de asset com host vivo, token de intenção ou abort de load;
- registrado o comportamento de callbacks tardios, pausa, falha terminal e `webglcontextlost`, além dos limites comprovados de `disposeObjectTree()` para meshes, geometry/material/texture deduplicados por árvore;
- definido somente o contrato experimental mínimo de host, root, owner, loading, unload idempotente, descarte de sucesso tardio e falha individual recuperável, sem introduzir API, `AssetManager`, cache, registry, streaming ou mudança de produção;
- decompostas as provas isoladas D2–D4; D2 passa a ser o próximo checkpoint para load → attach → unload mantendo o host vivo. Nenhum código ou asset foi alterado.

### F4-C-CLOSE — Materiais, UV e texturas concluídos experimentalmente — 2026-09-13

- consolidado o contrato experimental de materiais por fatores ou texturas, UV somente quando necessário, Base Color por fator/textura, normal map e metallic-roughness compartilhado permitido pelo glTF, sem patches por asset no runtime;
- a prova estrutural com os quatro GLBs F4-B, SHA-256 registrado e `GLTFLoader` de `three@0.185.1` confirmou KayKit texturizado, Kenney por fatores, Poly Haven com Base Color/normal/metallic-roughness combinado e Quaternius por fatores sem UV ou imagem;
- gate humano visual registrou Poly Haven e KayKit coerentes, Kenney sem artefato e Quaternius claro/cinza coerente com seu material por fatores, não como textura perdida; não houve comparação pixel a pixel, colorimetria ou benchmark;
- removido o harness visual temporário após cumprir o gate, sem alteração de produção, `ThreeWorldRuntime`, fixtures, fontes, materiais, UVs, imagens, loading/unload ou otimização; F4-D passa a ser o próximo checkpoint.

### F4-C3 — Prova automatizada de materiais, UV e texturas — 2026-09-13

- adicionado gate Vitest estrutural para os quatro GLBs F4-B, com SHA-256 registrado e `GLTFLoader` de `three@0.185.1`, sem alterar assets, runtime ou materiais após o parse;
- comprovados Base Color texturizado + UV no KayKit, material por fatores sem maps no Kenney, maps PBR e texture metallic-roughness compartilhada no Poly Haven e ausência legítima de maps/UV no Quaternius;
- registrado que o adaptador jsdom permite somente observar o parse e os maps estruturais: não declara fidelidade visual, equivalência de pixels, orientação visual, colorimetria, qualidade de conversão, custo, performance, loading/unload ou Android;
- F4-C permanece em andamento; F4-C4 é o próximo checkpoint.

### F4-C2 — Contrato técnico mínimo experimental de materiais, UV e texturas — 2026-09-13

- registrado o contrato experimental que exige preservar somente o significado material efetivamente usado — fatores, texturas, maps e UV necessário — entre fonte editável conhecida, GLB e `GLTFLoader`, sem correções por asset no runtime;
- formalizadas equivalências estruturais legítimas: metallic e roughness podem chegar combinados, formatos de imagem podem mudar, materiais por fatores não exigem textura/UV e imagens não utilizadas não exigem exportação;
- separada a prova estrutural automatizável da fidelidade visual, que não é demonstrada pelo adaptador jsdom nem foi declarada concluída; F4-C permanece em andamento e F4-C3 passa a ser a próxima etapa;
- não foram alterados fixtures, materiais, UVs, imagens, `ThreeWorldRuntime`, loading/unload, custo, compressão ou arquitetura de assets.

### F4-B-RUNTIME-AXIS-GATE — Geometria, escala, eixos e pivô concluídos — 2026-09-13

- comprovado com o `GLTFLoader` de `three@0.185.1` instalado que quatro GLBs normalizados e registrados chegam ao Three sem scale, rotação ou offset corretivos individuais: root em identidade, chão no plano `Y=0` e dimensões `[largura, altura, profundidade]`;
- registrado o mapeamento experimental observado Blender `X →` Three `X`, Blender `Y →` Three `-Z` e Blender `Z →` Three `Y`; uma frente visual/funcional não foi congelada;
- adicionadas quatro fixtures F4-B com hash, fonte, autoria, licença CC0, transformações e estado não-final registrados; materiais/texturas continuam pendentes para F4-C e custo/vertex splitting para F4-E;
- o diagnóstico Azrael confirmou nove meshes sob `F4_Azrael_Estanteria9`, mas o GLB não foi promovido ao checkout porque a evidência local disponível não comprova licença/proveniência suficiente;
- não foram alterados `ThreeWorldRuntime`, a cena técnica, câmera/interação, schema, persistência espacial, loading/unload, otimização ou compressão; F4-C passa a ser o próximo checkpoint autorizado.

### F4-A-CLOSE — Contrato e preflight de autoria concluídos — 2026-09-09

- concluída a F4-A: Blender 3.3.21 passou no preflight técnico por CLI, com save `.blend`, export GLB 2.0, validação estrutural e reimport do arquivo descartável;
- registrada a validação humana no Fedora: viewport, seleção, órbita, transformações, Object/Edit Mode, edição geométrica, save e export GLB foram utilizáveis, sem crash, travamento, tela preta, flickering, corrupção visual ou lentidão persistente relevante após alguns minutos de manipulação;
- Blender 3.3.21 está aprovado somente como ferramenta experimental de autoria durante F4; permanece substituível, não entra como dependência e não define o Pipeline 3D permanente;
- nenhum código, asset do projeto, arquivo humano de preflight ou infraestrutura de pipeline foi adicionado; F4-B passa a ser o próximo checkpoint autorizado.

### F4-A1/A2 — Auditoria e contrato experimental de assets 3D — 2026-09-09

- iniciada formalmente a F4: a auditoria registrou o caminho atual do fixture GLTF/GLB, seu ownership pela montagem Three e o disposal deduplicado, sem promover o fixture F1 a asset oficial ou criar código novo;
- criado o contrato experimental de assets e decomposta a F4 em A–F; F4-A permanece em andamento até o preflight de autoria A3;
- mantida a ferramenta de autoria substituível: Blender 3.3 é somente candidato atual e não foi aprovado, executado ou transformado em dependência;
- mantidos o Pipeline 3D permanente, persistência espacial, unload final e avaliação de compressão para trabalho posterior baseado em evidência.

### F3-CLOSE — Câmera e interação mobile concluída — 2026-09-09

- encerrada a F3 com contrato runtime-only de câmera/framing/bounds, pan no plano X/Z, wheel e pinch focais, tap monotônico, viewport real por `ResizeObserver` e preservação de exploração/seleção em orientação;
- consolidado o gate F3-F1: 64 arquivos/487 testes Vitest, 13 cenários E2E Chromium, format, lint, typecheck, áudio, build, relatório de performance, sync e debug build Android, com warnings conhecidos não bloqueantes;
- registrada validação humana ampla positiva no Moto G06 para abertura, framing, pan, tap/seleção, pinch, pinch → pan, zoom, rotação e background/resume, sem crash, travamento ou regressão funcional perceptível e com FPS aproximadamente em 60 ou próximo durante interação/rotação; não é benchmark do mundo final;
- registrada a correção matemática final dos bounds: região convexa de centros de câmera preserva patch mínimo projetado do piso técnico em vez de combinar os cantos vazios do AABB; ela passou 3 arquivos/61 testes dirigidos e novo build Android, sem alterar `CameraNavigation`, gestos, lifecycle ou renderer;
- o APK posterior ao fix dos bounds não recebeu revalidação física específica no Moto G06. Essa ausência foi aceita como não bloqueante para encerrar F3 e não constitui evidência física inexistente; F4 passa a ser a próxima fase autorizada.

### F3-F2-FIX — Limites diagonais da fixture — 2026-09-09

- corrigido o clamp que aceitava a combinação diagonal dos extremos do retângulo envolvente da projeção e podia deixar apenas o fundo da cena nos limites superiores;
- a região de navegação agora é convexa e garante na viewport um patch de área mínima pertencente à projeção real do piso técnico: 15% de cada span projetado, limitado somente pelo viewport disponível;
- adicionada regressão matemática para os quatro cantos, portrait, landscape e zoom `0.7`, `1` e `2.2`, sem alterar `CameraNavigation` como autoridade, os gestos, o renderer, lifecycle, seleção ou persistência;
- gerado novo APK debug em `android/app/build/outputs/apk/debug/app-debug.apk` (7.525.817 bytes), sem alteração Android nativa ou dependência nova;
- F3-F1 permanece concluída tecnicamente; F3 permanece aberta e aguarda somente revalidação física curta dos limites corrigidos no Moto G06.

### F3-F1 — Gate técnico consolidado + APK — 2026-09-09

- concluídos formatação, análise estática, 487 testes Vitest, áudio, build web, relatório de bundle, 13 cenários E2E Chromium, sync Capacitor e Gradle debug;
- confirmado o APK debug em `android/app/build/outputs/apk/debug/app-debug.apk`, com 7.525.817 bytes, sem alteração Android nativa ou dependência nova;
- corrigida uma tipagem objetiva no novo cenário E2E de orientação; não houve alteração de contrato de câmera, interação, lifecycle, renderer ou persistência;
- preservados os warnings conhecidos de chunks Vite acima de 500 kB, `NO_COLOR`/`FORCE_COLOR` e `flatDir`;
- F3 permanece aberta: instalação e validação física de orientação, safe areas, toque/pinch, ergonomia, background/resume e extremos no Moto G06 são F3-F2.

### F3-E — Viewport, orientação, safe areas e integração mobile — 2026-09-09

- consolidada a autoridade do viewport na caixa real observada do `world-host`: Three não calcula header, dock, safe areas ou breakpoints, e o CSS reutiliza o contrato global de `env(safe-area-inset-*)` e a reserva existente do dock fixo;
- a superfície da Biblioteca passou a conter largura e reduzir padding em tela estreita, com caixa responsiva baseada em proporção e limite vertical existente do app, sem overflow horizontal e sem duplicar safe areas;
- resize/orientação válido preserva a mesma montagem, canvas, seleção e estado lógico de câmera salvo clamp matematicamente necessário; viewport inválido continua aguardando dimensão válida, e mudança geométrica encerra apenas o gesto em curso para impedir picking com coordenadas antigas;
- adicionadas coberturas determinística e Chromium dirigida para gesto interrompido, picking após resize, portrait → landscape → portrait e 320×640. Não houve alteração Android nativa nem validação física de safe areas, system bars, orientação, toque/pinch, ergonomia ou FPS Android.

### F3-D — Tap, seleção e arbitragem de gestos — 2026-09-09

- consolidada uma candidatura de tap explícita, monotônica e vinculada ao `pointerId` inicial: somente `pointerup` elegível executa o `Raycaster` e pode alterar a seleção;
- preservado o threshold centralizado de `8` CSS px, inclusive na borda; ultrapassá-lo consome o slop antes de pan e continua inelegível mesmo que o pointer retorne à origem;
- pinch, segundo/terceiro pointer, wheel concorrente, cancelamento, perda de capture, pausa, disposal e terminalidade não geram seleção tardia; pinch → pan permanece limpo;
- formalizado que tap válido em espaço vazio limpa a seleção, sem alterar a ponte React ↔ Three, os botões `Anterior`/`Próximo`, highlight, câmera, bounds ou persistência;
- ampliada a cobertura focada de intenção de gesto e executado E2E Chromium dirigido à Biblioteca, sem teste físico, Android ou recalibragem ergonômica.

### F3-C — Pan, zoom e pinch — 2026-09-09

- pan passou a derivar posições sucessivas do canvas no plano navegável X/Z, mantendo escala coerente com viewport, aspect ratio e zoom sem alterar o target Y;
- wheel agora normaliza unidades de `deltaMode` antes da curva exponencial e aplica zoom focal, mantendo o ponto sob o cursor quando os bounds técnicos permitem;
- pinch passou a usar a razão entre distâncias sucessivas e a mapear o midpoint anterior para o atual, compondo pan+zoom sem depender da frequência dos eventos;
- todos os gestos continuam passando por `CameraNavigation` e pelo clamp F3-B; seleção, picking pelo bounding rect atual, pinch → pan, cancelamento, pausa e terminalidade foram preservados;
- ampliada a cobertura determinística para pan, âncoras, clamps, wheel normalizado, midpoint e pan+zoom, sem validar ergonomia física ou alterar a arbitragem final tap/gesto.

### F3-B — Modelo de câmera, framing e limites — 2026-09-09

- centralizado estado efêmero de foco X/Z e zoom em `CameraNavigation`, que passa a ser a única fonte para a `OrthographicCamera`; eventos continuam sob ownership de `ThreeWorldInteraction`;
- framing passou a derivar bounds explícitos da fixture técnica e padding de 15%, com frustum e bounds de navegação dependentes de viewport e zoom; GLB tardio não reposiciona a câmera;
- removida a deriva vertical incidental do pan: target Y é fixo, enquanto resize/orientação preservam estado lógico e seleção quando válidos;
- ampliada a cobertura focada para framing, bounds, zoom, viewport inválido, orientação e fixture tardio, sem recalibrar curva de wheel, ganho de pinch ou ergonomia final.

### F3-A — Contrato e baseline da câmera — 2026-09-09

- formalizada a autoridade da câmera efêmera: `ThreeWorldRuntime` possui a instância/lifecycle e `ThreeWorldInteraction` possui a navegação por gesto, sem estado React, Dexie ou persistência espacial;
- extraído o cálculo puro do frustum ortográfico da fixture F1, que rejeita viewport zero, negativo, não finito ou com derivação não representável em vez de fabricar estado de câmera;
- adicionada cobertura focada para frustum e baseline inicial, preservando a calibração, o comportamento observável e os contratos de lifecycle/input da F2;

### F2-F — Regressão consolidada e fechamento técnico e físico — 2026-09-09

- concluída tecnicamente a F2 — Integração e endurecimento da Fundação Three.js, sem nova funcionalidade espacial ou alteração de câmera, zoom, pan, pinch, framing, limites, safe areas ou UX mobile;
- confirmados os contratos de fronteira React/runtime, ownership de montagem, falha terminal, context loss, callbacks tardios, viewport transitório e cleanup de input pela regressão completa;
- aprovados os gates de formatação, análise estática, 459 testes Vitest, áudio, build, relatório de bundle, 12 cenários E2E Chromium, sync Capacitor e Gradle debug;
- concluída a revalidação humana física curta no Moto G06: background/resume, alinhamento React/canvas, seleção/highlight, pan, pinch, seleção por toque, controles React e rotação/orientação permaneceram funcionais, sem crash, travamento, degradação sustentada, perda de interação ou dessincronização React ↔ Three;
- registradas como observações não bloqueantes quedas transitórias para aproximadamente 37–45 FPS em orientação e 45–48 FPS na sequência extrema zoom-out/zoom-in, ambas com recuperação e estabilização em aproximadamente 60 FPS; não são benchmark formal, regressão comprovada ou causalidade atribuída à F2.

### F2-E — Viewport e input resistentes a interrupções — 2026-09-09

- resize passou a aguardar dimensões transitórias inválidas sem frustum artificial, frame, recriação ou falha terminal; retorno a uma dimensão válida atualiza a mesma montagem por `ResizeObserver`, preservando renderer, câmera, seleção e um único RAF;
- picking passou a usar a bounding box atual do canvas; mudança de proporção e resize não deixam coordenadas permanentemente obsoletas;
- Pointer Events agora saneiam `pointercancel`/perda de capture e a transição pinch → um pointer como pan limpo, sem seleção acidental ou gesto órfão após pausa, falha ou disposal;
- cobertura unitária e Chromium dirigida validaram viewport, gesture cleanup, desktop/mobile sintético e ciclos de rota, sem definir ergonomia final de câmera ou interação.

### F2-D2 — Context loss terminal e assíncrono em voo — 2026-09-09

- `webglcontextlost` passou a ser falha terminal da instância Three: previne o default, cancela RAF/gestos, libera a montagem e entrega uma única falha segura `unavailable` ao fallback React;
- listeners de context loss/restoration pertencem ao canvas da montagem e são removidos no cleanup; `webglcontextrestored` tardio não reconstrói nem retoma a instância descartada;
- GLB que conclui após `failed` ou `disposed` é descartado com seus recursos, sem renderização ou reativação; falha normal de carregamento do fixture continua recuperável.

### F2-D1 — Falhas terminais de execução do runtime — 2026-09-09

- exceções estruturais de `renderer.render()` e `setSize()` passaram a encerrar a instância Three de uso único, cancelar RAF/gestos, liberar a montagem e emitir uma única falha segura ao fallback React;
- renderizações fora do RAF seguem a mesma transição; chamadas posteriores de lifecycle, resize e seleção não revivem a instância;
- pausa passou a impedir frames incidentais de resize e conclusão do fixture, preservando retomada normal; falha de carregamento do GLB continua recuperável;

### F1-CLOSE — Fundação Three.js aprovada — 2026-09-09

- concluída a F1 com a fundação Three.js integrada por host React próprio, cena técnica 3D, fixture GLB, interação bidirecional, lifecycle explícito e diagnóstico local;
- registrado o gate físico aprovado no Moto G06, incluindo aproximadamente 60 FPS estabilizados na cena mínima, pan, pinch, picking, dez ciclos, background/resume e recuperação limpa após process death;
- promovido Three.js a renderer aprovado da Fundação pela ADR-009, sem aprovar a Biblioteca final, pipeline 3D, persistência espacial, TalkBack ou performance de cenas complexas;
- encerrado e arquivado o contrato temporário F0-D; F2 passa a ser a próxima fase.

### F1-F-FIX — Alternativa React no Android — 2026-09-09

- registrada a evidência humana inicial positiva da F1-F e o comportamento físico incompatível do `<select>` no Moto G06, que abria uma superfície branca vazia;
- removidos o dropdown, suas opções e o label específico, sem alterar picking, highlight, gestos, câmera, cena, lifecycle ou observabilidade;
- adicionados botões HTML nativos `Anterior`/`Próximo` com wrap centralizado, usando a seleção emitida pelo runtime como única fonte de verdade;
- ampliados testes React e Chromium para navegação nos dois sentidos, extremidades, seleção Three → React → Three e layout mobile;
- gerado novo APK debug para revalidação curta; F1-F permanece em validação humana e Three.js continua candidato experimental.

### F1-E — Gates técnicos consolidados e Android — 2026-09-09

- auditados os gates T1–T6 da Fundação Three.js sem adicionar funcionalidade ao mundo;
- consolidados regressão convencional, build Vite de produção, baseline Chromium desktop/mobile, ponte React ↔ Three e dez ciclos de lifecycle;
- confirmadas as fronteiras arquiteturais, o baseline estrutural de 46 meshes/11 selecionáveis/46–47 draw calls/546 triângulos e a ausência de persistência espacial;
- concluídos sync Capacitor e build Gradle debug, com APK técnico identificado para a validação humana no Moto G06;
- preservados Three.js como candidato experimental, R-09 como risco aberto e F1-F como gate físico pendente.

### F1-D — Lifecycle formal e observabilidade — 2026-09-08

- formalizados os estados `created`, `mounted`, `running`, `paused` e `disposed`, com start/pause/resume/dispose idempotentes, um único RAF e proteção contra callbacks tardios;
- integradas pausa por visibilidade, retomada previsível, cancelamento seguro de gestos, resize por `ResizeObserver` com fallback de `window.resize` e cleanup determinístico;
- adicionados snapshots locais de FPS, frame time médio, `renderer.info`, malhas, objetos, selecionáveis, primeiro frame utilizável e carregamento do GLB, exibidos em uma superfície React compacta atualizada em até 4 Hz;
- ampliada a cobertura unitária de métricas/lifecycle/disposal e a E2E Chromium com dez ciclos completos de saída e retorno, canvas/loop únicos e interação funcional após a repetição;
- preservados a cena e o bundle experimentais sem biblioteca de métricas, analytics, telemetria, persistência espacial ou funcionalidade da F1-E.

### F1-C — Interação e ponte React ↔ Three — 2026-09-08

- adicionados pan desktop/touch por Pointer Events, wheel zoom e pinch experimental com limites, distinção de tap/drag e pointer capture defensivo;
- onze objetos técnicos receberam IDs e labels efêmeros; piso e paredes permanecem fora da seleção;
- picking passou a usar `Raycaster` e resolve meshes filhos do GLB para o objeto lógico selecionável;
- seleção ganhou highlight ciano por `Box3Helper`, removido e descartado ao trocar, limpar ou desmontar;
- `WorldRuntime` passou a expor catálogo, callback de seleção e comando por ID, formando a ponte Three ↔ React sem persistência;
- adicionada superfície React compacta com texto `aria-live` e `select` HTML nativo como alternativa ao canvas;
- adicionada cobertura unitária e Chromium para seleção, gestos, cleanup, ponte bidirecional e viewport mobile sintético, sem antecipar a observabilidade da F1-D.

### F1-B — Cena de referência + GLB — 2026-09-08

- substituída a geometria única da F1-A por uma cena técnica descartável com piso, quatro segmentos de parede, quatro tipos de proxies e 46 meshes visíveis;
- mantida a câmera ortográfica em apresentação 2.5D e adicionadas iluminação hemisférica e direcional simples, materiais baratos e sombras desligadas;
- adicionado o fixture interno `f1-technical-pyramid.glb`, carregado pelo addon oficial `GLTFLoader`, com procedência registrada e sem pipeline 3D formal;
- falha de asset passou a ser diagnosticável sem derrubar o canvas ou o aplicativo convencional, e callbacks tardios após unmount descartam o modelo carregado;
- disposal passou a liberar geometrias, materiais e texturas da cena e do fixture sem descarte duplicado de recursos compartilhados;
- adicionados testes do GLB real, construção da cena, sucesso/erro/loading tardio, disposal e smoke Chromium observável, sem antecipar interação da F1-C;
- ajustada a altura do canvas em viewport estreita para preservar leitura da cena e evitar espaço vertical excessivo.

### F1-A — Bootstrap da Fundação Three.js — 2026-09-08

- incorporada a documentação final da F0 e instalado o contrato F0-D como autoridade temporária da F1;
- adicionado `three@0.185.1` como candidato experimental, carregado sob demanda pela rota Biblioteca;
- criada a fronteira `LibraryPage → WorldHost → ThreeWorldRuntime`, com `WebGLRenderer`, `Scene`, `OrthographicCamera`, uma geometria técnica e um único canvas;
- adicionado lifecycle explícito de mount, start, pause, resume, resize e disposal, com limpeza de loop, observer, listener, canvas e recursos Three;
- falha de inicialização do renderer passou a apresentar fallback textual sem bloquear as áreas convencionais;
- adicionados testes de contrato/lifecycle/React e smoke Chromium de mount, unmount e remount sem acúmulo de canvas;
- Dexie v8, backup v6 e as fronteiras de domínio/aplicação permanecem inalterados; não foi criado estado espacial persistente.

### WORLD RESET — 2026-09-08

- removidos integralmente o mundo visual anterior, seu renderer Phaser, Construção, contratos espaciais, progressão estrutural, salas, personagens, diálogos, assets, fontes, candidatos, guias, scripts e testes exclusivos;
- a rota Biblioteca passou a apresentar um placeholder React curto e acessível, sem canvas ou estado espacial;
- removido `phaser` e o preload visual; o aplicativo abre diretamente pelo bootstrap React;
- criado o schema Dexie v8, que descarta os dados de desenvolvimento existentes e mantém somente as tabelas convencionais no schema ativo;
- criado o backup v6 somente para dados convencionais; formatos v1–v5 são deliberadamente incompatíveis e rejeitados antes da escrita;
- preservados os dez marcos convencionais, sem rewards, grants, decoração, diálogo ou efeitos no mundo;
- reconciliada a documentação para um baseline sem mundo e registrada a direção futura de 3D real com apresentação ortográfica/2.5D, sem escolha de renderer neste checkpoint.

### Adicionado

#### Produto e registros

- união discriminada de seis tipos de registro: Livro, Filme, Série, Estudo, Atividade física e Trabalho;
- criação, edição, detalhamento, progresso e conclusão especializados por tipo;
- Coleção unificada, busca, filtros, ordenação e redirecionamentos para URLs históricas de livros;
- notas e citações generalizadas para os tipos compatíveis, com edição, exclusão confirmada e compartilhamento explícito;
- etiquetas normalizadas e favoritos em registros, notas e citações;
- sessões tipadas e persistentes, com uma sessão aberta globalmente, pause, retomada e duração baseada em timestamps;
- timeline, sessões recentes, estatísticas por período e categoria e resumo global da Biblioteca;
- métricas derivadas sem tabela própria, score, ranking ou streak.

#### Dados, backup e progressão

- schema Dexie v4 para registros múltiplos e anotações generalizadas;
- schema Dexie v5 com tabelas de etiquetas e sessões;
- schema Dexie v6 com `placedObjects`;
- schema Dexie v7 com `worldStructures`;
- backup v3 para etiquetas, sessões e dados da fase P1;
- backup v4 para objetos posicionados;
- backup v5 para estrutura persistente, preservando leitura dos formatos v1 a v4;
- inspeção de backup sem escrita, integridade SHA-256, restauração transacional e união monotônica de marcos;
- marcos idempotentes, recompensas declarativas e progressão estrutural por sessões elegíveis;
- concessões físicas por família nos limiares 1, 5, 15 e 30, com inventário derivado.

#### Experiência convencional

- sistema visual escuro semântico e componentes responsivos;
- dock global com Biblioteca, Coleção, Arquivo, Resumo e Ajustes;
- Novo registro como ação contextual da Coleção;
- Busca e Filtros recolhíveis, com estado preservado, foco, Escape e Android Back;
- Resumo com métricas reais, estados vazios, tipos compactos e gráfico SVG responsivo;
- preferências de movimento, contraste e tamanho de texto;
- edge-to-edge Android com system bars transparentes e safe areas.

#### Biblioteca visual e reboot espacial

- host Phaser carregado sob demanda, com uma instância, uma cena e um canvas;
- projeção tipada entre aplicação, React e Phaser;
- W1 com mundo maior que a viewport, câmera, bounds, pan e atmosfera por período;
- W2 com objetos persistentes, seleção, mover, girar, drag coalescido, preview e rollback;
- pisos internos e exteriores modulares, objetos de mesa e cadeira em quatro orientações e fallback procedural;
- `WorldStructureState` persistente para `world.main`, separado de `PlacedObject`;
- catálogo estrutural de pisos, paredes de 1/2/4 células, quatro cantos e porta horizontal aberta/fechada;
- editor de Construção para piso e peças, com revisão otimista, single-flight e inventário físico;
- alternativa textual acessível, feedback consolidado de desbloqueio e ação `Abrir construção`;
- etiqueta contextual de sala/período com ciclo de 5.000 ms;
- faixa compacta de peças colocadas e ações contextuais que preservam o mapa como superfície principal.

#### Áudio, conteúdo e qualidade

- serviço de áudio atrás de porta da aplicação;
- seis WAVs próprios e determinísticos, com silêncio como fallback;
- playlist musical declarativa, sequencial e validada;
- preferências independentes de música e efeitos;
- conteúdo contextual local, locale `pt-BR`, fallbacks e seleção determinística de diálogos;
- diagnóstico técnico restrito a desenvolvimento e builds internos;
- suíte Playwright Chromium e CI web;
- validações de assets estruturais, relatório de desempenho e scripts Android reproduzíveis.

### Alterado

- o produto deixou de ser centrado apenas em livros e passou a representar seis tipos de experiência;
- a direção inicial de cinco salas temáticas foi substituída por um mundo espacial contínuo, semanticamente neutro e construído pelo usuário;
- a antiga navegação por drawer foi substituída por um dock único;
- a Biblioteca deixou de trocar salas por arraste; o gesto em área livre passou a explorar o mundo;
- Construção passou a ocultar temporariamente o dock sem desmontar o host Phaser;
- o blueprint fixo W1 deixou de ser a autoridade da estrutura; `world.main` persistido passou a ser a fonte de verdade;
- estrutura e objetos passaram a possuir agregados, regras de ocupação e persistência independentes;
- o renderer estrutural deixou de consultar offsets, pivôs e spans visuais legados;
- sprite, fallback, hit testing, preview, seleção e depth passaram a consumir a mesma transformação canônica;
- o inventário deixou de ser uma contagem independente e passou a ser derivado de reserva, placements e concessões;
- restauração em base preenchida passou a exigir escolha explícita sobre backup de segurança;
- música passou a ser preparada após gesto permitido e a reutilizar decodificação entre entradas;
- fluxos automatizados foram adaptados aos disclosures e à navegação vigentes;
- somente as 17 texturas necessárias ao mapa inicial permanecem bloqueantes; 11 texturas são carregadas depois do primeiro frame;
- a leitura inicial duplicada em desenvolvimento pelo StrictMode foi deduplicada.

### Corrigido

#### Produto, dados e Android

- exportação Android passou a diferenciar salvamento em destino escolhido e compartilhamento nativo;
- exclusão de registros, anotações e atividades relacionadas passou a ser transacional;
- restauração preserva marcos legítimos e não repete recompensa, áudio ou notificação;
- atualização de schema preserva IDs, datas, revisões, objetos e conteúdo existente;
- aviso de backup v5 passou a comparar corretamente com o schema Dexie v7;
- sessão ativa restaurada volta em estado seguro, sem acumular duração fictícia;
- rolagem vertical e rodinha do mouse deixaram de disputar toque curto no canvas;
- Android Back passou a fechar subestados antes de sair da rota ou encerrar o aplicativo.

#### W1 e W2

- caminhos de assets internos foram reconciliados com a grafia real `architecture`;
- bounds passaram a considerar viewport alta e margens de câmera;
- ações de objeto selecionado deixaram de ficar fora da área visível;
- exterior passou a usar células e crops determinísticos menores para reduzir macro-tiles;
- o cartão de objeto recebeu fechamento acessível e confirmação por toast;
- drag descarta posições intermediárias acima da cadência de frame;
- giros rápidos persistem o último estado desejado e restauram estado seguro em falha.

#### Rodada corretiva W3-A R0–R6

- quatro cantos estruturais não conformes foram substituídos por candidatos determinísticos aprovados e promovidos às fontes e ao runtime;
- metadado visual duplicado foi unificado em `structureVisualGeometry`;
- porta horizontal deixou de depender do offset visual legado;
- depth passou a ser derivado da base visível, com bandas e desempate estável;
- fallback procedural passou a usar a mesma geometria e depth dos sprites;
- hit areas passaram a usar as regiões da transformação canônica, incluindo os dois braços de cantos;
- inicialização do Phaser foi protegida contra leitura de tweens antes do primeiro render;
- o contrato de porta passou a separar corredor estrutural de envelope visual;
- normal interior passou a ser derivada exclusivamente da adjacência do piso;
- alinhamento transversal passou a usar translação assinada geral, sem exceção por blueprint, coordenada ou `instanceId`;
- acabamento longitudinal passou a respeitar a tolerância de um pixel-fonte;
- a matriz de continuidade evoluiu de 19/31 para 31/31 junções;
- a repetição oficial do renderer ativo passou 9/9 cenários;
- controles superiores obsoletos foram removidos da Biblioteca;
- paletas e peças colocadas deixaram de cobrir permanentemente o mapa;
- expansão de piso, colocação, seleção, movimento e Resumo passaram a atualizar sem reload;
- R6 confirmou no Moto G06 o dock, Construção, Busca/Filtros recolhidos e preservação dos dados pessoais.

### Desempenho

- no cenário local de produção do gate pré-R6, o primeiro frame observado mudou de 1.642 para 1.453 ms a frio e de 1.426 para 1.233 ms com cache;
- a carga inicial bloqueante foi reduzida de 28 para 17 texturas;
- a demora inicial da Biblioteca e o engasgo no card do Resumo continuam conhecidos e não foram declarados resolvidos.

### Removido

- composição futura baseada em cinco salas obrigatórias por categoria;
- drawer como segunda navegação primária;
- controles superiores obsoletos da Biblioteca;
- fixture procedural histórica da composição normal de objetos;
- cópias públicas de paredes experimentais sem uso no runtime;
- áudio procedural reprovado como fallback ativo;
- tolerância legada do comando padrão de validação dos cantos.

### Segurança e privacidade

- registros, sessões, estrutura e backups continuam locais, sem conta, backend, sincronização ou telemetria;
- arquivos externos são validados por tamanho, schema, versão, duplicatas e integridade antes de qualquer escrita;
- restauração ocorre em transação e não publica eventos de conquista;
- fixtures, E2E e CI usam conteúdo fictício e não recebem backups pessoais;
- logs e diagnósticos não incluem títulos, autores, notas, citações, etiquetas ou payload de backup.

### Documentação

- documentação reorganizada entre contratos vigentes, decisões e arquivo histórico;
- `MANIFEST.md` e `docs/00_LEIA-ME.md` foram fundidos em `docs/README.md`;
- visão e contrato do produto foram consolidados em `docs/PRODUCT.md`;
- estado atual foi reconciliado com Dexie v7, backup v5 e encerramento da W3-A;
- planos concluídos, checklists antigos e logs integrais foram movidos para `docs/history/`;
- plano de testes cumulativo foi substituído por `docs/TESTING.md`;
- decisões vigentes foram consolidadas em ADRs individuais;
- o handoff obsoleto da W3-A foi substituído por um resumo histórico.
- o roteiro já definido da W3-B à W3-F foi restaurado como planejamento vigente, distinguindo etapa planejada de etapa em execução;
- `docs/W3_PLAN.md` passou a registrar a continuidade entre o reboot espacial, a ampliação da W3-A e as próximas etapas de estantes e livros.

## [0.2.0-alpha.1] — 2026-07-29

### Adicionado

- domínio puro de livros, progresso, status, notas e citações;
- schemas Zod de fronteira e eventos mínimos sem conteúdo pessoal;
- camada de aplicação com portas, casos de uso, atividades e erros públicos;
- persistência Dexie/IndexedDB com migração v1 para v2;
- repositórios concretos, transações, event bus pós-commit, Clock e IDs de plataforma;
- diagnóstico técnico interno para desenvolvimento e APKs de gate;
- suíte inicial de domínio, aplicação e persistência;
- validação manual de persistência no navegador e no Moto G06.

### Alterado

- comandos de escrita passaram a usar a fronteira transacional;
- eventos passaram a ser publicados somente após commit;
- documentação técnica foi alinhada aos contratos dos Prompts 4–6.

### Corrigido

- painel técnico passou a usar modo diagnóstico explícito e a permanecer fora do build normal.

## [0.1.0] — 2026-07-28

### Adicionado

- fundação React, Vite e TypeScript estrito;
- formatação, lint, testes e build web;
- shell responsivo com Biblioteca, Coleção, Novo livro, Arquivo e Configurações;
- React Router e tratamento inicial de Android Back;
- Capacitor 8, plataforma Android e primeiro APK debug;
- safe areas e prova física inicial no Moto G06.

### Alterado

- Gates G0, G1 e G2 foram aprovados;
- Blocos de contrato, fundação e prova Android foram encerrados.

## BF-4E — implementação candidata

- Dez famílias de objetos ambientais com ações nos cinco cômodos, animações e iluminação local.
- Três atmosferas e descoberta ficcional do Pergaminho, com ações React disponíveis sem WebGL.
- Estado somente de sessão; sem mudanças de dados ou backup. Auditoria e gate humano pendentes.
## 2026-11-05 — BF-5.5B candidata

- Tarefas de interação com estados previsíveis e leases exclusivos recuperáveis.
- Ciclo físico demonstrável com o mesmo livro cenográfico selecionável: pegar, transportar, posicionar e devolver.
- Sem nova migração Dexie/backup; BF-5.5A preservada. Testes Moto G06 e E2E global permanecem pendentes/vermelhos conforme relatório.
