> **DIREÇÃO APROVADA PELO PROPRIETÁRIO — 09/11/2026, Duelo Arcano BF-5.6F/reforma:** referência de **experiência de arena de Yu-Gi-Oh! Duel Links no mobile**, adaptada ao universo original da Biblioteca Viva. **A tela de duelo é um palco de game fullscreen, não página com textos explicativos**; não pode exigir rolagem da página para alcançar mão, campo, comandos ou vida/energia. Campo inimigo acima, mesa/área central dramatizada, campo do jogador e mão embaixo; HUD compacto e contextual; inspeções/detalhes em overlays temporários que não empurrem o tabuleiro. Remover instruções permanentes e rótulos burocráticos (“toque para jogar”, “nenhuma ação depende de arrastar” etc.), substituir por feedback audiovisual/visual preciso e controles claros. Preservar leitura de nomes, estatísticas e habilidades sob demanda, acessibilidade por semantics/TalkBack e estados sem depender exclusivamente de efeitos. Ocultar o dock geral durante duelos; respeitar insets Android, retrato/paisagem, toque confortável. A referência é **de ergonomia e apresentação**, não autorização para copiar a marca, ícones, cartas, personagens ou elementos específicos de Yu-Gi-Oh!. Tratar como requisito explícito antes de redesenhar a arena 3D da F; motor de regras E fica intacto. Sem implementação efetuada por esta nota.

> **Avaliação artística real — Moto G06, 09/11/2026:** proprietário considera as **48 ilustrações SVG proceduralmente geradas abstratas demais** para a identidade final do Duelo Arcano; aceitáveis como primeira versão, **sem aprovação artística definitiva**. A UI/UX de **todo o Arcanário** também foi avaliada negativamente: sobreposição entre dock e barra de ações, mão truncada em retrato, rolagem longa para jogar, texto sob barra de status e hierarquia pouco fluida. Planejar retrabalho **coeso e transversal** de interface, além de evolução de ilustrações mais figurativas e expressivas, antes do fechamento global, sem inventar um novo motor 3D. [Registro da decisão](BF-5_6E_FECHAMENTO_2026-11-09.md). As descrições de artes abaixo representam o estado implementado, não aceite humano.

## BF-5.6E — cartas fantásticas em candidata

O Duelo Arcano recebe 48 gravuras vetoriais autorais distinguíveis: criaturas com anatomias próprias, magia e artefatos; Ruína negro/lilás/brasas, Conhecimento azul/ouro/runas, Florescimento verde/dourado/pétalas, Caos violeta/magenta/fragmentos e neutras azul ardósia/pergaminho. Molduras específicas, variações por tipo, custo e atributos fora da arte. [Fontes editáveis/procedência](../assets/duel/source/README.md). Não são fotografias nem pinturas raster; acabamento estilizado de gravura, sem assets de franquias/terceiros. A inspeção automatizada/local não substitui aprovação artística humana. Arena e habitantes 3D permanecem para F/fases próprias.

> **BF-5.6C — arte candidata:** Provações usam fólio claro de leitura livre, inscrição violeta/dourada, alternativas amplas, correção comentada e diagnóstico integrado ao arquivo. Questões longas não são comprimidas em carta de proporção fixa. Radios de moldura exibem os nomes/ornamentos e estado selecionado. [Capturas C e gate artístico A+B+C](BF-5_6C_PROVACOES_DIAGNOSTICO_IMPLEMENTACAO.md). Sem novo aceite humano.

> **BF-5.6B — arte candidata:** portal de arquivo arcano, volumes de coleção, três gravuras de selos, três molduras vetoriais e quatro materiais cromáticos autorais, com giro de carta e modo reduzido. SVG/CSS locais de autoria desta implementação, sem assets externos. [Evidências B](BF-5_6B_OFICINA_COLECOES_IMPLEMENTACAO.md). Aceite artístico no Moto G06 pendente.

> **ACEITE ARTÍSTICO DIRIGIDO R5 — 08/11/2026:** o proprietário confirmou melhora de luminosidade/detalhes de Samael, Aryn, Ytha, Lua, pergaminho e livro em leitura e autorizou o fechamento da R5 no conjunto. Isso é aceite suficiente **para a etapa**, não declaração de rig facial, IK, dedos, voo livre de Ytha ou assento/leitura sentada. A fluidez geral e a atmosfera noturna foram preservadas; engasgo residual das quests fica documentado. [Fechamento R1–R5](audits/BV_FECHAMENTO_RECUPERACAO_R1_R5_2026-11-08.md). A seção R5 candidata abaixo é histórica.

> **Feedback físico R5R — 08/11/2026:** proprietário confirmou melhora perceptível da luminosidade e dos detalhes mágicos. É aceite parcial de melhora, não conclusão artística/R5. Nesta rodada os seis efeitos são preservados byte a byte; somente o contorno CSS de contato do Canvas foi removido após reprodução da listra de borda. Quests continuam com engasgos e fora deste reparo. [Complemento](audits/BV_POLIMENTO_R5R.md#complemento--contorno-do-canvas).

> **R5R — candidata de polimento (08/11/2026):** proprietário ainda percebe engasgo nas quests e magia discreta no Moto G06. Frame/header/Adiar ficam integrais no commit, conteúdo entra em 120 ms sem delay; feedback de contato usa o gesto existente. Halos unlit, contraste emissivo, pergaminho e livro ativo mais legíveis, sem novas PointLights ou alteração dos ganhos R5P/Q. Candidata exige aceite físico de suavidade/fluidez e arte; R5 aberta, mesma PR draft #40, sem merge ou fase nova. [Comparações, custos e roteiro](audits/BV_POLIMENTO_R5R.md). Notas anteriores são cronologia.

> **R5P — avaliação artística suspensa (07/11/2026):** após relato físico R5E, priorizar navegação fluida. Nove luminárias/núcleos, atmosfera, Ytha e arte R5E preservados; 10/12 pares de captura idênticos e 2/12 com 1 nível de diferença em 1 pixel. Isso não aprova a arte ou o desempenho. Retomar Samael/Aryn/Ytha/Lua somente após fluidez satisfatória no Moto G06. [Comparação e limites](audits/BV_SANEAMENTO_PERFORMANCE_R5P.md).

> **R5E — refinamento autorizado (07/11/2026):** o proprietário observou melhora na R5D no Moto G06, mas considerou a arte insuficiente para a fase. A candidata R5E refina os quatro habitantes na mesma PR #40, com Ytha menor (1,32 m de geometria) e suspensa 0,16 m acima do piso; raio físico 0,92 m preservado. Não há novo aceite, fechamento R5 ou F2B/F2C. [Relatório vigente](audits/BV_RECUPERACAO_R5E.md). Notas anteriores são cronologia.

> **R5 — candidata em implementação (07/11/2026):** R5A–D candidatas publicadas na [PR draft #40](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/40), sobre main `7100ff6` integrada com R4. Quatro GLBs remodelados, skins reais, oito clips reconstruídos, sockets explícitos e descarte de Skeleton. 950 unitários PASS; E2E dirigido 0/2 após correção de preparação, sem retries; APK debug gerado; aceite artístico individual/Moto G06 pendentes, assento/F2B/F2C não entregues, CI remota omitida por cota. Recuperação integral aberta. [Relatório vigente](audits/BV_RECUPERACAO_R5.md) · [Pipeline](INHABITANT_ART_PIPELINE.md). Notas abaixo preservam a cronologia.

> **ACEITE ARTÍSTICO DIRIGIDO — 07/11/2026:** o proprietário aprovou no Moto G06 a remodelagem pós-R2 dos artefatos de Estudo (mesa de cadernos/magia), Trabalho (estojo aberto), Filmes (projetor emissivo) e Atividade Física (halteres). Preservar essas formas durante a R3. O Livro da Estrela também teve correção funcional confirmada. Este aceite refere-se à inspeção realizada, não a todos os ângulos ou a futuros assets. [Retomada](audits/BV_RETOMADA_R3_2026-11-07.md). As indicações anteriores de aceite pendente abaixo são históricas.

## Refinamento pós-teste físico R2 — candidata (06/11/2026)

Resposta ao Moto G06: estudo como mesinha pessoal de pesquisa com cadernos/pena/cristal suspenso; trabalho como estojo de ofício ameixa aberto, ferragens, malhete/formão/planta; cinema com lente e memória emissivas; treino como par de halteres em suporte de duas alturas. Mantidos cenário, habitantes, livro pessoal e série. [Comparação normal/próxima/destaque no mundo completo](audits/evidence/bv-post-r2/comparison.png) e [24 vistas/custos/limites](audits/BV_SANEAMENTO_POS_R2.md). Inspeção web desta candidata realizada; seu aceite artístico e desempenho físico dependem de novo teste humano. Não é arte final nem encerramento da recuperação. Esta direção substitui fólio no chão/kettlebell/estojo fechado descritos na R2C abaixo.

## R2C — artefatos de memória, candidata de 06/11/2026

Os seis registros pessoais recebem linguagem própria de laca verde/ameixa, ferro patinado, latão, pergaminho e cristal: códices com ferragens/capa articulada; projetores de memória para filmes; receptores com capítulos/antenas para séries; fólios abertos com pena/tinteiro para estudo; pesos de treino encantados sobre tapete para atividade física; estojos de ofício com malhete/planta para trabalho. São objetos do registro, não novos móveis decorativos ou estações de sessão. Designs estilizados em pequenos assets nativos, com silhuetas reconhecíveis e selo comum, mantêm escala/slots e a leitura ortográfica. [Comparação das seis categorias no mundo](audits/evidence/bv-recovery-r2/record-comparison.png). Inspeção web realizada; aceite artístico humano e Moto G06 pendentes. Refinamento pode exigir autoria adicional, sem presumir limite do aparelho ou promover GLB/fixture.

> **Direção futura BF-5.5 — O Despertar da Biblioteca (05/11/2026):** magia permanentemente perceptível com manifestações de impacto, luz noturna quente e azulada legível, móveis mais variados, pergaminhos luminosos voadores e habitantes manipulando fisicamente objetos e participando das atividades reais do jogador. Trata-se de planejamento, não de arte implementada nem de aceite físico. [Plano de fase](BF-5_5_O_DESPERTAR_DA_BIBLIOTECA.md).

> **Direção aprovada da BF-5 (05/11/2026):** O Códice Iluminado e o **Atlas Clássico projetado** com gravuras masculinas/femininas estáticas, rotação contemplativa e dissolução substituem a apresentação articulada rejeitada. O proprietário considerou a versão instalada satisfatória para integração e fechamento da reforma de UI/UX. Esse é um aceite artístico dirigido, sem equivaler a um gate físico/assistivo completo. [Fechamento BF-5](BF-5_FECHAMENTO_2026-11-05.md) · [ADR-022](decisions/ADR-022-atlas-classico-projetado.md). Textos de candidatas anteriores são históricos.

## BF-5 — Atlas clássico projetado (2026-11-05)

O proprietário rejeitou a interpretação articulada do Atlas Vivo. A direção vigente exige gravuras estáticas clássicas refinadas, com desenhos masculinos/femininos próprios, variando pose/perspectiva, e rotação contemplativa por dissolução. A sensação sobrenatural vem da arte e da projeção; não há animação corporal procedural. [ADR-022](decisions/ADR-022-atlas-classico-projetado.md) · [candidata e pendências de aceite humano](BF-5_ATLAS_CLASSICO_PROJETADO.md).

## BF-5R9 — preservação do Códice Iluminado

O proprietário confirmou aprovação física da direção R6 no pedido R9 e resultados positivos do canvas/pan/pinch/rolagem. Esta rodada preserva a arte existente e acrescenta apenas o ícone Android original de códice/chama. O novo ícone ainda depende de avaliação humana; não se transfere o aceite R6 automaticamente. [Relatório](BF-5R9_RELATORIO.md).

# Direção artística

## BF-5R5 — acabamento candidato

Continuidade artesanal do papel/tinta/latão R4: superfícies de encadernação, cantos suaves, instrumentos encaixados, hierarquia de percurso e memórias por categoria. Retratos de detalhe mostram cinema, marcador episódico, intenção de estudo, ficha de prática e próximo passo de empreitada. Pressão curta e luz/relevo dão resposta sem reduzir o mundo, suas animações ou habitantes. A composição/pátio R4 é preservada; não há promoção da fixture à Biblioteca definitiva. Aceite artístico depende do proprietário. [Relatório R5](BF-5R5_RELATORIO.md).


## Candidata BF-5R4 (2026-11-03)

Papel claro e tinta nos rituais de registro, manuscritos no Arquivo, pedra azul e latão no observatório/ateliê. Gravuras originais dos seis tipos substituem símbolos tipográficos nas fichas. O exterior é um pátio cenográfico real com marcações e lanternas, sem prometer interações. A avaliação artística permanece humana e pendente; [relatório R4](BF-5R4_RELATORIO.md).


> **BF-4F2 concluída por gate dirigido (2026-11-02):** animações por seleção e controles React aceitas no Moto G06, sem regressão/queda de fluidez percebida. Simplicidade artística não é teto futuro. CI global FAIL e novos casos F2 rastreados em [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15). [Fechamento](BF-4F2_RELATORIO.md).

> **BF-5 — direção da identidade visual do aplicativo inteiro (2026-11-03):** [Fantasia Sobrenatural Editorial](BF-5_DIRECAO_VISUAL_GLOBAL.md) é a orientação criativa global para Biblioteca, Coleção, Arquivo, Resumo e Ajustes, compartilhando mistério arcano, presença sobrenatural, fluidez e contenção visual. O mundo 3D mantém seu contrato artístico anterior; a nova direção amplia a atmosfera para navegação e telas convencionais, **sem anular as evidências BF-4, fixar tokens cromáticos finais ou autorizar implementação**.

O futuro mundo deve parecer íntimo, antigo, acolhedor, mágico e habitado. Madeira, pedra, latão/dourado, pergaminho, bordô e verde profundo formam a linguagem material e cromática inicial. Legibilidade mobile continua prioritária.

A direção aprovada é **3D real estilizado com apresentação ortográfica/2.5D**. O mundo deve ter profundidade real sem perder leitura clara, calor e identidade editorial.

Escala, iluminação, materiais, densidade, animação e enquadramento ainda precisam de provas artísticas. Este documento não congela engine, formato de arquivo ou especificação técnica antes dessas provas.

## Ambição artística e criativa acima da otimização preventiva — prioridade vigente

**A Biblioteca Viva deve parecer um mundo vivo, acolhedor e mágico — não um benchmark gráfico.** Identidade dos habitantes, encenação, expressividade, cenários ricos, magia, humor, interações e histórias são objetivos primários. Não substituir a visão por uma estética genérica só porque é mais barata em draw calls ou mais simples de testar.

**Não presumir incapacidade do Moto G06.** F5 não estabeleceu teto do aparelho; F2 foi aceita fisicamente sem perda de fluidez percebida. Nenhuma dessas evidências garante desempenho sustentado ou ilimitado. Criar uma versão artística convincente, observar no mundo integrado e otimizar **somente diante de impacto real demonstrado**, preservando o resultado criativo.

A animação F2 pode ser enriquecida no futuro, apesar do aceite atual. Em F3, os habitantes precisam de iniciativa e relações críveis, não circulação mecânica; em F4, a narrativa e as escolhas precisam ser ricas e coerentes, não mero menu raso. Aceite estético pertence ao usuário, não à suíte E2E. Segurança e acessibilidade continuam obrigatórias. [Testes](TESTING.md), [desempenho](PERFORMANCE.md).

## BF-4 (decisão de escopo; não é aprovação visual)

A transformação visual deve alcançar os **cinco cômodos juntos** desde BF-4B, mantendo coesão geral e diferenças intencionais sem reservar cômodos a categorias. BF-4F prevê personagens reconhecíveis individualmente por silhueta, traje, acessórios e expressividade animada. Materiais, densidade, luzes, oclusão e personagens ainda requerem validação visual integrada no Moto G06. Referência: [BF-4 — Plano e contrato](BF-4_PLANO_CONTRATO.md).

## BF-4F — Identidade artística dos quatro habitantes (concepção aprovada)

O usuário adotou quatro personagens fantásticos detalhados: **Samael** (2,00 m, corpo robusto escuro, aura negra/lilás e gesto pesado), **Aryn** (elfa 1,70 m, cabelos escuros, pele clara, óculos e aura luminosa suave, gestos ágeis), **Ytha** (fada 1,70 m, cabelos rosa/lilás, asas de borboleta e luz feérica, atuação leve) e **Lua** (maga imortal 1,60 m, óculos, cadernos e grimório, gestos expressivos de magia instável). **Não** basta recolorir o mesmo modelo; identidade de cada um depende de silhueta, traje, acessórios, rosto, animação e comportamento. Os quatro devem ser legíveis na câmera ortográfica e dialogar visualmente com os cinco cômodos. Decisões de paleta final, rigging, efeitos, rosto e acabamento dependem de prova artística e aceite humano no Moto G06. [Bíblia BF-4F](BF-4F_CONCEPCAO_HABITANTES.md). Planejamento não equivale a asset produzido.

**Fechamento BF-4F1 (2026-11-02):** quatro habitantes integrados, visual inicial aprovado e seleção pelo canvas e React confirmada no Moto G06. Microgestos de cabeça não representam animação corporal; essa expressividade fica para BF-4F2. Capturas indicaram ~60 FPS pontuais, sem benchmark sustentado. [CI 41520167206](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41520167206) passou os gates não E2E e 667 Vitest; E2E final FAIL (20 PASS, 6 FAIL, 1 flaky), sem CI global PASS. Issues #4/#11, R-19 e TalkBack permanecem. [Relatório](BF-4F1_RELATORIO.md).


## BF-4F3 — encenação e convivência (concluída em gate dirigido, 2026-11-02)

A F3 adota cenas de aproximação, espera, gesto, atrito e reconhecimento em vez de simples animações periódicas. Samael aceita companhia com reserva; Aryn aprende a compartilhar a condução; Ytha ganha iniciativa por confiança; Lua conserva autoria e responsabilidade após o erro, sem humilhação recorrente. O acidente é uma folha de treino dobrada/chamuscada, seguida por luz suave e reparação, sem destruição geral ou flashes. As auras acompanham estados e continuam subordinadas à atuação corporal. Caminhada real tem ritmos individuais; os cinco cômodos são compartilhados.

Essa direção foi concretizada no código e nos clips F2 reaproveitados. **Gate Moto G06:** Autonomia PASS, Convivência PASS, Integração PASS; **acidente e reparação de Lua NÃO TESTADOS fisicamente**. A aprovação dirigida confirma o recorte observado, não significa que cada par ou gesto foi visto individualmente, nem equivale a arte final. Preservar a possibilidade de aprimorar coreografias e identidade social em fases futuras, sem reduzir criatividade por medo preventivo de desempenho. F4 priorizará identidade narrativa, escolhas e consequências. [Fechamento F3](BF-4F3_RELATORIO.md).

## BF-4F4 — linguagem visual RPG adotada (fechamento funcional dirigido, 2026-11-02)

O painel é uma mesa de leitura em pergaminho quente, contorno de latão e respostas em vinho; identidade do falante permanece visível na leitura móvel. Retrato conserva a cena acima da conversa; paisagem dispõe mundo e leitura lado a lado. As vozes se distinguem por humor seco e responsabilidade de Samael, cuidado/controle e vulnerabilidade de Aryn, imaginação e iniciativa de Ytha, precisão inventiva e orgulho de Lua.

A fenda é uma costura lilás com quatro segmentos de cor, luz local e sinais nos cinco cômodos. Contenção deixa meia-lua fria e inscrição incompleta; experimento deixa círculo de quatro cores e leitura recuperada após um erro reversível corrigido pelos quatro. Páginas, sutura, flor cinza/rosa/verde e glifo tornam consequências legíveis sem alterar registros. O repertório F2/F3 fornece gestos nas posições atuais, sem teletransporte. **As escolhas narrativas foram aceitas funcionalmente pelo usuário no Moto G06**, com capturas do painel e do mundo; a conclusão individual de todas as histórias, os desfechos da Fenda e a cena do folio F3 **não tiveram comprovação física exaustiva**. A aprovação atual não é aceite do acabamento artístico definitivo. O usuário reservou uma **fase própria de UI/UX**, além de outra frente de **aprimoramento dos personagens e experiências de RPG, diálogo e interatividade**. Essa separação permite enriquecer a expressão e corrigir ergonomia sem desqualificar a funcionalidade já integrada nem sacrificar ambição criativa por medo do Moto G06. [Fechamento](BF-4F4_RELATORIO.md).

## BF-5R6 — O Códice Iluminado (candidata, sem aceite, 2026-11-04)

A linguagem anterior de cartões verde-escuros e botões bege foi rejeitada nas capturas reais do Moto G06 por parecer uma coleção industrial de componentes. A candidata R6 busca **editorial de fantasia feito à mão**, com páginas e fichas em marfim/pergaminho, tinta escura, encadernações e selos em cobre, plano de navegação de veludo noturno e acontecimentos espectrais contidos. Marcadores de capítulo e gravuras autorais são proporcionais ao conteúdo; campos devem parecer instrumentos de escrita, nunca boxes hospitalares. Ver [relatório R6](BF-5R6_RELATORIO.md). Esta direção é implementação candidata, não aprovação final.

## R5 — Renascimento dos habitantes, candidata

Samael: chifres recurvos estriados, pele de obsidiana/lilás, garras, ombreiras infernais, couro e selo angular; massa e reserva acompanham café/notebook. Aryn: face alongada, orelhas laminares, tranças/mechas, gown pregueado verde/marfim, óculos e instrumentos de restauração. Ytha: membranas opalinas rosa/verde com nervuras/ocelos, coroa floral, pétalas e cabelo rosa. Lua: cabelo azul com nó/franja assimétrica, gola lunar e overskirt ameixa, ampolas, grimório e órbitas fraturadas. Latão patinado, tecido e cristal unem os quatro; altura, face, materiais e acessórios os distinguem.

[Comparação real frontal R4/R5](audits/evidence/bv-r5/comparison.png), [vistas por personagem](audits/evidence/bv-r5/portraits/) e [pipeline autoral](INHABITANT_ART_PIPELINE.md). A estética é estilizada geométrica; rostos não têm rig facial, mãos não têm dedos independentes e tecidos não são simulados. **Cada personagem aguarda aceite artístico próprio**; não apresentar testes, contagens ou inspeção automatizada como aprovação de beleza/expressividade. Refinar mediante feedback sem presumir limitação do Moto G06.
