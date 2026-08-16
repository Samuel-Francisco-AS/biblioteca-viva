# Desempenho e estabilidade

> Baseline técnico do Prompt 18: 2026-08-11. Este documento não aprova G9.

## 1. Política

Medir antes de otimizar. Alterações são justificadas apenas por gargalo real ou risco estrutural demonstrável; avisos isolados não motivam split, cache, pool ou modo gráfico ornamental. Nenhuma métrica inclui títulos, autores, notas ou citações.

## 2. Orçamento atual da sala

- uma instância Phaser e um canvas durante a montagem; zero após desmontagem;
- cena procedural fixa, com 13 objetos no display list raiz atual e elementos filhos agrupados;
- quatro zonas interativas fixas;
- até três tweens contínuos (bibliotecária, criatura e destaque), um tween transitório de desbloqueio e no máximo um tween finito de atmosfera;
- zero tween repetitivo com movimento reduzido;
- correspondência direta de uma representação por livro entre um e cinco livros; acima disso, compressão gradual e determinística até oito grupos visuais, inclusive com 100 livros ou mais;
- zero partículas, shaders próprios, pós-processamento, física, câmera móvel ou atlas/textura própria carregada atualmente.

O Phaser recebe somente `LibraryViewModel`, nunca entidades completas, títulos, autores ou anotações. O destaque visual contém apenas ID técnico, status e resumo de progresso e usa rótulo genérico na cena. A projeção faz duas consultas em paralelo na rota (livros e marcos), sem N+1, e resume coleções maiores sem crescimento linear ilimitado. A política produz 0, 1, 2, 3, 4 e 5 grupos para os primeiros livros, 6 para 10, 7 para 15 e no máximo 8 para 20, 100 ou mais.

## 3. Métricas automáticas

O painel já existente de diagnóstico, disponível em desenvolvimento ou em build interno com `VITE_ENABLE_DIAGNOSTICS=true`, agora mostra estado e gerações do host, instâncias criadas/ativas/destruídas, canvas no host, listeners de visibilidade e observers pertencentes ao host, tempo entre início da importação e instância pronta, FPS aproximado reportado pelo loop Phaser, objetos do display list raiz, zonas interativas e tweens ativos. O sampling do runtime ocorre uma vez por segundo somente enquanto esse diagnóstico está habilitado e é cancelado no cleanup.

`AudioService.diagnostics()` expõe apenas estado técnico: música desejada, suspensão, efeitos pendentes e quantidades de música/efeitos conhecidas pelo serviço. Dispose zera os registros. Não há tentativa de enumerar listeners privados globais ou memória não padronizada do navegador.

A prova determinística monta e desmonta o host 20 vezes com factory fake. Em cada ciclo há uma instância e um canvas; após unmount há zero, o observer é desconectado, o listener próprio é removido e a instância é destruída. Testes adicionais cobrem import tardio, desmontagem durante import/criação, falha parcial, visibility repetida, resize repetido/idêntico, troca de proporção, projeção, reduced motion, tweens próprios e lifecycle de áudio idempotente.

Tempos em jsdom e FPS fora do aparelho são diagnósticos, não metas de regressão: não há asserção frágil de milissegundos.

## 4. Bundle baseline

Build normal Vite de 2026-08-11:

| Chunk | Papel | Bytes | Gzip | Inicial |
| --- | --- | ---: | ---: | --- |
| `index-DiMT4q6b.js` | React, aplicação e infraestrutura web | 552.482 | 164.680 | sim |
| `createPhaserGame-CIO4E9qb.js` | Phaser 3.90 e sala | 1.221.123 | 325.960 | não, dynamic entry |
| `web-DwIi11bH.js` | adapter web Filesystem | 8.488 | 2.840 | não |
| demais chunks Capacitor | adapters carregados sob demanda | até 1.322 cada | até 690 | não |
| `index-D2dX1HQk.css` | estilos | 16.629 | 3.600 | sim |

O manifesto de build é gerado em `dist/.vite/manifest.json`. `npm run performance:report` falha se `createPhaserGame` deixar de ser dynamic entry e registra os tamanhos reais sem depender de hashes fixos.

O aviso >500 kB é aceitável para o chunk lazy do Phaser: o motor responde pela maior parte dos 1,22 MB, não participa do startup inicial e só é importado quando a Biblioteca pronta monta o host. Split manual ocultaria o aviso sem reduzir bytes ou parse total ao entrar na sala. O chunk inicial também excede 500 kB bruto, porém possui 164,68 kB gzip; nenhum gargalo físico de startup foi medido. Medido/inspecionado; nenhuma divisão adicional justificada.

Plugins Android de arquivos continuam em imports dinâmicos. O áudio usa Web Audio nativo, sem biblioteca externa.

## 5. Assets e offline

Os seis WAVs locais somam 791.418 bytes: música 705.644; os cinco efeitos 85.774. São provisórios, auditáveis e menos de 1 MiB. Como o ganho no APK é pequeno nesta etapa, não houve conversão para OGG nem aumento de complexidade de manifesto/fallback. O backend busca/decode o cue somente após gesto e intenção; não há autoplay ou preload remoto.

A sala visual atual é procedural e seu manifesto não carrega imagens. Conteúdo, áudio e persistência são locais. Não existe fetch remoto obrigatório, CDN ou serviço de rede essencial. Offline significa ausência de dependência externa, não instalação de PWA/service worker.

## 6. Lifecycle, memória estrutural e interação

O host possui exatamente um listener `visibilitychange` e um `ResizeObserver` (ou listener de resize como fallback), ambos removidos antes de destruir a instância. Eventos equivalentes são idempotentes. Resize idêntico é ignorado; mudança de proporção redimensiona a mesma instância, reconcilia movimento e preserva projeção/preferências. A cena remove listeners Phaser, zonas, labels, seleção, tweens próprios e handler React no shutdown.

O áudio mantém no máximo uma música conhecida, interrompe efeitos no pause/mute/dispose e não cria segunda música em resume ou entrada repetida. R1-B adicionou cache limitado aos sources locais efetivamente preparados/reproduzidos: `music.library` é preparada após unlock, fetch/decode concorrentes compartilham a mesma promessa e novas entradas reutilizam o buffer; `dispose` limpa o cache. A música reinicia após pause/resume conforme limitação aceita. Não há polling, timer artificial ou preload remoto.

R2 mantém o mesmo cache e acrescenta somente índice/generation counters limitados. Término natural chega pelo callback real do backend; não há polling nem timer de duração. Player antigo não avança a playlist depois de stop, saída ou dispose, e playback silencioso indisponível não cria ciclo de tentativas. A consulta do Arquivo continua carregando livros, notas e citações uma vez e filtra o estado atualizado em memória, sem N+1.

No build de R2 de 2026-08-16, o chunk inicial mede 568.210 bytes (168.170 gzip), o CSS 16.920 bytes (3.650 gzip) e o Phaser lazy 1.220.999 bytes (325.920 gzip). O manifesto confirma `createPhaserGame` como dynamic entry. O aumento do inicial em relação ao baseline documentado é compatível com os casos de uso, adapter e UI de gerenciamento; não foi observado motivo para split artificial.

## R3 — medição final técnica

O build R3 mede 572.410 bytes no JS inicial (167.886 gzip), 21.688 bytes de CSS (4.915 gzip) e 1.222.044 bytes no chunk Phaser lazy (323.038 gzip). `createPhaserGame` permanece dynamic entry. A cena acrescentou um `Graphics` de atmosfera e removeu o container de labels que conflitava com as camadas React: o display list raiz permanece em 13, com quatro zonas fixas e menos textos WebGL. Movimento normal mantém até três loops existentes e, somente durante troca de período, um tween finito de 500 ms; reduced motion mantém zero loops e troca imediata.

Em produção, atmosfera possui um timer único até a próxima fronteira e um listener de visibilidade, ambos limpos no dispose. O intervalo de amostragem de um segundo continua exclusivo do diagnóstico DEV/interno. Drawer, sheet, período, projeção e resize atualizam a mesma instância; a prova estrutural de 20 ciclos mantém zero canvas, instância, observer e listener próprios depois de cada unmount. Não há física, tilemap, shader, partículas, polling de período ou objeto por livro. Medição física de FPS, aquecimento e uso prolongado permanece pendente no Moto G06.

Não foram encontrados registries crescentes, URLs Blob da sala, caches próprios sem liberação ou players registrados após dispose. `performance.memory` e memória real da WebView não são portáveis/confiáveis e não são reportadas. Context loss WebGL não recebeu simulação destrutiva; tela preta persistente continua falha crítica do checkpoint físico.

Clique/toque válido emite a interação diretamente no `pointerup`, sem timer artificial. O limite arquitetural de resposta comum próxima de 100 ms permanece para medição física; testes estruturais não alegam latência real Android.

## 7. Achados e alterações do Prompt 18

| Classificação | Evidência | Ação |
| --- | --- | --- |
| risco estrutural | contabilidade anterior via painel cobria apenas instâncias | adicionadas métricas próprias de canvas, lifecycle, observer, criação, cena e áudio, com cleanup |
| risco estrutural | não existia prova única de 20 ciclos | adicionada prova determinística de 20 montagens/desmontagens |
| aviso aceitável | Phaser 1.221.123 bytes, mas lazy | documentado; sem split artificial |
| não aplicável | partículas, shaders, física, atlas, context loss automatizável | nenhuma infraestrutura criada |
| sem gargalo comprovado | WAVs <1 MiB, projeção limitada, resize e reduced motion já controlados | mantidos deliberadamente |

Antes: painel contava instâncias, geração e estado; o lazy boundary era testado por fonte. Depois: recursos possuídos são observáveis e zerados, áudio expõe contagens técnicas, 20 ciclos provam ausência de crescimento e o manifesto comprova o chunk lazy/tamanhos. Não houve mudança de regra de negócio, persistência, schema, backup, asset, dependência, permissão ou versão.

## 8. Perfil físico futuro — G9

No Moto G06 e, se disponível, em uma segunda configuração Android:

1. usar APK diagnóstico e registrar versão/hash, Android e condições iniciais;
2. abrir/fechar a Biblioteca 20 vezes e confirmar canvas/instância/recursos zerados;
3. usar por 30 minutos alternando rotas, diálogo, áudio, progresso e background;
4. registrar FPS e frame pacing reais, memória da WebView pelo Android Studio Profiler, temperatura e eventual pressão com outros apps;
5. avaliar abertura e toque percebidos, scroll, texto ampliado, alto contraste, reduced motion e TalkBack;
6. alternar offline, pause/resume, retorno do background e rotação física;
7. observar tela preta/context loss real e degradação após pressão de memória.

Continuam pendentes: FPS real, frame pacing, memória, temperatura, toque e abertura percebidos, outros apps, background real, rotação física, context loss e estabilidade de 30 minutos. G9 permanece aberto.
