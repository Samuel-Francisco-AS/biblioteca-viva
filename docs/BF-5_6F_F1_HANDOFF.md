# BF-5.6F — Arena Viva | Entrega F1 e contrato para F2

Data: 09/11/2026. **Status: F1 implementada em branch dedicada; F2 ainda NÃO iniciada.** Esta PR é **uma única candidata draft compartilhada** para F1 e F2. Nenhuma alteração da F é integrada à `main` antes do gate e da autorização do proprietário.

## Decisão de produto

O Duelo Arcano deve ser uma experiência **de jogo** inspirada na legibilidade e cadência mobile de *Yu-Gi-Oh! Duel Links*, sem reproduzir assets, regras ou interface proprietária. Uma partida inteira ocorre em **um único viewport**, inclusive em retrato, sem rolagem vertical/horizontal da página. Campo, mão, indicadores de vida/energia e ações contextuais cabem no espaço seguro do Moto G06. Sem texto instrutivo permanente durante o duelo; regras e descrições aparecem sob demanda. O dock da Biblioteca não aparece na arena; demais áreas do Arcanário preservam sua interface antiga por enquanto.

## F1 — O que existe no código

### 1. Projeção segura de estado

`src/features/duel/arena/arenaModel.ts`

- `projectArena(match)` retorna `ArenaView`: turno, revisão, status, modo, resultado, jogador, oponente, mão **apenas local**, unidades, artefatos, atributos e últimos eventos confirmados.
- A visão adversária expõe **contagem de mão/deck**, nunca seus IDs ou snapshots ocultos. Eventos de compra/queima/perscrutar removem IDs não públicos.
- `arenaActionsForSelection(view, id)` filtra somente ações que o motor existente permite para a carta/unidade/artefato local selecionado.
- `arenaActionIsLegal(view, action)` compara com ações legais do motor. Use esta checagem somente como affordance de UI; `DuelService.command` continua autoridade para validação, revisão concorrente e persistência.
- `projectArena` **não salva nem muda regras**. Não adicionar lógica estratégica/placar independente na cena 3D.

### 2. Ponte de sessão e lifecycle

`src/features/duel/arena/useArenaSession.ts`

- `useArenaSession(id)` retorna `{ view, busy, error, visible, submit, refresh }` e usa a aplicação existente/serviço `app.duels`.
- `submit(action, player=0)` envia um **comando completo com ID único e revisão esperada**, aguarda commit, então atualiza a projeção. Falhas não aplicam retry cego.
- Reconsulta a persistência no resume/visibilidade, descarta revisões mais antigas e evita nova decisão da IA se a revisão do turno mudou.
- A IA local existente age apenas no seu turno, quando a tela está visível e sem comando pendente. Uma decisão por vez, sem loop RAF.
- O hook só deve ser montado pela F2 quando a nova arena estiver pronta. A atual mesa 2D continua responsável pela sua própria sessão durante esta fase, **não montar os dois controladores simultaneamente**.

### 3. Shell fullscreen e URL reservada

- `src/features/duel/arena/arenaRoute.ts`: `arenaRouteFor(id)`, `legacyDuelRouteFor(id)` e `isArenaRoute(path)`.
- `src/features/duel/arena/ArenaFrame.tsx`: contêiner sem scroll com `stage` para arena/overlay e controle acessível de saída. F2 injeta elementos interativos e gráficos nesse palco.
- `src/features/duel/arena/arena.css` e `src/App.tsx`: o atributo `data-arena-route` ativa o isolamento de viewport, oculta dock, cabeçalho e navegação do Arcanário **apenas** na nova rota, respeitando `env(safe-area-inset-*)`.
- A rota da arena usa **escopo mínimo** no `ArcanariumPage`, sem materializar todas as cartas/entradas pessoais antes de carregar uma partida; a futura cena lê seu estado diretamente do serviço.
- A URL `/arcanario/duelos/arena/:id` está **reservada, mas não divulgada**; em F1 ela redireciona com `replace` para a mesa 2D `/arcanario/duelos/partida/:id`. Assim, nenhuma arena incompleta fica acessível e o comportamento público segue intacto.
- O mundo 3D da Biblioteca e o `WorldHost` não foram alterados. Nenhum segundo Canvas/RAF/Three.Scene foi iniciado pela F1.

### 4. Testes dirigidos escritos

`src/features/duel/arena/arenaModel.test.ts` cobre:
- Nenhum ID de mão/deck adversário na projeção.
- Seleção de ações exclusivamente locais e legais.
- Bloqueio de ações quando a IA está ativa.
- Redação de eventos com informações ocultas.
- Diferenciação e codificação da rota reservada.

**Limitação importante:** alterações realizadas exclusivamente via conector GitHub; **não houve checkout, execução de Vitest, TypeScript, lint, build ou gate Android no ambiente do assistente**. Esses testes são código acrescentado, **não casos reportados como PASS**. Codex deve executar os checks antes de estender a UI.

## Contrato obrigatório da F2 — trabalho do Codex nesta mesma PR

1. **Atualizar a própria branch F** `feat/bf-5-6f-arena-orbital` partindo da ponta remota de F1, sem abrir nova PR e sem rebase destrutivo. Não alterar `main`.
2. Substituir o componente `ReservedArenaFallback` pela arena pronta em `/arcanario/duelos/arena/:id`; só então adicionar o link/entrada ao Salão. Enquanto não estiver pronta, manter fallback funcional.
3. Usar `ArenaFrame`, `useArenaSession`, `projectArena` e o conjunto de ações **exato** do motor. Não duplicar `transition`, `legalActions`, AI, regras, replay ou persistência Dexie.
4. Implementar campo 3D e câmeras adaptativas em **um viewport sem rolagem**, com zonas inteligíveis para até quatro criaturas e dois artefatos de cada lado, mão local, alvo, feedback, PV/energia e controles curtos; respeitar `safe-area` superior/inferior e orientação retrato/paisagem.
5. **Fluxo mínimo de toque:** selecionar carta na mão → realçar ações permitidas → escolher efeito/alvo quando houver → confirmar por gesto ou botão contextual → animar evento confirmado, sem navegar por longas seções de texto. Sair/pausar/retomar com resultado persistente. Nenhum drag como único controle.
6. Inspeção de carta em overlay temporário, sem deslocar campo. Nome/atributos/regras legíveis sob demanda e por leitor de tela; texto de instrução persistente não faz parte do HUD de gameplay.
7. Ocultar o dock enquanto na arena, usar indicador de turno e ações situacionais, eliminar sobreposição e cartas cortadas sem affordance.
8. Construção orbital acessível a partir da Biblioteca sem criar outro mundo 3D residente pesado, respeitando ciclo de vida do Canvas e seleção.
9. Tratamento preciso de desmontagem: cancelar timers, listeners e render loops, liberar geometria/material/textura quando cabível, preservar mundo residente atual, não manter segunda cena desenhando em background.
10. **Gate no Moto G06:** uma partida completa retrato e paisagem, sem rolagem da página nem clipping/insets, com compra/invocação/ataque/artefato/alvo/IA/pausa/retomada/Voltar Android; Canvas da Biblioteca fluido após ida e volta.
11. Regressão das áreas educacionais A–D, Oficina/TCG E e backup v11; qualquer mudança de dados exige ADR e migração compatível.
12. Registrar resultados com evidências e distinção entre testes dirigidos, CI global e gate físico; **nenhum merge automático**.

## Dívidas e riscos preservados

- Balanceamento TCG: Ruína 59/72 x Conhecimento 19/72 no último lote IA, não certificado em jogos humanos.
- Arte atual SVG procedural abstrata; a F2 deve melhorar especialmente cenário/efeitos, com evolução de gravuras prevista também para um refinamento transversal posterior.
- A UI/UX de todo o Arcanário ainda precisa de fase dedicada; F2 resolve a **arena** agora, não reescreve Oficina, Provações e Relicário.
- CI, TalkBack humano, memória/termal sustentados e E2E históricos pendentes. Dexie v19, backup v11 (importa v6–v10); sem downgrade seguro.
- A existência da rota reservada não é um recurso entregue ao usuário na F1; usar tela antiga até conclusão e aceite F2.

## Próximo passo

Codex recebe este documento e a branch/PR em estado draft e completa **F2 na mesma PR**, com testes. Após gate humano e aceite expresso, a PR F inteira poderá ser integrada à `main`. BF-5.6G (auditoria final) permanece independente.

## F2-A — revisão local (09/11/2026)

Checkout remoto confirmado em `4e23b6d`, branch limpa e rastreada. Gates iniciais: TypeScript PASS; 49 testes de projeção/motor/IA/catálogo/persistência PASS. F1 tinha cinco arquivos fora do Prettier e um erro ESLint `set-state-in-effect`. Revisão F2 adiciona isolamento de respostas por geração/ID, pausa serializada após comando em trânsito, bloqueio imediato da IA em background e reconciliação após conflito sem retry de comando. Definições públicas das cartas visíveis acompanham a projeção para inspeção. Não muda schema/regras.

## F2-B — apresentação Three.js

Cena independente carregada sob demanda: plataforma octogonal suspensa, alvenaria em camadas, incrustações, círculos, quatro obeliscos, constelações e ruínas flutuantes. Cartas públicas recebem lâminas físicas com gravuras existentes e aparições por tradição. Câmera ortográfica oblíqua reenquadra zonas por proporção; controles semânticos usam a mesma projeção. Renderer pertence à montagem da arena, com ResizeObserver, pausa de RAF, recuperação explícita de contexto e descarte de GPU. Recursos de cenário e geometrias compartilhados; resolução reduz somente após amostra de frames lentos. Nenhuma sombra dinâmica nem luz pontual adicional. Gate artístico/físico permanece humano.
