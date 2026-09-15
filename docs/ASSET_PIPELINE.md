# Contrato experimental de assets 3D

Este documento é a autoridade ativa da F4 para experimentos de asset. Ele não é um pipeline de produção, manual de ferramenta ou catálogo da Biblioteca final. Todo arquivo externo permanece não confiável até passar por validação estrita; todo asset real que entrar em uma prova futura deverá ter procedência registrada.

## Baseline F1 já provado

O checkout contém somente um asset 3D de runtime: o fixture técnico `src/features/library/three/fixtures/f1-technical-pyramid.glb`. O Vite o resolve por import de URL (`?url&no-inline`) em `ThreeWorldRuntime`; `createFixtureLoader()` instancia `GLTFLoader`, cujo callback entrega `gltf.scene`. Após sucesso, o runtime acrescenta o modelo à cena e a montagem passa a possuí-lo.

`ThreeWorldMount.dispose()` libera o fixture e a cena de referência por `disposeObjectTree()`. Essa função percorre meshes, deduplica `BufferGeometry`, `Material` e `Texture` em `Set`s, descarta texturas, materiais e geometrias uma vez e remove/limpa a raiz. Callback de sucesso tardio após `failed` ou `disposed` também libera o modelo sem adicioná-lo à cena. Falha normal de load só marca o fixture como `error`; não derruba o runtime.

Há fonte declarativa adjacente em `f1-technical-pyramid.gltf`; a auditoria F4-A1 confirmou que ela e o GLB descrevem a mesma cena, malha, bounds e material. O fixture continua interno, técnico, descartável e ligado à F1. Seus ajustes de posição e escala em `ThreeWorldRuntime` pertencem à composição da fixture e não são uma normalização reutilizável de assets.

O baseline não tem abort explícito de load, cache, unload de um asset enquanto o runtime permanece vivo, registry de runtime, asset bundles, streaming ou `AssetManager`. Nenhuma dessas ausências autoriza criar a solução antecipadamente.

## Objetivo da F4

F4 deve reduzir incerteza sobre autoria, fonte editável, escala, unidades, eixos, orientação, pivô/origem, transforms, geometria, materiais, UV, texturas, exportação, GLTF/GLB, loading, unload, ownership, disposal, custo individual e compressão experimental. Cada resposta depende de prova posterior; F4-A não congelou convenções.

## Hipóteses experimentais aceitas

- **Runtime:** GLTF/GLB continua o caminho experimental aprovado para a Fundação. Nenhum outro formato de runtime entra neste checkpoint.
- **Fonte editável:** cada asset experimental relevante da F4 deverá ter fonte editável e reproduzível. A ferramenta dessa fonte é substituível.
- **Ferramenta:** Blender 3.3.21 passou no preflight técnico (CLI, save `.blend`, export GLB 2.0 e reimport do arquivo produzido) e no gate humano no Fedora (viewport e operações básicas utilizáveis, sem falha visual ou de estabilidade relevante). Está aprovado somente como ferramenta experimental de autoria durante F4. Continua substituível, não é dependência do projeto e não define a ferramenta definitiva do futuro Pipeline 3D.
- **Proveniência:** asset real futuro deverá registrar origem, autoria, licença, fonte editável, transformações realizadas, finalidade e estado experimental em `ASSET_REGISTRY.md` depois de existir no checkout.
- **Transformações:** a meta experimental é entrada previsível no runtime, evitando escala mágica, rotação corretiva sem explicação ou offset vertical específico por asset.
- **Materiais:** F4 começará pela rota simples e interoperável de materiais suportados por GLTF/Three. Não há shader customizado neste checkpoint.
- **Otimização:** compressão e demais otimizações só serão comparadas com evidência mensurável posterior; Draco, Meshopt, KTX2/Basis, atlas, LOD, instancing e merge não foram escolhidos.

## Processo esperado de prova

Uma prova F4 deve declarar a pergunta, o asset realmente presente, sua proveniência, a fonte editável, as transformações observadas, como foi exportado/carregado, qual owner o libera, quais métricas foram observadas e o resultado/restrições. O resultado pode rejeitar uma hipótese e manter a ferramenta substituível. Não existem comandos, scripts de criação/conversão/validação 3D, nem CI de assets ativos neste checkpoint.

## F4-B — geometria, escala, eixos e pivô — concluída experimentalmente

O gate usou o `GLTFLoader` de `three@0.185.1` realmente instalado no checkout, sem montar esses assets na cena técnica e sem alterar `ThreeWorldRuntime`. Quatro GLBs normalizados, com proveniência suficiente, entraram como fixtures de teste F4-B. O teste `f4bAssetAxisGate.test.ts` confere SHA-256, faz `parseAsync()`, mede o `Box3` da cena carregada e não aplica transform algum antes das asserções. Para os GLBs com imagem embutida, o adaptador mínimo de imagem do jsdom permite terminar o parse; ele não mede fidelidade de textura, que continua exclusivamente em F4-C.

O laboratório também carregou Azrael pelo mesmo `GLTFLoader`: o root `F4_Azrael_Estanteria9` chegou em identidade e continha os nove meshes. Ele não entrou no checkout nem no registro porque a evidência local disponível para `Pack_Estantes_Azrael68.fbx` não demonstra licença/origem suficiente para inclusão no bundle. Isso não foi contornado por substituição.

### Convenção observada no runtime

Para os modelos normalizados, a conversão observada entre autoria Blender e a cena devolvida pelo `GLTFLoader` é:

| Autoria Blender | glTF / Three carregado | Papel experimental |
| --------------- | ---------------------- | ------------------ |
| `X`             | `X`                    | largura            |
| `Y`             | `-Z`                   | profundidade       |
| `Z`             | `Y`                    | altura/vertical    |

Os bounds de todos os espécimes têm mínimo `Y` runtime igual a zero (dentro da precisão float), portanto o chão é o plano `Y=0` do Three. A evidência inclui dimensões `[X, Y, Z]` runtime iguais a `[largura, altura, profundidade]`; os centroides geométricos de KayKit e Poly Haven, comparados entre o `.blend` normalizado e a cena carregada, também confirmaram os sinais `X → X`, `Y → -Z` e `Z → Y`. Nenhum dos cinco espécimes formaliza uma frente visual/funcional; a convenção de frente continua deliberadamente aberta.

O contrato experimental resultante é: uma unidade física normalizada equivale a um metro; Blender usa `X` largura, `Y` profundidade e `Z` altura; mobiliário apoiado no chão tem footprint centralizado em `X/Y` e base `Z=0`; o root lógico tem location zero, rotação identidade e scale `1,1,1`; um asset pode ter múltiplos meshes sob esse root. No Three, isso chega sem scale, rotação ou offset corretivo individual: o root é identidade, o piso é `Y=0` e os eixos têm o mapeamento da tabela. Correções específicas de cada fonte devem continuar incorporadas ao asset, nunca como números mágicos do runtime.

### Estratégias verificadas no laboratório

| Fonte / espécime                   | Estratégia de normalização experimental                                                                                   | Estado neste checkout                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Azrael / `Estanteria_9`            | isolou os nove componentes do pack, reuniu-os sob `F4_Azrael_Estanteria9`, centralizou o footprint e levou a base a `Z=0` | não incluído: licença/proveniência local insuficiente |
| KayKit / `shelf_B_large_decorated` | centralizou o footprint e levou a base para `Z=0` sob root lógico único                                                   | fixture F4-B registrada                               |
| Kenney / `bookcaseOpen`            | recenterizou a origem positiva da fonte em `X/Y` e preservou a base em `Z=0`                                              | fixture F4-B registrada                               |
| Poly Haven / `Shelf_01`            | centralizou a profundidade da fonte, preservou a escala métrica e levou a base a `Z=0`                                    | fixture F4-B registrada                               |
| Quaternius / `Bookshelf`           | incorporou a escala corretiva da fonte (`0,5`), centralizou o footprint e levou a base a `Z=0`                            | fixture F4-B registrada                               |

O diagnóstico F4-C1 confirmou que as quatro imagens conectadas do Poly Haven chegam como três no GLB porque metallic e roughness são combinados na `metallicRoughnessTexture` glTF; não é perda demonstrada. Também confirmou que a única imagem listada no `.blend` Quaternius não está ligada ao material nem possui UV correspondente, portanto sua ausência no GLB é legítima. O aumento de vertex count após reexport, com posições únicas e triângulos preservados, continua assunto de custo para F4-E. Este resultado não introduz otimização, compressão, loading/unload formal, cache, `AssetManager`, mundo real ou persistência espacial.

## F4-C — materiais, UV e texturas — concluída experimentalmente

F4-C consolidou o diagnóstico C1, o contrato mínimo C2, o gate estrutural C3, o harness visual temporário C4 e a observação humana C5. O resultado é um contrato experimental limitado, não um Pipeline 3D permanente, especificação artística ou garantia de fidelidade científica: para o corpus F4-B, o significado material necessário sai de fonte editável conhecida, é exportado como GLB e chega naturalmente pelo `GLTFLoader` ao Three sem correção específica no runtime.

### Dados materiais necessários

- Cada primitive deve apontar para o material glTF que representa seu material efetivamente utilizado; cada mesh pode ter a quantidade de primitives e materiais que o asset exigir.
- Base Color deve chegar por fator, textura, ou ambos conforme o material glTF simples exportado. Roughness e metallic seguem a mesma regra quando utilizados; normal map deve chegar quando for utilizado.
- Propriedades glTF simples relevantes ao material, como alpha/transparência e `doubleSided`, devem ser preservadas quando forem necessárias ao material efetivamente utilizado. Elas não se tornam requisitos universais.
- Se o material utiliza textura mapeada, a primitive correspondente deve fornecer a coordenada UV referenciada pelo material, e ela deve chegar à geometria do Three. Nos espécimes atuais, esse caminho é `TEXCOORD_0`/`geometry.attributes.uv`; o contrato não torna esse índice uma regra permanente.
- Material puramente baseado em fatores não exige textura nem UV. UV existente mas não consumido pelo material continua válido.
- Imagem ou propriedade presente na fonte, mas não ligada ao material efetivamente utilizado, não precisa ser exportada para o GLB.

### Representações equivalentes permitidas

A prova compara significado material necessário, e não identidade de arquivos, nomes ou contagem de imagens. São aceitáveis, quando a estrutura GLB e o material carregado preservam esse significado:

- Base Color por fator no lugar de uma textura inexistente ou não utilizada;
- metallic e roughness separados na fonte combinados em uma `metallicRoughnessTexture` glTF;
- uma mesma textura alimentando mais de uma propriedade do material Three;
- conversão para formato de imagem compatível com o GLB/runtime;
- ausência de textura para material por fatores; e
- ausência de imagem solta/não utilizada na fonte.

Em particular, a prova não deve esperar arquivos independentes de metallic e roughness nem depender do nome físico da imagem gerada. A relação válida é a referência material → textura → imagem no GLB e os maps entregues pelo loader.

### Fronteira de preparação e runtime

O caminho experimental esperado é:

```text
fonte editável conhecida
        ↓
preparação/exportação comprovada no asset
        ↓
GLB
        ↓
GLTFLoader instalado
        ↓
material Three resultante
```

Toda correção real de UV, material, ligação de textura, fator ou preparação de exportação pertence à fonte editável ou ao processo de preparação comprovado do asset. `ThreeWorldRuntime` não deve, por asset, substituir material, injetar textura, corrigir roughness/metalness, rotacionar/deslocar UV, alterar imagem ou usar branch por nome/ID.

No corpus F4-C atual, `GLTFLoader` de `three@0.185.1` produz `MeshStandardMaterial` para os materiais PBR metálico-rugosidade observados. Isso é resultado do baseline atual, não uma exigência arquitetural eterna nem autorização para shader customizado.

### Evidência consolidada C1–C5

| Espécime   | Evidência que sustenta o contrato                                                                                                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KayKit     | Base Color PNG e UV chegam como `map` e `uv`; o gate humano observou textura e UV coerentes, sem fallback ou artefato material evidente.                                                                                                                                                |
| Kenney     | Material por fator, sem imagem usada, chega sem maps; UV presente não é requisito de consumo e a observação humana encontrou cor/material simples normal.                                                                                                                               |
| Poly Haven | Base Color, normal e metallic/roughness combinado chegam nos maps correspondentes; quatro imagens-fonte para três GLB preservam o significado material. A observação humana encontrou Base Color, UV, normal e metallic/roughness plausíveis, sem discrepância ou fallback perceptível. |
| Quaternius | Material por fatores, sem UV nem imagem usada, permanece válido; a aparência clara/cinza observada é coerente com seus fatores, roughness `0,5` e metalness `0`, não evidência de textura perdida.                                                                                      |

`f4cMaterialContract.test.ts` comprovou C3 pelos quatro GLBs reais, seus SHA-256 registrados e o `GLTFLoader` de `three@0.185.1`: KayKit chega texturizado; Kenney por fatores sem maps; Poly Haven com Base Color, normal e o mesmo objeto `Texture` para metallic/roughness; Quaternius por fatores sem maps ou UV. O gate não modifica o resultado do loader. C5 foi a observação humana no harness temporário: o usuário orbitou, aproximou e afastou os quatro espécimes; não encontrou defeito material relevante. O harness foi removido após cumprir exclusivamente essa prova.

### Limites da evidência

A prova estrutural verifica associação primitive → material, fatores, referências de textura, UV exigido e maps materializados no Three. O adaptador jsdom só permite terminar esse parse de imagens embutidas. A observação humana acrescenta coerência visual qualitativa, mas F4-C não provou equivalência pixel a pixel, colorimetria científica, precisão numérica da conversão EXR → PNG, qualidade artística, shader definitivo, resolução/formato definitivo de imagem, compressão, KTX2/Basis, Draco, Meshopt, atlas, LOD, instancing, merge, performance, custo de memória, loading/unload, cache, `AssetManager`, densidade de cena, Android físico ou Pipeline 3D permanente.

## F4-D1 — auditoria e contrato experimental de loading, unload e ownership — concluída

Esta auditoria não alterou `ThreeWorldRuntime`, assets ou a cena técnica. Ela confirma no checkout que `createFixtureLoader()` cria um `GLTFLoader` e entrega somente `gltf.scene` a `ThreeWorldRuntime`; `loadFixture()` inicia uma única carga do fixture F1, sem guardar operação, token de intenção, abort físico ou cancelamento lógico. No sucesso aceito, `handleFixtureLoaded()` posiciona o root, o adiciona à `Scene` e o entrega a `ThreeWorldMount.addFixture()`: a montagem passa a ser o único owner registrado desse root até seu encerramento terminal.

`ThreeWorldMount.dispose()` libera primeiro o fixture que ainda referencia, depois a raiz da cena de referência, limpa a `Scene`, descarta renderer e remove canvas. `disposeObjectTree()` percorre somente `Mesh` (incluindo os meshes em subárvores), coleta `BufferGeometry`, material único ou array de materiais e `Texture` encontradas nos valores próprios de cada material; `Set`s eliminam repetição dentro daquela chamada. Em seguida descarta texturas, materiais e geometrias, remove a raiz do parent e limpa seus filhos. O teste de `referenceScene` prova a deduplicação de uma geometry, material e texture compartilhados por dois meshes e que a raiz fica sem filhos. O código prova a remoção do parent; múltiplas chamadas sobre a mesma árvore, todos os slots/estruturas possíveis de textura e compartilhamento entre árvores distintas não são garantias cobertas por teste.

O callback de sucesso só é rejeitado quando o runtime já é terminal (`failed` ou `disposed`) ou a montagem não existe; nesse caso o root recebido é liberado sem anexação, render ou reativação. Durante `paused`, ele ainda é aceito, anexado e marcado `ready`, mas `renderCurrentFrame()` não renderiza até a retomada. Erro normal de fixture enquanto a montagem existe marca `fixtureStatus = error`, registra diagnóstico e mantém o host/runtime vivo; erro depois de terminalidade não produz efeito. Perda de contexto WebGL, erro estrutural de render ou resize tornam o runtime terminal e acionam a mesma liberação da montagem; sucesso tardio após isso é descartado. O baseline não guarda uma operação por asset: portanto não representa “não mais desejado”, não tem política para callbacks mutuamente contraditórios de uma mesma operação e não prova unload com host vivo.

### Contrato experimental mínimo D1

Os termos abaixo são semânticos para as provas D2–D4, não nomes de classes, enumerações ou API futura:

- **Host** é o ambiente vivo que pode receber e perder roots sem ser destruído; a prova não presume que ele seja `ThreeWorldRuntime`.
- **Asset root** é o root lógico carregado e potencialmente anexado, inclusive quando contém múltiplos meshes.
- **Owner** mantém a intenção de possuir um asset. Ao aceitar o sucesso, torna-se o único responsável pelo root, por removê-lo do host e por iniciar a liberação da árvore. Não há owner global nem propriedade compartilhada entre assets neste contrato.
- **Loading** ainda não transfere a posse do root: enquanto a operação está em voo, o owner precisa saber se ainda aceita seu resultado. As provas posteriores exigem cancelamento lógico, não abort físico de request.
- **Loaded/attached** só ocorre quando um resultado ainda desejado é anexado ao host e passa a ter exatamente um owner. Cada operação só pode transferir uma root uma vez; resultado posterior já não desejado, inclusive sucesso adicional da mesma operação, nunca é anexado e quem o recebe o libera imediatamente pela estratégia existente.
- **Unload** deve primeiro tornar o asset não pertencente ao owner, depois destacá-lo do host e liberar os recursos de sua árvore uma única vez. Ele não pode destruir o host, reanexar o root nem tocar outro asset; o host precisa continuar apto a receber uma nova carga.
- **Idempotência** significa que repetir unload ou encerrar o owner não duplica disposal nem altera outros roots. Um callback posterior não pode restaurar o vínculo nem voltar o estado conceitual a loaded.
- **Falha individual** deixa o host separado e utilizável; ela não é falha estrutural do host sem evidência concreta. Depois de uma falha ou abandono que encerre a operação conceitual, qualquer sucesso tardio deve ser descartado e qualquer erro tardio deve ser inerte. Política definitiva de retry permanece aberta.

Assim, `unload` de asset **não é** `dispose` de host/runtime: o primeiro atinge somente o root pertencente ao owner; o segundo continua a ser o lifecycle terminal já existente da montagem. O contrato reutiliza somente a estratégia local comprovada de `disposeObjectTree()` e não pressupõe cache, registry, preload, streaming, pooling, bundles, prioridades, deduplicação global, compartilhamento entre assets, contagem de referências, `AbortController` ou gerenciador definitivo.

### Sequência de provas D2–D4

- **D2:** em harness isolado, `Scene` ou `Group` vivo + `GLTFLoader` instalado e fixture KayKit real: load/attach, unload, host ainda íntegro e novo load/attach possível. KayKit exercita geometry, material e texture/UV reais.
- **D3:** duas roots reais simultâneas no mesmo harness — Poly Haven como A, para maps ricos e a textura metallic/roughness compartilhada dentro da própria árvore, e Kenney como B simples. Provar repetição/idempotência, unload de A sem atingir B e a deduplicação interna já oferecida pela estratégia de disposal; não inferir compartilhamento de recursos entre A e B.
- **D4:** usar root Quaternius real, pequeno e sem textura, entregue por double assíncrono controlado para testar abandono durante loading, sucesso tardio, erro, erro tardio e owner encerrado. A double controla somente a ordem temporal; os roots e sua liberação continuam Three reais. KayKit permanece disponível como variante texturizada se a prova precisar confirmar que o caminho tardio não depende de root simples.

Essas provas podem ficar fora de produção: um harness de teste com `THREE.Scene`/`Group`, `GLTFLoader`, os fixtures F4-B e `disposeObjectTree()` já isola a propriedade em questão. Nenhuma propriedade identificada exige mudar `ThreeWorldRuntime`; alterar a produção antes dessa evidência ampliaria indevidamente a arquitetura.

## F4-D2 — load, attach e unload com host vivo — concluída

`f4dAssetLifecycle.test.ts` prova o ciclo em harness isolado sem alterar `ThreeWorldRuntime`: lê o GLB KayKit F4-B, confere seu SHA-256 registrado e faz `GLTFLoader.parseAsync()` pelo `three@0.185.1` instalado. O adaptador jsdom só permite concluir o parse da imagem Base Color embutida; ele não simula renderer nem declara prova visual. Um owner mínimo definido apenas no teste aceita a root em uma `Scene` real, conserva sua referência e usa exclusivamente `disposeObjectTree()` ao unload.

No primeiro ciclo, listeners de `dispose` nos objetos Three reais da root KayKit confirmam uma liberação de geometry, material e texture usada pelo material. A root deixa o owner e a `Scene`, enquanto um `Group` sentinela e a mesma instância de host permanecem. No segundo ciclo, novo parse real produz nova root, que o mesmo owner anexa ao mesmo host; a liberação final serve somente de cleanup do teste. A prova não aprovou API, owner de produção, `AssetManager`, cache, unload definitivo, renderer ou arquitetura permanente.

## F4-D3 — repetição, isolamento e disposal — concluída

`f4dAssetLifecycle.test.ts` estende o mesmo harness local sem alterar `ThreeWorldRuntime`. Para KayKit, o unload repetido fica inerte depois da primeira liberação: geometry, material e texture reais emitem um único `dispose`. Três ciclos determinísticos de parse, attach e unload produzem roots, geometries, materiais e textures distintos, terminam com o owner vazio e não acumulam roots de asset no mesmo host ou removem seu sentinel.

Dois owners experimentais independentes anexam Poly Haven e Kenney à mesma `Scene`. O unload de Poly Haven libera somente seus recursos e preserva a root, o owner e os contadores de disposal de Kenney até seu unload próprio. No Poly Haven, `metalnessMap` e `roughnessMap` são a mesma `Texture`, observada uma única vez e descartada uma única vez. A cobertura complementar de `referenceScene.test.ts` continua demonstrando a deduplicação geral de geometry, material e texture compartilhados dentro de uma árvore. Isto não aprova política de compartilhamento entre assets independentes, referência contada, cache, manager ou API de produção.

## F4-D4 — assíncrono em voo, abandono, callbacks tardios e erros — concluída

`f4dAssetLifecycle.test.ts` preserva `GLTFLoader.parseAsync()` real e SHA-256 registrado para obter roots Quaternius concretas. Um double definido somente no teste retém e entrega callbacks de sucesso ou erro sob ordem escolhida; ele não substitui parsing, loading real já provado por D2/D3, renderer ou `disposeObjectTree()`. O owner experimental local usa uma identidade de operação apenas para a prova: abandono lógico ou encerramento tornam a operação inaceitável, e somente o primeiro sucesso válido pode transferir uma root ao owner.

Os casos cobrem abandono antes do sucesso, sucesso adicional da mesma operação, erro individual seguido de nova tentativa, erro tardio após abandono e encerramento do owner com operação em voo. Roots rejeitadas/tardias Quaternius emitem um único `dispose` de geometry e material, nunca são anexadas e não alteram host ou sentinel; a root aceita não é liberada até seu unload normal. Erro individual encerra a operação sem tornar o host terminal. O contrato continua sendo cancelamento lógico da intenção: não há abort físico, cancelamento de rede, `AbortController`, manager, cache, registry, retry automático ou API de produção.

## F4-D — loading, unload e ownership/disposal — concluída experimentalmente

O contrato sobrevivente é experimental e limitado ao harness: um **host** pode permanecer vivo enquanto roots entram e saem; uma root aceita tem exatamente um **owner**, e uma operação transfere ownership no máximo uma vez. Unload desfaz esse vínculo, remove/libera somente a árvore possuída e preserva host e assets independentes. Repetir unload é inerte; ciclos sucessivos não acumulam roots ou ownership; resources repetidos dentro da mesma árvore são liberados uma vez por `disposeObjectTree()`.

Se a intenção é abandonada ou o owner é encerrado durante loading, callback posterior é stale: não anexa nem ressuscita a root e libera o resultado. Falha individual encerra somente a operação e deixa o host apto a uma nova tentativa. D2/D3 comprovam o caminho real com `GLTFLoader`; D4 usa double somente para controlar a ordem de callbacks. O `ThreeWorldRuntime` continua com ownership terminal da fixture técnica e não recebeu unload dinâmico. O owner experimental, seus tokens e o double vivem somente nos testes; nenhuma API ou arquitetura produtiva foi aprovada.

F4-D não aprovou `AssetManager`, registry, cache, preload, streaming, pooling, queue global, retry automático, abort físico, `AbortController`, cancelamento de rede, sharing entre assets, referência contada, garbage collector, bundles, prioridades, loading screen, persistência, renderer em cena complexa, performance, memória total, Android físico, pressão real de rede/memória ou arquitetura final de loading. F4-E — custo e compressão experimental — é o próximo trabalho e deve medir os assets antes de escolher qualquer hipótese de otimização/compressão.

## F4-E1 — baseline estrutural de custo — concluída

Em 2026-09-14, a análise leu diretamente os quatro GLBs F4-B registrados, sem parse que mutasse o resultado, reexportação, conversão ou alteração de fixture. SHA-256, caminhos e tamanhos conferem com `ASSET_REGISTRY.md`:

| Asset | Caminho | SHA-256 | Correspondência |
| --- | --- | --- | --- |
| KayKit | `fixtures/f4-b/kaykit-shelf-b-large-decorated.glb` | `03e0b1af929de0a81795aea965b6cc5fbd8ac6e896e1047acef9f5d93b9debbe` | sim |
| Kenney | `fixtures/f4-b/kenney-bookcase-open.glb` | `6704751f18b91a68ad9689c24ea59e029c09d584264b7f089439e79683c71900` | sim |
| Poly Haven | `fixtures/f4-b/polyhaven-shelf-01.glb` | `33d55c107ea5afd314aad197f7753c64bacc88ea554df3f7e57fc8e7c81415b1` | sim |
| Quaternius | `fixtures/f4-b/quaternius-bookshelf.glb` | `aabe7de0adf6b0e3aaf651acbb5704680e44df3180ffa98aa0cb7d19d389f265` | sim |

### Método e classificação das métricas

- **Medida exata:** bytes/chunks do container, objetos glTF, accessors, `bufferViews`, materiais, imagens, MIME, dimensões lidas nos bytes de PNG/JPEG e extensões vieram da estrutura GLB 2.0 real.
- **Métrica derivada:** triângulos saem de índices em `TRIANGLES` dividido por três; bytes lógicos de accessor são `count × componentes do type × bytes do componentType`. Esses bytes não duplicam `bufferView` compartilhado e não representam padding, interleaving ou alocação física; neste corpus não há `byteStride`, sparse accessor ou `bufferView` compartilhado entre accessors.
- **Estimativa:** `largura × altura × 4` é apenas referência de imagem RGBA8 no nível base. Não mede memória de GPU, heap/browser, representação interna WebGL nem Moto G06; não supõe mipmaps.

### Tabela consolidada

| Asset | GLB bytes | Meshes | Primitives | Vertices | Triangles | Materials | Images | Encoded image bytes | Image dimensions | RGBA8 base estimate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| KayKit | 44.780 (43,73 KiB) | 1 | 1 | 778 | 482 | 1 | 1 | 15.605 | PNG 1024×1024 | 4.194.304 (4 MiB) |
| Kenney | 20.460 (19,98 KiB) | 1 | 1 | 543 | 320 | 1 | 0 | 0 | — | 0 |
| Poly Haven | 5.828.612 (5,559 MiB) | 1 | 1 | 362 | 182 | 1 | 3 | 5.814.197 | PNG/JPEG/PNG, cada uma 1024×1024 | 12.582.912 (12 MiB) |
| Quaternius | 7.572 (7,39 KiB) | 1 | 1 | 240 | 120 | 1 | 0 | 0 | — | 0 |

Todos os primitives são indexed, `mode=TRIANGLES`, têm um material e são um **proxy estrutural** de uma submissão; não são uma contagem exata de draw calls do renderer. Não há animações, skins, joints/bones, morph targets, cameras, lights incorporadas ou extensões glTF em nenhum dos quatro assets (`extensionsUsed` e `extensionsRequired` vazios). Portanto não há neste corpus extensão glTF declarada de compressão geométrica, transcodificação/compressão de textura, quantização ou material; PNG e JPEG continuam sendo os encodings de imagem efetivamente medidos.

### Container, geometria e atributos

Cada GLB tem cabeçalho de 12 bytes, um chunk JSON e um BIN; não há chunks adicionais. JSON/BIN abaixo são bytes exatos dos chunks, e o restante são os 28 bytes dos cabeçalhos de container/chunk.

| Asset | JSON bytes (% GLB) | BIN bytes (% GLB) | Observação de alinhamento | Índices | Atributos e bytes lógicos |
| --- | ---: | ---: | --- | ---: | --- |
| KayKit | 1.356 (3,028%) | 43.396 (96,909%) | 3 bytes finais de padding após a PNG | 1.446 `UNSIGNED_SHORT` | `POSITION` 9.336; `NORMAL` 9.336; `TEXCOORD_0` 6.224; índices 2.892 (total 27.788) |
| Kenney | 1.136 (5,552%) | 19.296 (94,311%) | sem padding interno adicional observado | 960 `UNSIGNED_SHORT` | `POSITION` 6.516; `NORMAL` 6.516; `TEXCOORD_0` 4.344; índices 1.920 (total 19.296) |
| Poly Haven | 1.708 (0,029%) | 5.826.876 (99,970%) | 3 bytes entre imagens para alinhamento de `bufferView` | 546 `UNSIGNED_SHORT` | `POSITION` 4.344; `NORMAL` 4.344; `TEXCOORD_0` 2.896; índices 1.092 (total 12.676) |
| Quaternius | 1.064 (14,052%) | 6.480 (85,578%) | sem padding interno adicional observado | 360 `UNSIGNED_SHORT` | `POSITION` 2.880; `NORMAL` 2.880; índices 720 (total 6.480) |

Há uma scene, um node, um mesh e um primitive por fixture. Accessors/bufferViews são respectivamente KayKit 4/5, Kenney 4/4, Poly Haven 4/7 e Quaternius 3/3. Os totais lógicos de geometria do corpus são `POSITION` 23.076 bytes, `NORMAL` 23.076, UV 13.464 e índices 6.624: 66.240 bytes. Isso explica o BIN simples de Kenney e Quaternius e deixa claro que o BIN de Poly Haven é majoritariamente imagem, não malha.

### Materiais e imagens

| Asset | Material PBR efetivo | Imagem/textura e papel | Bytes codificados |
| --- | --- | --- | ---: |
| KayKit | `furniture_texture`; Base Color texture, metallic 0, roughness 0,5; opaco, uma face | PNG 1024×1024 em `baseColorTexture` | 15.605 |
| Kenney | `wood`; Base Color factor `[0,8962264, 0,6015712, 0,3931559, 1]`, metallic 0; opaco, uma face | nenhuma; UV existe mas o material por fator não a consome | 0 |
| Poly Haven | `Shelf_01`; Base Color, normal e `metallicRoughnessTexture`; opaco, `doubleSided` | normal PNG 1024×1024; Base Color JPEG 1024×1024; PNG 1024×1024 de metallic/roughness combinado | 4.594.197; 153.220; 1.066.780 |
| Quaternius | `White`; Base Color factor `[0,4479754, 0,4432907, 0,4294085, 1]`, metallic 0, roughness 0,5; opaco, `doubleSided` | nenhuma e sem UV; ausência continua legítima pelo contrato F4-C | 0 |

No Poly Haven, cada imagem é referida por uma textura distinta; a textura de metallic/roughness representa os dois canais PBR pela única `metallicRoughnessTexture` válida. Como já observado em F4-C/D, `GLTFLoader` materializa esse recurso como o mesmo objeto `Texture` nos maps de metalness e roughness; não há nova imagem ausente ou duplicada. KayKit não compartilha sua única textura com outro papel.

### Corpus inteiro

O corpus soma **5.901.424 bytes** (5.763,11 KiB; 5,628 MiB), quatro primitives, 1.923 vertices, 3.312 índices, 1.104 triângulos, quatro materiais, quatro texturas/imagens e 5.829.802 bytes de imagens codificadas. As estimativas RGBA8 base somam 16.777.216 bytes (16 MiB): 4 MiB de KayKit e 12 MiB de Poly Haven.

| Asset | Participação no GLB corpus | Principal parcela observada |
| --- | ---: | --- |
| KayKit | 0,759% | PNG de 15.605 bytes e geometria de 27.788 bytes lógicos |
| Kenney | 0,347% | geometria de 19.296 bytes lógicos |
| Poly Haven | 98,766% | imagens: 5.814.197 bytes, 99,753% do próprio GLB |
| Quaternius | 0,128% | geometria de 6.480 bytes lógicos |

## F4-E2 — diagnóstico e hipóteses — concluída

### Diagnóstico por asset

- **KayKit:** arquivo pequeno. A imagem PNG ocupa 34,848% do GLB, mas são só 15.605 bytes de payload; a estimativa de 4 MiB RGBA8 decorre exclusivamente de sua dimensão 1024×1024. Geometria (482 triângulos) também é pequena. Não há base medida para experimento individual.
- **Kenney:** o custo observado é a geometria descomprimida de 19.296 bytes lógicos, 320 triângulos e UV não consumida pelo material atual; porém o GLB inteiro tem apenas 20.460 bytes. Remover ou comprimir dados aqui não se justifica sem uma pergunta futura mais concreta.
- **Poly Haven:** é o único custo dominante de storage/payload: 5.814.197 bytes de imagens, em especial normal PNG (4.594.197 bytes), respondem por 99,753% do GLB e o asset por 98,766% do corpus. Estruturalmente, três imagens 1024×1024 dão estimativa RGBA8 base de 12 MiB, apesar de a geometria ter somente 182 triângulos e 12.676 bytes lógicos. Isso é prioridade de experimento de asset, não prova de gargalo físico.
- **Quaternius:** arquivo e geometria são mínimos (7.572 bytes, 120 triângulos); não há textura/UV ausente a recuperar. Não há hipótese útil neste checkpoint.

Logo, storage/payload e custo estrutural potencial estão separados: JPEG Base Color de Poly Haven tem apenas 153.220 bytes codificados, mas entra na estimativa de 4 MiB RGBA8 base como as outras imagens 1024². Em sentido inverso, compressão de geometria reduziria poucos bytes neste corpus e pode introduzir trabalho de decoder. Nenhuma dessas estimativas equivale a uso real de GPU, RAM, frame time, loading físico ou desempenho no Moto G06.

### Hipóteses avaliadas

| Hipótese | Problema medido / alvo | Ganho a investigar | Complexidade e risco | Decisão |
| --- | --- | --- | --- | --- |
| Reduzir resolução das três texturas Poly Haven de 1024² em variante isolada | 5.814.197 bytes codificados e estimativa base de 12 MiB; apenas Poly Haven | comparar bytes do GLB/imagens e a estimativa base contra a variante; se 512², a fórmula de referência cai de 12 para 3 MiB, sem promessa de memória real | transformação offline e novo gate visual/material/UV; pode degradar normal, detalhes e leitura artística; não requer decoder no runtime | **avançar como hipótese principal** |
| KTX2/Basis para as texturas Poly Haven | mesmo alvo de imagens, mas visando encoding/transcodificação | possível redução de payload e mudança de representação, a medir somente se a primeira hipótese demonstrar necessidade | exige `KHR_texture_basisu`, `KTX2Loader`, transcoder WASM/configuração e compatibilidade WebGL/Android; maior superfície de manutenção e risco de decoder | não avançar em E3/E4 |
| Quantização/meshopt/Draco para geometria | 66.240 bytes lógicos de geometria no corpus; Poly Haven tem só 12.676 | redução potencial pequena frente a 5,901 MiB totais | requer transformação e, para meshopt/Draco, decoder/configuração; pode reduzir arquivo sem provar benefício de runtime | não avançar |

O checkout de `three@0.185.1` contém `DRACOLoader`, `KTX2Loader` e `meshopt_decoder.module.js`; o `GLTFLoader` instalado reconhece `KHR_draco_mesh_compression`, `EXT_meshopt_compression`, `KHR_mesh_quantization` e `KHR_texture_basisu`, mas requer explicitamente configurar o loader/decoder apropriado. Essa disponibilidade local não aprova sua adoção nem elimina payload, worker/transcoder, Android/WebView e manutenção a validar.

### Seleção para F4-E3 + F4-E4

**Hipótese principal:** variante isolada de Poly Haven com resolução de texturas reduzida, mantendo o significado PBR atual (Base Color, normal e metallic/roughness combinado).

**Problema medido que ela ataca:** 5.814.197 bytes de imagens codificadas (99,753% do GLB Poly Haven), com três imagens 1024×1024 e estimativa RGBA8 base de 12 MiB.

**Asset alvo:** somente `polyhaven-shelf-01.glb`; KayKit, Kenney e Quaternius não entram no experimento.

**Por que merece experimento:** ataca quase todo o payload atual com transformação offline isolável, preserva a geometria já pequena e permite comparação original × variante sem adicionar decoder ao runtime.

**Comparação exigida em E3/E4:** hashes/proveniência da variante, container, imagens/bytes/dimensões, geometria e contratos materiais/UV, inspeção visual humana da variante e diferença documentada contra o original. A decisão sobre manter, reverter ou investigar encoding adicional continua dependente dessa evidência.

Não foi definido formato definitivo, compressão obrigatória, budget, limite de polígonos, limite de textura nem Pipeline 3D permanente.

## F4-E3/E4 — variante 512 e comparação objetiva — concluídas experimentalmente

Em 2026-09-14, o GLB registrado Poly Haven foi novamente conferido (`33d55c107ea5afd314aad197f7753c64bacc88ea554df3f7e57fc8e7c81415b1`, 5.828.612 bytes) e permaneceu intocado. A variante laboratorial externa ao checkout é `../bv-f4-lab/experiments/f4-e/polyhaven-shelf-01-512.glb`, SHA-256 `910cdf18f5eca657e0204ede8279608ad1d9b15341f8f9c8be8cbad4131f39f4`. Ela não é fixture registrada, asset final ou decisão de pipeline.

A transformação temporária leu o JSON/BIN do GLB atual, copiou sem alteração os `bufferViews` de geometria e substituiu somente os três payloads de imagem incorporados; então reempacotou um GLB 2.0 autocontido. Pillow 12.3.0 aplicou `LANCZOS` de 1024×1024 para 512×512. Base Color manteve JPEG RGB, qualidade 90 e subsampling 4:2:0; o JPEG original reportava qualidade 85 no ImageMagick, portanto a diferença codificada inclui reencoding além da resolução. Normal e metallic/roughness mantiveram PNG RGB com `compress_level=9`, sem inversão de canal G, troca de canal, gamma deliberado, recoloração, sharpening ou renormalização: é downsample convencional documentado para o gate visual. Não houve Blender, mudança de mesh/UV/material, codec novo, extensão glTF, decoder, dependência ou alteração de loader/runtime.

| Métrica | Original 1024 | Variante 512 | Delta | Delta % |
| --- | ---: | ---: | ---: | ---: |
| GLB bytes | 5.828.612 | 711.352 | -5.117.260 | -87,796% |
| JSON chunk | 1.708 | 1.700 | -8 | -0,468% |
| BIN chunk | 5.826.876 | 709.624 | -5.117.252 | -87,822% |
| Imagens codificadas | 5.814.197 | 696.943 | -5.117.254 | -88,013% |
| Normal PNG | 4.594.197 | 418.465 | -4.175.732 | -90,891% |
| Base Color JPEG | 153.220 | 56.840 | -96.380 | -62,903% |
| Metallic/Roughness PNG | 1.066.780 | 221.638 | -845.142 | -79,224% |
| Estimativa RGBA8 base | 12.582.912 (12 MiB) | 3.145.728 (3 MiB) | -9.437.184 | -75,000% |
| Vertices / índices / triângulos | 362 / 546 / 182 | 362 / 546 / 182 | 0 / 0 / 0 | 0% |
| Materials / imagens | 1 / 3 | 1 / 3 | 0 / 0 | 0% |

O teste temporário comparou byte a byte os dados lógicos de `POSITION`, `NORMAL`, `TEXCOORD_0` e índices; comparou nodes, hierarchy/scenes, mesh/primitive, accessors, materiais, texturas, samplers e extensões; e confirmou transform/bounding box iguais. O `GLTFLoader` de `three@0.185.1` fez parse real dos dois GLBs: a variante tem UV, `map`, `normalMap`, `metalnessMap` e `roughnessMap`, sendo os dois últimos o mesmo objeto `Texture`. As três imagens permanecem incorporadas e agora têm 512×512, na mesma ordem e MIME `PNG`, `JPEG`, `PNG`.

O gate humano no comparador A/B temporário foi **PASS**. Em comparação próxima, foi percebido apenas leve desfoque nas texturas 512×512 em relação ao original 1024×1024. A diferença foi considerada irrelevante no uso ortográfico/2.5D pretendido, em que os objetos aparecem menores e mais distantes; identidade visual, material e leitura geral foram preservados, sem perda bloqueante. Isto não afirma identidade visual pixel a pixel nem elimina a ressalva de desfoque.

Após o gate, o teste, o comparador HTML, a cópia Vite da variante e seus arquivos de suporte foram removidos do checkout. A variante e o script temporário permanecem somente no laboratório externo como evidência até E5. A conclusão vale exclusivamente para este Poly Haven e este experimento: 512×512 não se torna budget global, outros assets podem exigir outra resolução e a técnica não define Pipeline 3D definitivo. F4-E5 — consolidação e fechamento da F4-E — é o próximo checkpoint.

## Limites

F4-E1–E4 não medem FPS, frame time, loading real, memória real de GPU, heap/RAM, VRAM, temperatura, bateria, Android/Moto G06, impacto real de decoder ou arquitetura final. O gate humano aprovou somente a adequação visual desta variante no uso pretendido; não aprovou fidelidade pixel a pixel, formatos/resoluções universais ou qualidade de outros assets. F4 não cria a Biblioteca final, arte definitiva, persistência espacial, `PlacedObject`, `WorldStructureState`, tabela espacial, backup espacial, catálogo final ou pipeline artístico definitivo. F5 tratará densidade de cena, frame time, estabilidade, Android físico, temperatura e limites de conteúdo; o Pipeline 3D permanente só poderá ser formalizado depois da FUNDAÇÃO, com evidência sobrevivente de F4–F6.
