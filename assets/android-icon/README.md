# Biblioteca Viva — selo da chama viva

Autoria original BF-5R9: códice aberto em marfim, capas em latão e sombra de encadernação, chama lilás com núcleo dourado e selo circular ameixa. A chama ocupa o lugar de um portal entre as páginas; as duas estrelas sugerem um céu vivo. Sem fontes, imagens externas ou licença de terceiros.

Fonte editável e gerador: `scripts/generate-android-icon.py` (lista de paths com cores). Exporta SVGs e VectorDrawables a partir dos mesmos paths; renderiza os legados localmente com ImageMagick 7/librsvg. Executar da raiz: `python scripts/generate-android-icon.py`. Nenhuma dependência nova no aplicativo.

`foreground.svg`: camada transparente de 108 × 108; `icon.svg`: composição com fundo; `monochrome.svg`: silhueta com recortes de páginas. A composição essencial cabe no círculo central de raio 33dp. O selo ocupa raio 29dp; a base do livro fica dentro da mesma área segura. Não há texto a perder em miniatura.

Android: background opaco #201729; foreground vetorial em drawable; adaptive normal e round em mipmap-anydpi-v26; v33 acrescenta monochrome. Legados normal com cantos arredondados e round em 48/72/96/144/192px, gerados do recorte central de 72dp. Manifesto já referencia ambos os mipmaps, portanto não precisou mudar. Removidos os foregrounds raster e vetor de template Capacitor que poderiam conflitar com a nova fonte.

Referência técnica: [Android Developers — adaptive icons](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive). As máscaras e themed icons dependem do launcher; a prévia em `docs/evidence/bf5r9/icon-preview.png` cobre integral, circular, monocromática e 48/32/24px. O ícone normal legado cobre máscara de cantos arredondados. Aprovação final na tela inicial/gaveta do Moto G06 é humana e permanece pendente.
