# Evidências BF-5R5

Capturas do **build final de produção** em Chromium 390×844, movimento reduzido, contexto descartável e conteúdo inteiramente fictício. Não são capturas do Moto G06, aceite artístico nem benchmark. `editor-*` e `detalhe-*` mostram os seis tipos; `colecao`, `arquivo`, `resumo` e `ajustes` mostram as abas convencionais; `biblioteca` e `dialogo-final` mostram o mundo/painel. Campos têm dados fictícios e as capturas de página inteira foram recolhidas com rolagem no início e animações CSS finitas concluídas.

Evidências diagnósticas preservadas: `dialogo-fallback-inspecao.png` mostra a candidata com painel fora da viewport; `dialogo-causa-corrigida.png` e `dialogue-position.json` documentam a hipótese com CSS injetado; `dialogue-position-final.json` confirma o build final **sem injeção**. Essas etapas não são apresentadas como capturas finais equivalentes.

`e2e-broad-results.json` preserva os 44 casos amplos: 19 PASS/25 FAIL, antes dos últimos refinamentos/fix de posicionamento. Não foi repetido o amplo. Regressões finais e limites estão no [relatório R5](../../docs/BF-5R5_RELATORIO.md).

Tempos de automação local incluem protocolo, espera, asserts e SwiftShader. Não comparar diretamente com a exploração concorrente R4 nem inferir ganho físico de FPS.
