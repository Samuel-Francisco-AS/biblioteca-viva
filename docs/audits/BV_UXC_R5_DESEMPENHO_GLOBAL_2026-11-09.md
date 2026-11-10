# BV-UXC R5 — intervenção global de desempenho

Candidata de 09/11/2026 na [PR #49](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/49), **draft, sem merge ou aceite físico**. Missão específica do proprietário autoriza investigação, refatorações, commits, push e APK; não inicia BF-5.6G nem migração de engine. Não foram solicitados workflows/serviços pagos. Commits usam `[skip ci]`.

## Proveniência e método

`git fetch origin` e conector GitHub confirmaram inicialmente: checkout limpo e branch `feat/bv-ux-touch-continuity-2026-11-09` em `00edaf745ee6167946819c7ff2ea2916c4db7c5a`; PR aberta/draft, não integrada; `main`/base `a637bc8b8466fd1012a6b3edfff3fe1075f179a6`, ancestral da candidata. Não havia trabalho remoto posterior a incorporar.

Autoridades consultadas: AGENTS, STATUS/índice/ROADMAP/CHANGELOG, ADRs aplicáveis (especialmente 009, 015, 025–029), relatório BV-UXC, auditoria de arquitetura/performance/stack, R5P/R5Q, evidências de integridade pós-R3, PERFORMANCE/ANDROID. Documentação foi confrontada com código de shell/rotas, registros, sessões, mundo, arena, salas, repositórios, transações, styles, bundle e integração nativa. Não se afirma revisão formal de cada linha ou de toda regra do RPG.

Primeiro foi compilada a R4 sem alterações e executado um recorte de regressão: **65 PASS / 4 FAIL em 6 arquivos**. Os quatro defeitos do recorte eram: duas expectativas antigas sem o opt-in `deferPicking`, ordem de tabulação anterior ao novo diagnóstico e callback diferido que ainda executava em scheduler cancelado do teste. As expectativas foram atualizadas preservando asserts; o cancelamento recebeu guarda explícita, inclusive se uma callback obsoleta for entregue. Não se apagou nenhum assert ou aumentou timeout.

`scripts/profile-interactions.mjs` usa Chromium de produção em contexto temporário próprio, viewport 412×915, banco vazio fictício, sem throttling. Conta operações nativas de IndexedDB e gravações de Storage, observa long tasks e intervalos RAF, percorre seis trocas de sala e digita a mesma frase. Nenhum banco pessoal foi aberto, exportado, apagado ou restaurado. A contagem é de APIs observadas, não de bytes de disco ou tempo nativo. O tempo entre clique capturado e título observado mais dois RAFs inclui automação: **não é apresentação de pixels nem prontidão exata**.

ADB disponível, **nenhum aparelho conectado**. Não foram possíveis Perfetto, Chromium remoto do Android, GPU/driver real, alocações/GC isolados, temperatura, TalkBack, input-to-photon ou memória sustentada. Os números R3 do Moto G06 são contexto anterior, não baseline físico R4/R5.

## Diagnóstico e intervenção

Severidade abaixo ordena trabalho evitável e frequência; não atribui toda a lentidão física a uma causa única.

| Prioridade / subsistema | Causa e evidência | Impacto / frequência | Correção / risco |
| --- | --- | --- | --- |
| Alta — React/rotas/Arcanário | `AppErrorBoundary key={pathname}` destruía a subárvore saudável, incluindo provedor. Replay: **8 leituras / 2 transações por sala**, mesmo com acervo vazio. | Cada caminho novo; leitura, parsing, montagem e efeitos repetidos. | `resetKey` recupera somente falhas; provedor acompanha a visita ao Arcanário. Chaves ficam nos formulários/partidas cuja identidade realmente muda. Risco: estado indevido entre IDs; regressões cobrem isolamento e recuperação. |
| Alta — Oficina/editores TCG | Cleanup do efeito dependente de `draft` serializava e escrevia Storage a cada mudança antes do debounce. Replay: **36 escritas** por frase. | Cada tecla/controle; rascunho pode incluir imagem local. | Timer separado dos listeners e do flush de saída; referência contém último draft confirmado. **1 escrita** no mesmo roteiro; ocultação/pagehide/unmount continuam imediatos, save final impede ressurreição. Risco de perda de rascunho coberto por regressões. |
| Alta — registros/Estudos/dados | `list()` fazia consulta de vínculos por estudo e `getCard` sequencial por vínculo. Alimenta Biblioteca, Coleção, Arquivo e seletores de telas. | Cresce com estudos e cards, repetido a cada consulta/reentrada. | Uma busca indexada de vínculos para o conjunto de estudos + `bulkGet` deduplicado; mesma transação readonly e parsing estrito. Ordem, texto integral, arquivo e referências inválidas preservados. `bulkGet` ainda pode fazer um request nativo por chave: não se promete O(1) de I/O. |
| Média — consultas do Arcanário | `ArcanariumService.list()` usava o runner `rw` abrangendo 15 tabelas, embora só lesse. | Toda consulta completa; concorrência desnecessária com gravações de outras áreas. | Snapshot atômico `r` das sete tabelas necessárias dentro do repositório. Comandos e validação transacional permanecem `rw`. Teste verifica modo e ausência de tabelas alheias; sem cache ou schema novo. |
| Média — navegação dock/portal orbital | Espera deliberada de dois RAFs ainda existia fora do picking R4. | Cada ativação, ampliada quando RAF já está atrasado. | Microtask cancelável na mesma rodada de eventos, sem atraso de apresentação. Feedback/links modificados/Voltar preservados. Removido o mecanismo anterior, sem spinner para esconder CPU. |
| Média — arena | Effect de seleção/atividade chamava `world.update(view)`, reconciliava entidades, reposicionava cartas e republicava âncoras sem nova revisão. Também cancelava/reabria RAF. | Seleção, painel e alterações de atividade. | Atualizar campo/âncoras somente se view ou layout mudarem; seleção só destaca. Loop existente continua quando já ativo. Cleanup idempotente também em falha parcial de inicialização; descarte de renderer/scene coberto. |
| Média — Acervo/Relicário | Filtro serializava todo conteúdo de cada carta mesmo quando busca estava vazia, e repetia em cada tecla/filtro. | Acervos grandes e digitação. | Busca vazia não serializa; índice textual por referência imutável de `data.cards` durante busca ativa, invalidado na recarga. Sem cache global/persistente; sem alteração de resultados. |
| Baixa — fronteira React/Three/layout | Identidade neutra de cena reconstruída em renders de seleção; shell escrevia CSS antes de terminar leituras geométricas; consultas independentes da Biblioteca começavam em cascata. | Seleções/rotas, resize e retorno à Biblioteca. | Identidade memoizada pelo snapshot; medir antes de escrever variáveis e não repetir valor igual; queries iniciadas juntas com mesma proteção de geração. Não se declara ganho de milissegundos sem trace. |
| Alta — picking R4, validação | Histórico físico R3 comprovava skinning caro, mas R4 ainda não tinha teste executado. | Habitantes e precisão de objetos próximos/aninhados. | Quatro GLBs reais, magia/caminhada, dois zooms e rotação testados sem leitura de vértices/caixa exata. Objetos aninhados e profundidade mantêm regressões. R4 preservada; não se assume redução física já medida. |

## Contratos e arquivos

- **Shell:** `App.tsx`, `AppErrorBoundary`, `PrimaryDock`, `interactionContinuity`, `pages.tsx`. Remontagem apenas onde identidade de registro/editor/partida exige; Biblioteca continua residente, `hidden/inert` e pausada fora da rota. Não foi criado cache de páginas inteiras que retenha consultas ou formulários indefinidamente.
- **Arcanário:** `ArcanariumPage`, `Catalogue`, `Workshop`, `DuelDecks`, `drafts`. Provedor possui escopos explícitos portal/arena/completo; reload estável, invalidado por geração, ignora conclusão antiga e unmount. Portal/arena mantêm leitura mínima. Salas continuam lazy e recargas explícitas após comandos/retorno de visibilidade preservam consistência. Saída da arena provoca nova leitura completa ao voltar ao salão.
- **Infraestrutura:** `repositories.ts`, `arcanariumRepository.ts`, consulta `ArcanariumService.list`. O repositório mantém snapshot consistente; invariantes e erros continuam validados. Não se introduziu worker, cache de banco, novo evento, schema, migração ou formato de backup.
- **Three:** `WorldHost`, `ThreeWorldInteraction` e `ArenaCanvas`. Não se alteraram os quatro assets, shaders, luzes, DPR, qualidade, motor TCG ou animações. `worldPickBroadphase` recebeu narrowing seguro de `BufferGeometry`, removendo erros de lint preexistentes da R3. Formatação das folhas e auxiliares R3/R4 é apenas whitespace.
- **Diagnóstico:** extensão do `uiActionProbe`, sem sistema paralelo. Até 20 ações anônimas, 600 intervalos RAF, resumo de long tasks globais e reconciliação React nos Profiler existentes na subárvore. A callback de Profiler não publica estado nem dispara outra renderização do próprio diagnóstico. Desativar/fechar/desmontar cancela observador/loop e invalida callbacks anteriores; ocultação separa intervalos.
- **Profiling React:** build `diagnostics` resolve `react-dom/client` para o renderer oficial `react-dom/profiling` já instalado. Produção normal não é alterada para profiling. A build diagnostics antiga desviava a Biblioteca para fixtures F5; agora abre o mundo real por padrão. As fixtures continuam acessíveis explicitamente em `/?worldScenario=true`, sem contaminar o roteiro físico do app. `reactRenderMs` é duração de render/reconciliação; número de callbacks não é duração do commit. Atribuição ao último gesto por até 1 segundo é **correlação**, pode incluir trabalho concorrente. Zero pode indicar build sem profiling ou ausência de commit, não CPU zero.
- **Bundle:** percentis compartilhados extraídos para módulo puro para não puxar o coletor Three inteiro para o shell. `performance:report` passa a somar imports estáticos e CSS transitivos sem duplicação; `initialBytes` antigo mantido para compatibilidade. Tamanhos não medem avaliação/compilação JS. Imagens/fontes não integram essa soma JS/CSS.

[ADR-030](../decisions/ADR-030-desempenho-rotas-consultas.md) formaliza residência de provedor, cancelamento e ownership de leituras/rascunhos. **Dexie v19, backup v11, seis registros, progresso/sessões, mídia e versões históricas preservados.**

## Resultados e limites

Evidências: [antes](evidence/bv-uxc-r5/navigation-before.json), [depois](evidence/bv-uxc-r5/navigation-after.json), [bundles antes](evidence/bv-uxc-r5/bundle-before.json) e [depois](evidence/bv-uxc-r5/bundle-after.json).

| Medição confirmada local | R4 | R5 |
| --- | --- | --- |
| Seis trocas entre Acervo/Baralhos/Ecos, sem escrita | 48 leituras / 12 transações | **0 leituras / 0 transações** durante as trocas |
| Digitação da frase fictícia antes de sair | 36 escritas de rascunho | **1 escrita**, flush de saída separado |
| Projeção de 12 estudos com um card cada, regressão de API | Por estudo: vínculos + `getCard` | Uma consulta de vínculos + uma chamada `bulkGet`, zero `getCard` |
| Seleção na arena, mesmo view/layout | Reconciliação + âncoras repetidas | Sem nova reconciliação ou republicação de âncoras; destaque preservado |
| Picking dos quatro GLBs no recorte R4/R5 | R4 não executada anteriormente | Zero leitura de vértices/exact bounds nos cenários testados |

**Não houve comprovação de melhora de P95/P99 ou desaparecimento de long tasks.** Replay antes/depois teve concorrência diferente de compilação/testes e instrumentação/automação; números temporais completos são publicados, inclusive os piores posteriores. RAF P50/P95/P99 observado antes ≈16,7/16,8/33,3 ms e depois ≈16,7/33,4/83,3 ms. Long tasks: 3 antes (máximo 360 ms), 7 depois (máximo 289 ms). Isso **não constitui comparação controlada nem prova de regressão ou melhora do produto**; não se descarta nenhuma amostra. Os contadores de trabalho eliminado são o resultado confiável desta sessão.

Bundle normal final: entry **571.036→573.946 B**; grafo inicial JS/CSS **967.816→970.996 B**. Há pequeno acréscimo de diagnóstico/contratos, não redução de payload inicial. Warning de chunks >500 kB permanece.

Esperado, ainda sem medição física: menos bursts de parsing/Storage, menor espera no dock, menor trabalho de arena, leitura de estudos com menos etapas e mais reutilização ao percorrer salas. FPS, fluidez percebida e ausência de congelamentos permanecem gates Moto G06.

## Cobertura transversal e próximos experimentos

| Área auditada | O que foi coberto / limite |
| --- | --- |
| Biblioteca: personagem, objeto, vazio, diálogo/fechamento, sequência rápida | Picking/GLBs/oclusão/cancelamento, WorldHost/narrativa/sessões e lifecycle testados; R5Q por etapa permanece disponível. Percepção, CPU/GPU reais e acessórios expansivos exigem aparelho. |
| Coleção/Arquivo e seis tipos | Leitor compartilhado, sessão, projeção/backup/migrações existentes e shell; tour inclui dock, Arquivo, Resumo/Ajustes. Formulários/detalhes têm identidade por ID; não se alega gate manual de cada controle. |
| Arcanário | Tour de Portal, Acervo, Baralhos, Oficina/rascunho/save, Ecos, Provações, Pacotes, Taxonomia, Diagnóstico, Relicário, Salão/Regras. Suites de serviços incluem reviews, pacotes, provas e duelo. Arena tem regressão de update/teardown e motor preservado. |
| Android/Capacitor/áudio | MainActivity/insets/ponte tátil/lifecycle inspecionados; não há ponte por frame do desenho. Não se encontrou evidência para alterar aceleração ou haptic. APK/sync e assets de áudio verificados separadamente; latência nativa não medida. |
| CSS/composição | Removida alternância leitura/escrita no resize do shell; cascata de filtros/transições inspecionada. Blur de modal, sombras e arte mantidos: custo físico de composição não atribuído. |
| Bundle/assets/memória | Divisão de salas preservada, inventário transitivo ampliado, sem assets/dependências novos. Cleanup de arena/observer/RAF e identidade de renderer cobertos; heap/GC/GPU sustentados não certificados. |

Resíduos priorizados para o aparelho: (1) distinguir avaliação de módulo, parsing/validação de histórico grande e montagem de sala fria; (2) perfilar CPU de simulação/submissão versus GPU/compositor com mesma câmera/dados; (3) medir custo de comandos com validação global em acervos grandes e backup/mídia, antes de trocar garantias por validação incremental; (4) heap snapshot após 10–20 ciclos para diferenciar retenção intencional da Biblioteca, cache do browser e vazamento; (5) haptic ligado/desligado e efeitos CSS com trace, caso a thread JS já esteja curta. Sem hipótese demonstrada não se mudou WebView, engine, DPR, efeitos, shaders ou regras do jogo.

## Validação e artefato

Fontes dos dois APKs conferidas no commit `446b571d4791080a894f9d2a344fdebb3663c647`; o commit posterior registra somente proveniência documental. Resultados finais e proveniência do APK em [validation.json](evidence/bv-uxc-r5/validation.json) e [apk.json](evidence/bv-uxc-r5/apk.json). Não são CI remota ou certificação global.

| Verificação | Resultado local |
| --- | --- |
| Build normal e diagnostics / TypeScript (`tsc -b`) | PASS |
| Lint e formato globais / áudio / `git diff --check` | PASS |
| Capacitor sync / Gradle assembleDebug, normal e diagnostics | PASS |
| APK normal / diagnóstico | 13.081.021 B / 19.096.063 B; **192/192** e **199/199** arquivos web conferidos |
| Assinatura | SHA-256 do certificado igual à candidata F anterior; versão inalterada |
| E2E final | **1 PASS / 1 FAIL por timeout 3D**, sem retries automáticos |
| Moto G06 / TalkBack / memória térmica sustentada / CI remota | Não executados nesta rodada |

APK normal: `android/app/build/outputs/apk/debug/Biblioteca-Viva-UXC-R5-debug.apk`, SHA-256 `e8036c8a76f0243a2016542e6c7a1aaddfc9755432b581b6fbfa30918d5c7d09`. Diagnóstico: `Biblioteca-Viva-UXC-R5-diagnostics-debug.apk`, SHA-256 `6e7cae292af5fed39268141b0ddf75f3c248ecd788cd10cf97e4a93f68936079`. Binários locais ignorados pelo Git, sem release/publicação; não instalados. `.vite/manifest.json` é metadado de build excluído pelo Capacitor, não asset faltante.

A rodada integrada dirigida executou **420 PASS / 0 FAIL, 47 arquivos**, incluindo shell, rotas, dados, backup, flashcards, sessões, Arcanário, duelo, runtime e picking. Ajustes posteriores de diagnóstico/tipagem/utilitário tiveram **82 PASS em 6 arquivos** e **39 PASS em 4 arquivos**, incluindo o default real da build diagnostics. Estes recortes se sobrepõem e não devem ser somados como testes distintos; toda a suíte global não foi repetida.

O E2E inicial de 30 s falhou por orçamento total ao avaliar a identidade final do Canvas depois do passeio inteiro; seus asserts anteriores de salas/dock/rascunho e pausa/retomada já tinham sido alcançados. O teste foi separado em tour de UI e lifecycle 3D, **sem remover assert, aumentar timeout ou repetir suítes extensas**. A rodada separada terminou **1 PASS (UI) / 1 FAIL por timeout (3D)**: identidade do Canvas e estados paused/running foram alcançados, mas a verificação final de um loop não terminou. Nenhuma terceira tentativa gráfica foi feita; a falha permanece no teste, sem relaxar o assert. Resultado final no manifesto de validação. Timeouts gráficos históricos e CI global permanecem dívidas independentes.

## Gate curto — Moto G06 / Android 15

1. Atualizar o APK **sem desinstalar/limpar dados**. Confirmar registros, sessão/progresso e rascunho preexistentes. Começar com diagnóstico desligado e anotar cada congelamento percebido.
2. Biblioteca: tocar 10 vezes no vazio; cada um dos quatro habitantes parado/andando/magia; abrir/adiar/reabrir e alternar diálogos; tocar móveis, pergaminhos e objeto próximo/aninhado. Variar zoom/rotação. Conferir precisão, animação contínua e ausência de ação fantasma.
3. Dock: Biblioteca → Coleção → Arquivo → Resumo → Ajustes → Biblioteca, cinco ciclos; incluir Voltar, abertura de ficha/formulário e ações rápidas. Conferir retorno da câmera/mundo e sessão ativa.
4. Arcanário: Portal → Acervo → Baralhos → Oficina (digitar, sair e recuperar draft) → Ecos (virar/responder/retomar) → Provações/Pacotes → Duelo/Arena (selecionar/inspecionar/agir/pausar/retomar). Repetir acesso às salas quentes e confirmar persistência após reabrir o app.
5. Segundo plano/retorno, teclado, retrato/paisagem e movimento reduzido; 10–15 minutos para observar degradação/temperatura sem fingir medição térmica. Conferir Back/foco/TalkBack separadamente.
6. Ativar **Diagnóstico do mundo → BV-UXC R5** e repetir trecho curto, voltar e copiar amostras; R5Q mede etapas do picking/diálogo e R5 mede shell/React/RAF. Perfilar via `chrome://inspect/#devices` no mesmo APK/dados; capturar Performance com JS, eventos, frames, GC e GPU quando disponível. Desativar ao terminar. Comparar instrumentação ligada/desligada; não chamar RAF ou `routeContentCommitMs` de pixels/prontidão total.

Aceite de responsividade/artístico e qualquer meta de 16,7 ms/P95/P99 dependem desse gate. **Sem merge automático, sem encerramento de BF-5.6G.**

Reproduzir build após sincronizar a branch:

```bash
git fetch origin
git switch feat/bv-ux-touch-continuity-2026-11-09
git pull --ff-only origin feat/bv-ux-touch-continuity-2026-11-09
npm ci
npm run android:build:diagnostics
# Sem profiling React:
npm run android:build:debug
```

Replay sintético em terminal separado: `npm run preview -- --host 127.0.0.1 --port 4175`; então `node scripts/profile-interactions.mjs /tmp/bv-navigation.json`. Não aponta para sessão/banco pessoal e não aprova hardware Android.
