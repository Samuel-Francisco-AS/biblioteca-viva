# BF-5.5F — Resposta às sessões e ações reais

**Início da implementação:** 05/11/2026. **Estado:** primeira candidata funcional / checkpoint F1, **sem aceite final**, sem merge e sem avaliação física. Base: BF-5.5E (PR #36), dependente da stack BF-5.5A–D (PRs #32–35).

## F1 — Entrega direta

1. **Contrato neutro de sessão confirmada.** `src/contracts/worldSessionActivity.ts` contém exclusivamente `sessionId`, `entryId`, `entryType`, `instanceId`, `kind`, `status` e `revision`. Não recebe títulos, anotações, exercícios ou outros textos pessoais. Produzido por `projectWorldSessionActivity` somente a partir de `Session` persistida e do registro correspondente; sessão concluída, inexistente ou registro ausente/incompatível projetam `null`.
2. **Fundação independente na main.** A projeção e seus testes foram incorporados separadamente à `main`, sem puxar BF-5.5A–E para a branch principal. A branch F inclui o mesmo contrato/fonte para compilação sobre a base E e reconciliação posterior.
3. **Ponte de dados na Biblioteca.** `src/pages.tsx` busca a sessão aberta pela consulta existente, observa `SessionChanged` após persistência, refaz a projeção após retorno à Biblioteca e descarta resultados assíncronos obsoletos. Para uma mudança de sessão que não altera os registros, preserva a referência do snapshot do mundo para **não desmontar o Canvas e não perder autonomia/continuidade**.
4. **Runtime sem Dexie.** `WorldHost` passa a atividade confirmada ao runtime montado via método opcional `applyWorldSession`, inclusive na inicialização. Alterar a sessão não provoca reconstrução do renderer. O runtime recebe apenas o contrato mínimo, sem consultas a banco, callbacks de formulário ou cópias de registros.
5. **Resposta ambiental inicial.** `sessionWorldVisuals.ts` utiliza **o mesmo grupo 3D** para uma runa/luz discreta sobre uma peça de mobília existente por tipo: leitura, entretenimento, estudo, treino e trabalho. Ativa com sessão confirmada, enfraquece quando pausada, desaparece quando não há sessão. Não é selectable nem simula falsa posse do livro. Recursos fazem parte da árvore de cena e são liberados com ela.

## Testes e verificações

- Testes dirigidos de identidade canônica, ausência de conteúdo privado, sessão pausada, retomada, conclusão, entrada removida e distinção de estudos/trabalhos.
- Teste do sinal da sessão: todas as cinco categorias, reaplicação no mesmo grupo, mudança para pausa, desaparecimento e descarte.
- **CI e testes de integração permanecem obrigatórios.** Os resultados definitivos da candidata devem ser registrados pelo GitHub; não presumir PASS dos arquivos novos ou do aplicativo físico.
- A CI global da BF-5.5E anterior tinha gates estáticos/unitários/build PASS, com shards E2E FAIL em 18 e 19 cenários; consultar a causa por cenário antes de atribuir regressão à F. A limitação de Ytha na rota lateral do livro B continua documentada.

## F2 — Tarefas deliberadamente reservadas ao Codex

- **Leitura física do mesmo livro** `entryId`: decidir identidade e autoridade única do volume da estante, transporte até mesa/poltrona, abertura, brilho, seleção/picking, reserva/assento e retorno; não criar clone visual.
- **Estudo com habitantes:** prioridade de sessão real, ocupação segura da cadeira, sentar, consultar, escrever, levantar e cancelar sem furar reservas ou atravessar mobiliário.
- **Trabalho/treino:** manipulação dos equipamentos corretos, gestos característicos e reações dos quatro personagens sem falsa sessão, de acordo com os rigs atuais.
- **Entretenimento:** reação contextual (filme/série) sem inventar uma sessão não registrada.
- **Concorrência e recuperação:** duas atividades, pausa/retomada, exclusão de entrada, mudança de abas, reinício, WebGL indisponível, fallback semântico e gates E2E físicos dirigidos; preservar o contrato F1.

## Restrições

Não alterar Dexie, backup, schemas, identidades, material pessoal nem merge automático. A BF-5.5G continua responsável pela avaliação física/artística no Moto G06. Não declarar a BF-5.5F concluída até as ações físicas e suas provas de integração serem entregues.
