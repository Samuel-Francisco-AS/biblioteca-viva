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
