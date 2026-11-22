# BF-5.7B — Reconciliação documental e estado final

**Data da reconciliação:** 22/11/2026  
**Escopo:** documentação e classificação de entregas da BF-5.7B.  
**Estado:** BF-5.7B encerrada por decisão expressa do proprietário, com ressalvas técnicas registradas. A BF-5.7 como um todo permanece aberta.

> Este documento é a referência consolidada para o estado da BF-5.7B. Ele prevalece sobre estados operacionais antigos mantidos nos relatórios de cada checkpoint, que continuam preservados como registros históricos. A reestruturação A–H foi posteriormente integrada pela PR #60 e a Issue #50 foi sincronizada; para o planejamento vigente, consulte [reestruturação A–H](BF-5_7_REESTRUTURACAO_A-H_2026-11-22.md) e [Issue #50](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/50).

## 1. Síntese executiva

A BF-5.7B entregou a reorientação do Arcanário e a retirada técnica do Duelo Arcano/TCG. A cadeia foi integrada à `main` pela [PR #58](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/58).

O resultado integrado:
- removeu a interface ativa, rotas, motor, serviços, contratos, arena e assets exclusivos do TCG;
- preservou o Arcanário educativo, incluindo os fluxos de flashcards, questões, baralhos e pacotes;
- preservou a Lua orbital como entrada para `/arcanario`;
- estabeleceu a identidade de persistência `biblioteca-viva-bf57`, Dexie v19 e backup atual v12, com rejeição explícita de dados TCG incompatíveis;
- incorporou saneamentos de persistência, navegação orbital, seleção e testes.

**A conclusão da BF-5.7B não significa que todo o plano original B1–B6 foi executado integralmente.** B3, B4 e B5 não foram realizadas como entregas independentes. A validação final foi aceita nos aspectos funcionais, mas permanecem dívidas técnicas e limites de homologação.

## 2. Reconciliação de B1–B6

| Subetapa | Estado reconciliado | Evidência / observação |
|---|---|---|
| **B1 — Inventário técnico e decisão arquitetural** | **Concluída** | Auditoria estática CP1–CP5 e handoff documentados em [BF-5_7B1_AUDITORIA_HANDOFF.md](BF-5_7B1_AUDITORIA_HANDOFF.md). O inventário continua válido; as instruções iniciais de preservação/compatibilidade foram superadas pela decisão de 12/11 sobre descarte de dados locais de teste. |
| **B2.1 — Travas de compatibilidade** | **Encerrada como obsoleta para o plano vigente** | [PR #53](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/53) foi fechada. Os testes históricos do contrato legado registraram 31/31 PASS, mas deixaram de ser requisito após a autorização para descartar os dados locais de teste. Não deve ser tratada como gate pendente. |
| **B2.2 — Persistência isolada** | **Concluída e integrada** | [PR #54](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/54), incorporada à `main` antes da integração final. Nova identidade `biblioteca-viva-bf57`; não importa nem limpa automaticamente o banco antigo. |
| **B2.3 — Retirada da UI do Duelo** | **Concluída e integrada** | [PR #55](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/55), integrada pela cadeia de branches e trazida à `main` pela PR #58. Menus/rotas/entradas de combate retirados; rotas antigas redirecionadas; Lua orbital preservada. |
| **B2.4 — Remoção estrutural do TCG** | **Concluída e integrada** | [PR #56](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/56), integrada pela PR #58. Motor, serviço, contratos, arena e assets exclusivos removidos; Dexie v19 e persistência educativa preservados; backup atual v12 rejeita conteúdo TCG incompatível. |
| **B2.5 — Saneamento residual e checkpoint R3** | **Concluída e integrada, com ressalvas** | [PR #57](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/57), integrada pela PR #58. Reentrada lunar corrigida e dois novos E2E dirigidos passaram em ciclos repetidos. Glifos fragmentados e stalls/fluidez no aparelho não foram comprovadamente resolvidos. |
| **B2.6 — Consolidação Android pós-retirada** | **Absorvida pela consolidação final; sem entrega independente** | Não foi identificada PR ou checkpoint autônomo B2.6. A integração e o gate funcional foram consolidados na [PR #58](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/58) e no diagnóstico associado. Não criar retrospectivamente uma entrega separada. |
| **B3 — Navegação e apresentação** | **Não executada como subetapa independente** | A remoção de entradas TCG e os redirecionamentos pertencem à B2.3; não equivalem à reforma planejada de Portal, Acervo, Oficina e demais superfícies. |
| **B4 — Consolidação educacional** | **Não executada como subetapa independente** | Funcionalidades educacionais existentes foram preservadas e testadas; não houve a rodada de consolidação/autoria/filtros/histórico/pacotes descrita no plano original. |
| **B5 — Cartas de atividade física** | **Não executada** | Ficha de treinamento e carta de desempenho por período permaneceram conceitos candidatos. Não houve decisão final de produto, contrato de dados ou implementação de uma nova família de cards. |
| **B6 — Regressões, Android e aceite** | **Aceite funcional concluído com ressalvas** | O proprietário aprovou os fluxos funcionais avaliados no Moto G06. A validação não certifica desempenho sustentado, TalkBack, P95/P99, memória ou comportamento térmico; as pendências E2E permanecem documentadas. |

### Leitura correta da cadeia de PRs

- **#52:** plano e reorientação documental; não implementou funcionalidades.
- **#53:** checkpoint de compatibilidade legado; encerrado como obsoleto após a decisão superveniente sobre os dados de teste.
- **#54:** isolamento da persistência; incorporado à `main`.
- **#55 e #56:** retiradas de UI e estrutura do TCG; integradas sequencialmente na cadeia.
- **#57:** saneamento residual/R3; integrado à `main` pela PR #58.
- **#58:** integração final à `main` e consolidação das evidências/gates. É a referência para o estado integrado, não uma prova de que B3–B5 tenham sido executadas.

## 3. Validação e ressalvas que permanecem

### Evidências positivas

- Na PR #57, lint, typecheck, build e Vitest global isolado passaram; os testes dirigidos finais registraram 234/234 PASS e os dois novos E2E R3 passaram em três ciclos por caminho.
- O diagnóstico da PR #58 registra 12/12 testes dirigidos específicos da BF-5.7B PASS.
- O proprietário aprovou no Moto G06 os aspectos funcionais de entrada/saída da órbita lunar, reentrada por Canvas e controle acessível, navegação do Arcanário, flashcards, questões e persistência.
- A execução CI analisada na PR #58 passou em format check, lint, typecheck, Vitest, áudio, build e relatório de performance.

### Falhas e limites — não converter em PASS

- A execução CI da PR #58 teve **36 falhas E2E** distribuídas entre testes históricos de mundo 3D, residência, leitura, RPG, controles e lifecycle. O diagnóstico as classifica como legadas, instabilidade de ambiente ou causas inconclusivas; não foi demonstrada regressão crítica específica da BF-5.7B. Isso não significa que os 36 testes tenham sido corrigidos.
- Na rodada R3 anterior, três cenários gráficos antigos também permaneceram FAIL; os dois novos testes de reentrada passaram. Não confundir esses resultados com a contagem da CI da PR #58.
- O gate físico funcional não certificou fluidez geral, ausência de stalls, fragmentação de glifos, TalkBack, métricas P95/P99, memória sustentada ou comportamento térmico.
- O APK submetido ao gate do proprietário foi produzido com alterações locais documentais/E2E adicionais sobre o HEAD de referência. Seu resultado funcional é evidência do aparelho, mas não deve ser descrito como reprodução byte a byte de um commit remoto específico.
- GitHub Actions sem execução em checkpoints anteriores não deve ser retroativamente classificado como PASS; considerar apenas a execução CI identificada no diagnóstico da PR #58.

Fontes de evidência:
- [PR #58 — integração final](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/58)
- [Diagnóstico E2E da PR #58](BF-5_7B_PR58_DIAGNOSTICO_E2E.md)
- [Relatório B2.5-R3](BF-5_7B2_5_R3_GATE_FISICO_REPAROS.md)
- [PR #54 — persistência isolada](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/54)
- [PR #55 — retirada da UI](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/55)
- [PR #56 — remoção estrutural](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/56)
- [PR #57 — saneamento R3](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/57)

## 4. Itens que não podem ser atribuídos à BF-5.7B

Não registrar como entregues nesta etapa:
1. reforma completa de Portal, Acervo e Oficina;
2. consolidação adicional de flashcards, questões, autoria, filtros, histórico e pacotes;
3. criação ou decisão final sobre cards de atividade física;
4. homologação completa de performance, acessibilidade e estabilidade física;
5. encerramento da BF-5.7 como um todo.

A existência de funcionalidades de flashcards, questões, pacotes e atividade física anteriores à BF-5.7B, ou sua preservação durante a retirada do TCG, não comprova execução das melhorias planejadas em B3/B4/B5.

## 5. Encaminhamento para a reorganização da BF-5.7

As partes não executadas de B3, B4 e B5 — e eventuais verificações residuais que forem confirmadas como trabalho ainda necessário — foram transferidas para a etapa **BF-5.7C** pela reestruturação A–H, integrada na PR #60. C permanece planejada e não iniciada.

A transferência deve preservar a distinção entre:
- trabalho não executado;
- trabalho existente que foi apenas preservado;
- dívida técnica de validação/performance;
- decisões de produto ainda abertas.

Esta reconciliação não cria tarefas de implementação, não autoriza começar a nova BF-5.7C, não fecha a issue #50 e não encerra a BF-5.7. A reestruturação A–H e a atualização integral da Issue #50 foram concluídas documentalmente pela PR #60; a BF-5.7 permanece aberta.

## 6. Decisão final

**BF-5.7B: ENCERRADA por decisão expressa do proprietário, com ressalvas técnicas documentadas.**

**BF-5.7: permanece ABERTA.** Nenhuma etapa posterior é considerada iniciada por este documento.
