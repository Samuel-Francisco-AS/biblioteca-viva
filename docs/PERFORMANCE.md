# Desempenho e estabilidade

O objetivo atual é manter o aplicativo convencional responsivo e estável em navegador e Android. Consultas relacionadas devem ser carregadas em lote, duração de sessão deriva de timestamps e listeners/players precisam respeitar lifecycle.

`npm run performance:report` relata arquivos e tamanho total dos entrypoints do build.

## Fundação 3D

Ainda não existe budget definitivo de mundo. A F1 — Three.js Foundation Spike criou o primeiro baseline identificado para uma cena mínima.

### Fronteira F4/F5

F4 concluiu provas controladas por asset: mediu tamanho, geometria, materiais e texturas dos quatro fixtures e identificou no Poly Haven um custo concentrado nas imagens. A variante externa 512 reduziu payload e a estimativa RGBA8 base daquele único asset, sem medir performance física nem criar budget.

F5 foi responsável pelo aprofundamento de densidade de cena, frame time, estabilidade, Android físico, temperatura e limites de conteúdo; seus resultados sobreviventes são o envelope físico observado e os guardrails documentados, sem hard budgets. Custo individual de asset e redução estrutural não aprovam esses aspectos.

### F5-A — cenário reproduzível, sem budget físico

F5-A reutiliza a instrumentação F1-D: FPS e frame médio são a janela móvel de RAF, e draw calls, triângulos, geometrias e texturas vêm de `renderer.info`; meshes e objetos visíveis são contados na cena. O diagnóstico também informa o cenário e `assets carregados/total`. Nada disso representa RAM/GPU totais nem substitui uma medição física.

O seletor temporário existe somente no build de diagnóstico (`npm run android:build:diagnostics`) e remonta o runtime real ao trocar de carga. A composição estática é:

| Cenário | GLBs totais | Corpus F4 | Incremento estrutural conhecido sobre F1 |
| --- | ---: | ---: | --- |
| Baseline F1 | 1 | 0 | referência atual: 46 meshes e 546 triângulos |
| Corpus F4 | 5 | 1× KayKit, Kenney, Poly Haven, Quaternius | +4 meshes, +1.104 triângulos do corpus |
| Corpus F4 ×4 | 17 | 4× o mesmo corpus | +16 meshes, +4.416 triângulos do corpus |

As contagens finais de draw calls, geometrias e texturas são observadas após o carregamento pelo renderer do ambiente medido — não são estimadas nesta tabela. A F5-A não estabelece FPS mínimo, orçamento de draw calls/triângulos/texturas, resolução máxima nem conclusão sobre densidade aceitável. O Moto G06 na F5-B é a autoridade para esses resultados.

Como verificação do harness, Chromium headless local (viewport 390×844, DPR 1, após `assets carregados/total`) observou os valores abaixo. São somente confirmação de composição e de `renderer.info`; FPS/frame médio locais não são evidência do Moto G06.

| Cenário | Calls | Triângulos | Geometrias | Texturas | Meshes | Objetos | FPS / frame médio local |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Baseline F1 | 46 | 546 | 46 | 1 | 46 | 57 | 60,0 / 16,67 ms |
| Corpus F4 | 50 | 1.650 | 50 | 1 | 50 | 65 | 60,0 / 16,67 ms |
| Corpus F4 ×4 | 62 | 4.962 | 62 | 1 | 62 | 89 | 51,9 / 19,26 ms |

O `textures=1` acima é a contagem observada naquele renderer/execução, não estimativa de memória, declaração sobre as imagens do corpus nem valor a ser transformado em limite.

### F5-B — evidência física no Moto G06, sem budget

Em 2026-09-17, F5-B usou o APK de diagnóstico no Moto G06 (`motorola moto g06`, Android 15/API 35, build `VVOB35.78-202`, pacote `com.samuelfrancisco.bibliotecaviva`, `versionName 1.0`/`versionCode 1`). O USB permaneceu conectado e carregando; a bateria variou de 91% a 94% e de 30,0°C a 33,0°C. Essa condição pode afetar a temperatura e não representa operação desconectada.

Antes da coleta, o log da WebView mostrou que a CSP bloqueava `blob:` em `connect-src`. O `GLTFLoader` cria esses URLs para imagens embutidas dos GLBs; as malhas eram anexadas, mas os maps não carregavam. A correção mínima permite `blob:` somente nessa diretiva e foi revalidada humanamente. Portanto, os dados abaixo são do APK corrigido, com os maps visíveis.

`renderer.info.memory.textures` é lido depois de renderizações contínuas e também após cada asset carregado; não estava stale. No Three r185, ele conta recursos WebGL criados, não bytes de GPU/RAM nem imagens/maps declarados. Para tornar isso explícito somente no diagnóstico, o runtime também conta referências de `Texture` em materiais e instâncias `Texture` únicas na cena após o load. São medidas complementares, não equivalentes. O cenário F4 confirmou 5 referências/4 instâncias únicas e 5 recursos reportados; F4 ×4, 20/16/17 respectivamente. A diferença de um recurso em cada caso é compatível com o recurso já presente no baseline e não deve ser interpretada como memória total.

As amostras comparáveis em repouso usaram a janela RAF existente de 750 ms, já estabilizada, com cenário sem seleção/highlight. `frame médio` é o intervalo entre RAFs, não duração de `renderer.render()`. Calls/triângulos/geometrias de `renderer.info` são valores do frame atual e podem variar com visibilidade/câmera/highlight; meshes/objetos são contagens da cena naquele estado.

| Cenário | GLBs | FPS médio (min–max) | Frame médio | Calls | Triângulos | Geometrias | Texturas renderer | Maps / Texturas únicas | Meshes / Objetos | GLB interno | Primeiro frame |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Baseline F1 | 1 | 60,06 (60,0–60,1) | 16,65 ms | 46 | 546 | 46 | 1 | 0 / 0 | 46 / 57 | 28,0 ms | 118,1 ms |
| Corpus F4 | 5 | 60,07 (60,0–60,1) | 16,65 ms | 50 | 1.650 | 50 | 5 | 5 / 4 | 50 / 65 | 579,1 ms | 257,7 ms |
| Corpus F4 ×4 | 17 | 60,07 (60,0–60,1) | 16,65 ms | 62 | 4.962 | 62 | 17 | 20 / 16 | 62 / 89 | 1.039,8 ms | 164,1 ms |

`GLB interno` mede da abertura dos loads do cenário até todos os callbacks terminarem. Corpus F4 e ×4 foram trocas/remounts no processo já vivo; não são transferências de payload quatro vezes nem comparação de cache frio. Uma segunda troca para ×4 marcou 924,9 ms. A abertura via `am start -W` teve 2.727 ms de tempo total da Activity, medida diferente e não diretamente comparável ao tempo interno do runtime.

`dumpsys meminfo` após estabilização inicial cresceu de 483.004 KiB PSS/304.910 KiB Graphics no baseline para 547.230/342.942 no corpus e 648.377/439.914 no ×4. Remounts repetidos atingiram transitoriamente 731.891 KiB PSS/525.590 KiB Graphics no segundo ×4; depois de background/resume, o mesmo cenário voltou a 313.705/182.454 KiB e a sessão prolongada ficou entre 307.369–318.349 KiB PSS e 182.006–191.326 KiB Graphics. `meminfo` não mede VRAM/GPU com exatidão; o padrão observado inclui caches/allocator/WebView e não sustenta diagnóstico de leak, embora a pressão transitória de remount deva ser considerada em F5-C.

`dumpsys thermalservice` permaneceu em `Thermal Status: 0`. O serviço expôs entradas de sensores rotuladas CPU/GPU/SOC entre 44,6°C e 52,2°C, além de entradas estáveis de 48,8°C; não é seguro convertê-las em temperatura exata de GPU/SoC. A temperatura de bateria foi 31,0–33,0°C durante a coleta. Não houve aquecimento percebido pelo avaliador, throttling declarado pelo Android, crash, kill, WebView instável ou perda persistente de responsividade.

O avaliador humano confirmou os três cenários, pan, pinch/extremos de zoom, picking somente dos objetos F1, portrait/landscape/portrait, background/resume antes e depois da sessão e aproximadamente 15 minutos no F4 ×4 em blocos de repouso e navegação. Em ~5/~10/~15 minutos, FPS médio foi 59,95/59,94/59,94 e frame médio 16,69/16,69/16,69 ms, sem travamento, tela preta, recarregamento, artefato, queda de fluidez ou aquecimento percebido. Os assets F4 diagnósticos não são selecionáveis por design e isso não foi objetivo da F5-B.

Essa evidência não fixa 30/60 FPS, máximo de draw calls, triângulos, texturas, tamanho de GLB ou resolução. Não foram criados cenários extras porque o ×4 já diferiu em loading e memória; não foram adotados KTX2/Basis, Draco, Meshopt, LOD, instancing, atlas, streaming ou `AssetManager`. F5-C consolidou a curva abaixo como envelope e guardrails de remedição, sem promover budgets numéricos.

### F5-C — consolidação: envelope, não teto

F5-C encerra a interpretação sem nova sessão física. O maior cenário observado — 62 calls, 4.962 triângulos, 62 geometrias, 17 recursos WebGL de textura, 62 meshes e 89 objetos sem seleção — é um **envelope físico validado**, não a capacidade máxima do Moto G06. A ausência de queda até esse ponto demonstra que não foi identificado gargalo de renderização neste corpus; ela não extrapola para personagens, skinned meshes, animação, transparência intensa, sombras/iluminação mais caras, partículas, pós-processamento ou Biblioteca real.

| Categoria | Classificação F5-C | Decisão operacional |
| --- | --- | --- |
| Renderização | Envelope observado sem teto conhecido | Não há hard cap de FPS, calls, triângulos, geometrias, meshes ou objetos. Remedir no Moto G06 antes de carga materialmente maior ou qualitativamente diferente. |
| Loading | Guardrail provisório | Os ~1.040 ms internos do ×4 são ordem de grandeza que dispara remedição quando um fluxo real de montagem/remount a alcançar ou superar; não são SLA, limite UX ou medida de cache frio. |
| Memória | Guardrail provisório | Não há cap de PSS/Graphics. Evitar multiplicar recursos simultâneos sem necessidade e capturar `meminfo` ao superar materialmente 17 GLBs/16 `Texture` únicas ou se remounts mostrarem picos recorrentes. |
| Texturas | Envelope observado sem teto conhecido | Manter separadas as três métricas: recursos WebGL de `renderer.info`, referências de map e `Texture` únicas. Nenhuma é bytes de GPU; não há resolução, formato ou quantidade global aprovada. |
| Estabilidade/lifecycle | Envelope observado sem teto conhecido | O ×4 passou interação, orientação, background/resume e ~15 min sem falha. Alterações de lifecycle, carregamento ou renderização exigem nova prova física. |
| Térmica | Dado insuficiente para limite | `Thermal Status: 0` e ausência de aquecimento percebido somente descrevem a sessão USB/carregando; não definem temperatura segura, throttling ou duração máxima. |

O harness permanece versionado como ferramenta de desenvolvimento: é carregado apenas quando `VITE_ENABLE_DIAGNOSTICS=true`, mantém o build normal na fixture F1 e fornece uma escada reproduzível sem criar catálogo, `AssetManager`, cache ou contrato espacial. Não foi removido/refatorado porque isso alteraria uma ferramenta fisicamente aprovada sem ganho proporcional; sua revisão cabe quando o primeiro conteúdo real precisar de outro experimento.

Não há justificativa presente para KTX2/Basis, Draco, Meshopt, LOD, instancing, atlas, merge, streaming, preload/cache avançado ou `AssetManager`. Cada hipótese só reabre diante de gargalo físico correspondente no conteúdo real: respectivamente pressão de textura/loading, payload/parse geométrico, densidade de desenho/triângulos, repetição de objetos, ou necessidade concreta de manter conjuntos grandes fora da cena simultânea. A variante Poly Haven 512 continua externa e experimental.

A FUNDAÇÃO concluída herda Three.js/WebGL e a prova física F5, mas não um mundo final, Pipeline 3D, persistência espacial ou budget artístico. F6 fechou tecnicamente a fronteira acessível sem nova medição; TalkBack e a auditoria humana correspondente não foram aprovados e permanecem dívida obrigatória antes do fechamento do primeiro recorte real e de beta/release aplicável. Não houve nova validação física nesta F5-C.

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

#### Baseline de bundle da F2-F

Build de produção Vite 8.1.5 em 2026-09-09, após o endurecimento do runtime:

- 222 módulos transformados;
- entrypoint JS inicial `index-DIVNhyZY.js`: 628.314 bytes (gzip exibido pelo Vite: 179,39 kB), aumento de 656 bytes diante da F1-E;
- CSS `index-oRZ44BBB.css`: 24.520 bytes (gzip 5,53 kB), aumento de 155 bytes;
- chunk dinâmico `ThreeWorldRuntime-azpYH93M.js`: 624.748 bytes (gzip 157,94 kB), aumento de 3.511 bytes ou aproximadamente 0,6%;
- fixture `f1-technical-pyramid-PTGgLHNh.glb`: 1.044 bytes;
- a divisão dinâmica do runtime Three e o warning conhecido de chunks acima de 500 kB foram preservados; não surgiu warning material novo.

O relatório desta etapa mede artefatos do build. Não foram coletadas novas amostras de FPS/frame time para transformar a regressão técnica em benchmark de renderização ou desempenho Android.

#### Gate técnico F3-F1

Build de produção Vite 8.1.5 em 2026-09-09, para a regressão consolidada de câmera/interação:

- 224 módulos transformados;
- entrypoint JS inicial `index-NDqKuRIY.js`: 628.314 bytes (gzip 179,39 kB), sem mudança diante da referência F2-F;
- CSS `index-CcRs4yq-.css`: 24.540 bytes (gzip 5,54 kB), aumento de 20 bytes;
- chunk dinâmico `ThreeWorldRuntime-DanH6PBH.js`: 629.884 bytes (gzip 159,47 kB), aumento de 5.136 bytes ou aproximadamente 0,8% diante da F2-F;
- fixture GLB: 1.044 bytes; nenhum pacote externo, chunk adicional ou alteração Android nativa foi introduzido;
- o warning conhecido de chunks acima de 500 kB permaneceu.

`npm run performance:report` registrou somente os artefatos acima. Não houve nova coleta de FPS ou frame time nesse gate; a validação humana ampla posterior da F3 registrou observação de fluidez no Moto G06, sem transformá-la em benchmark.

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

### Observação humana da F2 — revalidação física curta

Separadamente do baseline físico da F1-F, a revalidação humana curta da F2 no Moto G06 registrou os seguintes comportamentos transitórios:

- na rotação/orientação, aproximadamente 37–45 FPS, com recuperação e estabilização em aproximadamente 60 FPS;
- na sequência extrema zoom-out até o máximo e zoom-in até o máximo, aproximadamente 45–48 FPS, com recuperação e estabilização em aproximadamente 60 FPS.

Não houve degradação sustentada, crash ou travamento. Essas observações são não bloqueantes: não constituem benchmark formal, não comprovam regressão e não atribuem causalidade à F2 sem evidência. Permanecem disponíveis para reavaliação em F3, no contexto de ergonomia e extremos de zoom, e em F5, no contexto de performance, frame time e Android físico. Elas não aprovam performance do mundo final, temperatura prolongada, densidade real da Biblioteca ou budget artístico.

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

### Fechamento da F3 — observação humana no Moto G06

Na validação humana ampla da F3, o FPS permaneceu aproximadamente em 60 ou muito próximo durante as interações de câmera e também durante rotação. Pan e pinch foram percebidos como fluidos, sem crash, travamento ou regressão funcional perceptível. É uma observação da fixture técnica em uso humano: não é benchmark científico, budget definitivo nem garantia de desempenho para o mundo final. Naquele checkpoint, o aprofundamento de performance e Android físico permanecia reservado à F5.

O APK gerado após o fix final dos bounds não recebeu revalidação física específica; portanto, esta observação não comprova fisicamente aquele fix.
