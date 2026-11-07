# Integração da PR #39 — R4 e saneamento de leitura

Em 07/11/2026, o proprietário autorizou expressamente a integração à main. Informou aceite físico dirigido da R4 e do saneamento pós-R4 no Moto G06: cronômetro funcionando, pausa e retomada corretas, livro saindo da estante, indo à mesa, abrindo e retornando, e nova interface de leitura aprovada com ajustes futuros desejáveis. Esse relato não comprova teste exaustivo ou gates assistivos.

- Main de entrada: `d5eb469b22dea9d8b604543b408de817aea8b076`.
- Candidata de entrada: `36a39a7704175ad472988b3bc35d4633e3bb06ab`.
- Merge commit: `960d8cecb94f7de776215e5d91c1dbe16bc65c4a`, com ambos os SHAs acima como pais, sem squash ou rebase.
- Saída de produto: o merge acima; saída documental: o commit que contém este relatório, descendente do merge. Seu SHA pode ser obtido com `git log -1 --format=%H -- docs/audits/BV_INTEGRACAO_PR39_R4_2026-11-07.md`, evitando autorreferência impossível.

A candidata registrou 946 testes unitários PASS, gates locais e E2E dirigido de leitura/Pomodoro PASS; evidências e limites estão nos [relatórios R4](BV_RECUPERACAO_R4.md) e [pós-R4](BV_SANEAMENTO_POS_R4_LEITURA.md). O E2E R2 permaneceu FAIL por deadline, causa não atribuída. Não se declara CI global verde. O HEAD candidato usou `[skip ci]`; consulta disponível de runs associados a PR retornou vazia, com limitação a runs de PR e primeira página. Integração e documentação usam `[skip ci]`; nenhum dispatch ou rerun manual foi solicitado. A ausência de runs não prova aprovação nem consumo zero.

Permanecem abertas a dívida E2E R2, pendências assistivas incluindo TalkBack, retenção de memória host sem atribuição, e BF-5.5 parcial (F2B/F2C, leitura sentada, rigs e gate G). Desempenho sustentado e áudio percebido não foram declarados aprovados. A recuperação integral não está encerrada; R5 não foi iniciada. Não houve alteração funcional adicional nesta integração.
