# Evidências dirigidas BF-5.5F2

Fixtures fictícias; quatro GLBs reais da candidata. Não são aprovação humana ou FPS Android.

- `reading-{held,sitting,reading,returned}.png`: sequência integrada real da agência/controlador e mesmo volume selecionável. Identidade, fases e métricas em `reading-sequence.json`.
- `{habitante}-{sit-mid,seated,stand-mid,study,workshop}.png`: contato/transições e escrita dos quatro. `poses.json` registra a rodada; **estudo foi atualizado após ajustar o layout**, e seus valores finais estão em `supplement-poses.json`.
- `ytha-train.png`, `samael-watch.png`: poses de mobilidade corporal e atenção nas estações reais, também em `supplement-poses.json`. Uma imagem estática não demonstra o ciclo completo.
- `rig-inventory.json`, `envelopes.json`, `animation-cpu.json`: inventário/hash/sockets, 33 poses por clip e comparação CPU Node com R5. Heap do processo não isola as versões.

Reprodução e resultados, incluindo limites e roteiro Moto G06: [relatório F2](../../../BF-5_5F2_IMPLEMENTACAO.md).
