# Registro de assets e licenças

O baseline ativo possui dois assets de áudio e um fixture 3D técnico da F1, todos de autoria interna:

| ID | Arquivo | Uso | Origem/licença | Estado |
|---|---|---|---|---|
| `ui-page-provisional-v1` | `public/audio/ui-page.wav` | navegação | autoria interna, gerado por `scripts/generate-audio-assets.mjs`; licença do projeto | gerado |
| `book-completed-provisional-v1` | `public/audio/book-completed.wav` | conclusão de livro | autoria interna, gerado pelo mesmo script; licença do projeto | gerado |

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
