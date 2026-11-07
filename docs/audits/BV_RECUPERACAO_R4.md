# Recuperação R4 — Dados, observabilidade, integridade e CI

Autoridade operacional desta rodada: missão do proprietário de 07/11/2026 e [integração cumulativa](BV_INTEGRACAO_PR32_38_2026-11-07.md). Base `d5eb469b22dea9d8b604543b408de817aea8b076`. Branch `perf/bv-r4-dados-observabilidade-integridade`. BF-5.5 parcial; R5 não autorizada. Aceites físicos de R2/R3/segurança são baseline, não aprovação física R4.

## Preparação

Fetch origin antes das alterações; checkout limpo. Branch nova exatamente em origin/main de referência. Node 24.18.0/npm 12.0.2. Lockfile/dependências preservados. Nenhum dispositivo ADB conectado. `gh` local retorna 401; conector GitHub funciona e não encontrou PR aberta. Consulta de runs PR do merge retorna vazio (não lista todos os runs push).

Workflows inspecionados: CI em push main/pull_request; preview Android em dispatch/push main filtrado pelo próprio arquivo. Sem pull_request_target. Cada publicação contém `[skip ci]`, inclusive HEAD ao abrir a draft. [Semântica oficial](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs) confirmada: push/PR respeitam esse marcador. Nenhum dispatch/rerun autorizado. CI remota omitida por cota, nunca PASS presumido.

## R4A — BV-09

Entrada `d5eb469`; saída: commit identificado por `R4A` no histórico desta branch (SHA definitivo registrado no checkpoint seguinte).

Diagnóstico reproduzível: efeito em pages consultava quatro coleções/estado e serializava os snapshots completos a cada SessionChanged. WorldHost dependia da identidade de todos os metadados, mesmo os que a construção Three não consome.

Implementação: fila por instância ativa reconcilia sessão confirmada e registro por ID depois do commit. Catálogo/notas/citações continuam consultados ao entrar/retornar. Evento não reprojeta catálogo quando registro permanece igual; mudanças do registro ainda reconciliam projeção completa. Comparação estrutural de snapshots plain imutáveis substitui JSON. Aplicação/aba obsoleta não publica resposta tardia.

WorldHost distingue os inputs consumidos na construção: ordem, categoria, IDs/modelo, título/autor dos livros e identidades/vínculos/categoria dos pergaminhos. Progresso e timestamps de anotação permanecem atualizados no snapshot React sem reconstruir recursos que não os consomem. Mudanças nesses inputs físicos/labels montam e descartam pelo owner existente. Não há Dexie no runtime, state manager, schema ou backup novo. Alteração de texto de anotação não chega ao renderer; inserção/exclusão de pergaminho exige reconstrução segura, ainda não incremental.

[Evidência contável antes/depois](evidence/bv-recovery-r4/data-counts.json). Reprodução: `npx vitest run src/pages.test.tsx src/features/library/snapshotEquality.test.ts src/features/library/WorldHost.test.tsx src/application/projectWorldSessionActivity.test.ts`. **57 PASS**, typecheck PASS. Testes incluem retorno com catálogo igual/editado/excluído, seis categorias e troca de application; igualdade separa progresso sem ignorar exclusão/título. Não foram medidos FPS, CPU ou alocações Android.

Arquivos: pages.tsx/test, WorldHost.tsx, snapshotEquality.ts/test; relatório/evidência e autoridades documentais. Risco residual: registro modificado ainda reprojeta N; alterações físicas remountam, reiniciando câmera/seleção como antes. Incrementalização física ampla fica limitada pela segurança de reservas/ownership. Continuidade, sessão/livro e lifecycle serão incluídos na rodada final dirigida/ampla.

## R4B — pendente

## R4C — pendente

## R4D — pendente
