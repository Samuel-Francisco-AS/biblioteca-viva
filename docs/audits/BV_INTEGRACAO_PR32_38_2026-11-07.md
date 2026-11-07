# Integração cumulativa das PRs #32–#38 — Biblioteca Viva

**Data:** 07/11/2026. **Escopo:** integração administrativa e técnica, não encerramento da BF-5.5 ou da recuperação R1–R5.

## Autorização e proveniência

O proprietário autorizou expressamente o merge cumulativo das PRs #32–#38 na `main`, aceitando como exceção documentada o E2E de seleção/highlight ainda falho. Também autorizou o encerramento administrativo das PRs incorporadas. Os critérios de aceite humano relatados cobrem R2, R3 e saneamento de segurança no Moto G06, sem regressões percebidas; **não** constituem gate artístico/funcional exaustivo de BF-5.5A–F.

- Primeiro pai do merge: `main` em `360aac10679ec1916d9e0dee412196abdf73b192`.
- Segundo pai do merge: candidata acumulada `71a3164a03eca6754e09a1b93626dec0cc80f077` (`perf/bv-recuperacao-integral`, PR #38).
- A PR #38 incorpora por ancestralidade os HEADs das PRs #32–#37, em ordem A→B→C→D→E→F parcial, seguidas da recuperação R1→R2→R3 e atualizações de segurança.
- A `main` tinha seis commits exclusivos, com projeção/contrato de sessões F1 idênticos ao conteúdo da candidata e workflow de preview Android exclusivo dela. O ensaio `merge --no-commit --no-ff` foi **sem conflitos**; preservou as duas histórias e o workflow.
- Única correção adicional de produção do merge: em `.github/workflows/android-preview-apk.yml`, mudar `java-version: '21'` para `java-version: "21"`, conforme `prettier --check` da árvore integrada.

Esta integração deve usar um commit com dois pais, **sem squash, rebase, force push ou exclusão de histórico**. Sua mensagem contém `[skip ci]` devido à cota de GitHub Actions esgotada. A ausência de nova execução remota não é sinal de CI verde.

## Validação do ensaio integrado

- `npm ci` PASS; `npm audit --omit=dev` e `npm audit` com **zero alertas**; lockfile idêntico ao da candidata.
- Capacitor Core/Android/CLI 8.4.3; React Router/DOM 7.18.5; Zod 4.6.7. Overrides específicos de minimatch 11.0.5 e glob 14.0.4 preservados.
- `format:check` FAIL **antes** da correção de uma linha no workflow exclusivo da `main`; PASS **depois**.
- Lint, TypeScript, **923 testes unitários em 144 arquivos**, áudio, build web, relatório de bundle, sync/build Android e `git diff --check` PASS.
- E2E dirigido após build: **3 PASS / 1 FAIL**, zero retries. Busca/Arquivo, backup e restore de base fictícia aprovados; o cenário R2 de seleção/highlight de série falhou por timeout de 30 s, atributo vazio. Falha anterior existente em SHA pré-segurança ocorreu em passo distinto. A causa não foi atribuída e a paridade causal não foi demonstrada. **Não declarar CI global verde.**
- Uma tentativa inicial dos E2E sem `dist` foi erro de preparação do harness, sem evidência sobre o produto; a rodada válida ocorreu após o build.
- Ensaio e patch de formatação foram preparados em worktree isolada, sem publicação prévia; não são uma validação física nova.

## Ressalvas e dívidas que permanecem abertas

1. BF-5.5F ainda parcial: pegar o livro nas mãos, leitura sentada, F2B/F2C e refinamentos de rigs não entregues. BF-5.5G não executada e BF-5.5 **não encerrada**.
2. Ytha não tem alcance seguro para o percurso lateral do livro cenográfico com envelope de asas de raio 0,92 m; não reduzir o envelope ou simular travessia.
3. Retenção de memória host pós-GC e crescimento do heap observados no harness da R3 permanecem **sem causa atribuída**; não alegar leak Android nem memória estabilizada.
4. CI E2E global histórica vermelha, seleção/highlight R2 com falha; atenção também a TalkBack, integridade de backups reais e medição sustentada Android. Correções de CI, integridade e observabilidade pertencem à R4, sem início antecipado.
5. R4/R5 não iniciadas, migração de engine não autorizada, nenhum release/beta aprovado.

## Administração das PRs

As PRs #32–#37 e #38 são incorporadas por ancestralidade ao merge cumulativo. Após atualizar `main`, verificar o estado nativo de cada PR; as que permanecerem abertas devem ser encerradas **por incorporação**, com comentário vinculando o commit cumulativo e preservando as ressalvas acima. Um fechamento administrativo `closed` **não** deve ser descrito como `merged` no GitHub quando a plataforma não o reconhecer assim.

Não apagar branches nem alterar versões/arte para concluir a administração. O ponto de retomada pós-integração é a `main` com os dois históricos preservados.
