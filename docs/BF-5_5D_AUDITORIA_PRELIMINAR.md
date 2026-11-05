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
