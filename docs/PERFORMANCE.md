# Desempenho e estabilidade

O objetivo atual é manter o aplicativo convencional responsivo e estável em navegador e Android. Consultas relacionadas devem ser carregadas em lote, duração de sessão deriva de timestamps e listeners/players precisam respeitar lifecycle.

`npm run performance:report` relata arquivos e tamanho total dos entrypoints do build.

## Fundação 3D

Ainda não existe budget definitivo de mundo. A F1 — Three.js Foundation Spike criou o primeiro baseline identificado para uma cena mínima.

### Web

#### Baseline da F1-A

Build de produção Vite 8.1.5 em 2026-09-08, antes de Three.js:

- entrypoint JS inicial: 623.510 bytes (gzip exibido pelo Vite: 178,12 kB);
- CSS inicial: 22,48 kB (gzip 5,21 kB);
- warning existente: chunk inicial acima de 500 kB.

Depois do bootstrap com `three@0.185.1`, carregado sob demanda:

- entrypoint JS inicial: 624.850 bytes, aumento de 1.340 bytes (gzip 178,53 kB);
- CSS inicial: 23,14 kB (gzip 5,33 kB);
- chunk dinâmico `ThreeWorldRuntime`: 517.546 bytes (gzip 129,46 kB);
- o warning de chunks acima de 500 kB permanece e também alcança o chunk dinâmico Three.js.

Esses números medem arquivos do build, não FPS, frame time, memória, Android ou custo de uma cena real. A análise/otimização do chunk e as métricas do renderer pertencem aos checkpoints posteriores da F1.

#### Baseline da F1-B

Build de produção Vite 8.1.5 em 2026-09-08, com `three@0.185.1`, `GLTFLoader` e a cena técnica:

- 219 módulos transformados;
- entrypoint JS inicial: 624.876 bytes (gzip 178,53 kB), sem aumento diante da referência de 624.876 bytes da F1-A-FIX;
- CSS inicial: 23.209 bytes (gzip 5,35 kB), aumento de 69 bytes diante dos 23.140 bytes da F1-A;
- chunk dinâmico `ThreeWorldRuntime`: 604.922 bytes (gzip 152,91 kB), aumento de 87.376 bytes ou aproximadamente 16,9% diante dos 517.546 bytes da F1-A-FIX;
- nenhum novo chunk JavaScript separado: `GLTFLoader` permanece no chunk dinâmico do runtime;
- fixture `f1-technical-pyramid.glb`: 1.044 bytes, emitido como asset próprio;
- o warning de chunks acima de 500 kB permanece para o entrypoint e para o chunk dinâmico Three.js.

Diagnóstico local em Chromium/Playwright com build de produção, DPR 1, antialias ligado, sombras desligadas e viewports de 1.280 × 900 e 390 × 844:

- 46 objetos visíveis representados por meshes: 45 primitivas técnicas e 1 mesh GLB;
- 46 draw calls;
- 546 triângulos;
- 46 geometrias;
- 1 textura reportada por `renderer.info`, embora o fixture não possua textura de conteúdo;
- carregamento local observado do GLB: 195,8 ms no contexto desktop e 134,1 ms no contexto mobile emulado.

Esses tempos são amostras locais de Chromium, não benchmark estável nem evidência Android. FPS, frame time e repetição formal foram adicionados na F1-D; naquele checkpoint, o desempenho físico ainda estava pendente para o Moto G06.

#### Baseline da F1-C

Build de produção Vite 8.1.5 em 2026-09-08, após adicionar input e ponte bidirecional:

- 221 módulos transformados, dois a mais que a F1-B;
- entrypoint JS inicial: 625.738 bytes (gzip 178,74 kB), aumento de 862 bytes ou 0,14%;
- CSS inicial: 23.738 bytes (gzip 5,44 kB), aumento de 529 bytes ou aproximadamente 2,3%;
- chunk dinâmico `ThreeWorldRuntime`: 616.600 bytes (gzip 156,03 kB), aumento de 11.678 bytes ou 1,93%;
- fixture GLB permanece com 1.044 bytes;
- nenhum pacote externo ou chunk JavaScript adicional foi introduzido;
- o warning já conhecido de chunks acima de 500 kB permanece.

O highlight adiciona um draw call enquanto existe: a cena observada passa de 46 para 47 draw calls, mantendo 546 triângulos de meshes. F1-C preservou as métricas locais existentes; FPS e histórico de frame time foram adicionados na F1-D.

#### Baseline da F1-D

Build de produção Vite 8.1.5 em 2026-09-08, após lifecycle formal e observabilidade local:

- 222 módulos transformados, um a mais que a F1-C;
- entrypoint JS inicial: 627.658 bytes (gzip 179,19 kB), aumento de 1.920 bytes ou aproximadamente 0,31% diante dos 625.738 bytes da F1-C;
- CSS inicial: 24.365 bytes (gzip 5,53 kB), aumento de 627 bytes ou aproximadamente 2,64% diante dos 23.738 bytes da F1-C;
- chunk dinâmico `ThreeWorldRuntime`: 621.237 bytes (gzip 157,05 kB), aumento de 4.637 bytes ou aproximadamente 0,75% diante dos 616.600 bytes da F1-C;
- fixture GLB permanece com 1.044 bytes;
- nenhuma biblioteca externa de métricas, novo chunk JavaScript ou objeto 3D de instrumentação foi adicionado;
- o warning conhecido de chunks acima de 500 kB permanece.

Método da instrumentação:

- FPS usa os intervalos registrados por RAF em uma janela móvel de 750 ms: `(intervalos × 1.000) / tempo decorrido`;
- frame time é a média do tempo **entre RAFs** na mesma janela, não o tempo gasto dentro de `renderer.render()`;
- a janela é zerada em pause/resume, portanto uma pausa apresenta FPS/frame time como indisponíveis em vez de simular atividade;
- primeiro frame utilizável mede do início de `mount()` — antes da criação do renderer — até a primeira renderização da cena base após renderer, cena, câmera e resize estarem prontos; ele não espera pelo GLB;
- carregamento do fixture mede da chamada ao loader até o callback de sucesso e permanece separado do primeiro frame;
- draw calls, triângulos, geometrias e texturas vêm de `renderer.info`; `renderer.info.memory` conta recursos Three conhecidos e não representa RAM ou memória GPU total;
- malhas são objetos `Mesh` visíveis; selecionáveis são entradas do catálogo técnico; objetos da cena incluem também grupos e luzes visíveis;
- snapshots para React saem em no máximo 4 Hz durante o loop, além de transições relevantes; não existe timer, persistência, envio ou analytics.

Amostras locais em Chromium 151.0.7922.34 headless/Playwright 1.62.1 sobre preview do build de produção, Linux, DPR 1, antialias ligado, sombras desligadas, sem highlight e com 57 objetos visíveis da cena, dos quais 46 são meshes e 11 são selecionáveis:

| Viewport | FPS | Frame médio | Calls | Triângulos | Geometrias | Texturas | Primeiro frame | GLB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1.280 × 900 | 54,9 | 18,22 ms | 46 | 546 | 46 | 1 | 78,2 ms | 198,7 ms |
| 390 × 844 | 58,7 | 17,03 ms | 46 | 546 | 46 | 1 | 62,2 ms | 137,8 ms |

Cada linha é uma amostra curta local após estabilização da janela, não benchmark científico nem métrica Android. O headless/host pode variar agendamento e FPS. O canvas desktop observado media aproximadamente 734 × 466 CSS px; o mobile, 293,625 × 271 CSS px.

#### Baseline consolidado da F1-E

Build de produção Vite 8.1.5 em 2026-09-09, sem mudança material diante da F1-D:

- 222 módulos transformados;
- entrypoint JS inicial `index-f8yhZ15A.js`: 627.658 bytes (gzip exibido pelo Vite: 179,19 kB);
- CSS `index-BgTT1Bg_.css`: 24.365 bytes (gzip 5,53 kB);
- chunk dinâmico `ThreeWorldRuntime-Dn2TtzJj.js`: 621.237 bytes (gzip 157,05 kB);
- fixture `f1-technical-pyramid-PTGgLHNh.glb`: 1.044 bytes;
- o warning conhecido de chunks acima de 500 kB permanece no entrypoint e no chunk Three; não surgiu warning material novo.

Amostras curtas no Chromium 151.0.7922.34 headless/Playwright 1.62.1 sobre preview de produção, Linux, DPR 1, antialias ligado, sombras desligadas, 57 objetos visíveis da cena, 46 meshes e 11 selecionáveis:

| Viewport | FPS | Frame médio | Calls | Triângulos | Geometrias | Texturas | Primeiro frame | GLB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1.280 × 900 | 60,0 | 16,67 ms | 46 | 546 | 46 | 1 | 74,1 ms | 178,7 ms |
| 390 × 844 | 60,0 | 16,67 ms | 46 | 546 | 46 | 1 | 53,1 ms | 129,9 ms |

O canvas observado media 734 × 466 CSS px no desktop e 293,625 × 271 CSS px no mobile. A seleção acrescentou um highlight e elevou a amostra a 47 draw calls e 47 geometrias, sem alterar os 546 triângulos de meshes. Não houve erro de console nem overflow horizontal nas duas amostras. Essas medições são baseline web local, não aprovam desempenho Android.

### Moto G06

O gate físico da F1-F, executado em build APK da cena técnica, produziu o primeiro baseline 3D identificado no aparelho:

- FPS estabilizado em aproximadamente 60;
- pequenas quedas temporárias para aproximadamente 53–57 FPS na primeira interação com certos grupos de objetos, com recuperação rápida para aproximadamente 60;
- pan e pinch sem queda perceptível relevante e sem lag relatado;
- carregamento e reentrada rápidos, com reconstrução percebida em menos de aproximadamente um segundo;
- nenhum crash, travamento, objeto cortado, corrupção ou artefato gráfico relevante;
- aproximadamente cinco minutos de teste sem comportamento térmico anormal ou throttling perceptível.

Durante a montagem, a janela móvel ainda incompleta apresentou inicialmente aproximadamente 8–12 FPS e subiu rapidamente por valores intermediários. Esses primeiros valores representam o preenchimento e a estabilização da janela, não FPS sustentado.

A cena possui somente 46 meshes e 546 triângulos, com efeitos caros fora do baseline. O piso provisório de 30 FPS foi superado com folga nessa cena, mas aproximadamente 60 FPS não se torna requisito permanente, budget artístico nem garantia para o produto completo. Densidade, assets, iluminação, personagens, temperatura prolongada e o mundo real permanecem para F4/F5 e fases posteriores.

O usuário percebeu abertura mais rápida e maior fluidez em comparação contextual com a antiga implementação 2D removida da W3. A observação é subjetiva e não constitui benchmark científico entre Phaser e Three.js.

Registrar, quando tecnicamente disponível:

- FPS;
- frame time;
- draw calls;
- triângulos;
- geometrias;
- texturas;
- quantidade aproximada de objetos/meshes;
- tempo até o primeiro frame utilizável;
- tempo de carregamento do fixture GLTF/GLB;
- impacto no bundle;
- erros WebGL/Three relevantes;
- configuração da medição, incluindo dispositivo, viewport, DPR, antialias, sombras, quantidade de objetos, versão do Three.js e tipo de build.

Para a cena padrão em build de produção no Moto G06, a F1 usa como **piso provisório de viabilidade**:

- 30 FPS sustentados durante interação normal;
- 45–60 FPS como faixa desejável, sem exigir 60 FPS constantes;
- ausência de crashes, congelamentos recorrentes ou degradação evidente de lifecycle.

Esse piso é um critério de spike, não um budget artístico permanente. Deve ser recalibrado a partir da evidência física.

Se a cena mínima ficar persistentemente abaixo do piso, é permitida uma única rodada curta e registrada de correção/otimização de causas plausíveis. Se o bloqueio estrutural persistir, Three.js não deve ser aprovado e outra alternativa poderá ser estudada sequencialmente.

O baseline físico reduz a incerteza da cena mínima, mas o desempenho 3D no Moto G06 permanece risco ativo para cenas complexas.
