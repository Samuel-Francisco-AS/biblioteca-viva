# BF-4B — Entrega local para auditoria

Data: 2026-11-01. Escopo: ambiente integrado dos cinco cômodos, sob ADR-012. Não encerra BF-4 nem aprova estética, TalkBack ou Moto G06.

## Git e autorização

Checkout inicial: `main`, limpo, HEAD `a25bcbb4e26d5fefa3a10dc469dc1ccced49a5be`, sem commits locais não publicados. `git fetch --prune origin` encontrou o merge BF-4A esperado. `git pull --ff-only origin main` avançou para `92b78f9d8e67dfbf232878d0bc2ef7d118d64bbf`, igual a `origin/main`; BF-4A e ADR-012 presentes. Não houve commits remotos posteriores nesse fetch. Implementação autorizada pelo pedido BF-4B; nenhum commit, push, branch adicional, stash ou descarte de trabalho preexistente.

## Entrega e arquivos

- `src/features/library/three/proceduralLibraryBuilding.ts`: assoalhos com juntas alternadas, embasamentos, bordas, painéis, rodapés, pilastras, coroamentos e marcos de passagem em todos os cinco cômodos; agrupamento dos detalhes repetidos por material.
- `src/features/library/three/libraryBuildingMaterials.ts` (novo): paleta de oito materiais Lambert, madeira, pedra, pergaminho, latão, bordô e verde; ownership exclusivamente por edifício.
- `src/features/library/three/ThreeWorldRuntime.ts`: ajusta cores das duas luzes somente no caminho composto funcional; mesma montagem, seleção e descarte.
- `src/features/library/three/referenceScene.ts`: descarte explícito de `InstancedMesh`, preservando deduplicação dos recursos intrárvore.
- `src/features/library/libraryRecordLayout.test.ts`: inspeciona cada instância geométrica real, todas as peças estruturais, colisões com BF-2/BF-3, passagens, enquadramento e descarte dos batches/materiais.
- `e2e/r4-shell.spec.ts`: mantém a grade de busca e eventos de picking, mas os executa em uma única chamada ao navegador para evitar centenas de viagens pelo protocolo antes da seleção real. Mesmas assertivas, sem skip, retry ou timeout ampliado.
- `e2e/bf4-environment.spec.ts` (novo): seis tipos fictícios no runtime real, seleção React, zoom, pan, orientação e capturas.
- `CHANGELOG.md`, `docs/STATUS.md`, `docs/ROADMAP.md`, `docs/README.md`, `docs/WORLD.md`, `docs/PERFORMANCE.md`, `docs/TESTING.md`, `docs/BF-4_PLANO_CONTRATO.md` e este relatório: presente, contrato implementado, evidências e pendências. Nenhum arquivo removido.

## Decisões e limites

A planta e as quatro conexões permanecem iguais. O embasamento avança apenas 0,16 m além de cada piso. Paredes baixas preservam a leitura ortográfica; marcos não têm lintéis que encubram os caminhos. Os testes verificam faixa livre de 1,4 m nas quatro passagens até 2 m de altura. Tábuas ficam abaixo do plano Y=0 dos registros. O acabamento tem variações por posição, sem categoria permanente de cômodo.

A câmera F3, limites e zoom inicial 0,7 foram mantidos após projeção dos bounds reais e inspeção de capturas. Retrato mostra o conjunto inteiro em escala pequena; zoom continua necessário para detalhes. Não há mobiliário extensivo, habitantes, novas ações ambientais, persistência espacial, schema, backup, dependência ou asset externo.

Hemisférica quente com preenchimento verde acinzentado e direcional quente reutilizam as duas fontes existentes. Sem sombras, texturas ou pós-processamento. A arquitetura usa Lambert difuso, escolhido após os timeouts do gate com materiais Standard; latão é expresso por cor e relevo, sem reflexo especular físico. Estantes e registros preservam seus materiais. Instâncias por material reduzem chamadas com ownership local; descarte libera buffers de instâncias, geometrias e materiais. F5 conserva seu conteúdo e iluminação próprios.

## Verificação

- PASS: gate inicial dirigido, 4 arquivos/79 testes de runtime, interação, câmera e layout.
- PASS final: suíte integral, **78 arquivos/636 testes**. Gates dirigidos também aprovaram layout/enquadramento/disposal, incluindo 2 arquivos/7 testes de geometria e `referenceScene`.
- PASS: build web, relatório estático, áudio, sync Capacitor e `android:build:debug` (`assembleDebug`, 184 tarefas). Avisos conhecidos: chunks >500 kB e `flatDir` Gradle.
- PASS final: `format:check`, lint, typecheck e `git diff --check`. Guards explícitos corrigiram os apontamentos intermediários de `any` implícito nas classes Three; nenhuma supressão foi adotada.

### Investigação E2E / issue #4

A primeira suíte apresentou 15 PASS/4 FAIL por timeout em `r4-shell` (desktop, mobile, orientação e dez ciclos). Os traces dos três primeiros encerraram a busca do ponto clicável após aproximadamente 121–162 eventos sintéticos, antes de completar a grade. O runtime continuava `running`; nenhuma exceção de aplicação foi identificada nesses traces.

Para comparar, `git archive HEAD` criou uma cópia temporária isolada de `92b78f9`, sem mudar o checkout nem criar branch; nela, desktop/mobile/orientação passaram em 28,7/19,2/16,1 s. Portanto, as falhas locais **não foram simplesmente atribuídas à issue preexistente**. Após agrupamento integral das paredes, execução sem compilação concorrente aprovou três de quatro casos, mas desktop ainda falhou. Com materiais Lambert e gate integral, passaram 18/19, ainda com timeout desktop (33,8 s). Isso não demonstra causalidade exclusiva de material/GPU, e a troca de material não resolveu sozinha a busca.

A busca `visibleShelfPoint` fazia duas chamadas `dispatchEvent` e uma `getAttribute` para cada um de até 289 pontos. A correção mantém grade, coordenadas, IDs de pointer, eventos DOM, raycast real e limpeza de seleção, executando a busca em uma chamada `canvas.evaluate`. Ela continua falhando se nenhuma estante for encontrada; o clique real do mouse e todas as assertivas de pan/zoom/React dos cenários permanecem fora da busca e inalterados. Não altera produção ou limites dos testes. **Execução final: 19/19 E2E PASS (1,3 min)**, sem retries; desktop 6,7 s, mobile 3,8 s, orientação 3,0 s e dez ciclos 12,9 s. Essa comparação sustenta a remediação do custo da busca no harness, não um benchmark da Biblioteca. A issue remota #4 não foi fechada nem sua causa histórica declarada resolvida.

## Custos observados

Chromium headless local, Vite/preview, viewport 1280×900, DPR 1, canvas 760×468, coleção vazia e três estantes, sem seleção: a primeira implementação em caixas individuais emitiu 458 draw calls. Depois de agrupar detalhes e paredes: **47 meshes, 47 draw calls, 32 geometrias e 5.496 triângulos**. O agrupamento inicial somente dos detalhes havia produzido 74 calls. Contagem de meshes inclui cada `InstancedMesh` como uma mesh; triângulos incluem suas instâncias. Nenhuma referência de textura material; o renderer reportou um recurso de textura interno. Redução de 411 calls dentro da implementação, sem reduzir sua geometria.

Comparação adicional com build limpo do HEAD `92b78f9` em cópia temporária, mesma viewport/coleção vazia: **67 meshes/calls, 52 geometrias, 804 triângulos**. A entrega final reduz 20 meshes/calls e 20 geometrias, adicionando 4.692 triângulos nesse recorte. A medição anterior de 458 calls pertence à versão intermediária desta implementação, não ao baseline remoto.

Amostras locais curtas não são benchmark físico, nem garantia de fluidez. `performance:report`: 638.489 bytes iniciais e chunk dinâmico Three de 663.215 bytes. Não há medição de RAM/GPU/temperatura Android, FPS sustentado ou aprovação de desempenho do novo ambiente.

## Inspeção e APK

Execute `npm run dev`, abra a rota `/` e use registros fictícios em um perfil separado para auditoria. Inspecione visão geral dos cinco cômodos, quatro passagens, zoom/pan, seleção por canvas e React, orientação e retorno de background. A superfície convencional continua disponível sem WebGL.

`npm run test:e2e -- e2e/bf4-environment.spec.ts` reproduz capturas de paisagem, retrato e exploração com seleção em `test-results/bf4-environment-*/`. As capturas da execução final desta entrega estão em `test-results/bf4-reviewed/bf4-environment-*/`. O contexto Playwright usa dados fictícios descartáveis; as capturas não incluem dados pessoais.

APK local: `android/app/build/outputs/apk/debug/app-debug.apk`.
SHA-256: `5a7ea24a8f431921bd56150cdc722ef990753328861cd8e8461055ffacd2e925`.
Não houve instalação ou execução física. O gate humano deve usar este build ou outro comprovadamente representativo da revisão aprovada.

## Prontidão

Implementação integrada candidata à auditoria independente: gates técnicos finais aprovados, sem regressão bloqueante identificada nesta execução. A aprovação estética não é presumida. Permanecem avaliação visual humana dos cinco cômodos, legibilidade/oclusões em densidade representativa, medição dirigida Moto G06 e TalkBack obrigatório antes do primeiro recorte real/beta. BF-4C–G continuam futuras. A dívida E2E issue #4 não é encerrada por esta entrega.

Estado Git final: `main`, HEAD e `origin/main` continuam em `92b78f9d8e67dfbf232878d0bc2ef7d118d64bbf`, sem divergência de commits. Há 13 arquivos rastreados modificados e três novos para revisão; nenhum removido. Builds, capturas e traces são locais/ignorados. Nenhum commit ou push realizado.
