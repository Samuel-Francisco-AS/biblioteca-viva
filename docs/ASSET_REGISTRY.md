# Registro de assets e licenças

O baseline ativo possui dois assets de áudio e um fixture 3D técnico da F1, todos de autoria interna:

| ID                              | Arquivo                           | Uso                | Origem/licença                                                                      | Estado |
| ------------------------------- | --------------------------------- | ------------------ | ----------------------------------------------------------------------------------- | ------ |
| `ui-page-provisional-v1`        | `public/audio/ui-page.wav`        | navegação          | autoria interna, gerado por `scripts/generate-audio-assets.mjs`; licença do projeto | gerado |
| `book-completed-provisional-v1` | `public/audio/book-completed.wav` | conclusão de livro | autoria interna, gerado pelo mesmo script; licença do projeto                       | gerado |

## Fixture 3D experimental

- **ID/nome:** `f1-technical-pyramid-v1` — Pirâmide técnica F1;
- **arquivo de runtime:** `src/features/library/three/fixtures/f1-technical-pyramid.glb`;
- **fonte declarativa adjacente:** `src/features/library/three/fixtures/f1-technical-pyramid.gltf`;
- **formato/tamanho:** GLB 2.0, 1.044 bytes;
- **origem:** criado especificamente neste checkout para a F1-B; não há URL ou asset externo;
- **autoria:** projeto Biblioteca Viva;
- **licença:** licença do projeto;
- **finalidade:** fixture experimental/técnico da F1 para provar ingestão por `GLTFLoader`;
- **modificações:** pirâmide low-poly e material unlit laranja definidos no GLTF declarativo e empacotados sem textura ou animação no GLB;
- **estado:** experimental/técnico/F1; não é asset artístico ou oficial da Biblioteca final.

Antes de release, todo asset do bundle deve constar aqui com origem, autoria, licença, modificações e estado. Assets futuros do mundo só entram no registro depois de existirem no checkout.

## Candidato produtivo P3D-B

Este candidato documental não é o fixture experimental F4-B de nome semelhante e não possui GLB no bundle/runtime.

### `bookshelf`

- **perfil/estado:** `grounded/static`; `candidate` (P3D-B1 concluída documentalmente), ainda não `validated` nem `production`;
- **origem/autoria/licença:** Quaternius, pacote `Quaternius Blends`; CC0 1.0 Universal, preservada em `assets/3d/source/bookshelf/upstream/Quaternius-License.txt` — SHA-256 `83d8959f9fc56353ed571fbe2dc52e4bcd64508e2399501cd45ac2ce3df0bf8c`;
- **fonte upstream preservada de partida:** `assets/3d/source/bookshelf/upstream/Bookshelf.original.blend` — SHA-256 `43b31c1c6fdb4d3c08bf9d9b1950e2f152d5e4797efb9b89bf32f23f51ab5a4d`;
- **referência histórica F4:** `assets/3d/source/bookshelf/evidence/Bookshelf-f4-work-reference.blend` — SHA-256 `20cb9b2897962cafd5412aa4c43ef6acac789bd059e41767d6e2df07b8a6dc1b`; não é a fonte produtiva final;
- **evidências preservadas:** `evidence/f4-inspect-original.txt` e `evidence/f4-inspect-normalized.txt`;
- **limite de B1:** não há fonte canônica editável normalizada, GLB produtivo, carga de runtime, catálogo ou promoção de fixture. B2 criará a fonte canônica a partir do upstream; B3 exportará e validará; B4 fará a promoção final.

## Fixtures F4-B — geometria, escala, eixos e pivô

Os itens abaixo são espécimes externos normalizados para o gate F4-B, não assets artísticos aprovados, não catálogo da Biblioteca e não um pipeline 3D permanente. A fonte editável e os originais preservados permanecem fora do checkout, no laboratório F4; os hashes identificam exatamente os GLBs incluídos.

### `f4-b-kaykit-shelf-b-large-decorated`

- **arquivo de fixture:** `src/features/library/three/fixtures/f4-b/kaykit-shelf-b-large-decorated.glb` — GLB 2.0, 44.780 bytes, SHA-256 `03e0b1af929de0a81795aea965b6cc5fbd8ac6e896e1047acef9f5d93b9debbe`;
- **origem/fonte:** pacote externo `KayKit Furniture Bits 1.0 FREE`; candidato `shelf_B_large_decorated.gltf` com binário e textura associados;
- **autoria/licença:** Kay Lousberg; CC0 1.0, conforme `License.txt` do pacote original preservado;
- **modificações:** centralização do footprint, base em `Z=0`, root `F4_KayKit_ShelfBLargeDecorated` em identidade e export GLB normalizado;
- **finalidade/estado:** prova experimental F4-B; não-final, sem uso pela cena técnica.

### `f4-b-kenney-bookcase-open`

- **arquivo de fixture:** `src/features/library/three/fixtures/f4-b/kenney-bookcase-open.glb` — GLB 2.0, 20.460 bytes, SHA-256 `6704751f18b91a68ad9689c24ea59e029c09d584264b7f089439e79683c71900`;
- **origem/fonte:** pacote externo `Furniture Kit 2.0`; candidato `bookcaseOpen.glb` extraído do pacote, com fonte editável disponível no corpus F4;
- **autoria/licença:** Kenney; CC0 1.0, conforme `License.txt` do pacote original preservado;
- **modificações:** origem positiva da fonte recentralizada em `X/Y`, base em `Z=0`, root `F4_Kenney_BookcaseOpen` em identidade e export GLB normalizado;
- **finalidade/estado:** prova experimental F4-B; não-final, sem uso pela cena técnica.

### `f4-b-polyhaven-shelf-01`

- **arquivo de fixture:** `src/features/library/three/fixtures/f4-b/polyhaven-shelf-01.glb` — GLB 2.0, 5.828.612 bytes, SHA-256 `33d55c107ea5afd314aad197f7753c64bacc88ea554df3f7e57fc8e7c81415b1`;
- **origem/fonte:** [Poly Haven — Shelf 01](https://polyhaven.com/a/Shelf_01); candidato editável `Shelf_01_1k.blend` e texturas da fonte preservados no corpus F4;
- **autoria/licença:** Gabriel Radić; CC0 1.0, declarada pela página oficial do asset;
- **modificações:** profundidade centralizada, base em `Z=0`, root `F4_PolyHaven_Shelf01` em identidade e export GLB normalizado;
- **finalidade/estado:** prova experimental F4-B; não-final, sem uso pela cena técnica. F4-C confirmou estruturalmente Base Color, normal e metallic/roughness; metallic e roughness chegam em representação compartilhada válida, e o gate humano visual não encontrou discrepância material relevante.

### `f4-b-quaternius-bookshelf`

- **arquivo de fixture:** `src/features/library/three/fixtures/f4-b/quaternius-bookshelf.glb` — GLB 2.0, 7.572 bytes, SHA-256 `aabe7de0adf6b0e3aaf651acbb5704680e44df3180ffa98aa0cb7d19d389f265`;
- **origem/fonte:** pacote externo `Quaternius Blends`; fonte editável candidata `Bookshelf.blend`;
- **autoria/licença:** Quaternius; CC0 1.0, conforme `Quaternius-License.txt` original preservado;
- **modificações:** escala `0,5` incorporada ao asset, footprint centralizado, base em `Z=0`, root `F4_Quaternius_Bookshelf` em identidade e export GLB normalizado;
- **finalidade/estado:** prova experimental F4-B; não-final, sem uso pela cena técnica. F4-C confirmou material efetivo por fatores: a imagem da fonte não participa dele, o mesh não requer UV e a ausência de imagem no GLB é legítima, não perda material.
