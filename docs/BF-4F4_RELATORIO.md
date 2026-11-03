# BF-4F4 — Diálogos RPG, histórias e consequências

Candidata de 2026-11-02, branch `feat/bf-4f4-rpg-quests`, baseline `cf2a463dce30a7bd3eb36d9712a75b6b6e634dbc` (merge BF-4F3). Checkout inicialmente limpo, remoto conferido, `fetch`, `switch main` e `pull --ff-only` executados. Sem merge, release, mudança de versão ou aceite artístico. **BF-4F4 e BF-4F não estão encerradas.**

## Histórias entregues

Cinco grafos autorais offline, totalizando **70 nós e 174 escolhas declaradas**. Não há entrada livre, LLM, serviço de texto, espera pelo relógio, evento aleatório obrigatório nem dependência de concluir as histórias individuais antes da coletiva. Os botões mostram respostas completas; cenas de confirmação/conclusão não inventam alternativas para completar uma contagem. A investigação coletiva oferece até quatro perspectivas ainda não ouvidas e, depois delas, a decisão.

| História | Descoberta e conflito | Trajetórias e consequências verificáveis |
| --- | --- | --- |
| **As Cinzas do Caderno** | O calor retido na tinta de um caderno ficcional saiu por um lacre incompleto; as páginas passaram pelo relógio B e buscaram calor no braseiro E. Samael precisa assumir que controlar a chama não era controlar suas consequências. | Discrição → inspeção privada → lacre corrigido por ele, com confiança reservada ao jogador. Exposição → leitura de Aryn → atrito e negociação de permissão → reparo compartilhado ou reconstrução do limite. O desconforto da exposição permanece no epílogo mesmo que o jogador escolha uma conclusão reservada. A margem queimada pode permanecer como lembrança escolhida. |
| **O Livro de Anatomia Rasgado** | Atlas inteiramente ficcional em C. Uma fita úmida encolheu, apertando o suporte e puxando a lombada. Aryn suspeita cedo demais e precisa reconhecer sua própria intervenção. | Estabilizar imediatamente cobre parte da pista e exige testemunho/fragmentos. Investigar primeiro revela impressão mecânica. Ytha pode ser autora do apoio flexível; Lua pode receber crédito pelo desenho articulado; Aryn pode concluir o reparo com compromisso explícito de perguntar antes de agir. Pressão sobre Ytha abre uma cena em que ela defende sua ideia e Aryn pode nomear o medo de ser dispensável. |
| **As Pétalas que Esquecem** | Planta e globo de D guardavam emoções sem retorno. Ytha percebe que a Biblioteca conserva lembranças por circulação, não por cárcere. | Observação e história íntima → retorno lento com nervura prateada. Experimento limitado com Lua → janela vegetal concebida por Ytha e florada com arco visível. Apoio de Aryn → raízes sustentadas enquanto Ytha conduz. Propostas de força/corte não silenciam Ytha: ela recusa e formula seu próprio limite. Folhas cinza tornam-se verdes, pétalas recuperam rosa; o texto também descreve a recuperação. |
| **O Feitiço Mal Copiado** | Lua copiou uma seta de retorno como entrada no folio de treino de D. Ela lembrava do desenho, mas deixara de observar o movimento. | Revisão direta → teste pequeno → estudo guardado. Encorajamento impaciente → sobrecarga reversível → Lua interrompe, escolhe assistência e corrige. Aryn estabiliza fibras sob permissão ou Samael contém calor segundo a indicação de Lua. Ela conserva o lápis, compreende o erro e executa a solução; pode explicar a colaboração ou nomear a variante Volta da Luméria. |
| **A Noite da Fenda Lilás** | Uma curva recente acorda quatro assinaturas antigas que tentavam conservar calor, forma, cor e palavra sem saída. O jogador descobre a origem, escuta versões distintas e escolhe um modo de resolver. | Contenção cautelosa → selo, marca fria e perda de parte da inscrição; Lua pode continuar discordando. Retorno experimental → cores deslocadas de modo reversível, pausa/correção em equipe e inscrição recuperada; círculo de quatro cores. Escolhas de proteção, permissão, suspeita, revisão e reconhecimento modificam memória e vínculos. |

A voz seca de Samael não o transforma em vilão; o impulso de Aryn nasce também de seu medo de falhar; Ytha toma decisões mesmo com receio; a experiência secular de Lua convive com orgulho e necessidade de companhia, sem humilhação como solução narrativa.

## A Noite da Fenda Lilás — cinco atos efetivos

1. **Presságio:** costura lilás no salão A, luz local e sinais nos outros cômodos. Pode começar pelo eco do relógio B, por observação cautelosa ou por uma pergunta franca a Lua. O renderer recebe uma sobreposição noturna enquanto o fenômeno está aberto; horário e estado BF-4E continuam intactos.
2. **Quatro perspectivas:** ordem livre, por escolhas ou seleção contextual dos habitantes. Samael lê calor/assinatura em E; Aryn lê a sombra do apoio em C; Ytha investiga cores/planta/globo em D; Lua liga a curva de A ao eco de B. Falas posteriores consideram perspectivas já ouvidas e, quando apropriado, histórias individuais concluídas. A abordagem altera pistas e os canais de confiança/atrito/reparação.
3. **Decisão:** contenção ou experimento, com custo anunciado antes de escolher. É possível pactuar interrupção por qualquer participante ou adiar. Não existe opção que destrua dados ou torne a história impossível.
4. **Cooperação:** quatro etapas necessárias e explícitas: Samael contém energia; Aryn estabiliza estrutura; Ytha protege raízes e abre circulação; Lua reconstrói o retorno. Cada etapa oferece decisões concretas sobre sinais, limites, apoio e autoria. No experimento, há um deslocamento de cores seguido de correção pelo ritmo da planta, reserva de Samael ou pausa compartilhada. Não há final automático por um callback de animação.
5. **Epílogo:** os quatro reagem; a estratégia determina texto, resultado do diário e vestígio visual. A última escolha preserva companhia com discordância, espaço individual ou convite para experiências futuras. A Biblioteca volta à atmosfera BF-4E corrente; o vestígio fica nesta sessão.

O Catálogo das Coisas Perdidas e As Quatro Chaves do Arquivo Velado permanecem futuros.

## Arquitetura e contratos

- `narrative/contracts.ts`: nós, escolhas, condições discriminadas, efeitos enumerados, progresso e snapshot de sessão. IDs de escolha têm namespace próprio `quest:choice:...`; nós usam `quest:...`.
- `ashes/anatomy/petals/spell/rift.ts`: escrita e grafos; `writing.ts` apenas auxilia a autoria declarativa. Nenhum texto executa código.
- `session.ts`: condições puras, progressão síncrona por ativação explícita e revisão esperada. Double tap e callbacks antigos são recusados. O guard de publicação impede ações recursivas de assinantes. Fatos são conjuntos sem duplicação; consequências de vínculo têm identidade estável e são aplicadas uma vez por escolha/par, mesmo em ciclos. O histórico visível tem limite de 16 escolhas; fatos/vínculos são limitados pelo corpus finito de definições, sem conteúdo livre.
- `validate.ts`: IDs globais únicos, condições conhecidas, destinos, textos, alcance, saídas e conclusão alcançável. Testes exploram também os estados condicionais efetivos e verificam que não há armadilhas.
- `NarrativePanel.tsx`: painel de pergaminho/vinho/latão, nome do falante, objetivo, respostas, adiamento, diário e epílogos; teclado/Escape, foco no falante e devolução ao acionador quando possível. Retrato preserva a cena e a identificação durante rolagem; paisagem usa cena e leitura lado a lado. Não captura gestos fora do painel.
- `WorldHost`: é o owner da sessão narrativa; canvas e alternativa semântica abrem o mesmo fluxo. Seleção React usa o retorno do runtime e evita publicar seleção em duplicidade. Falha WebGL remove a ponte 3D e mantém a história legível e jogável.
- `InhabitantAgency.setConversation`: lease explícito para falante, protagonista e, durante cooperação, os quatro. Mantém posição/yaw, preserva tarefa para reconsideração e verifica espaço antes do gesto. Bloqueia movimento, atenção manual e encontros incompatíveis para participantes; liberação recupera/replaneja. Quem não participa continua autônomo. Demonstração F2 pelo painel adia a conversa antes de usar o controle manual.
- `setNarrativeBonds`: substitui somente o canal das escolhas. Confiança/tensão efetivas influenciam prioridades F3; histórico espontâneo continua separado de `narrativeHistory`. Reiniciar a ficção remove apenas a contribuição narrativa, preservando encontros espontâneos.
- `ThreeWorldRuntime.applyNarrative`: ponte estreita, inerte após falha/disposal. Revisões antigas são recusadas também na ponte com o renderer. Sem timers, RAF novo, execução de scripts ou coordenação narrativa dentro do núcleo F3. Clips F2 e poses F3 são reutilizados; um gesto amplo pode ser substituído por repouso se não houver espaço seguro.
- `three/narrativeVisuals.ts`: páginas chamuscadas em E, atlas/sutura em C, flor de memória junto à planta de D, glifo sobre o folio de treino, costura/vestígio em A e sinais em B/C/D/E. O marcador de pista ancora somente IDs ambientais conferidos. Recursos pertencem ao building e são descartados com ele. Não se apropria de materiais ou roots BF-4E.

## Fronteiras e continuidade

Nenhum schema, Dexie, backup, tipo de registro, versão, dependência, GLB ou fonte Blender foi alterado. Os cinco cômodos e as quatro passagens continuam os mesmos. A ponte não lê nem escreve conteúdo do usuário. BF-4E é usado como referência de props; não recebe flags de quest, ações de descoberta nem callbacks recursivos. A sobreposição de atmosfera atua somente no renderer.

A sessão sobrevive a fechar/abrir conversas, trocar personagens, rotação e pause/resume do mesmo host. A falha WebGL preserva progresso no React; texto passa a ser explicitamente uma leitura ficcional, sem afirmar execução física das animações. Sair da rota Biblioteca, recarregar ou recriar o processo cria outra sessão, por contrato. Não há persistência durável. O diário permite reinício explícito das cinco histórias com confirmação restrita à ficção. Escolhas não dependem de conclusão de animação; portanto, não existe callback tardio capaz de resolver uma quest antiga.

A encenação utiliza as posições atuais: **não move instantaneamente personagens até props ou até o jogador**. Gestos de energia/cuidado correspondem ao beat narrativo; o texto faz a ligação espacial quando um participante está distante. A legibilidade dessa solução precisa da avaliação humana. Movimento reduzido mantém estados visuais estáticos e todos os textos, suprimindo animação decorativa. TalkBack ainda não foi avaliado fisicamente.

## Verificação da candidata

| Gate local | Resultado |
| --- | --- |
| `npm run format` / `format:check` | PASS |
| `npm run lint` / `typecheck` | PASS |
| Vitest integral `npm run test:run -- --maxWorkers=2` | **PASS — 91 arquivos, 708 testes** |
| Regressão final de núcleo/painel/host/runtime/cenário | **PASS — 5 arquivos, 78 testes**, incluindo reativação do mesmo habitante e deslocamento/correção visual das cores |
| `npm run audio:check` | PASS |
| Build web / relatório de bundle | PASS; aviso Vite de chunks acima de 500 kB permanece |
| Android sync / debug | PASS técnico; artefato final e hash abaixo |
| E2E dirigido final `playwright test e2e/bf4-rpg.spec.ts` | **PASS — 2/2**, canvas + fallback, retomada, rotação, conclusão, comparação dos registros fictícios antes/depois e retorno à Coleção |
| E2E global local | **NOT RUN**, reservado à CI da PR |
| Moto G06 / TalkBack / aceite artístico | **NOT RUN nesta candidata** |

**Falhas observadas e diagnóstico proporcional:** a primeira execução integral padrão, simultânea com Chromium, teve 707 PASS e um timeout de 5 s no teste longo F3 de encontros/reparo. A execução integral sem Chromium, com dois workers e os mesmos asserts/timeouts, passou 708/708. A concorrência é uma hipótese sustentada por essa diferença, não prova de desempenho físico; a falha não foi atribuída automaticamente à dívida histórica.

O primeiro E2E dirigido percorreu a história de Samael até o epílogo em canvas/fallback, mas procurava ao fim o link inexistente `Livros`. Na rodada seguinte, o fallback chegou à Coleção mas o teste procurava `h1 Coleção` (o header é `Biblioteca Viva` e a Coleção usa h2); o cenário canvas esgotou o prazo global aguardando estabilidade no botão de retomada durante a execução simultânea com a suíte Vitest. O teste foi corrigido por inspeção do DOM/rotas, recebeu uma fixture fictícia e comparação de registros antes/depois e foi reexecutado sem a carga concorrente. Não houve aumento de timeout, remoção de assert, retry configurado ou modificação da navegação convencional. Erros de seletor e timeout foram registrados como falhas desta candidata, sem classificação automática como históricos.

[Retrato](evidence/bf4f4/rpg-portrait.png) e [paisagem](evidence/bf4f4/rpg-landscape.png): capturas Chromium com movimento reduzido e dados fictícios, sem prova de animação física. As capturas dirigidas também motivaram manter nome/saída visíveis e reservar a disposição em duas colunas ao modo 3D pronto; o fallback ocupa a largura disponível. A revisão automatizada de layout não é aceite humano.

Dívidas anteriores: BF-4F3 foi integrada com CI global FAIL, 690 Vitest PASS, E2E 21 PASS / 10 FAIL / 1 flaky; issues #4/#11/#15 abertas. Coincidência nominal não comprova causa idêntica. **Acidente/reparação de Lua F3 continua sem aceite artístico físico.** Nenhuma cobertura lógica F4 substitui essa observação. Suíte E2E global será executada na CI da PR, sem campanha local de estabilização.

## Roteiro curto para o Moto G06

1. Tocar cada habitante e ler o começo; verificar se voz, gesto e postura revelam personalidade. Concluir as quatro histórias pelo diário, adiando uma conversa e trocando de personagem durante a visita.
2. Comparar dois caminhos significativos, usando o reinício ficcional: discrição/exposição de Samael; reparo imediato/investigação de Aryn; memória reservada/janela vegetal de Ytha; revisão/sobrecarga interrompida de Lua. Observar pistas, vínculos, epílogos e props, especialmente a cor da planta. Não é necessário testar todas as combinações.
3. Iniciar a Fenda sem concluir as individuais. Ouvir os quatro em ordem escolhida; observar A–E. Comparar contenção e retorno experimental: custo antecipado, quatro contribuições, correção de cores e vestígio/epílogo diferentes. Avaliar se parece um acontecimento importante, mesmo com os desacordos finais.
4. Conferir conforto do painel em retrato/paisagem, toque fora dele para navegar no mundo, adiamento, background/retorno e funcionamento convencional da coleção. Com movimento reduzido, verificar se o texto basta. Fallback tem cobertura automatizada; não exige provocar falha gráfica no aparelho.

Gate é humano e artístico, sem benchmark prolongado por padrão. Registrar problemas concretos de leitura, história, gesto, ritmo ou fluidez. **Somente decisão expressa do usuário após auditoria poderá encerrar F4.**

## Artefato e publicação

APK debug: `android/app/build/outputs/apk/debug/app-debug.apk`. Build técnico, sem instalação ou observação no Moto G06. A sincronização/empacotamento final foi repetida somente após a revisão das capturas corrigir o layout de fallback; não houve builds por nó ou personagem. Tamanho final: **10.568.395 bytes**. SHA-256: `353f81eb311ed8d1a309d255e90c4c0a950f4fb36fafeea063e16d9718a62935`.

O relatório de bundle registra **720.583 bytes iniciais** e **730.377 bytes no chunk dinâmico ThreeWorldRuntime**; informa bytes, não FPS/GPU/fluidez. O último guard de revisão antiga na ponte passou novamente pelos **43 testes do runtime**, e o build final incluiu essa proteção. A PR é draft contra `main`, candidata à auditoria; CI integrada deve ser consultada na própria PR. Falhas futuras serão distinguidas por cenário e evidência, sem atribuição automática às issues existentes.

## Arquivos desta entrega

```text
CHANGELOG.md
docs/ART_DIRECTION.md
docs/BF-4F4_RELATORIO.md
docs/BF-4F_PLANO_TECNICO.md
docs/README.md
docs/RISKS.md
docs/ROADMAP.md
docs/STATUS.md
docs/evidence/bf4f4/rpg-landscape.png
docs/evidence/bf4f4/rpg-portrait.png
e2e/bf4-rpg.spec.ts
src/features/library/InhabitantLife.tsx
src/features/library/NarrativePanel.test.tsx
src/features/library/NarrativePanel.tsx
src/features/library/WorldHost.test.tsx
src/features/library/WorldHost.tsx
src/features/library/inhabitantAgency.test.ts
src/features/library/inhabitantAgency.ts
src/features/library/narrative/anatomy.ts
src/features/library/narrative/ashes.ts
src/features/library/narrative/contracts.ts
src/features/library/narrative/petals.ts
src/features/library/narrative/rift.ts
src/features/library/narrative/session.test.ts
src/features/library/narrative/session.ts
src/features/library/narrative/spell.ts
src/features/library/narrative/stories.ts
src/features/library/narrative/validate.ts
src/features/library/narrative/writing.ts
src/features/library/three/ThreeWorldInteraction.ts
src/features/library/three/ThreeWorldRuntime.test.ts
src/features/library/three/ThreeWorldRuntime.ts
src/features/library/three/livingVisuals.ts
src/features/library/three/narrativeVisuals.test.ts
src/features/library/three/narrativeVisuals.ts
src/features/library/worldRuntime.ts
src/styles.css
```
