# BF-5.5D — Auditoria preliminar de B/C

Base inspecionada: `8cc12c214f539089cb47566415a66376fa3305d9`, em 05/11/2026. Checkout limpo; fetch origin executado; #32, #33 e #34 abertas/draft. Auditoria por inspeção dirigida, não aceite físico.

| Achado | Gravidade / classificação | Evidência e consequência |
|---|---|---|
| Leases exclusivos por recurso, proprietário e tarefa; renovação e expiração | Contrato confirmado | `InteractionCoordinator.reserve/renew/owns`; agência renova durante execução e libera em `stop`. Reutilizar, sem segundo coordenador. |
| Ciclo B usa objeto original e âncora corporal | Confirmado, com limite artístico | `livingVisuals.driveInhabitantInteractions`, `getCarryAnchor`; teste integrado de agência percorre estados. GLBs sem mão articulada adequada: não equivale a contato corporal perfeito. |
| Recuperação física pode retornar imediatamente à origem | Dívida média comprovada | Ausência de pose ativa em `driveInhabitantInteractions` copia posição original; checkpoints A não persistem manipulação. D precisa evitar objeto preso e não prometer continuidade de voo persistida. |
| Ciclo noturno e fallback independentes do NPC | Contrato confirmado | `nightCycleKey`, `power`: 18h–06h, madrugada vinculada à véspera, potência plena após 45 s desde 18h. A luminária BF-4E é excluída. |
| Ritual persistido e idempotente | Contrato confirmado | `complete`, parser estrito e fila de escrita em `nightLightingRepository`; WorldHost restaura antes da montagem. |
| Alcance ritual de 2,8 unidades não comprova contato manual | Limitação artística média | `chooseNightTask` e chegada usam gesto de invocação; não afirmar acionamento mecânico de interruptor. |
| CI global vermelha em ambas as bases | Pendência alta, causa não classificada | B: run 42062347500; C: run 42068468122. Em ambos estáticos/unitários/áudio/build/performance PASS, E2E 1/2 e 2/2 FAIL. Não atribuir ao runner nem presumir que toda falha é histórica. |

Não foi identificado bloqueante inequívoco exigindo refatoração de B/C. Pausa/redução/indisponibilidade cancelam tarefas físicas; restauração A rejeita retomada de interação sem lease. Inspeção não substitui integração visual, TalkBack nem testes em aparelho. Débitos históricos #21–#24 permanecem abertos. Nenhuma alteração nas branches B/C.

Complemento de evidência CI C: logs dos jobs 127389263639 e 127389264244, run 42068468122, mostram 31 PASS / 34 FAIL. O cenário `bf4-living.spec.ts:71` já falha por timeout na C. Na D local, ele falhou com seleção `living:table` em vez de `living:lamp`; mesma família de teste, **causa equivalente não comprovada**. Sem retries, relaxamento de assertivas ou atribuição automática ao ambiente.

## Saneamento da candidata D (rodada posterior a 72db7ff)

- **Arquitetura — defeito comprovado pela CI #35:** o renderer importava o tipo da aplicação. Contrato extraído para `src/contracts/livingScroll.ts`, usado pelo projector e pelo mundo. Teste arquitetural original preservado e aprovado (6/6).
- **Leases — risco concreto de handoff social:** `tryMeeting` apagava tarefas após iniciar os percursos sociais sem liberar explicitamente leases; `dispose` também apagava tarefas sem liberação. A nova branch libera antes de perder a referência e impede encontros de tomar manipulação já iniciada; aproximação ainda pode ceder ao encontro. Luminárias já eram excluídas da seleção social. Pausa, diálogo e falha de rota já chamavam liberação; não foram reescritos.
- **Limite da reprodução:** duas configurações determinísticas com percursos/autonomia reais não produziram o abandono social exato na versão anterior. O teste verifica coexistência de encontros e tarefas, correspondência entre proprietário e lease e limpeza no descarte, mas **não prova reprodução pré-reparo da sobreposição específica**. A correção é localizada no caminho de perda de referência identificado por inspeção; não se alega cobertura exaustiva de todas as janelas de interrupção.
- **Picking — divergência comprovada no harness:** tanto C como D usam `CameraNavigation(camera, 1, LIBRARY_ROOMS, 10)` no runtime; o E2E antigo construía câmera com zoom 0,7 e dimensão padrão 1. O ponto clicado não representava a posição visual da luminária. Corrigida somente a projeção do teste para usar o zoom publicado e o enquadramento real. Assertivas, timeout e prioridades do raycast preservados. A execução dirigida desta rodada está registrada no relatório, sem generalizar a causa para todas as falhas CI anteriores.

Resultado dirigido após correção do harness: seleção e destaque da luminária PASS; cenário E2E geral FAIL na busca do feedback temporário, com timeout de 30 s. Causa da ausência do feedback não demonstrada. Não repetir o cenário sem hipótese nova; evidência preservada no trace local.
