# BF-5.7 — Saneamento documental

**Data:** 22/11/2026  
**Escopo:** reconciliação documental após as PRs #58, #59 e #60.  
**Natureza:** somente documentação. Esta PR não altera código, schema, banco, migrações, backup, assets, testes, workflows ou configuração de produto.

## Estado canônico usado

- BF-5.6 foi encerrada globalmente com ressalvas em 11/11/2026; não é a fase atual.
- BF-5.7 permanece aberta.
- BF-5.7A: concluída com ressalvas.
- BF-5.7B: encerrada com ressalvas; retirada do TCG integrada pela PR #58 e reconciliação documental pela PR #59.
- A estrutura A–H foi integrada pela PR #60 e a Issue #50 sincronizada.
- BF-5.7C: planejada, não iniciada. BF-5.7D–H: não iniciadas.
- Persistência ativa: Dexie v19 e backup v12 educativo. O TCG/Duelo Arcano, motor, arena e assets exclusivos foram removidos; payloads TCG antigos são rejeitados.
- BF-6 não foi iniciada nem autorizada.

## Correções desta PR

| Área | Reconciliação |
|---|---|
| `AGENTS.md` | Atualiza instruções operacionais para BF-5.7 A–H, Dexie v19/backup v12 e retirada do TCG; reclassifica snapshots BF-5.6 como cronologia. |
| `docs/ARCHITECTURE.md` | Distingue arquitetura ativa de contratos históricos de combate/arena. |
| `docs/DATA_MODEL.md` | Distingue backup v12 educativo dos contratos históricos v7–v11; marca tabelas e payloads TCG como retirados. |
| `docs/decisions/README.md` | Corrige estados das ADRs 025–031; ADR-029/030 preservadas como retiradas, ADR-027/028 como implementadas. |
| ADRs 027–030 | Atualiza estados de implementação e retirada, sem apagar o conteúdo histórico. |
| `docs/BF-5_7B_RECONCILIACAO_2026-11-22.md` | Registra que a transferência B3/B4/B5 para C e a reestruturação A–H já foram concluídas documentalmente pela PR #60. |
| Caderno UX | Mantém as 17 propostas, mas deixa explícito que PR #51 foi integrada e que o caderno não autoriza execução automática. |
| Roadmap, Status e índice docs | Estabelecem precedência dos blocos canônicos de 22/11 e identificam snapshots antigos como cronologia, não estado operacional. |
| `CHANGELOG.md` | Registra a cadeia de reconciliação #58–#60 e o escopo estritamente documental. |

## Issues abertas preservadas

A consulta confirmou que as issues #21, #22, #23 e #24 permanecem abertas. Seus corpos descrevem dívidas originadas na BF-5 anterior e incluem critérios de validação que não foram comprovados como resolvidos por esta auditoria documental.

- **#21 — backup/restauração E2E:** requer revalidação com o modelo e backup atuais; critérios antigos podem precisar de atualização.
- **#22 — histórico imutável de execuções:** requer confirmar se o comportamento e o teste ainda apresentam a falha descrita.
- **#23 — suíte E2E de navegação/WebGL/RPG:** requer inventário atual, separando falhas corrigidas, regressões e limitações de runner.
- **#24 — lapidação de formulários:** requer verificar sobreposição com as reformas BF-5.7A e etapas E posteriores.

As issues #4, #11 e #15 também continuam abertas como dívidas históricas de CI/E2E. Nenhuma issue foi fechada, reescrita ou transferida nesta PR. A classificação e eventual atualização dessas issues exigem reconciliação própria, com evidência atual.

## Verificações e limites

- A branch foi criada a partir de `main`; todas as alterações são em arquivos Markdown.
- Os arquivos modificados foram relidos na branch após as gravações.
- Não foram executados testes de aplicação, build ou CI, pois não houve alteração de código e a cota de Actions não deve ser consumida por uma PR documental.
- A PR não declara PASS de CI, Android, TalkBack, performance ou E2E.
- A PR não altera o corpo da Issue #50, não fecha issues, não inicia BF-5.7C e não autoriza BF-6.

## Referências

- [Issue #50 — planejamento mestre BF-5.7](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/50)
- [PR #58 — retirada do TCG e saneamento](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/58)
- [PR #59 — reconciliação BF-5.7B](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/59)
- [PR #60 — reestruturação A–H](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/60)
- [Reestruturação A–H](BF-5_7_REESTRUTURACAO_A-H_2026-11-22.md)
