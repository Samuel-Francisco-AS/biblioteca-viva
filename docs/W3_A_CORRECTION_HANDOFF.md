# W3-A — handoff da correção

> Estado em 2026-09-06. HEAD de referência: `02f0fde84a4b620f6c829277bca8b3b4e65fead8`. O working tree está propositalmente sujo e deve ser preservado. Para histórico e comandos de cada gate, consulte [`W3_A_CORRECTION_LOG.md`](W3_A_CORRECTION_LOG.md).

## Objetivo e estado do gate

W3-A foi reaberta para corrigir a construção estrutural: geometria lógica, continuidade visual de paredes/cantos/porta, renderer, interação, depth, fallback e, depois, a experiência mobile de Construção.

Foram tecnicamente concluídas conforme seus gates e aceitas nominalmente na sequência de autorizações: R0, R1-A, R1-B, R2-A, R2-B1, R2-B2-A, R2-B2-B, R3-A, R3-B, R3-C-A e R3-C-B1.

**W3-A-R3-C-B2 está tecnicamente concluída.** A repetição oficial passou com 9/9 testes, sete capturas de uma única geração e 31/31 emendas sem canal conectado de fundo.

**W3-A-R3-C-B2-FIX-A foi aceita nominalmente.** A primeira tentativa de FIX-B parou sem escrita porque o PNG achatado não distinguia folha, moldura e batente. Sam aceitou essa parada, decidiu que aberta/fechada compartilham o corredor estrutural horizontal oficial e autorizou somente FIX-B1.

**W3-A-R3-C-B2-FIX-B1 e o reparo de inicialização foram aceitos nominalmente por Sam.** A restauração foi confirmada manualmente no Firefox com estado `ready`, uma instância ativa e um canvas.

**W3-A-R3-C-B2-FIX-B2 e o acabamento longitudinal de 14 px-fonte foram aceitos por Sam e comprovados pela repetição.** A normal interior é derivada somente do piso adjacente a cada aresta, e a translação assinada é aplicada uma vez em `structureVisualGeometry`. O oráculo passou de 19/31 para 31/31. FIX-C foi absorvida pelas regressões de consumidores, sem abertura separada. A direção visual posterior foi aprovada e R4 foi concluída e aprovada pelo usuário no escopo web.

**W3-A-R5 está tecnicamente concluída.** A auditoria não encontrou regressão de produto; os dois arquivos focados passaram com 49/49 testes; o smoke Firefox isolado passou com um reload e 8 peças estruturais preservadas; build web, sync e build Android passaram. O APK debug técnico não foi instalado: `android/app/build/outputs/apk/debug/app-debug.apk`, 36.952.055 bytes, SHA-256 `99d379427949798ba1e1c20728bb254a1f021d09599f4f173b3bcbb0cb08e6fe`, gerado em 2026-09-06 18:35:54 -03:00. Consulte `STATUS.md` para o estado vigente.

**O gate final pré-R6 está tecnicamente concluído.** A Biblioteca perdeu os dois controles superiores obsoletos; o Resumo inferior conserva a alternativa textual. Coleção e Arquivo usam expansores inline acessíveis e preservam filtros. A medição de produção local observou primeiro frame de 1.642→1.453 ms a frio e 1.426→1.233 ms com cache após sobrepor o chunk Phaser, deduplicar a leitura DEV e reduzir de 28 para 17 as texturas bloqueantes. O fluxo Firefox visível 320 px passou e gerou quatro capturas. Build/sync/APK passaram; o APK não foi instalado: `android/app/build/outputs/apk/debug/app-debug.apk`, 36.952.055 bytes, SHA-256 `348b9f549f1ebdc552f6b42b0b1f0c10ff0fa15584c6955ef989870f1e9a0330`, gerado em 2026-09-06 19:59:44 -03:00.

**W3-A-R6 foi aprovada pelo usuário no Moto G06.** As capturas humanas da aplicação Android real confirmaram a ausência dos controles superiores obsoletos, a preservação do Resumo inferior e de Construir, o funcionamento do dock, a Busca recolhida ao lado de Novo registro, os Filtros recolhidos com a busca textual visível e a preservação dos dados pessoais. A demora inicial da Biblioteca e o engasgo no card do Resumo já existiam antes do gate, foram aceitos como ressalvas não bloqueadoras e ficaram adiados para a fase final específica de otimização; desempenho físico não foi aprovado nem declarado resolvido. A rodada corretiva W3-A está integralmente encerrada.

## Arquitetura já entregue

- `src/application/worldStructure.ts`: spans, intervalos, endpoints, vértices, porta e ocupação lógica;
- `src/application/worldStructureAnalysis.ts`: perímetro, fechamento diagnóstico e identidade normalizada;
- `src/application/worldStructureEditing.ts`: place/move/rotate/store e piso sem depender de pixels;
- `src/features/library-visual/phaser/structureVisualGeometry.ts`: metadado e transformação visual canônicos dos 12 assets;
- `src/features/library-visual/phaser/structureVisualTopology.ts`: normal interior por adjacência de piso, com resolução/ambiguidade/inconsistência tipadas;
- `src/features/library-visual/phaser/structureVisualContinuity.ts`: análise pura e determinística de continuidade entre planos vizinhos;
- `src/features/library-visual/phaser/structureVisualDepth.ts`: depth pela base visível e desempate estável;
- `src/features/library-visual/phaser/structureVisualFallback.ts`: fallback derivado da mesma geometria/depth;
- `src/features/library-visual/phaser/structureRenderPlan.ts`: transformação e depth materializados por placement;
- `src/features/library-visual/phaser/SpatialWorldScene.ts`: sprite ou fallback atômico no renderer ativo;
- `src/features/library-visual/phaser/constructionInput.ts`: hit testing pelas mesmas regiões do renderer.

Offsets, pivôs e spans visuais legados permanecem como compatibilidade, sem consumo estrutural ativo. `wallComposition.ts` permanece histórico e fora do runtime.

## Assets promovidos

Os quatro cantos aprovados foram promovidos em R2-B2-B. Candidatos e fontes são byte a byte iguais; runtimes são RGBA pixel-equivalentes. Todos usam canvas 1248×1248, alpha bbox `1200x1200+24+24`, escala 300 px-fonte por célula e passam o contrato individual `production`. Retas e portas foram preservadas byte a byte; `wall-assets:check` não usa tolerância legada no comando padrão.

## Diagnóstico histórico e correção atual

Fechamento lógico e endpoint/plano longitudinal passam, mas não garantem continuidade da espessura. A causa combinada é:

1. assimetria transversal dos assets lineares;
2. `sourceReferencePx` linear baseado no início do alpha bbox;
3. cantos leste/sul ocupando o lado transversal oposto;
4. ausência de normal, lado ocupado ou centerline/perfil transversal canônico;
5. testes anteriores que conferiam planos, mas não perfis transversais vizinhos.

Na sala canônica, os cantos direitos ocupam `x=454,826667..480` e a reta ocupa `x=480..505,066667`, com salto aproximado de centerline de 25,12 world units. No cômodo modificado, ocorre `x=518,826667..544` contra `x=544..569,066667`. No lado inferior, cantos ficam ao norte do eixo enquanto paredes/porta ficam ao sul; a diferença chega a 45,76 world units.

O lado esquerdo e o superior permanecem contínuos dentro da diferença registrada de um pixel-fonte. A porta conserva seus planos longitudinais. O fallback reproduz corretamente a geometria atual e não é um defeito independente. Não houve correção de produção em B2 ou RECOVERY.

O campo `side` dos planos continua identificando somente o lado longitudinal do encontro. FIX-A ampliou o mesmo `WorldJoinPlane` com endpoint lógico, eixo tangente, normal transversal assinada, intervalo semiaberto relativo ao eixo, lateral ocupada, centerline, espessura e tolerância de um pixel-fonte convertido. Tangente horizontal usa `+y = south`; tangente vertical usa `+x = east`. Não se deve corrigir o defeito com offset por `instanceId`, coordenada ou blueprint.

O oráculo agrupa planos exclusivamente por endpoint lógico + eixo longitudinal e não depende da ordem. Em FIX-A, encontrou 4/8 junções compatíveis na sala canônica, 10/15 no cômodo modificado e 2/8 no cenário de portas. FIX-B1 preservou 4/8 na canônica e evoluiu as outras composições para 11/15 e 4/8. Não resta `thickness-mismatch` provocado pelo envelope da porta; as incompatibilidades restantes continuam explicadas por lado, centerline e intervalo ainda não alinhados.

O contrato versão 2 nomeia `stone-01-horizontal-corridor` a partir da única referência `[24,453)`, espessura 429 px-fonte ou `45,76` world units. Retas horizontais, braços horizontais dos quatro cantos e os endpoints oeste/leste das duas portas referenciam essa classe. `profile` passa a ser a interface estrutural; `visualProfile`, alpha bounds e regiões ocupadas preservam o envelope completo. A porta fechada continua com 564 px de envelope e a aberta, 740 px; folha, moldura, arco, sombra e projeções fora do corredor continuam visuais.

O validador mede, sem connected components, se cada linha do corredor possui alpha na faixa lateral de largura `outerPaddingPx`. Fonte e runtime das duas portas têm somente uma linha sem suporte em cada endpoint, exatamente dentro da tolerância já existente de 1 px-fonte. A transformação, `spriteCanvasPosition`, escala, bounds, interação e depth não mudaram; o fallback apenas passou a validar seu desenho contra `visualProfile`, não contra o perfil estrutural mais estreito.

FIX-B2 percorre cada aresta unitária de cada intervalo lógico. Piso exclusivo no lado negativo resolve norte/oeste; piso exclusivo no positivo resolve sul/leste. Ausência, piso dos dois lados ou suporte misto são ambíguos; lados exclusivos contraditórios no mesmo braço são inconsistentes. Qualquer resultado não resolvido preserva o sprite e fica exposto em `transform.alignment.issues`. Cadeias abertas são aceitas quando todas as arestas observam o mesmo lado; peças isoladas permanecem sem deslocamento. Cantos resolvem braços horizontal e vertical separadamente.

O perfil medido vira `[0,t)` na normal positiva ou `[-t,0)` na negativa, com translação `target.start − measured.start`. Retas e portas recebem somente a componente normal; os dois braços de um canto formam uma translação 2D. Restrições do mesmo eixo que discordem além da tolerância de um pixel-fonte são inconsistentes e não são promediadas. `structureRenderPlan` fornece o contexto explicitamente; renderer, hit regions, seleção, preview, fallback e depth recebem a transformação resultante sem fórmula paralela.

| Composição | Antes de FIX-B2 | Depois de FIX-B2 |
|---|---:|---:|
| canônica | 4/8 | 8/8 |
| modificada | 11/15 | 15/15 |
| portas | 4/8 | 8/8 |
| total | 19/31 | 31/31 |

Não restam issues de lado, centerline, gap, overlap, intervalo ou espessura nas 31 junções; endpoints e planos longitudinais são idênticos ao estado anterior. A parede direita canônica translada `-25,066667` world units em `x`; a porta inferior, `-45,76` em `y`. Esses valores são derivados respectivamente de 235 e 429 px-fonte, não de placement ou coordenada. Os quatro cantos canônicos recebem duas restrições e translação `(0,0)`.

## Evidências e última validação

O harness `e2e/w3-a-r3-c-b2.spec.ts` usa a cadeia real `WorldStructureState → structureRenderPlan → structureVisualGeometry → SpatialWorldScene → canvas Phaser`, Chromium `151.0.7922.34` e dados descartáveis. Evidências em `art-guides/w3-a-r3-c-b2/`:

- `canonical-room-full.png`;
- `canonical-room-mobile-320x640.png`;
- `canonical-room-mobile-360x800.png`;
- `modified-room-full.png`;
- `door-states-detail.png`;
- `depth-selection-detail.png`;
- `fallback-detail.png`;
- `capture-manifest.json`.

O resultado histórico de B2 foi 8/9 e motivou a rodada corretiva. Na repetição, a primeira tentativa foi interrompida porque `expectedSpriteRecords()` ainda exigia escala uniforme; a captura canônica e o manifesto parciais não constituíram baseline e foram substituídos pela geração completa. Uma comparação RGB posterior marcou `(6,2)`, mas a composição alpha mostrou contribuição combinada 255, matriz 11×46 sem pixel transparente e nenhum canal transversal: era coincidência cromática com o fundo, não uma abertura. O oráculo final verifica conectividade alpha 4 e 8 em toda a faixa estrutural.

No reparo pré-B2, a matriz evoluiu para 172/172 em 14 arquivos, e o conjunto direto de host/scene/geometria/continuidade/fallback passou com 84/84. Typecheck e build passaram. A Biblioteca foi confirmada em navegador de desenvolvimento com estado `ready`, 1 instância ativa, 1 canvas 1184×900, 67 display objects e 2 zonas; o preview de produção também montou 1 canvas sem fallback. O lint conserva somente os quatro parâmetros preexistentes, agora deslocados para `SpatialWorldScene.test.ts:86/88`.

Na repetição final, o Playwright passou 9/9 duas vezes no Chromium `151.0.7922.34` com backend Canvas. O manifesto registra 8/8 emendas canônicas, 15/15 modificadas e 8/8 de portas, zero canal conectado, dimensões mobile exatas e arrays vazios de erro, warning e request failure. O foco de continuidade/geometria/render plan/cena passou 78/78; typecheck, lint, build, `wall-assets:check` e `git diff --check` passaram. Nenhum PNG-fonte, persistência, schema, backup, blueprint ou dependência mudou.

Hashes vigentes:

- manifesto `9c89ee9d485700f2bed6ea7d15198d27f3b2320ee0c35d013cd7c01e18fd9192`;
- canônica `d075c9b11543dfa9f41c7136cad37a02f894ea85a02879fb7a00f6952afc8b19`;
- mobile 320 `9f24e524f44ec8ce474354ff0c2b6e7a9ffae3b6454bc63e7b9b8aeb31d85600`;
- mobile 360 `4c0bcce157330b3ffb08dbd4a98ee5e6064cc787f624b2cc091e3ee59218ab18`;
- depth `dc01a027495d4c356a1b66b91262131f0846c6f4929f1857b4cc890614a0de9a`;
- portas `ff34f73bda8549c06716d226b65febf37edcddd620ed061c278c339576ae1ce3`;
- fallback `8a0e8720dba3e3bdf3a38d6f225743550f98a9373b716a7134f3b1b8e4271269`;
- modificada `ce452f0147e2f11bb6f118a7ca00b4bfc8e2e72f9a332ad5f2562d5e9966a662`.

## Encerramento da rodada corretiva

R3-C-B2, R4, R5, o gate final pré-R6 e R6 estão encerrados. R6 foi aprovada pelo usuário no Moto G06 com as duas ressalvas não bloqueadoras registradas acima, e a rodada corretiva W3-A está integralmente encerrada. A próxima etapa de produto ainda não foi iniciada.

## Project source refresh

Use esta tabela para atualizar as fontes documentais de um ChatGPT Project. “Replace” significa substituir a versão antiga pela versão atual do repositório; nenhum item deve ser removido.

| Nome antigo da fonte | Caminho atual no repositório | Ação | Justificativa |
|---|---|---|---|
| `00_LEIA-ME.md` | `docs/00_LEIA-ME.md` | replace | entrada e estado atual da W3-A |
| `STATUS.md` | `docs/STATUS.md` | replace | R6 aprovada com ressalvas e W3-A encerrada |
| `ROADMAP.md` | `docs/ROADMAP.md` | replace | rodada corretiva encerrada; próxima etapa de produto não iniciada |
| `W3_A_CORRECTION_LOG.md` | `docs/W3_A_CORRECTION_LOG.md` | replace | histórico integral até a aprovação humana e o encerramento |
| `ARCHITECTURE.md` | `docs/ARCHITECTURE.md` | replace | autoridades R1–R3 e lacuna transversal |
| `WORLD_MODEL.md` | `docs/WORLD_MODEL.md` | replace | intervalos, vértices, porta e distinção lógica/visual |
| `DECISIONS.md` | `docs/DECISIONS.md` | replace | D-NEW-16 e alinhamento assinado por topologia |
| `TEST_PLAN.md` | `docs/TEST_PLAN.md` | replace | evidência humana de R6 e ressalvas não bloqueadoras |
| `ACCESSIBILITY.md` | `docs/ACCESSIBILITY.md` | replace | pendências mobile/Back preservadas |
| `UX_FLOWS.md` | `docs/UX_FLOWS.md` | replace | histórico de fluxo preservado; sem mudança neste encerramento |
| `ART_DIRECTION.md` | `docs/ART_DIRECTION.md` | replace | cantos promovidos e lacuna transversal |
| `ASSET_SPEC.md` | `docs/ASSET_SPEC.md` | replace | contrato production e insuficiência longitudinal |
| `ASSET_REGISTRY.md` | `docs/ASSET_REGISTRY.md` | replace | estado real da promoção e gate visual |
| `RISK_REGISTER.md` | `docs/RISK_REGISTER.md` | replace | falsos positivos e offsets particulares |
| `MAINTENANCE.md` | `docs/MAINTENANCE.md` | replace | papéis e validadores oficiais |
| `CHANGELOG.md` | `CHANGELOG.md` | replace | entregas técnicas e falha conhecida em Unreleased |
| `MANIFEST.md` | `MANIFEST.md` | replace | índice e estágio operacional atual |
| `W3_A_CORRECTION_HANDOFF.md` | `docs/W3_A_CORRECTION_HANDOFF.md` | add | resumo final da rodada corretiva encerrada |
| `AGENTS.md` | `AGENTS.md` | keep | regras de contribuição continuam vigentes |
| `EXECUTION_PLAN.md` | `docs/EXECUTION_PLAN.md` | keep | plano histórico, sem link quebrado |
| `VISION.md` | `docs/VISION.md` | keep | direção duradoura sem alteração nesta rodada |
| `PRODUCT.md` | `docs/PRODUCT.md` | keep | produto fora do escopo documental corretivo |
| `AUDIO.md` | `docs/AUDIO.md` | keep | sem mudança de áudio |
| `PERFORMANCE.md` | `docs/PERFORMANCE.md` | keep | sem nova medição |
| `ANDROID_RELEASE.md` | `docs/ANDROID_RELEASE.md` | keep | pipeline inalterado; APK do gate foi inspecionado fisicamente em R6 |
| — | — | remove: none | nenhuma fonte deve ser removida |
