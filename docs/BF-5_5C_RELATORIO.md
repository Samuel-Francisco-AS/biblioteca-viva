# BF-5.5C — Noite e Ritual de Iluminação

**Data:** 05/11/2026. **Estado:** candidata na [PR draft #34](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/34), baseada na BF-5.5B (#33), dependente da BF-5.5A (#32). **Sem merge, aceite físico ou CI global verde confirmado.**

## Implementação entregue

- **Aparência noturna:** tonalidade lunar azulada na luz hemisférica, direcional e fundo, preservando a apresentação diurna. Os **nove abajures já modelados** nos cinco cômodos passam a emitir luz pontual âmbar e um núcleo luminoso; não surgem novas mobílias, seletores ou entradas de registros.
- **Relógio e fallback:** o relógio local determina noite entre **18h e 06h**, atravessando corretamente a meia-noite. Ao anoitecer, as luminárias já fornecem luminosidade funcional (68% de intensidade); em **45 segundos** desde o crepúsculo, atingem iluminação plena automaticamente, mesmo que nenhum NPC esteja disponível. Ao iniciar tarde da noite, já estão completamente acesas. O contexto visual noturno é independente de uma leitura temporária ou do efeito encantado.
- **Ritual observável:** habitantes livres escolhem abajures pendentes, reservam o recurso, percorrem a navegação existente até um ponto seguro do mesmo cômodo, orientam-se para a luz e executam um gesto. O agente conclui apenas se sua reserva ainda é válida e ele está próximo; diálogos, indisponibilidade, caminho bloqueado, ciclo diurno, pausa e redução de movimento levam à liberação segura. O ritual não força todos os habitantes a abandonar atividades críticas.
- **Idempotência:** cada abajur é marcado como atendido uma única vez por ciclo noturno. Um pequeno checkpoint versionado guarda apenas a data local da noite e IDs dos abajures atendidos em `settings`, já abrangida pelo backup v6. Sem tabela nova, migração, texto pessoal ou gravações por frame.
- **Precedência manual/narrativa:** o abajur especial `living:lamp` do pergaminho BF-4E **não é automatizado**; seu liga/desliga, intensidade, pista e sequência permanecem sob comando do jogador. Os demais abajures e a luz de preenchimento garantem a legibilidade independentemente desse segredo; a narrativa da Fenda continua capaz de solicitar clima sombrio sem alterar os dados de iluminação real.

## Evidências técnicas

Testes adicionados para ciclo 18h–06h, reabertura, progresso de ritual, checkpoint inválido, compatibilidade de backup, posicionamento dos nove abajures existentes, preservação do segredo e tarefa autônoma com navegação realista. **Aguarda-se a consolidação dos gates da PR #34**; não presumir aprovação de CI, WebGL, E2E ou verificação artística sem execução.

Não se altera o contrato do checkpoint de habitantes BF-5.5A. A CI histórica de BF-5/B permanece com falhas E2E, mantidas como dívida e não atribuídas automaticamente ao runner.

## Limitações e próximos gates

- Os gestos utilizam as animações disponíveis; não há rig de mão nem animação corporal específica de girar a chave do abajur. A ação acende a luz de modo funcional; o gesto é uma encenação simplificada a refinar posteriormente.
- A seleção/toggle manual aplica-se ao abajur do pergaminho; os demais abajures modelados são parte do cenário, iluminados pelo relógio e coreografados pelos NPCs. Controles manuais por cômodo não foram inventados nesta etapa.
- Navegação e alcance foram definidos para pontos existentes; **a legibilidade, o posicionamento das luzes, a coreografia, retrato/paisagem, pan/pinch, TalkBack, movimento reduzido e interrupção** dependem do gate físico acumulado no Moto G06.
- BF-5.5D–G, refinamento de móveis e sessões pessoais não foram antecipados. Sem merge automático e sem encerramento de fase.
