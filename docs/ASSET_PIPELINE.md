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

## F4-C — contrato técnico mínimo experimental de materiais, UV e texturas

F4-C transforma o diagnóstico F4-C1 em uma regra verificável para os espécimes F4 atuais. É um contrato experimental limitado, não um Pipeline 3D permanente, uma especificação artística ou uma garantia de fidelidade visual. Ele responde somente se um material necessário sai de fonte editável conhecida, é preparado/exportado como GLB e chega naturalmente pelo `GLTFLoader` ao Three sem correção específica no runtime.

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

### Limite da prova

A prova estrutural pode verificar por parsing e `GLTFLoader`: associação primitive → material, fatores, referências de textura, UV exigido e maps materializados no Three. Ela não prova fidelidade visual. Em especial, o adaptador mínimo de imagem do jsdom empregado pelos gates só permite terminar o parse estrutural de imagens embutidas; não prova decodificação, canais, color space, aparência ou equivalência pixel a pixel. Fidelidade visual exige gate posterior apropriado e, se necessário, evidência humana.

### Evidência F4-C1 e próximo gate

| Espécime   | Evidência que sustenta o contrato                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KayKit     | Base Color PNG e UV chegam como `map` e `uv`; controle texturizado simples.                                                                             |
| Kenney     | Material por fator, sem imagem usada, chega sem maps; UV presente não é requisito de consumo.                                                           |
| Poly Haven | Base Color, normal e metallic/roughness combinado chegam nos maps correspondentes; quatro imagens-fonte para três GLB preservam o significado material. |
| Quaternius | Material por fatores, sem UV nem imagem usada, permanece válido; imagem solta não exige exportação.                                                     |

F4-C3 deverá implementar a prova automatizada fonte/GLB → `GLTFLoader`/Three deste contrato, sem reexportar fixtures, alterar o runtime ou concluir fidelidade visual. F4-D continua responsável por loading/unload/ownership; F4-E por custo e compressão; F5 por densidade, desempenho e Android físico.

## Limites

F4 não cria a Biblioteca final, arte definitiva, persistência espacial, `PlacedObject`, `WorldStructureState`, tabela espacial, backup espacial, catálogo final ou pipeline artístico definitivo. F4 mede provas controladas por asset; F5 tratará densidade de cena, frame time, estabilidade, Android físico, temperatura e limites de conteúdo. O Pipeline 3D permanente só poderá ser formalizado depois da FUNDAÇÃO, com evidência sobrevivente de F4–F6.
