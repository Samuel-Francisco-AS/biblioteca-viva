# Mundo

O mundo anterior foi encerrado pelo WORLD RESET e não constitui fundação futura. Phaser, `PlacedObject`, `WorldStructureState`, grid 32 e os contratos W3-A permanecem mortos.

O novo mundo será criado do zero, será o único mundo ativo e seguirá 3D real com apresentação ortográfica/2.5D.

## Estado da Fundação

A F1 provou o runtime e aprovou Three.js como renderer da Fundação, com integração direta por host React próprio:

- `WebGLRenderer` como baseline vigente;
- `OrthographicCamera`;
- GLTF/GLB;
- ponte React ↔ Three;
- lifecycle explícito;
- Android/Capacitor.

A superfície atual ainda é uma fixture técnica: piso, paredes, proxies, iluminação simples e um GLB mínimo. Ela não é a Biblioteca final e não define conteúdo, arte ou UX permanentes; a F3 concluiu o contrato técnico de câmera e interação desta fixture.

Identidade, posição da câmera e seleção permanecem efêmeras. Na fixture, a câmera tem framing e limites técnicos explícitos, sem depender do GLB tardio ou persistir estado espacial; pan, wheel e pinch usam o mesmo modelo lógico no plano X/Z, com zoom focal e midpoint de pinch ancorados dentro desses limites. A seleção por canvas só ocorre no `pointerup` de uma candidatura de tap única que não excedeu `8` CSS px, não entrou em pinch e não foi interrompida; tap vazio limpa a seleção. Isso não define a câmera, as áreas de toque ou a ergonomia final da Biblioteca. F4 fechou a evidência experimental de assets e P3D-A formalizou o contrato produtivo v1 (fonte editável, normalização antes do runtime, materiais relevantes e custo medido), sem criar asset, ingestão, catálogo ou `AssetManager`. F5 validou no Moto G06 um envelope físico observado, sem encontrar teto ou criar budget permanente. F6 concluiu tecnicamente a fronteira acessível React ↔ Three, mas não aprovou TalkBack humano. A fixture continua descartável; o mundo real e a persistência espacial ainda não existem.

## Biblioteca Funcional Primeiro

BF-0 aprovou construir primeiro uma Biblioteca funcional com conteúdo procedural/provisório em TypeScript/Three.js. Esse caminho pode representar visualmente um tipo de modelo sem depender de GLB; não promove a fixture F1, os cenários diagnósticos F5 ou qualquer fixture F4 à arquitetura produtiva. React continua a superfície semântica das funções essenciais: seleção visual é complementar e nunca o único caminho de operação.

A ADR-011 registrou originalmente a identidade lógica como contrato de significado, sem materializá-la em schema, tabela, backup, posição persistida ou contrato espacial. BF-1A passou a materializar somente os tipos TypeScript mínimos `ProceduralModelTypeId` e `ProceduralContentIdentity`, distinguindo tipo de modelo, instância e `entryId` opcional. Eles continuam independentes de representação visual, mesh, root Three, URL e posição; não existe schema persistido, tabela espacial, backup espacial ou associação funcional a registros reais, e os contratos espaciais anteriores não retornam.

### Contrato mínimo procedural BF-1A

BF-1A implementa `createProceduralBookshelf()` em módulo próprio, sem importar `referenceScene.ts` ou alterar a fixture. A fábrica recebe e devolve separadamente a identidade lógica com `modelTypeId` (`bookshelf`), `instanceId` e `entryId` opcional; esses valores não derivam de nome de mesh, root Three, URL ou posição. Cada chamada cria root `Group` em identidade, dimensões finitas e positivas, geometria apoiada localmente em `Y=0` e uma estante de corpo, laterais e prateleiras com materiais `MeshStandardMaterial` simples.

Quem anexar a root será seu owner e a liberará por `disposeObjectTree()`. Materiais e geometrias são independentes entre chamadas; prateleiras repetidas podem compartilhar recursos somente dentro da mesma root, cujo descarte já é deduplicado.

### Composição declarativa BF-1B

BF-1B adiciona definições Three-independentes de identidade e posição `[x, y, z]`. A primeira composição contém somente `bookshelf`: `reading-shelf-01` em `[-3, 0, -2]`, `reading-shelf-02` em `[0, 0, -2]` e `reading-shelf-03` em `[3, 0, -2]`. A composição valida `instanceId` duplicado antes de criar recursos e devolve a root, cada wrapper de instância e sua representação. A posição vive no wrapper, nunca na root local da fábrica; as definições recebidas não são mutadas e chamadas sucessivas são logicamente equivalentes.

A root de composição é owner de todas as representações que constrói e pode ser liberada por `disposeObjectTree()`. Composições distintas não compartilham geometria ou material, e o descarte mantém a deduplicação intrárvore.

### Integração estática BF-1C

Na experiência normal — isto é, quando as dependências do runtime não trazem `performanceScenario` — `ThreeWorldRuntime` cria a composição com `READING_SHELF_COMPOSITION_DEFINITIONS`, anexa sua root uma única vez e a montagem se torna seu único owner. O descarte terminal libera a composição uma vez com `disposeObjectTree()` depois de desfazer a interação; se a montagem falhar antes da transferência de ownership, a root provisória também é liberada. Não há unload isolado, substituição de representação, cache, pooling, ref counting ou `AssetManager`.

Cada wrapper de instância é uma root selecionável própria. O catálogo disponível imediatamente após `mount()` usa o `identity.instanceId` — `reading-shelf-01`, `reading-shelf-02` e `reading-shelf-03` — e os rótulos `Estante de leitura 1`–`3`; ele preserva todos os selecionáveis técnicos e o fixture. Raycasting de uma prateleira, lateral ou fundo retorna o wrapper da mesma instância, e a seleção por canvas usa o mesmo destaque e ponte React existentes. Quando uma root procedural e um proxy técnico se sobrepõem no raio, a root procedural tem prioridade restrita a essa interseção para não tornar a estante inacessível; sem interseção procedural, o picking técnico vigente é inalterado. A seleção por controles React, teclado e anúncio acessível continua essencial; o canvas é complementar. `entryId` permanece sem uso e não há registros convencionais artificiais.

Quando há `performanceScenario`, o runtime mantém exclusivamente o caminho F5: não constrói nem anexa a composição, e não muda seu catálogo, corpus, payload, métricas ou resultados comparáveis. A fixture F1 continua visível na experiência normal. Há uma observação técnica de que proxies F1 podem ocluir partes projetadas das estantes; ela segue para o gate visual, sem alterar a fixture ou inventar layout/persistência espacial.

### Correção visual BF-1C-FIX

A inspeção humana posterior à BF-1C (`34015b6`) encontrou linhas e perda de leitura. A causa geométrica confirmada foi a face frontal do fundo coincidir com a face traseira das prateleiras na fábrica anterior, somada a interseções de volume entre peças; não se adotaram `depthTest`, `polygonOffset`, alteração de câmera ou outro mascaramento de renderer. A fábrica agora separa fundo recuado, prateleiras avançadas, laterais, base e moldura superior, sem sobreposição positiva de volume e com apoio local em `Y=0`.

Cada instância continua `modelTypeId: "bookshelf"` e preserva sua identidade semântica: `reading-shelf-01` usa `reading-balanced` (corpo nominal 2,10 × 3,10 × 0,62 m), `reading-shelf-02` usa `reading-dark-tall` (1,86 × 3,38 × 0,60 m) e `reading-shelf-03` usa `reading-light-wide` (2,34 × 2,86 × 0,66 m). A moldura acrescenta somente o pequeno avanço horizontal testado nos bounds externos. As diferenças de proporção, tom, quantidade de prateleiras e moldura são somente representação visual declarativa, não novos tipos semânticos. As duas primeiras posições BF-1B foram preservadas; a terceira passou a `[3, 0, -2.1]` porque seus bounds originais cruzavam um banco F1. Os bounds atuais não cruzam proxies F1 selecionáveis. Rolagem comum não altera câmera ou viewport do runtime; o picking usa somente o retângulo atual do canvas. A aparência continua provisória e requer gate visual humano antes de BF-1D.

P3D-B1 preserva o candidato `bookshelf` e a sua proveniência. P3D-B2–F estão adiados e só retomam se a ingestão ou substituição por assets GLB definitivos se tornar necessária. A dívida de TalkBack continua bloqueante para o fechamento do primeiro recorte real: prever remediação e validações físicas incrementais no Moto G06, sem impor budgets preventivos.

A caixa do mundo é a área efetiva do `world-host` dentro do layout React, não uma estimativa da janela. O shell preserva as safe areas e reserva o dock fixo; Three recebe somente a dimensão observada da sua caixa. Portrait, landscape e resize mantêm a mesma montagem, seleção e exploração lógica quando os bounds permitem; transição inválida aguarda dimensão válida e interrompe somente gesto que estivesse ativo. F3-F1 confirmou este contrato por regressão técnica, build e E2E; a validação humana ampla da F3 no Moto G06 foi positiva para orientação, toque/pinch, lifecycle e fluidez. O fix posterior dos bounds foi validado tecnicamente, sem revalidação física específica; isso foi aceito como limitação não bloqueante do fechamento, não como prova física inexistente.

R3F não foi aprovado e só poderá ser reconsiderado diante de um problema concreto de integração. WebGPU não é o baseline. Babylon.js, PlayCanvas e Godot não serão testados ou migrados preventivamente; alternativas só retornam diante de evidência estrutural que justifique reabrir a decisão.

A FUNDAÇÃO estabelece a base técnica/arquitetural Three.js e sua fronteira semântica React. Ela não aprova o mundo real, performance de cenas complexas, TalkBack, acessibilidade humana Android ou temperatura de longo prazo. A validação assistiva humana permanece obrigatória antes do fechamento do primeiro recorte real e de beta/release aplicável.
