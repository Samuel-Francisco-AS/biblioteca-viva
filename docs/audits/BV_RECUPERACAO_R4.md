> **Atualização 07/11/2026:** proprietário autorizou a integração após aceite físico dirigido da R4 e saneamento de leitura no Moto G06. [Relatório de integração](BV_INTEGRACAO_PR39_R4_2026-11-07.md) prevalece sobre estados anteriores de candidata; ressalvas e evidências abaixo permanecem.

> **Continuação pós-R4 de 07/11/2026:** proprietário observou Canvas/seleção/início/saída do livro funcionais e sem regressão de fluidez percebida frente à R3, mas relógio visual parado. Saneamento de UX/cronômetro na mesma PR draft #39, preservando os quatro checkpoints abaixo. Não significa aprovação física integral R4. [Diagnóstico, candidata, gates e roteiro](BV_SANEAMENTO_POS_R4_LEITURA.md). R5 não iniciada.

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

RAF: P50/P95/P99, máximo, contagem de intervalos >33,34 ms na janela móvel, teto 1024 timestamps. Probe opt-in com até 240 amostras por sete canais: CPU do update, livro (inclui preparação de modo/disponibilidade), agência, restante dos visuais/efeitos (inclui animação/checkpoint), chamada síncrona renderer.render, recepção do primeiro Pointer desde o último frame até retorno da submissão e long tasks quando PerformanceObserver suporta. Sem conteúdo pessoal, rede ou coleta permanente. Observer e listeners removidos ao fechar, pausar, falhar ou descartar; retorno reativa apenas com consumidor. Heap JS lido apenas sob demanda quando API existe. Percentis calculados na publicação, não ordenados por estágio a cada frame.

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

Entrada `345ea0b`; saída `b05b0be`. [Matriz dos 17 casos e reprodução](evidence/bv-recovery-r4/backup-matrix.md).

Defeito demonstrado: snapshot Dexie incluía continuidade/ritual mas codec completo rejeitava suas chaves. Testes anteriores apenas read/replace não atravessavam encode/inspect; não comprovavam exportação utilizável. Teste novo falhou antes da correção com discriminador de settings desconhecido. A primeira fixture também tinha dimensões/localização incorretas, corrigidas para JPEG real 720×1080 e tópico de estudo; erro de fixture separado do defeito real das chaves.

Correção compatível com contrato documentado v6: allowlist inclui somente as duas chaves já persistidas, usando parsers estritos existentes (quatro agentes únicos e lâmpadas válidas). Schema v14, envelope v6, IDs e checksum intocados; v6 antigo continua válido, v1–v5 incompatíveis. Preferências desconhecidas continuam rejeitadas, sem aceitação genérica de settings.

Segundo mecanismo corrigido: codec validava ownership de mídia/duplicatas, mas não rejeitava notas/citações órfãs, tags inexistentes ou sessões cujo tipo diverge do registro. Agora valida referências antes de substituir; atividades históricas podem referenciar agregados excluídos e não são tratadas como referências vivas. Ensaios assinam fixtures inválidas com SHA-256 válido para distinguir integridade do envelope de validade referencial; banco destino permanece idêntico.

Atomicidade: replace já usa uma transação de nove tabelas. Falha injetada em bulkAdd de sessões depois de clears e inserções anteriores prova rollback comparando snapshot integral e nova abertura. Validação precede escrita; backup de segurança cancelado/read failure/destino que passou a conter dados recusam operação. Sem limpeza de dados reais. Testes novos usam bases com nome aleatório apenas para isolamento, dados determinísticos fictícios.

Gates: conjunto inicial **30 PASS/7 arquivos**; reexecução após ajuste de tipo da fixture **20 PASS/2 arquivos** (inclui UI Settings). Typecheck inicialmente detectou sessão artificial com discriminantes incompatíveis; fixture passou a usar entryId incompatível com tipo válido, sem cast. UI adicional testa falha de leitura e limite antes de inspect. Resultado final e typecheck registrados abaixo. Nenhuma migração executada.

Arquivos: backupCodec.ts, r4Integrity.test.ts, SettingsPage.test.tsx, docs DATA_MODEL/SECURITY/TESTING/relatório/evidência. Riscos: transações fictícias não reproduzem corte de energia, falta real de storage, seletor Android ou corrupção física. Reabertura de app React/ausência de duplicação no mundo depende também do E2E R4D; sem prova humana de backups pessoais.

## R4D — BV-18

Entrada `b05b0be`; saída identificada pelo commit `R4D`, SHA definitivo na PR/final (não pode ser incluído no próprio conteúdo do commit).

Investigação inicial antes de nova execução: [extração limitada do trace de integração](evidence/bv-recovery-r4/selection-trace-analysis.json). Livro/filme tiveram seleção e highlight confirmados; ~3–4 s por click e ~1 s por assert, RAF host ~3 FPS; marcador do primeiro frame estável e frames monotônicos até input da série, sem evidência de remount. Deadline global encerrou teste durante série; estado final pressed React versus atributo vazio é evidência incompleta, não prova de causa runner-only nem de erro de picking. Fixture contém seis entidades válidas e transação de seed concluída. Novo teste aguarda também WorldHost ready e runtime running além de fixture ready; asserts de seleção/highlight/href/reload mantidos, prazo inalterado e sem sleeps.

Pipeline: concurrency por workflow/PR/ref cancela execuções obsoletas; artefatos de falha identificam SHA/shard e mantêm retenção de três dias. retries=0 também na configuração local/CI, coerente com --retries=0 já usado no workflow. Push só main e PR preservados, sem filtros que omitam código relevante ou alteração de proteção. Builds duplicados dos shards permanecem: extração de job/artifact compartilhado não foi necessária para proteger a cota nesta missão. Nenhum dispatch/rerun. Futuro após 01/12: retirar skip somente numa publicação expressamente autorizada com cota, executar todos os gates e ambos shards sem retries, classificar FAIL por trace contra baseline e não supor sucesso desta rodada local.

Gates finais em execução. Primeira format:check capturou novo teste antes de formatação; lint encontrou cinco achados novos (inicializações sobrescritas, dois non-null redundantes e mock async sem await), corrigidos sem supressões. Novo teste de conservação do runtime esperava start, mas contava chamadas antes do efeito ready/seleção; corrigido para aguardar seleção publicada, **27/27 host PASS**. Essas falhas novas de preparação/teste/estática são separadas do E2E histórico. Nenhuma assertion removida ou timeout ampliado.

R4B pós-ajuste: **26/26 WorldHost PASS**, typecheck PASS, lint dirigido posteriormente identificado como FAIL (quatro achados estáticos corrigidos em R4D); os outros 52 testes da rodada inicial passaram. Validação ampla final obrigatória antes de R4D.

R4C final: UI **15/15 PASS**, typecheck PASS após fixture compatível, lint dirigido do codec PASS após substituir mocks async sem await por Promise.resolve; UI adicional ainda tinha um mock async sem await, identificado e corrigido em R4D. Os 6 testes novos de integridade passaram na rodada de 20; checks amplos finais em R4D.

### E2E final dirigido

[Resultados reproduzíveis](evidence/bv-recovery-r4/e2e-results.json): **3 PASS / 1 FAIL em 59,8 s**, uma execução, zero retries. Busca/Arquivo, exportar-validar-restaurar e restore vazio/reabertura PASS. R2 esgotou prazo global de 30 s ao avançar para Estudo. O passo difere da integração (série), sem prova de causa comum/regressão nem de que apenas o runner seja responsável. Não repetir sem hipótese nova. Prontidão de WorldHost/runtime agora é explícita, mas não resolveu o deadline. Seleção completa dos seis tipos/reload permanece dívida E2E ativa; testes unitários de identidade/seleção/ownership não a substituem.

### Dívidas preservadas

R5/assets/rigs/leitura sentada, F2B/F2C e BF-5.5G fora do escopo. Ytha conserva envelope de 0,92 m e impedimento físico conhecido. Livro da Estrela, livro pessoal, quatro habitantes, reservas, nove luzes, magia, seis representações e formulários não foram reduzidos. Integridade física Android, TalkBack, áudio percebido, desempenho sustentado, memória host sem atribuição e CI E2E global continuam abertos. Não há migração, release, beta, merge ou alteração de proteção da main.

## Resultado local final da candidata

[Evidência dos comandos/saídas e APK](evidence/bv-recovery-r4/local-gates.json). `npm ci`, `npm audit --omit=dev`, `npm audit` PASS, **zero vulnerabilidades**. `format:check`, lint global, typecheck, **935 testes/147 arquivos**, áudio, build web, performance:report, Android sync/build debug e diff --check PASS. Reexecução ampla justificada pela correção do novo teste de espera; não houve loop E2E. Build mantém warning de chunk >500 kB e Gradle flatDir, sem falha nova. Lockfile/package e schema sem diff.

APK local: `android/app/build/outputs/apk/debug/app-debug.apk`, proveniência/checksum na evidência. Não foi instalado nem submetido a avaliação física. O painel diagnóstico é opt-in nessa build; cenários técnicos adicionais continuam em `npm run android:build:diagnostics`, não executado aqui. Nenhum APK/backup binário foi versionado.

PR única draft [#39](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/39), branch R4 própria; nenhuma alteração/merge na main. A/B/C consultadas sem runs PR após publicação. R4D contém `[skip ci]`, com gatilhos rechecados (somente push main/pull_request e preview dispatch/push main filtrado). Consumo novo de Actions evitado; não se alegam minutos de faturamento auditados nem CI remota verde. Plano remoto futuro na seção R4D.

**Estado:** R4 candidata técnica para revisão e gate físico dirigido, com redução demonstrável de trabalho, instrumentação local e correções de integridade, mantendo o FAIL E2E e limites explícitos. Recuperação integral não encerrada. O roteiro Moto G06 está na seção R4B; validar também backup/restore apenas de fixture em ambiente isolado e preservando recuperação dos dados existentes.
