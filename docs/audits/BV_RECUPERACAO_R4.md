# Recuperação R4 — Dados, observabilidade, integridade e CI

Autoridade operacional desta rodada: missão do proprietário de 07/11/2026 e [integração cumulativa](BV_INTEGRACAO_PR32_38_2026-11-07.md). Base `d5eb469b22dea9d8b604543b408de817aea8b076`. Branch `perf/bv-r4-dados-observabilidade-integridade`. BF-5.5 parcial; R5 não autorizada. Aceites físicos de R2/R3/segurança são baseline, não aprovação física R4.

## Preparação

Fetch origin antes das alterações; checkout limpo. Branch nova exatamente em origin/main de referência. Node 24.18.0/npm 12.0.2. Lockfile/dependências preservados. Nenhum dispositivo ADB conectado. `gh` local retorna 401; conector GitHub funciona e não encontrou PR aberta. Consulta de runs PR do merge retorna vazio (não lista todos os runs push).

Workflows inspecionados: CI em push main/pull_request; preview Android em dispatch/push main filtrado pelo próprio arquivo. Sem pull_request_target. Cada publicação contém `[skip ci]`, inclusive HEAD ao abrir a draft. [Semântica oficial](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs) confirmada: push/PR respeitam esse marcador. Nenhum dispatch/rerun autorizado. CI remota omitida por cota, nunca PASS presumido.

## R4A — BV-09

Entrada `d5eb469`; saída `8c095c30087a4128011407f0efd21b492aad5633`.

Diagnóstico reproduzível: efeito em pages consultava quatro coleções/estado e serializava os snapshots completos a cada SessionChanged. WorldHost dependia da identidade de todos os metadados, mesmo os que a construção Three não consome.

Implementação: fila por instância ativa reconcilia sessão confirmada e registro por ID depois do commit. Catálogo/notas/citações continuam consultados ao entrar/retornar. Evento não reprojeta catálogo quando registro permanece igual; mudanças do registro ainda reconciliam projeção completa. Comparação estrutural de snapshots plain imutáveis substitui JSON. Aplicação/aba obsoleta não publica resposta tardia.

WorldHost distingue os inputs consumidos na construção: ordem, categoria, IDs/modelo, título/autor dos livros e identidades/vínculos/categoria dos pergaminhos. Progresso e timestamps de anotação permanecem atualizados no snapshot React sem reconstruir recursos que não os consomem. Mudanças nesses inputs físicos/labels montam e descartam pelo owner existente. Não há Dexie no runtime, state manager, schema ou backup novo. Alteração de texto de anotação não chega ao renderer; inserção/exclusão de pergaminho exige reconstrução segura, ainda não incremental.

[Evidência contável antes/depois](evidence/bv-recovery-r4/data-counts.json). Reprodução: `npx vitest run src/pages.test.tsx src/features/library/snapshotEquality.test.ts src/features/library/WorldHost.test.tsx src/application/projectWorldSessionActivity.test.ts`. **57 PASS**, typecheck PASS. Testes incluem retorno com catálogo igual/editado/excluído, seis categorias e troca de application; igualdade separa progresso sem ignorar exclusão/título. Não foram medidos FPS, CPU ou alocações Android.

Arquivos: pages.tsx/test, WorldHost.tsx, snapshotEquality.ts/test; relatório/evidência e autoridades documentais. Risco residual: registro modificado ainda reprojeta N; alterações físicas remountam, reiniciando câmera/seleção como antes. Incrementalização física ampla fica limitada pela segurança de reservas/ownership. Continuidade, sessão/livro e lifecycle serão incluídos na rodada final dirigida/ampla.

## R4B — BV-13/14/16

Entrada `8c095c3`; saída `345ea0b`. PR draft [#39](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/39).

Anterior: média RAF de 750 ms, renderer.info, inventário e datasets a cada 250 ms; painel assinado mesmo fechado. Agora assinatura somente ao abrir details. Travessia ampla periódica: **3–4/s → 0/s fechado**; ao abrir, inventário imediato e cadência 250 ms, sem recriar a cena. Datasets baratos e publicações de lifecycle preservados. Teste do runtime mede 60 frames fechado, 60 aberto, 60 fechado novamente; zero travessias nos trechos fechados. Inventários também atualizam em mudanças estruturais forçadas.

RAF: P50/P95/P99, máximo, contagem de intervalos >33,34 ms na janela móvel, teto 1024 timestamps. Probe opt-in com até 240 amostras por sete canais: CPU do update, livro, agência, restante dos visuais/efeitos (inclui animação/checkpoint), chamada síncrona renderer.render, recepção do primeiro Pointer desde o último frame até retorno da submissão e long tasks quando PerformanceObserver suporta. Sem conteúdo pessoal, rede ou coleta permanente. Observer e listeners removidos ao fechar, pausar, falhar ou descartar; retorno reativa apenas com consumidor. Heap JS lido apenas sob demanda quando API existe. Percentis calculados na publicação, não ordenados por estágio a cada frame.

**Limites de interpretação:** RAF não é duração de CPU. renderer.render mede CPU da chamada/submissão, podendo incluir espera de driver, nunca tempo GPU. gestureToSubmit começa no listener do Canvas, não no hardware e não mede input-to-photon. Tempo GPU, apresentação/compositor, memória GPU/VRAM e custo separado do handler de input indisponíveis nesta implementação. renderer.info fornece calls/triângulos/geometrias/texturas, não bytes gráficos. Bundle report agora explicita que mede bytes estáticos. Fechado ainda mantém janela RAF/datasets baratos, sem long tasks/CPU detalhada ou atualizações React periódicas.

Gates: primeira rodada **77 PASS/1 FAIL** (WorldHost esperava assinatura fechada). Atualizado o contrato do teste: exige ausência de assinatura fechada, abre painel antes dos asserts existentes de diagnóstico; nenhum assert funcional removido. Reexecução dirigida do host registrada abaixo e rodada global final confirmará integração. Testes novos: percentis/outliers, limite de buffers, descarte de listeners e recepção→submissão.

WebView: MainActivity apenas registra plugins de arquivos/haptics e configura insets/barras. Pointer/câmera/RAF/renderização usam JS/Canvas/WebGL; não há frame ou gesto transmitido por bridge Capacitor. Isso refuta a hipótese específica de bridge por frame no código atual, **não** elimina possíveis custos de WebView, composição ou driver. ADB sem aparelho; nenhuma comparação Chrome/WebView, GPU, versão WebView ou gargalo físico medido. Sem alteração de qualidade/DPR/iluminação/animações.

### Protocolo Moto G06

1. Instalar APK debug local apenas após proteger dados conforme rotina do proprietário; não limpar storage. Anotar SHA, Android/WebView, orientação, bateria/temperatura e estado de movimento reduzido.
2. Usar catálogo fictício ou cenário diagnóstico isolado. Com mesma câmera, observar 60 s parado, pan/pinch, seleção, sessão/livro e dia/noite; repetir com painel fechado/aberto. Registrar percentis RAF, canais CPU P95, long tasks e renderer.info disponíveis, sem conteúdo/caminhos pessoais.
3. Fechar painel, navegar entre abas, pausar/background 20 s, retomar e reabrir. Confirmar câmera/seleção, livro retornando, quatro habitantes, nove lâmpadas e pergaminhos. Distinguir pausa intencional de frame atrasado.
4. Para atribuição física usar DevTools Performance/Perfetto sob conexão autorizada; comparar trilhas JS, driver/GPU e compositor separadamente. Filmagem externa é necessária para input-to-photon; performance.now não o substitui. Reportar fluidez percebida separada de métricas.

Arquivos: frameMetrics, performanceProbe/test, ThreeWorldRuntime/test, WorldDiagnosticPanel, worldRuntime, WorldHost.test, report-build-performance e docs. APK comum contém painel opt-in; build:diagnostics existente habilita cenários técnicos, sem telemetria.


## R4C — BV-17

Entrada `345ea0b`; saída: commit `R4C` (SHA no checkpoint seguinte). [Matriz dos 17 casos e reprodução](evidence/bv-recovery-r4/backup-matrix.md).

Defeito demonstrado: snapshot Dexie incluía continuidade/ritual mas codec completo rejeitava suas chaves. Testes anteriores apenas read/replace não atravessavam encode/inspect; não comprovavam exportação utilizável. Teste novo falhou antes da correção com discriminador de settings desconhecido. A primeira fixture também tinha dimensões/localização incorretas, corrigidas para JPEG real 720×1080 e tópico de estudo; erro de fixture separado do defeito real das chaves.

Correção compatível com contrato documentado v6: allowlist inclui somente as duas chaves já persistidas, usando parsers estritos existentes (quatro agentes únicos e lâmpadas válidas). Schema v14, envelope v6, IDs e checksum intocados; v6 antigo continua válido, v1–v5 incompatíveis. Preferências desconhecidas continuam rejeitadas, sem aceitação genérica de settings.

Segundo mecanismo corrigido: codec validava ownership de mídia/duplicatas, mas não rejeitava notas/citações órfãs, tags inexistentes ou sessões cujo tipo diverge do registro. Agora valida referências antes de substituir; atividades históricas podem referenciar agregados excluídos e não são tratadas como referências vivas. Ensaios assinam fixtures inválidas com SHA-256 válido para distinguir integridade do envelope de validade referencial; banco destino permanece idêntico.

Atomicidade: replace já usa uma transação de nove tabelas. Falha injetada em bulkAdd de sessões depois de clears e inserções anteriores prova rollback comparando snapshot integral e nova abertura. Validação precede escrita; backup de segurança cancelado/read failure/destino que passou a conter dados recusam operação. Sem limpeza de dados reais. Testes novos usam bases com nome aleatório apenas para isolamento, dados determinísticos fictícios.

Gates: conjunto inicial **30 PASS/7 arquivos**; reexecução após ajuste de tipo da fixture **20 PASS/2 arquivos** (inclui UI Settings). Typecheck inicialmente detectou sessão artificial com discriminantes incompatíveis; fixture passou a usar entryId incompatível com tipo válido, sem cast. UI adicional testa falha de leitura e limite antes de inspect. Resultado final e typecheck registrados abaixo. Nenhuma migração executada.

Arquivos: backupCodec.ts, r4Integrity.test.ts, SettingsPage.test.tsx, docs DATA_MODEL/SECURITY/TESTING/relatório/evidência. Riscos: transações fictícias não reproduzem corte de energia, falta real de storage, seletor Android ou corrupção física. Reabertura de app React/ausência de duplicação no mundo depende também do E2E R4D; sem prova humana de backups pessoais.


## R4D — pendente

R4B pós-ajuste: **26/26 WorldHost PASS**, typecheck PASS, lint dirigido PASS; os outros 52 testes da rodada inicial passaram. Validação ampla final obrigatória antes de R4D.

R4C final: UI **15/15 PASS**, typecheck PASS após fixture compatível, lint dirigido PASS após substituir mocks async sem await por Promise.resolve. Os 6 testes novos de integridade passaram na rodada de 20; checks amplos finais em R4D.
