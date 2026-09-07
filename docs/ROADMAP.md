# Roadmap

> Atualizado em 2026-09-07.

## Encerrado

- Fundação do protótipo e aplicação convencional.
- Registros múltiplos, sessões, etiquetas, favoritos, histórico e estatísticas.
- Reboot espacial W1/W2.
- Estrutura persistente W3-A.
- Rodada corretiva W3-A R0–R6, incluindo continuidade visual, Construção mobile, shell, regressão e validação no Moto G06.

O histórico detalhado está em `HISTORY.md` e `history/w3-a/`.

## Agora

**Próxima etapa planejada: W3-B — Estantes reais.** A W3-A encerrou a fundação estrutural; W3-B retoma a sequência de estantes e livros que havia sido definida antes da ampliação corretiva da arquitetura.

Nenhuma etapa W3-B–W3-F está em execução. Iniciar uma delas ainda exige escopo e gate explícitos, mas não exige escolher novamente entre ideias concorrentes.

## Continuação da W3

| Etapa | Estado | Entrega principal |
|---|---|---|
| W3-B — Estantes reais | próxima, não iniciada | quatro orientações, pivôs, footprints, movimento e rotação |
| W3-C — Livros derivados dos registros | planejada | um sprite por `BookEntry`, estilo determinístico, slots e múltiplas estantes |
| W3-D — Primeiro livro e desbloqueio | planejada | marco, concessão permanente da estante, posição inicial e reação audiovisual |
| W3-E — Livro ativo no mundo | planejada | livro aberto ligado por `bookId`, movimento, giro e ação atômica de pausar/guardar |
| W3-F — Visualização e progresso | planejada | painel React em forma de livro antigo, progresso, notas e citações |

Detalhes, autoridades e questões ainda abertas estão em `W3_PLAN.md`.

## Trabalho transversal

- medir e investigar a demora inicial da Biblioteca e o engasgo do Resumo no Moto G06;
- preservar alternativa React, foco, teclado, TalkBack e redução de movimento em cada fatia;
- validar áudio percebido e procedência dos assets antes de release;
- evoluir Dexie e backup juntos sempre que uma etapa introduzir estado persistente novo.

## Critério para iniciar uma fatia

Antes de implementar:

1. descrever problema e resultado observável;
2. definir fora de escopo;
3. localizar a autoridade de dados e apresentação;
4. avaliar migração, backup, privacidade e desempenho;
5. definir regressões automáticas e evidência humana;
6. registrar decisão arquitetural se algum limite vigente mudar.

## Horizonte, não compromisso

Expansões futuras podem incluir mais objetos, habitantes, memória conectada e refinamento de conteúdo. Conta, sincronização, social, 3D real e novos mundos continuam fora do horizonte aprovado.
