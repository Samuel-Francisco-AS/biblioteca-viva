> **Estado final — 22/11/2026: RETIRADA COM O TCG.** A Arena Viva descrita nesta ADR era a apresentação do antigo Duelo Arcano. A PR #58 removeu arena, rota e assets exclusivos do combate; portanto, este documento é histórico e não descreve uma arena ativa nem autoriza sua reconstrução. A Lua orbital preservada continua sendo o acesso ao Arcanário educativo, não uma arena de duelo.

> **Estado atualizado — 09/11/2026:** decisão ADR-030 implementada/integrada na `main` após aceite físico/artístico dirigido do proprietário e merge da PR #48 (`690be5b5798d34e6436610bf9d209ede38629fd7`). [Fechamento F e ressalvas](../BF-5_6F_FECHAMENTO_2026-11-09.md). O estado original “candidata draft, sem aceite/merge” abaixo é histórico da primeira redação. E2E orbital e testes gráficos/CI/TalkBack/termal ainda têm dívidas; BF-5.6 global aguardando G.

# ADR-030 — Arena Viva: apresentação e ciclo de vida

Data: 09/11/2026. Estado: implementada em candidata F2 por missão específica, PR draft #48; sem aceite físico/artístico ou merge. Complementa ADR-009, ADR-015 e ADR-029.

## Decisão

A arena é apresentação efêmera Three.js do motor E, em rota fullscreen própria, com HUD e controles semânticos sincronizados pela mesma projeção de câmera. O motor/service E conserva regras, IA, revisão concorrente, comandos únicos, replay e persistência. Nenhuma informação oculta do rival chega à cena. Animações consomem revisões já confirmadas, sem novos comandos nem replay gráfico ao reabrir.

A Biblioteca permanece residente e pausada pelo contrato `active=false` vigente. A arena tem renderer/recursos próprios somente enquanto sua rota está montada. Não há segundo mundo desenhando continuamente. Desmontagem libera contexto, RAF, listeners, geometrias, materiais e texturas; retorno retoma a residência anterior.

Pausa/segundo plano bloqueiam IA imediatamente e serializam pausa persistente após comando em trânsito. Escrita concorrente falha e reconcilia sem retry cego. Estado confirmado permanece válido se o processo for encerrado antes da pausa. Retomada reconsulta persistência, sem executar decisão obsoleta.

Uma manifestação orbital do building usa catálogo/picking existentes e abre o Salão. Está fora das regiões caminháveis e acima do chão, sem novos colisores de circulação nem persistência espacial. Não é outro WorldHost. Desenho/câmera da Biblioteca não são substituídos.

## Consequências

Câmeras/enquadramento e slots visuais não têm significado de regra. Orientação/redimensionamento não escrevem dados. Inputs por toque e teclado confirmam somente ações legais e não dependem de drag. Scroll é reservado a overlays de leitura; jogo inteiro ocupa um viewport seguro. Mesa E legada continua disponível para compatibilidade.

Dexie v19/backup v11/regulamento v1 inalterados, sem migração. Assets procedurais originais e gravuras públicas existentes; SVG rasterizado em memória para upload WebGL previsível, sem mudar fontes/hashes. Testes locais não aprovam arte, TalkBack, fluidez ou temperatura Android; o gate Moto G06 permanece humano. G e merge não autorizados por esta ADR.

## Adendo F/R1–R4 — 09/11/2026

A root orbital agora se move no anel arquitetônico existente, pelo delta do mesmo scheduler do mundo, mantendo seleção/picking e isolamento de regiões caminháveis. Pausa/redução congelam a fase; não há relógio/RAF externo, nova persistência ou alteração da câmera. Matrizes de filhos agrupados são propagadas antes de raycast/highlight.

A arte pintada é resolvida fora do domínio, sem trocar `artId`, revisões ou regras; SVGs originais permanecem. Recursos de cenário e efeitos pertencem à cena efêmera. Resultado pode desenhar efeito finito confirmado antes de parar o loop; reabertura não repete a animação. Refinamento não encerra a G nem autoriza merge/aceite artístico.
