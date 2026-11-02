# BF-4C — Ampliação, mobília e decoração

2026-11-02. **Implementação candidata à auditoria independente da Luna e aos gates humanos; BF-4C não encerrada.** Escopo C1 e C2 autorizado expressamente nesta execução. Sem merge na main.

## Checkout e publicação

Estado inicial limpo em `feat/bf-4b-environment`, HEAD `153dd6a`, sem commits locais à frente do upstream então conhecido. Fetch atualizou a referência BF-4B para `9b5414f` e main para `8e39a63ae06d043f04884a62d1fae3bcb05ff407`. Switch main e pull ff-only concluíram antes de qualquer alteração; HEAD e origin/main conferidos iguais ao merge BF-4B conhecido. Não havia commits posteriores na main remota. Contrato BF-4 e fechamento BF-4B presentes. Nenhum stash, reset ou descarte.

A branch `feat/bf-4c-expanded-furnishing` não existia localmente nem remotamente e foi criada após a sincronização. Commit/push autorizados apenas nela. URL de auditoria: https://github.com/Samuel-Francisco-AS/biblioteca-viva/tree/feat/bf-4c-expanded-furnishing. O SHA publicado é informado na entrega, evitando autorreferência impossível no próprio commit.

## Planta: medidas em metros

| Cômodo | Antes L × P | Depois L × P | Fator por eixo | Área anterior → nova | Crescimento |
| --- | --- | --- | --- | --- | --- |
| room-a, salão | 10 × 9 | 19 × 17,1 | 1,9 × 1,9 | 90 → 324,9 m² | +261% |
| room-b | 4,8 × 6,3 | 7,68 × 10,08 | 1,6 × 1,6 | 30,24 → 77,4144 m² | +156% |
| room-c | 4,8 × 6,3 | 7,68 × 10,08 | 1,6 × 1,6 | 30,24 → 77,4144 m² | +156% |
| room-d | 4,8 × 6,3 | 7,68 × 10,08 | 1,6 × 1,6 | 30,24 → 77,4144 m² | +156% |
| room-e | 4,8 × 6,3 | 7,68 × 10,08 | 1,6 × 1,6 | 30,24 → 77,4144 m² | +156% |

Área dos cômodos: 210,96 → 634,5576 m², sem contar conexões. Os fatores intermediários aprovados dão mais área ao núcleo mantendo a silhueta de quatro alas. Não se multiplicam alturas, livros, estantes nem registros. Paredes continuam com 0,85 m; acabamentos e degraus de relevo preservam separação entre faces.

Quatro pontes passam de 0,8 × 1,8 para 1,2 × 2,6 m. Centros `(±5,4; ±2,7)` tornam-se `(±10,1; ±4,8)` em X/Z. Paredes, aberturas e marcos usam as mesmas constantes. A regressão verifica faixa livre de 2,2 m até 2 m de altura.

As três estantes BF-2 permanecem em `[-3,0,-2]`, `[0,0,-2]`, `[3,0,-2.1]`, com 70 slots e dimensões originais. Os 13 slots BF-3 são transladados para a metade externa das alas: `x += sign(x)*6,3`, `z += sign(z)*3,5`. Identidades, ordem, overflow e seis tipos são preservados; a antiga sobreposição projetada série/estante deixa de ocorrer no teste dirigido.

## Mobília e arte

18 conjuntos declarativos, todos ambientais, sem entryId ou seleção convencional:

| Cômodo | Composição |
| --- | --- |
| room-a | Duas mesas de leitura, oito cadeiras, dois tapetes de estudo, conjunto de duas poltronas com tapete/mesa de apoio/luminária, armário baixo com livros decorativos/luminária e duas plantas |
| room-b | Duas poltronas, mesa de apoio, tapete, luminária, armário baixo com livros decorativos/luminária e planta |
| room-c | Mesa de estudo com quatro cadeiras, livros abertos estilizados, luminária e tapete; banco estofado e planta |
| room-d | Mesa de estudo com quatro cadeiras, livros abertos estilizados, luminária e tapete; banco estofado e planta |
| room-e | Duas poltronas, mesa de apoio, tapete e luminária; armário baixo com livros decorativos/luminária e planta |

Madeira escura, carvalho, latão, pergaminho, bordô e verde profundo mantêm unidade. Assentos têm pernas, almofadas, encostos inclinados e braços; luminárias têm haste, base e cúpula; vasos afunilados recebem folhagem volumétrica. Conjuntos de C/D são semelhantes com orientação/posição na planta; B/E usam outra atividade implícita. Cômodos continuam neutros, sem categoria reservada. As áreas livres entre ilhas e o núcleo central são deliberadas para circulação futura. Box3 não equivale a navmesh nem comprova todas as atividades de personagens ainda inexistentes.

## Arquitetura e ownership

Integração permanece `React → WorldHost → ThreeWorldRuntime → Three.js`. Mobiliário é filho do edifício e participa de seu owner/rollback/descarte existente; não cria outro RAF ou serviço. Cinco geometrias e sete materiais usados por mobiliário são compartilhados apenas na montagem. Batches por geometria/material totalizam 13 InstancedMesh adicionais. Recursos não usados da paleta são liberados na fábrica; disposal terminal deduplica recursos e libera buffers de instâncias. Nenhum asset externo, dependência, schema, backup ou persistência espacial foi acrescentado.

CameraNavigation recebe opcionalmente os pisos do mundo composto. O algoritmo F3 de patch projetado é aplicado a cada piso e escolhe a região válida mais próxima: existe piso real visível, sem considerar vazio entre alas como superfície. Frustum, zoom e perspectiva não são reduzidos para encaixar a construção. F5 e caminho legado conservam os parâmetros técnicos anteriores. Não foram implementados agentes, animações, diálogos, navmesh, rotas ou pontos de parada.

## Verificação e evidências

Resultados técnicos locais consolidados; não são PASS humano nem CI remota. A rodada inicial encontrou duas expectativas obsoletas: igualdade estrita `0/-0` e seleção da estante na antiga sobreposição com série. Corrigidas para tolerância numérica e seleção direta real da série. Lint inicial encontrou inferência `any` das classes Three; corrigida com guards tipados, sem supressão.

- PASS: suíte integral, 79 arquivos / 638 testes, incluindo lifecycle/falhas/seleção/F5.
- PASS: build web, áudio e relatório estático; Android sync e assembleDebug (184 tarefas, 53 s). Não houve instalação ou execução física.
- PASS: format:check, lint, typecheck e git diff --check.
- PASS: regressão final dirigida de câmera/layout/mobília, 3 arquivos / 30 testes, seguida de 4 testes de layout após fortalecer a prova de pan até o centro de cada cômodo.
- PASS final: E2E integral, **19/19 em 1,9 min**, zero retries locais. A primeira rodada teve **17 PASS / 2 FAIL por timeout de 30 s** em interação desktop e dez ciclos de rota, concorrendo com Gradle e verificações. Na repetição sem builds concorrentes, os mesmos testes passaram em 13,4 s e 26,4 s, sem alteração de seu código, timeout ou retries. Contenção é hipótese compatível, não causa comprovada; issue #4 continua aberta. Não há regressão técnica bloqueante reproduzida no gate final.

Capturas E2E geradas em `test-results/bf4-environment-*/`: `ambiente-1280.png`, `ambiente-390.png`, `exploracao-selecao.png`; a execução final também anexa métricas JSON. Capturas e logs não são versionados. Inspeção automatizada da captura integrada confirmou móveis reconhecíveis e construção ampliada excedendo o viewport; não equivale a aprovação estética humana.

Para reproduzir: `npm run build`, `npm run test:e2e -- e2e/bf4-environment.spec.ts`; ou `npm run dev` em perfil de navegador de teste, usando apenas registros fictícios. Explore os cinco cômodos com pan/zoom; confira seleção por canvas e React em cada ala, aproximação dos assentos e estantes, retrato/paisagem e retorno de background. Para gate físico, gere `npm run android:build:debug` e instale o APK debug no Moto G06 pelo procedimento habitual do usuário.

## Desempenho e limites

Amostra Chromium headless local, DPR 1, viewport 1280×900, coleção vazia, três estantes, sem highlight:

| Métrica | BF-4B | BF-4C |
| --- | --- | --- |
| Meshes / draw calls no frame observado | 47 / 47 | 60 / 60 |
| Geometrias | 32 | 37 |
| Triângulos | 5.496 | 22.584 |
| Materiais únicos da composição | não registrados | 21 |
| Texturas referenciadas por materiais | 0 | 0 |
| Recurso de textura interno reportado | 1 | 1 |

Build final: 638.489 bytes iniciais (igual à BF-4B) e chunk dinâmico Three de 669.201 bytes (BF-4B: 663.215; +5.986 bytes). Aviso conhecido de chunks >500 kB preservado.

Contagem estrutural independente confirmou 60 meshes, 37 geometrias, 21 materiais e 22.584 triângulos. Meshes contam batches; triângulos incluem instâncias. Não há sombras/texturas/pós-processamento novos. O aumento inclui pisos e acabamentos maiores e a mobília completa. Custo físico precisa ser medido; FPS da execução concorrente com testes/builds em software renderer não é benchmark comparável.

R-19 não foi investigada nem considerada resolvida; capturas estáticas não provam ausência de tremulação em movimento. TalkBack, ergonomia tátil, oclusão em todas as posições, desempenho sustentado/temperatura/memória e aprovação visual/física definitiva permanecem pendentes. A issue #4 não é encerrada por um gate local.

## Arquivos

Criados: `libraryFurnishingLayout.ts`, `proceduralLibraryFurnishing.ts`, `libraryFurnishing.test.ts` em `src/features/library/three/`, e este relatório.

Modificados: `libraryBuildingGeometry.ts`, `libraryRecordLayout.ts`, `libraryRecordLayout.test.ts`; `three/CameraNavigation.ts`, `three/cameraMath.ts`, `three/ThreeWorldRuntime.ts`, `three/ThreeWorldRuntime.d1.test.ts`, `three/proceduralLibraryBuilding.ts`; `e2e/bf4-environment.spec.ts`; `CHANGELOG.md`, `docs/README.md`, `STATUS.md`, `ROADMAP.md`, `WORLD.md`, `BF-4_PLANO_CONTRATO.md`, `PERFORMANCE.md`, `TESTING.md`, `RISKS.md`. Nenhum arquivo removido. Nenhum APK/build/captura/log/credencial incluído no commit.
