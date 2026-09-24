# Roadmap

> Atualizado em 2026-09-24.

## Baseline concluído

- Aplicativo convencional funcional, local-first, com Dexie v8 e backup v6 somente para dados convencionais.
- Mundo anterior, Phaser e contratos espaciais legados removidos pelo WORLD RESET.
- **F0 — Definição da Fundação concluída.**
- **F1 — Three.js Foundation Spike concluída:** Three.js aprovado como renderer da Fundação com host React próprio, `WebGLRenderer`, `OrthographicCamera`, GLTF/GLB, interação bidirecional, lifecycle explícito e prova física no Moto G06.
- A cena vigente continua técnica e descartável; P3D-A formalizou o contrato e P3D-B1 registrou a proveniência do candidato `bookshelf`, mas a Biblioteca final, fonte canônica normalizada, assets produtivos e persistência espacial ainda não existem.

## Biblioteca Funcional Primeiro

```text
BF-0 ✅ replanejamento e decisão arquitetural
BF-1 ✅ camada mínima de conteúdo procedural — encerramento técnico
  BF-1A ✅ contrato mínimo e primeira fábrica procedural
  BF-1B ✅ composição declarativa e posicionamento determinístico
  BF-1C ✅ integração estática com runtime e seleção
  BF-1C-FIX ✅ correção geométrica e variantes — gate visual humano no navegador PASS
  BF-1D ✅ substituição, descarte e gate integrado
BF-2 ✅ primeira área de leitura integrada a registros reais
  BF-2A ✅ contrato e projeção neutra dos livros reais
  BF-2B ✅ livro procedural e layout determinístico
  BF-2C ✅ integração com runtime e seleção
  BF-2D ✅ ponte React/aplicação e fluxo funcional
  BF-2E ✅ gate técnico e validação física dirigida positiva
BF-3 ⏳ contrato, projeção, C e D concluídos; E/F pendentes
  BF-3A ✅ contrato e fronteiras — documental
  BF-3B ✅ projeção neutra dos cinco tipos restantes — contratos e testes puros
  BF-3C ✅ representação procedural e layout isolados — concluída no escopo aprovado
    BF-3C1 ✅ auditoria curta, contrato e cinco fábricas procedurais
    BF-3C2 ✅ layout determinístico, bounds e overflow — CONCLUÍDA TECNICAMENTE
    BF-3C3 ✅ hipótese 3 PASS visual humano e técnico; prévia removida
  BF-3D ✅ runtime e seleção — PASS TÉCNICO LOCAL
    BF-3D1 ✅ montagem e ownership — PASS TÉCNICO DIRIGIDO
    BF-3D2 ✅ catálogo, picking e seleção — PASS TÉCNICO LOCAL
    BF-3D3 ✅ robustez, regressão e fechamento — PASS TÉCNICO LOCAL
  BF-3E ⏳ ponte React/aplicação e fluxo funcional
    BF-3E1 ✅ consulta agregada e ponte React → runtime
    BF-3E2 ✅ interface funcional dos seis tipos — implementação local
    BF-3E3 ⏳ gate consolidado da E
  BF-3F ⏳ gate integrado, validação física dirigida e fechamento
BF-4 ⏳ ambiente habitável, mobília e personagens provisórios
BF-5 ⏳ consolidação do marco funcional
```

O caminho BF usa conteúdo procedural/provisório em TypeScript/Three.js e mantém React como superfície semântica das funções essenciais. A identidade lógica separa tipo de modelo, instância do mundo e ID de registro convencional associado quando houver; a representação visual poderá ser procedural agora e GLB definitivo depois, sem alterar essa identidade. Não há persistência espacial produtiva, tabela nova ou mudança de backup neste plano.

### BF-0 — Replanejamento — concluída

ADR-011 está aceita e estabeleceu a prioridade funcional, preservando P3D-B1 e adiando P3D-B2–F.

### BF-1 — Camada mínima de conteúdo procedural

#### BF-1A — Contrato mínimo e primeira fábrica — concluída

Definiu a identidade lógica mínima e implementou uma fábrica procedural isolada de `bookshelf`, com testes dirigidos de geometria, transforms, isolamento e recursos. A fábrica não está integrada ao runtime, seleção ou composição; a documentação desta decomposição foi atualizada.

#### BF-1B — Composição do conteúdo — concluída

Definiu instâncias declarativas, posicionamento determinístico e uma pequena composição de três estantes procedurais, separando definições de conteúdo da criação de objetos Three.js. A composição valida `instanceId` duplicado antes de criar recursos, mantém a root local da fábrica em identidade, aplica layout em wrapper de instância e cobre determinismo, isolamento e descarte; ela ainda não está integrada ao runtime ou à seleção.

#### BF-1C — Integração com runtime e seleção — concluída tecnicamente

Integra estaticamente a composição BF-1B somente na experiência normal, distinguida da diagnóstica pela ausência de `performanceScenario`. As três instâncias preservam `instanceId`, posição e root local; entram no catálogo de `WorldRuntime` já em `mount()` como `reading-shelf-01`–`03`, com rótulos distintos, roots selecionáveis por wrapper e destaque/picking existentes. Em sobreposição com um proxy F1, a interseção procedural recebe prioridade para que a estante continue selecionável; fora dela, a regra técnica existente permanece. Os controles React, anúncio acessível, foco, teclado e fallback continuam sendo o caminho semântico complementar ao canvas. A montagem possui a root da composição e a libera por `disposeObjectTree()` em descarte terminal ou falha; novas montagens usam recursos independentes. F5 não recebe a composição, nem tem seus counts, catálogo, payload ou resultados alterados. Foram acrescentadas somente as validações de `instanceId` vazio e coordenadas não finitas. A fixture F1 permanece visível; a oclusão projetada anterior foi tratada pela BF-1C-FIX e seu gate humano PASS; BF-1D fecha a troca de representação sem reforma de layout.

#### BF-1C-FIX — Correção geométrica e apresentação — concluída, gate visual humano aprovado

Sem reescrever a BF-1C versionada em `34015b6`, corrige a fábrica após a inspeção humana identificar linhas, massa visual pouco legível e variação aparente por enquadramento. A causa comprovada foi a coincidência da face frontal do fundo com as prateleiras e interseções internas; a inspeção de código não encontrou mudança de câmera/projeção/viewport pela rolagem. A nova família evita essas sobreposições, cria três variantes moderadas e determinísticas e desloca somente a variante larga para `[3, 0, -2.1]` após demonstrar a colisão com banco F1. A seleção, lifecycle, fallback e F5 permanecem preservados. Após `493c887`, o usuário aprovou no navegador as três estantes, as variantes e a leitura das prateleiras, sem as deformidades, linhas ou perdas de definição reportadas; este PASS não aprova TalkBack, Android físico nem arte final.

#### BF-1D — Substituição, descarte e gate — concluída tecnicamente

Implementou uma operação síncrona e estreita da composição para trocar uma instância `bookshelf` existente por outra variante procedural. `reading-shelf-02: reading-dark-tall → reading-balanced` preserva `modelTypeId`, `instanceId`, `entryId` quando houver, posição e o wrapper selecionável; a representação nova é preparada e anexada antes de a antiga ser liberada uma única vez. Pedir a variante já ativa retorna inerte; `instanceId`/variante inválidos ou falha de preparação/attach preservam a representação anterior. A montagem terminal libera somente as roots ainda possuídas. Se a estante selecionada troca, o helper anterior é descartado e o novo acompanha os bounds atualizados sem reconstruir catálogo, ID ou seleção React. F5 permanece sem composição e responde explicitamente que a operação está indisponível. Passaram testes de fábrica/composição/runtime/interação/host/fronteiras, format, lint, typecheck, 546 testes Vitest, build e 6 E2E da rota Biblioteca. Não houve API nova em `WorldRuntime`, controle React, GLB, cache, persistência espacial ou remoção pública de estantes. BF-1 está encerrada somente no plano técnico desta camada; a dívida TalkBack ainda impede declarar fechado o primeiro recorte real.

### BF-2 — Primeira área de leitura funcional

Integrará registros reais de livros ao mundo, mantendo os casos de uso existentes e a operação essencial pela interface React.

#### BF-2A — Contrato e projeção dos livros reais — concluída

Criou a projeção neutra `BookEntry → ReadingAreaBook` para ocorrências futuras `book-volume` da área de leitura. Ela preserva `entryId`, deriva `instanceId` estável como `reading-book:${entryId}`, ordena deterministicamente por `createdAt` e `id`, inclui título, autor opcional e progresso de leitura disponível, e rejeita `entryId` duplicado. A projeção permanece sem integração com `ThreeWorldRuntime`, seleção, carregamento na rota Biblioteca, persistência espacial ou outra categoria de registro.

#### BF-2B — Livro procedural e layout determinístico — concluída

Criou a representação procedural isolada `book-volume` e o contrato determinístico de slots das três estantes existentes. A fábrica exige `entryId` por um contrato mais estreito, escolhe entre quatro variantes discretas a partir da identidade estável e mantém recursos próprios por criação. BF-2D-BOOK-VIS-FIX ampliou seus volumes para 0,190–0,225 m de largura, 0,370–0,400 m de altura e 0,320–0,360 m de profundidade, para legibilidade no enquadramento normal sem ultrapassar o envelope físico das estantes. O layout puro consome a ordem recebida, preenche as estantes declaradas, depois níveis internos de baixo para cima e slots da esquerda para a direita; a capacidade inicial deriva de 24 + 25 + 21 = 70 slots e qualquer excedente é devolvido como overflow ordenado. As posições são locais ao wrapper estável da estante, não à root descartável de sua representação BF-1D. Não há attach ao runtime, livro real visível, seleção, React/aplicação, schema, backup ou persistência espacial.

#### BF-2C — Integração com runtime e seleção — concluída tecnicamente

`ReadingAreaBook` agora chega ao `ThreeWorldRuntime` por contrato neutro e snapshot imutável, sem query, `BookEntry`, application, Dexie ou React. Cada livro colocado é wrapper selecionável irmão da representação substituível da estante; o catálogo e `WorldSelection` preservam `entryId`. Slots são regenerados pelas variantes atuais e BF-1D relayouta sem recriar livros ainda visíveis; overflow não tem root ou seleção e pode retornar após aumento de capacidade. A configuração inicial deriva 70 slots (24 + 25 + 21), sem transformar esse número em capacidade universal. F5 ignora o snapshot. Não houve persistência espacial, navegação nem integração da rota; BF-2D permanece responsável por trazer registros reais.

#### BF-2D — Ponte React/aplicação e fluxo funcional — concluída tecnicamente

A Biblioteca consulta `listBookEntries` por um contrato React/aplicação estreito, projeta um snapshot imutável com `projectReadingAreaBooks()` e o entrega ao `WorldHost` na montagem. Loading, indisponibilidade e erro público não se confundem com vazio; o vazio real mantém estantes sem livros e ação convencional para criar livro. A lista React preserva todos os livros e seus links por `entryId`, inclusive overflow; o catálogo neutro do host informa quais livros estão visíveis e permite seleção React → canvas, enquanto a seleção do canvas retorna `entryId` para abrir o registro sem foco forçado. F5 continua sem query ou livros reais e agora ignora inclusive snapshot inválido. Não há sincronização live, schema, backup ou persistência espacial.

#### BF-2E — Gate integrado e fechamento da BF-2 — concluída no escopo acordado

Consolidou regressão integrada com base convencional real: criação, projeção, representação, seleção bidirecional, abertura por `entryId`, edição/retorno, vazio, overflow 70 + 1, fallback e lifecycle. O gate técnico e a validação física dirigida no Moto G06 foram positivos; BF-2E está concluída no escopo acordado e BF-2 no escopo técnico-funcional e físico dirigido. Os volumes procedurais permanecem pequenos no enquadramento geral, mas são selecionáveis e foram aceitos pelo usuário para o escopo funcional atual. A observação humana é qualitativa, sem estabelecer benchmark, FPS, teto de carga ou aprovação da arte definitiva. TalkBack continua obrigatório antes do fechamento do primeiro recorte real e de beta/release aplicável.

### BF-3 — Integração dos seis tipos de registro — D concluída tecnicamente; E/F pendentes

**Estado:** BF-3A/B/C estão concluídas nos escopos aprovados, e BF-3D1/D2/D3 receberam PASS técnico local conjunto. A BF-2 já integra `book` na área de leitura; a D monta e seleciona `movie`, `series`, `study`, `physical_activity` e `work` no runtime composto. BF-3E1 conectou a consulta real e a ponte React → runtime; E2/E3 e o gate BF-3F permanecem pendentes. BF-3 não está concluída. `docs/STATUS.md` permanece a autoridade sobre o presente.

**Resultado funcional pretendido:** cada registro convencional existente pode ser encontrado, identificado pelo seu tipo, selecionado quando houver representação 3D e aberto pelo `entryId`; todos continuam acessíveis por uma superfície React semântica mesmo sem WebGL ou quando não couberem visualmente. Não se exige uma sala definitiva por categoria: composição, formas e capacidade devem ser proporcionais à prova funcional, não uma antecipação da BF-4. O layout provisório deve preservar legibilidade e interação no Moto G06.

**Invariantes comuns e limites:**

- Preservar a identidade lógica da ADR-011: `modelTypeId` (tipo visual), `instanceId` (ocorrência estável e única no mundo) e `entryId` (registro convencional) são distintos. Não derivar identidade de mesh, posição, título ou URL; IDs entre categorias não podem colidir. `book-volume` e a área de leitura BF-2 permanecem válidos.
- Projetar dados convencionais em contratos neutros, imutáveis e determinísticos; domínio/aplicação não conhecem Three.js, e runtime não consulta Dexie nem casos de uso. Na Biblioteca, reutilizar `listLibraryEntries` uma vez por montagem normal, sem quebrar a consulta estreita `listBookEntries` já aprovada fora dessa rota ou prometer sincronização live.
- Procedural leve, geometria e posicionamento isolados, ownership único após attach, disposal idempotente e proteção a callbacks tardios. F5 continua diagnóstico e não recebe snapshots funcionais; não promover fixture F1/F4, GLB de laboratório ou candidato P3D-B1 a asset produtivo.
- Sem `PlacedObject`, `WorldStructureState`, persistência espacial, tabela/schema Dexie, alteração de backup, `AssetManager`, cache, novos loaders, dependências ou refatoração ampla não justificados. Os 70 slots atuais são capacidade derivada **apenas dos livros**, não limite global de BF-3. Sem novas mecânicas ou personagens de BF-4.
- React permanece o caminho convencional de busca/abertura/edição, lista integral e alternativa de seleção. Distinguir vazio real, loading, armazenamento indisponível, erro de consulta, erro WebGL e overflow. Seleção não força foco, não recria o mundo e não inventa objeto 3D para excedentes. TalkBack humano permanece obrigatório para fechar o primeiro recorte real e beta/release aplicável.
- Usar checkpoints pequenos e retomáveis: testes dirigidos durante cada implementação e regressão ampla somente no gate integrado ou em mudança que a justifique. Não declarar benchmark/FPS medido por CI; gatilhos de densidade ou renderização nova exigem medição proporcional no Moto G06.

#### BF-3A — Contrato e fronteiras — concluída documentalmente

O baseline real confirmou que `ListBookEntries` chama `ListLibraryEntries` e filtra `book`. Assim, BF-3E fará uma única chamada a `listLibraryEntries` por montagem normal da Biblioteca e projetará os seis tipos do mesmo resultado; `listBookEntries` e a projeção BF-2 permanecem intactos fora dessa rota. O contrato detalhado vigente está em `WORLD.md`: fixa campos, metadados disponíveis, `modelTypeId` semântico, namespaces de `instanceId`, ordenação `createdAt`/`id`, duplicidade, snapshot imutável, vazio e overflow; reserva uma zona complementar provisória sem coordenadas, capacidades ou salas finais; e fecha a fronteira de runtime, React, lifecycle, WebGL e F5.

Os tipos novos usarão `movie-record`/`library-movie:${entryId}`, `series-record`/`library-series:${entryId}`, `study-record`/`library-study:${entryId}`, `physical-activity-record`/`library-physical-activity:${entryId}` e `work-record`/`library-work:${entryId}`. Esses identificadores não descrevem a geometria provisória. Mídia, caderno, marcador e pasta permanecem hipóteses a inspecionar no navegador em BF-3C, não uma obrigação visual. A reconciliação geral pós-BF-2 de README, mapa, UX e TESTING já foi feita em `0430b2a`; como BF-3A não alterou comportamento vigente, ela não a repetiu.

**Gate A: PASS documental.** Contrato conferido contra ADR-011, BF-2, tipos e testes existentes; limites, riscos e ponto de retomada atualizados. Nenhum runtime, código, teste, asset, schema, dependência ou APK foi alterado.

#### BF-3B — Projeção neutra dos cinco tipos restantes — concluída

Implementou e testou a projeção renderer-independent `projectLibraryWorldEntries()` a partir de `LibraryEntry[]`. O snapshot imutável contém as seis categorias na ordem de `ENTRY_TYPES`: reutiliza integralmente `projectReadingAreaBooks()` para `book`, sem acrescentar `type` ou `createdAt`, e projeta os cinco tipos restantes com seus discriminantes, metadados mínimos, `modelTypeId` e `instanceId` semânticos. A projeção ordena por `createdAt`/`id`, rejeita `entryId` duplicado antes de publicar e verifica unicidade de `instanceId`, sem mutar a entrada. Não houve geometria, layout, runtime, React, consulta, dependência ou persistência espacial.

**Gate B: PASS.** Testes puros cobrem os seis tipos, identidade sem colisão, ordenação, opcionais, duplicidade, imutabilidade, determinismo, fronteira arquitetural e regressão da projeção BF-2; não houve representação no runtime.

#### BF-3C — Representação procedural e layout isolados — decomposição em três checkpoints

**Estado:** BF-3C1/C2/C3 e BF-3C concluídas no escopo procedural provisório. A hipótese 1 recebeu FAIL visual por escala/reconhecibilidade; a hipótese 2 melhorou os objetos mas recebeu FAIL na planta. A hipótese 3 recebeu PASS humano explícito, com ressalva de que a planta não reproduz fielmente a referência 2D e não é definitiva. O gate técnico consolidou construção, layout, geometria real e descarte; BF-3D1 integrou a montagem runtime e passou no gate técnico dirigido. BF-3D2 recebeu PASS técnico local.

##### BF-3C1 — Contrato breve e cinco representações procedurais

Concluiu a auditoria dirigida da composição vigente — estantes e livros no plano local `Y=0`, piso técnico de 14 × 10 m, proxies já ocupados e câmera ortográfica/2.5D — sem alterar essa cena. Criou raízes isoladas para `movie-record`, `series-record`, `study-record`, `physical-activity-record` e `work-record`, usando os identificadores estreitos da projeção BF-3B. As formas são, respectivamente, painel audiovisual, três casos de mídia, caderno, marcador de percurso neutro e pasta de trabalho; são hipóteses provisórias, não arte final. Cada chamada cria recursos próprios, mantidos apenas dentro de sua root e liberáveis por `disposeObjectTree()`; não há cache, pooling, coordenada global, capacidade ou slot. Os envelopes reais medidos (largura × altura × profundidade) são 0,720 × 0,480 × 0,240 m, 0,660 × 0,500 × 0,200 m, 0,560 × 0,132 × 0,400 m, 0,460 × 0,590 × 0,400 m e 0,600 × 0,300 × 0,400 m.

**Gate C1: PASS técnico.** Testes dirigidos cobrem geometria, dimensões por `Box3`, identidade, raiz local, componentes, distinção filme/série, determinismo estrutural, isolamento de recursos, descarte deduplicado/repetido e entrada inválida antes de anexar recursos. Não houve montagem na cena produtiva, alteração do snapshot BF-3B, runtime, React, Dexie ou integração de consulta.

##### BF-3C2 — Layout determinístico e overflow — concluída tecnicamente

Medir os bounds reais das cinco representações da C1 e derivar a zona complementar provisória e seus slots, sem propor cinco cômodos ou estado espacial persistente. Implementar atribuição pura que consuma as ocorrências na ordem lógica do snapshot BF-3B, preserve `entryId`/`instanceId`, derive a capacidade a partir dos slots efetivos e devolva overflow ordenado, sem criar representação para excedentes. Garantir posições finitas, espaçamento positivo e ausência de interseção positiva com a área de leitura, os livros colocados e os proxies técnicos relevantes; considerar também enquadramento, navegação e selecionabilidade da câmera atual. Os **70 slots de livros** são exclusivos das estantes BF-2 e não integram a capacidade dos novos tipos.

**Gate C2: PASS técnico.** A zona complementar central/frontal, cinco faixas e 37 slots derivados (6 filme, 7 série, 8 estudo, 9 atividade física, 7 trabalho) foram declarados e testados contra bounds reais C1, área de leitura com 70 livros e proxies técnicos modelados. A atribuição é pura, imutável e retorna placement/overflow ordenado sem roots. Ainda não foram anexados tipos ao `ThreeWorldRuntime` ou à rota Biblioteca; C3 é o próximo checkpoint.

##### BF-3C3 — Prévia visual isolada, decisão humana e fechamento — concluída

A primeira hipótese de sala única recebeu FAIL visual por escala e reconhecibilidade; o layout de 37 slots permanece evidência histórica C2. A segunda hipótese melhorou as representações mas recebeu FAIL visual na planta retangular subdividida. A terceira hipótese, com núcleo central, quatro salas periféricas conectadas e cômodos semanticamente neutros, recebeu PASS humano explícito para o escopo procedural provisório nos cenários A/B/C. A planta ainda não reproduz fielmente a referência 2D e não é definitiva. A/B/C mantiveram 5/13/13 placements e 0/0/4 overflow; ausência de picking é esperada até BF-3D.

O fechamento promoveu construção e layout a módulos independentes da prévia, testou roots e Box3 reais contra passagens, paredes, representações, estantes e livros BF-2, e removeu os instrumentos temporários. A capacidade inicial dos cinco tipos deriva dos slots 2/2/3/3/3; os 70 slots de livros permanecem exclusivos. O PASS técnico local cobriu 77 arquivos/616 testes, format:check, lint, typecheck, audio:check e build. Este gate não aprova planta ou arte final, GLB, seleção, movimento, persistência espacial, desempenho Android, TalkBack ou ergonomia física.

#### BF-3D — Runtime, catálogo e seleção — PASS técnico local D1/D2/D3

**Objetivo e fronteira:** consumir `LibraryWorldSnapshot`, `createProceduralLibraryBuilding()`, `LIBRARY_ROOMS`, `INITIAL_LIBRARY_RECORD_SLOTS`, `assignLibraryRecordSlots()` e as cinco fábricas C1 no `ThreeWorldRuntime` normal. O runtime recebe somente dados neutros por montagem, sem consulta ou dependência de domínio/Dexie. Cômodos permanecem semanticamente neutros; distribuição inicial não reserva categorias nem implementa movimentação ou persistência espacial. BF-3E permanece responsável pela única consulta convencional dos seis tipos e pela ponte React; BF-3F, pelo gate físico integrado.

**BF-3D1 — Snapshot, montagem e ownership (PASS TÉCNICO DIRIGIDO; integrada):** adicionar uma entrada opcional `LibraryWorldSnapshot` às dependências de criação do runtime, mantendo o caminho legado `readingAreaBooks` para BF-2. Quando houver snapshot composto, sua categoria `book` alimenta o mecanismo BF-2 existente; não montar livros em duplicidade nem misturar fontes incompatíveis silenciosamente. Montar a construção procedural e os wrappers dos placements dos cinco tipos apenas no caminho normal, com roots locais, ownership único e cleanup terminal/falha. Overflow não cria root. Auditar a convivência do edifício aprovado com `referenceScene`, composição BF-1/BF-2 e enquadramento atual: a prévia C3 não montou os proxies técnicos. Se houver colisão, oclusão ou incompatibilidade material que exija mudar a composição aprovada, registrar bloqueio/correção dirigida sem remodelar F5 ou presumir novo PASS visual. **Gate D1:** testes dirigidos de montagem, posição/identidade, 13 slots iniciais, overflow, F5 ignorando inclusive snapshot inválido, preservação de três estantes/70 livros e ownership/descarte. Não adicionar seleção nova nem modificar `LibraryPage`/`WorldHost`.

**Resultado D1 (2026-09-23):** PR #1 integrado à `main` por squash (`6b613e2`), após duas auditorias independentes e microverificação do Codex. Snapshot neutro opcional, 13 wrappers não selecionáveis, 70 livros BF-2, overflow sem root e F5 isolado; no mundo composto, a construção substitui apenas a geometria técnica F1 sobreposta, com luzes próprias, sem alterar o caminho legado/diagnóstico. Testes verificam identidade (`entryId`, `instanceId`, `modelTypeId`), descarte de geometria/material, rollback parcial, mounts independentes, indicadores consistentes e zoom inicial 0,7 já no primeiro quadro; a última CI do HEAD aprovado na branch passou integralmente, inclusive E2E. **Não há PASS visual integrado:** oclusão/iluminação, exploração ergonômica e bounds F3 derivados do piso técnico permanecem para validação dirigida; Android e TalkBack não foram aprovados. Não declarar BF-3 completa nem avançar escopo para BF-3E.

**BF-3D2 — Catálogo, picking e seleção:** registrar apenas wrappers efetivamente anexados como selecionáveis com `id: instanceId`, `entryId` e rótulo seguro; incorporar `getSelectableObjects()`, `ThreeWorldInteraction`, raycast, `selectObject(id)`, `WorldSelection` e destaque sem duplicar catálogo nem alterar a identidade BF-2. A seleção de um tipo não pode interferir em livros/estantes ou outros tipos. Overflow e falha de representação não são selecionáveis; o caminho React convencional, anunciado/alternativo, continua sob BF-3E. **Gate D2:** testes dirigidos das cinco categorias, seleção por canvas e ID, highlight, prioridade de picking com objetos já existentes, seleção inválida, isolamento BF-1/BF-2 e F5 sem conteúdo BF. Não criar controles React de novos tipos.

**Resultado D2 (2026-09-23):** PASS técnico local para os wrappers anexados. O catálogo único entrega 13 registros BF-3, três estantes e 70 livros no snapshot de teste composto; `WorldSelection` conserva `instanceId`/`entryId`, e o helper de highlight é trocado ou removido nas seleções inválidas e no descarte. Raycast dirigido selecionou representantes das cinco categorias em pontos visíveis, e os testes cobriram overflow, montagens independentes, caminho legado e F5 inválido. O centro projetado de uma série incidiu sobre uma estante: o teste usa parte visível, sem mudança global de prioridade, planta ou câmera. Gate: format:check, lint, typecheck, 78 arquivos/622 testes Vitest, build e 17 E2E passaram. Os E2E exercitam BF-2/rota atual; a ponte React BF-3E ainda não existe. D3 e validações visuais/físicas permanecem pendentes.

**BF-3D3 — Robustez, regressão e fechamento:** testar falhas de preparação/attach, rollback sem wrappers, catálogo ou highlight órfãos, dispose repetido, mounts independentes, WebGL indisponível, seleção obsoleta e proteção dos callbacks tardios já existentes. Não inventar sincronização live, reconciliação de snapshots após montagem ou mecanismo assíncrono para as fábricas síncronas; qualquer callback realmente diferido deve respeitar o owner e descartar resultado stale. Executar testes dirigidos durante correções e regressão consolidada proporcional no gate (BF-1/BF-2/F5, arquitetura, format, lint, typecheck, Vitest, build e E2E aplicáveis), com documentação e riscos reconciliados. **Gate D3/D:** PASS somente com montagem, catálogo, picking, seleção, falha/lifecycle, ownership e F5 demonstrados em conjunto. BF-3E passa a próxima execução ainda não iniciada.

**Resultado D3/D (2026-09-23): PASS técnico local.** D1 comprova snapshot, montagem, ownership, rollback e F5; D2 comprova catálogo, picking, seleção, highlight e a prova posterior de livros/estantes BF-2 por canvas no mundo composto; D3 acrescenta falhas controladas na composição, depois de criar as roots e no attach parcial da interação, além de falha WebGL terminal. O attach parcial revelou um listener remanescente no canvas; o construtor da interação agora limpa o registro parcial antes de propagar a falha. Os testes verificam ausência de canvas, catálogo e highlight utilizáveis após estado terminal, descarte repetido, montagens independentes, IDs obsoletos e callbacks tardios existentes. Gate local: 6 arquivos/85 testes dirigidos, 78 arquivos/626 testes Vitest, format:check, lint, typecheck, audio:check, build, performance:report e 17 E2E, todos verdes. O build mantém aviso convencional de chunks acima de 500 kB; o relatório estático indica 634.053 bytes iniciais e 659.439 bytes no chunk dinâmico Three. Não há PASS visual integrado nem físico: avaliar apresentação, oclusão e bounds F3 sem alterar a planta C3 por precaução. BF-3E é a próxima implementação; BF-3F, Android e TalkBack continuam pendentes.

**Limites de toda a D:** sem `listLibraryEntries`, consulta de registros reais, alterações de schema/backup, persistência ou drag/drop espacial, editor de cômodos, novos GLBs/dependências, redecoração, alteração de fixture F1/F4 ou benchmark/APK Android. Não declarar BF-3 completa, desempenho físico, TalkBack ou planta definitiva. Preservar a decisão visual C3 aprovada para o escopo provisório; se houver alteração material, gate humano dirigido fica pendente até nova aprovação.

#### BF-3E — Ponte React/aplicação e fluxo funcional

**E1 concluída (2026-09-23):** a rota Biblioteca usa uma consulta `listLibraryEntries` por montagem vigente e `projectLibraryWorldEntries` para entregar `LibraryWorldSnapshot` ao `WorldHost` normal. O host usa a entrada composta do runtime existente; preserva a entrada legada BF-2, a precedência diagnóstica F5 e o `runtimeFactory` explícito. Resultado ou erro tardio de outra instância de `application` é descartado. A lista React de livros BF-2 permanece operacional; ainda não há organização React dos outros cinco tipos. E2 implementará essa interface e E3 fará o gate consolidado da E, sem antecipar BF-3F.

**E2 implementada (2026-09-24):** a superfície React apresenta as seis categorias a partir do snapshot E1, conserva livros BF-2 e usa o catálogo publicado pelo host para disponibilizar seleção. Registros fora do catálogo permanecem abríveis; falha 3D não vira overflow. Canvas → React exige par `instanceId`/`entryId` vigente. A rota de detalhe/edição preserva o retorno à Biblioteca. Testes dirigidos React e E2E fictício cobrem seleção, vazio, overflow, fallback e edição/retorno. Auditoria independente e gate E3 permanecem pendentes; F não foi iniciado.

Consultar os seis tipos pelo caminho aprovado em A/B e entregar snapshot neutro ao host normal, respeitando ciclo de vida da instância vigente de `application`. Exibir lista/organização semântica por categoria com todos os registros, inclusive overflow; indicar quais têm representação visual e habilitar seleção no ambiente somente para esses. Integrar canvas → React e React → runtime, abertura convencional pelo `entryId`, edição/retorno e os estados vazio/loading/erro/armazenamento indisponível/falha WebGL. Preservar os recursos da Coleção, Arquivo, Resumo e o fluxo de livros; não prometer atualização live.

**Gate E:** testes React/host e E2E dirigidos com registros fictícios de todos os tipos, seleção bidirecional, overflow, erro, criação/edição/retorno e múltiplas montagens, sem exigir canvas para a operação essencial.

#### BF-3F — Gate integrado, físico dirigido e fechamento

Executar `format:check`, lint, typecheck, Vitest, `audio:check`, build, `performance:report` e E2E; gerar APK debug representativo, se o gate web passar. Validar no Moto G06 o conjunto de seis tipos: leitura de rótulos, toque/seleção, React alternativo, abertura/retorno, pan, pinch, zoom, rotação, background/resume, ergonomia e densidade relevante. Registrar separadamente evidência automatizada, observação humana, limites, regressões e riscos, e reconciliar documentação de acordo com o comportamento efetivamente aprovado. Se houver falha, abrir correção dirigida antes de fechar.

**Gate F:** só declarar BF-3 concluída no escopo técnico-funcional e físico dirigido após os resultados correspondentes; isso **não** encerra por implicação o primeiro recorte real nem aprova TalkBack, arte final, GLB produtivo ou a BF-4. Prosseguir para BF-4 somente após autorização própria.

**Fechamento C3/C:** `libraryBuildingGeometry.ts` e `proceduralLibraryBuilding.ts` preservam os cinco cômodos neutros, núcleo e quatro passagens; `libraryRecordLayout.ts` contém somente a distribuição inicial, 13 slots derivados (2/2/3/3/3), placements e overflow imutáveis. A/B/C foram 5/13/13 placements e 0/0/4 overflow na inspeção aprovada. Testes `Box3` reais cobrem as fábricas, passagens, colisões e convivência com três estantes e 70 livros BF-2; 77 arquivos/616 testes passaram, junto de format:check, lint, typecheck, audio:check e build. A prévia temporária foi removida; a referência PNG 2D permanece documental. Não houve gate físico, assistivo, de ergonomia ou seleção.

**Ponto de retomada BF-3E3:** consolidar regressão técnica da E, incluindo abertura e retorno dos seis tipos, isolamento de montagens e E2E aplicável; registrar separadamente a falha recorrente `p1-memory` se reaparecer, sem atribuição causal automática. Avaliação visual integrada, bounds F3, oclusão, Android físico e TalkBack permanecem para BF-3F. Não redefinir a planta aprovada por iniciativa própria.

### BF-4 — Mundo habitável

Expandirá mobília, organização espacial, objetos e personagens provisórios, com comportamentos definidos conforme necessidade funcional.

### BF-5 — Consolidação funcional

Executará regressão, validação Android, acessibilidade e fechamento do marco funcional aprovado.

O fechamento do primeiro recorte real continua bloqueado pela dívida de TalkBack: a remediação e a validação física incremental no Moto G06 usarão builds representativos então vigentes. Não há budget preventivo; mudanças materiais de densidade ou renderização exigem nova medição conforme a necessidade observada.

## Pipeline 3D v1 — adiado após P3D-B1

```text
P3D-A ✅ contrato produtivo e estrutura
P3D-B1 ✅ proveniência e organização documental de `bookshelf`
P3D-B2 ⏸ ADIADO — fonte canônica editável normalizada
P3D-B3 ⏸ ADIADO — exportação e validação
P3D-B4 ⏸ ADIADO — promoção final
P3D-C ⏸ ADIADO — validação e relatório automatizados
P3D-D ⏸ ADIADO — preparação/exportação reproduzível
P3D-E ⏸ ADIADO — ingestão produtiva, ownership e unload
P3D-F ⏸ ADIADO — gate integrado e fechamento
```

ADR-010 continua regulando assets GLB produtivos. B1 preservou integralmente a proveniência de `bookshelf`: o upstream Quaternius é a fonte de partida, enquanto o `.blend` normalizado da F4 permanece apenas evidência histórica; o fixture F4-B não foi promovido. Os checkpoints adiados não foram concluídos nem cancelados e só retomam quando houver necessidade demonstrada de ingestão ou substituição por assets GLB definitivos.

## FUNDAÇÃO

```text
F0 ✅
F1 ✅
F2 ✅
F3 ✅ CONCLUÍDA
F4 ✅ CONTRATO EXPERIMENTAL DE ASSETS 3D CONCLUÍDO
  F4-A ✅ CONCLUÍDA (preflight técnico + humano)
  F4-B ✅ CONCLUÍDA
  F4-C ✅ CONCLUÍDA
  F4-D ✅ CONCLUÍDA EXPERIMENTALMENTE
    D1 ✅ auditoria e contrato experimental
    D2 ✅ load → attach → unload com host vivo
    D3 ✅ repetição, isolamento e disposal
    D4 ✅ assíncrono, abandono, callbacks tardios e erros
    D5 ✅ regressão, consolidação e fechamento
  F4-E ✅ CONCLUÍDA EXPERIMENTALMENTE
    E1 ✅ baseline de custo
    E2 ✅ diagnóstico e seleção de hipótese
    E3 ✅ experimento selecionado
    E4 ✅ comparação objetiva + gate humano PASS
    E5 ✅ consolidação e fechamento
  F4-F ✅ consolidação final e handoff para F5
F5 ✅ CONCLUÍDA — performance e validação Android física
  F5-A ✅ baseline e cenário de carga
  F5-B ✅ stress físico, loading e limites
  F5-C ✅ consolidação, guardrails iniciais e gate final
F6 ✅ CONCLUÍDA — fechamento técnico/arquitetural
  F6-A ✅ contrato de acessibilidade e auditoria de lacunas
  F6-B ✅ evidência automatizada, regressão técnica e APK candidato
  F6-C ✅ fechamento documental com dívida assistiva aceita; sem PASS humano
FUNDAÇÃO ✅ CONCLUÍDA
P3D-A ✅ contrato produtivo e estrutura
P3D-B1 ✅ proveniência e organização documental de `bookshelf`
P3D-B2–F ⏸ ADIADOS
BF-0 ✅ replanejamento e decisão arquitetural
BF-1A ✅ contrato mínimo e primeira fábrica procedural isolada
BF-1B ✅ composição declarativa e posicionamento determinístico
BF-1C ✅ integração estática com runtime e seleção
BF-1C-FIX ✅ técnico + gate visual humano no navegador PASS
BF-1D ✅ substituição procedural, descarte seletivo e gate integrado
BF-1 ✅ tecnicamente concluída
BF-2 ✅ primeira área de leitura integrada a registros reais
  BF-2A ✅ contrato e projeção neutra dos livros reais
  BF-2B ✅ livro procedural e layout determinístico isolados
  BF-2C ✅ integração com runtime e seleção
  BF-2D ✅ ponte React/aplicação e fluxo funcional
  BF-2E ✅ gate técnico e validação física dirigida positiva
BF-3 ⏳ CONTRATO, PROJEÇÃO, C E D CONCLUÍDOS; E/F PENDENTES
  BF-3A ✅ contrato e fronteiras — CONCLUÍDA DOCUMENTALMENTE
  BF-3B ✅ projeção neutra dos cinco tipos restantes — CONTRATOS E TESTES PUROS
  BF-3C ✅ procedural e layout isolados — CONCLUÍDA NO ESCOPO APROVADO
    BF-3C1 ✅ contrato breve e cinco fábricas — CONCLUÍDA TECNICAMENTE
    BF-3C2 ✅ layout determinístico e overflow — CONCLUÍDA TECNICAMENTE
    BF-3C3 ✅ hipótese 3 PASS humano e técnico; prévia removida
  BF-3D ✅ runtime e seleção — PASS TÉCNICO LOCAL
    BF-3D1 ✅ montagem e ownership — PASS TÉCNICO DIRIGIDO
    BF-3D2 ✅ catálogo, picking e seleção — PASS TÉCNICO LOCAL
    BF-3D3 ✅ robustez, regressão e fechamento — PASS TÉCNICO LOCAL
  BF-3E ⏳ React/aplicação e fluxo funcional
    BF-3E1 ✅ consulta agregada e ponte React → runtime
    BF-3E2 ✅ interface funcional dos seis tipos — implementação local
    BF-3E3 ⏳ gate consolidado da E
  BF-3F ⏳ gate integrado, físico dirigido e fechamento
```

### F2 — Integração e endurecimento da Fundação Three.js — concluída

Integração e endurecimento da Fundação Three.js, consolidando limites React/runtime, lifecycle, recuperação, organização interna e contratos estáveis. F2-B definiu a falha terminal pública e o fallback React; F2-C consolidou ownership da montagem; F2-D1 tornou falhas estruturais de render/resize terminais e impede render incidental durante pausa; F2-D2 definiu `webglcontextlost` como falha terminal e torna restoration tardia inerte; F2-E endureceu viewport/orientation/input contra dimensões transitórias, callbacks tardios e interrupções de Pointer Events, sem calibrar a ergonomia. F2-F executou a regressão consolidada, build web, E2E e Android técnico sem detectar regressão material.

F2 está concluída técnica e fisicamente no escopo da validação curta: a revalidação humana no Moto G06 confirmou lifecycle observável por background/resume, alinhamento React/canvas, seleção/highlight, pan, pinch, toque, controles React e rotação/orientação, sem regressão funcional perceptível. Quedas transitórias de FPS em orientação e em extremos rápidos de zoom recuperaram para aproximadamente 60 FPS, são não bloqueantes e não estabelecem causalidade com a F2. Câmera e interação finais continuam em F3.

### F3 — Câmera e interação mobile — concluída

Refinar câmera ortográfica/2.5D, pan, zoom, pinch, limites, seleção e ergonomia em tela pequena.

#### F3-A — Contrato e baseline da câmera — concluída

Mapeou e testou o baseline real: o runtime possui a instância/ciclo de vida da câmera e a interação possui a navegação por gesto; o frustum da fixture F1 é derivado por matemática pura somente de viewport válido. Não houve mudança de calibração, persistência espacial ou UX observável.

#### F3-B — Modelo de câmera, framing e limites — concluída

Consolidou estado runtime-only único para foco X/Z e zoom, framing determinístico a partir dos bounds técnicos da fixture, clamp dependente de viewport/zoom e resize que preserva a exploração e seleção. Target Y foi fixado porque sua liberdade era deriva incidental do pan no `camera.up`; o GLB tardio não participa do framing.

#### F3-C — Pan, zoom e pinch — concluída

Transformou o modelo F3-B em navegação espacial ancorada: pan resolve a tela no plano X/Z, wheel preserva o ponto sob o cursor e pinch usa razão de distâncias, midpoint e seu deslocamento para pan+zoom. Bounds, lifecycle e seleção foram preservados; não houve calibração física nem alteração da arbitragem tap/gesto.

#### F3-D — Tap, seleção e arbitragem de gestos — concluída

Consolidou uma candidatura de tap monotônica por pointer: até `8` CSS px inclusive permanece tap, ultrapassar o slop consome o primeiro delta e invalida seleção mesmo que o pointer retorne à origem. Segundo pointer/pinch, wheel com pointer ativo, cancelamento, perda de capture, pausa e terminalidade também invalidam; o Raycaster só executa no `pointerup` confirmado e tap vazio limpa seleção. Não houve recalibração de câmera, persistência espacial ou alteração da ponte React ↔ Three.

#### F3-E — Viewport, orientação, safe areas e integração mobile — concluída

Consolidou a autoridade do tamanho no `world-host` observado, sem transportar constantes de header, dock, safe areas ou breakpoints para Three. O layout reutiliza o contrato global de safe areas e a reserva já existente do dock fixo; o canvas se adapta sem overflow horizontal. Resize/orientação preservam a montagem, seleção e exploração lógica salvo clamp necessário, anulam somente o gesto em curso e mantêm picking no bounding rect atual. O gate Chromium cobriu 390×844, 844×390 e 320×640, sem provar a ergonomia ou system bars físicos.

#### F3-F1 — Gate técnico consolidado + APK — concluído

Executou a regressão completa, confirmou os contratos acumulados, gerou build web, APK debug e cobertura E2E integral. Não forneceu evidência de instalação ou uso físico.

#### F3-F2-FIX — Correção dos limites diagonais — concluída tecnicamente

O gate físico encontrou perda total da fixture nos limites superiores. O clamp deixou de combinar apenas os extremos independentes do retângulo envolvente: ele conserva um patch retangular de área mínima dentro da projeção convexa do piso técnico e dentro da viewport. A regra cobre portrait/landscape, quatro cantos e zoom `0.7–2.2`, sem alterar pan, zoom focal, pinch, seleção, lifecycle ou renderer.

#### Fechamento F3 — evidência humana e correção final dos bounds

A validação humana ampla no Moto G06 foi positiva para abertura, framing, pan, tap/seleção, pinch, pinch → pan, zoom mínimo/máximo, portrait → landscape → portrait e background/resume, sem crash, travamento ou regressão funcional perceptível; o FPS ficou aproximadamente em 60 ou muito próximo, inclusive durante rotação. A observação é da fixture técnica e não é benchmark ou garantia do mundo final.

Durante essa validação, os limites superiores esquerdo/direito ainda podiam mostrar somente fundo. A correção F3-F2-FIX substituiu o AABB da projeção por região convexa válida de centros de câmera e preserva um patch do piso técnico de 15% dos spans projetados, limitado pelo espaço disponível. Ela preservou `CameraNavigation`, gestos, zoom, lifecycle e renderer; passou 3 arquivos/61 testes dirigidos, `format:check`, `typecheck`, `git diff --check`, build, sync Android e debug build, com novo APK. Não houve revalidação física específica desse fix no Moto G06; a ausência foi aceita como risco residual não bloqueante porque a falha era localizada, a correção é matemática e coberta, os contratos não mudaram e a fixture é descartável. F3 está encerrada.

### F4 — Contrato experimental de assets 3D — concluída

F4 produz evidência experimental para um pipeline 3D posterior; não o formaliza. GLTF/GLB continua o caminho de runtime da Fundação. Não há persistência espacial, catálogo real, asset manager definitivo ou pipeline artístico aprovado nesta fase.

#### F4-A — Contrato + preflight de autoria — concluída

Auditoria do caminho atual, contrato experimental e preflight da ferramenta de autoria foram concluídos. Blender 3.3.21 passou no preflight técnico (CLI, save `.blend`, export GLB 2.0 e reimport) e no gate humano no Fedora (viewport e operações básicas utilizáveis, sem falha visual ou de estabilidade relevante). Ele está aprovado somente como ferramenta experimental de autoria durante F4, continua substituível e não se torna dependência nem ferramenta definitiva do Pipeline 3D.

#### F4-B — Geometria, escala, eixos e pivô — concluída

O `GLTFLoader` instalado confirmou quatro GLBs normalizados com procedência suficiente sem correções individuais: root lógico em identidade, chão no `Y=0` e bounds `[largura, altura, profundidade]`. O mapeamento observado é Blender `X →` Three `X`, `Y → -Z` e `Z → Y`. O diagnóstico do Azrael confirmou root lógico utilizável com nove meshes, mas a ausência de evidência local suficiente de licença/proveniência impede sua promoção ao checkout. O contrato permanece experimental; frente visual/funcional, materiais/texturas, custo e pipeline definitivo não foram congelados.

#### F4-C — Materiais, UV e texturas — concluída experimentalmente

F4-C1 inventariou materiais, UVs e imagens dos quatro espécimes F4-B; F4-C2 registrou o contrato técnico mínimo experimental; F4-C3 comprovou os quatro GLBs pelo `GLTFLoader` instalado; C4 preparou um harness isolado e temporário; C5 registrou observação humana visual coerente; e C6 consolidou o contrato e removeu o harness. F4-C não estabelece especificação artística ou técnica permanente, equivalência pixel a pixel ou fidelidade científica.

#### F4-D — Loading, unload e ownership/disposal — concluída experimentalmente

D1 mapeou o fixture F1 real: a montagem terminal é seu único owner registrado, `disposeObjectTree()` deduplica recursos dentro de uma árvore e não existe unload mantendo host vivo. O contrato experimental exige um owner único depois do attach, cancelamento lógico de intenção durante loading, descarte do resultado tardio, unload idempotente que remove/libera somente o root alvo e falha individual separada da falha do host. Não escolhe API, `AssetManager`, cache, abort físico ou gerenciamento global.

D2 comprovou em harness isolado o ciclo KayKit real `GLTFLoader` → owner local → `THREE.Scene` → `disposeObjectTree()`: geometry, material e texture emitiram disposal, o sentinel e a mesma instância de host permaneceram, e novo parse/attach funcionou. O owner existe somente no teste; não há API, manager, cache ou mudança de `ThreeWorldRuntime`.

D3 comprovou unload repetido inerte, três ciclos KayKit sem acúmulo, owners independentes para Poly Haven e Kenney no mesmo host e unload seletivo de A sem disposal de B. A `Texture` compartilhada por metallic/roughness no Poly Haven emitiu um único `dispose`; `referenceScene.test.ts` mantém a cobertura complementar da deduplicação geral intrárvore. Não há política de sharing entre assets, referência contada, cache, manager ou API de produção.

D4 comprovou com roots Quaternius reais e callbacks controlados somente no teste que abandono lógico, sucesso adicional, erro tardio e encerramento do owner rejeitam resultados stale sem anexá-los; cada resultado rejeitado é liberado uma vez. Erro individual deixa o host utilizável para nova tentativa. Não há abort físico, cancelamento de rede, cache, manager ou API de produção.

D5 reuniu F4-B/C/D em gate dirigido de 4 arquivos/20 testes e confirmou a suíte unitária integral com 67 arquivos/510 testes, sem retries ou falhas. F4-D está concluída experimentalmente: o owner e o double permanecem somente no harness, `ThreeWorldRuntime` não recebeu unload dinâmico e não há API, manager, cache ou abort físico.

#### F4-E — Custo e compressão experimental — concluída experimentalmente

E1–E5 concluíram baseline, diagnóstico, variante, comparação e consolidação sem alterar o fixture registrado. Poly Haven concentrou o custo do corpus em três imagens 1024×1024; a variante 512 reduziu o GLB de 5.828.612 para 711.352 bytes (-87,796%), as imagens codificadas em -88,013% e a estimativa RGBA8 base de 12 para 3 MiB, preservando geometry/índices/UV/transforms/material e o `GLTFLoader` atual. O gate humano foi PASS, com leve desfoque em comparação próxima considerado irrelevante para objetos menores e mais distantes na composição ortográfica/2.5D. É evidência deste asset/experimento, não budget global, asset final ou Pipeline 3D definitivo. KTX2/Basis, Draco, Meshopt e quantização não foram adotados.

#### F4-F — Regressão, consolidação e handoff F5 — concluída

Consolidou A–E em contrato experimental: autoria editável e substituível, normalização no asset antes do runtime, materiais PBR relevantes, lifecycle/ownership apenas em harness e custo medido antes de otimizar. Confirmou os quatro fixtures registrados, manteve os testes de contrato, excluiu o laboratório externo da dependência de F5 e não criou `AssetManager`, budget, codec, pipeline produtivo, conteúdo ou persistência espacial.

### F5 — Performance e Android físico — concluída

F5-A preparou o build de diagnóstico para o Moto G06: baseline F1, corpus F4 uma vez e corpus F4 ×4, todos pelo `ThreeWorldRuntime`/`WebGLRenderer` reais. F5-B mediu os três cenários no aparelho, inclusive loading, repouso, memória, remount, interação, orientação, background/resume e sessão de aproximadamente 15 minutos no corpus ×4. F5-C consolidou isso como envelope observado e gatilhos de remedição, não como hard caps: o teto do aparelho não foi encontrado e nenhuma otimização avançada foi justificada.

F6 foi concluída tecnicamente/arquiteturalmente sem criar mundo ou persistência espacial. P3D-A posterior formalizou o contrato produtivo do Pipeline 3D v1; P3D-B1 preservou documentalmente o candidato `bookshelf`, sem criar fonte canônica normalizada, GLB, ingestão produtiva ou implementação de mundo. BF-0 adiou P3D-B2–F e priorizou a trilha funcional com conteúdo procedural/provisório. A dívida de validação humana assistiva permanece obrigatória antes do fechamento do primeiro recorte real e de beta/release dependente da experiência acessível; ela deve usar o build então vigente, não necessariamente o APK F6-B.

### F6 — Acessibilidade e fechamento da FUNDAÇÃO — concluída tecnicamente

F6-A concluiu a auditoria do contrato entre a superfície 3D e React semântico. F6-B confirmou a única lacuna automatizável — foco/teclado e marcos semânticos estruturais — sem alteração de produção; a regressão técnica, E2E e build Android aprovaram o APK candidato. F6-C aceitou documentalmente a indisponibilidade temporária do Moto G06 como dívida assistiva, sem declarar TalkBack ou acessibilidade humana Android aprovados. A FUNDAÇÃO está concluída no plano técnico/arquitetural. P3D-A continua regulando GLBs, P3D-B1 preserva a proveniência de `bookshelf` e P3D-B2–F estão adiados; BF-1A/B concluíram fábrica e composição, BF-1C a integrou estaticamente ao runtime normal, BF-1C-FIX recebeu PASS visual humano no navegador e BF-1D concluiu a troca procedural e seu gate integrado.

F1 aprovou a viabilidade da base Three.js; não concluiu câmera, interação, assets, performance ou acessibilidade finais.

## Depois da FUNDAÇÃO

1. Antes do fechamento do primeiro recorte real e de beta/release aplicável, validar TalkBack no Moto G06; essa dívida humana continua pendente e não reabre o encerramento técnico da BF-1.
2. BF-2–BF-5 só avançam com autorização explícita: integrar progressivamente leitura, os seis tipos de registro e o ambiente provisório, preservando a operação essencial em React.
3. Retomar P3D-B2–F somente se a ingestão ou substituição por GLB definitivo se tornar necessária.
4. Projetar persistência espacial nova somente quando uma necessidade funcional demonstrar o que deve ser salvo.
