# ADR-030 — residência de rotas e consultas consistentes

- Data: 09/11/2026.
- Estado: implementada em candidata PR #49; aceite físico e merge pendentes.
- Complementa ADR-009/015/025–029; não altera engine, schema ou backup.

## Problema e evidência

A fronteira de erro com chave por pathname desmontava o provedor do Arcanário em cada sala; seis trocas locais repetiam 48 leituras. Efeitos dependentes de draft gravavam no cleanup de cada tecla, anulando o debounce: 36 gravações por frase. Listagens de registros projetavam flashcards por consultas individuais. Seleção na arena reconciliava um view sem alteração e republicava âncoras.

## Decisão

1. Fronteiras de erro mantêm identidade saudável e resetam somente falhas por navegação. O provedor do Arcanário vive durante a visita; formulários/partidas cujo ID define estado recebem chave própria. Não manter todas as páginas montadas ou criar cache global de telas.
2. Portal/arena usam projeções mínimas; demais salas compartilham o snapshot da visita. Recargas explícitas de comandos e visibilidade permanecem. Gerações invalidam respostas antigas na troca de escopo/app ou desmontagem. Não servir resultado de uma leitura anterior a um commit como se fosse atualização posterior.
3. Leitura completa do Arcanário é transação readonly atômica nas sete tabelas pertinentes, pertencente ao repositório. Runner de comandos permanece readwrite; validação e eventos após commit não mudam. Projeção de estudos agrupa vínculos por IDs e deduplica `bulkGet`, com parsing estrito, dentro da mesma transação que lê registros.
4. Timers de rascunho cancelam somente o agendamento anterior; teardown/pagehide/ocultação gravam o último draft confirmado. Save final marca encerramento antes de remover o rascunho. Keys de editor delimitam ownership; não há escrita de rascunho em outro ID.
5. Na arena, view/layout autorizam reconciliação e âncoras; seleção autoriza destaque. RAF já ativo continua; alocações gráficas têm cleanup idempotente, inclusive se a inicialização falhar parcialmente.
6. Navegação não aguarda dois RAFs: microtask cancelável resolve intenções da mesma rodada de eventos. Véu/halo são apresentação sem gate artificial de execução.
7. Diagnóstico existente é opt-in, limitado, volátil e anônimo. Profiler nunca publica estado dentro do próprio commit; medições de render, callbacks RAF e tasks são distintas. Alias oficial de profiling só na build diagnostics. Sem telemetria, persistência de métricas, workers ou cache de banco.

## Consequências e validação

A retenção deliberada do provedor dura somente a visita ao Arcanário; Biblioteca residente mantém o contrato ADR-015. Reentrada consulta dados atuais. Menos consultas e gravações não comprovam FPS ou input-to-photon. Preservar precisão aninhada e os quatro GLBs, arte, acessibilidade, progresso e offline. Dexie v19/backup v11 continuam iguais.

Regressões cobrem recuperação sem remount saudável, isolamento de IDs, latest-read-wins, drafts, estudos arquivados/referências inválidas, transação readonly, arena e descarte. [Relatório e gate Moto G06](../audits/BV_UXC_R5_DESEMPENHO_GLOBAL_2026-11-09.md) registram medições, falhas e limitações. Não promover automaticamente para main ou declarar BF-5.6G encerrada.
