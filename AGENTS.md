# Regras de contribuição automatizada

## Antes de alterar

1. Leia `docs/STATUS.md` e `docs/README.md`.
2. Leia apenas os documentos ativos relacionados ao escopo.
3. Consulte `docs/decisions/README.md` e as decisões aplicáveis.
4. Verifique código, testes, scripts e estado Git; documentação não substitui evidência do checkout.
5. Trate `docs/history/` como registro histórico, nunca como instrução operacional.
6. Se uma autoridade ativa contradisser o código ou uma decisão mais recente, interrompa somente a parte conflitante e relate a divergência.

## Limites arquiteturais

- `domain` não importa React, Dexie, Capacitor, DOM ou browser.
- `application` coordena domínio, transações e portas.
- `infrastructure` implementa portas e valida dados externos.
- React não acessa Dexie diretamente.
- Eventos saem somente após o commit da transação correspondente.
- A rota Biblioteca não possui mundo ou renderer neste baseline.
- Não crie contratos espaciais especulativos antes de uma decisão aprovada.

## Escopo e qualidade

- Implemente apenas o pedido autorizado e preserve os seis tipos de registro.
- Não introduza conta, backend, sincronização, nuvem, social, analytics, XP, moedas, streaks ou novos mundos sem decisão explícita.
- Mudança de schema exige versão aditiva, testes de upgrade/reabertura e revisão do backup.
- Mudança de comportamento exige regressão e atualização documental no mesmo checkpoint.
- Não oculte erros com `any`, `@ts-ignore`, casts cegos ou lint desativado.

## Dados, segurança e privacidade

- Nunca versione credencial, keystore, senha, token, backup pessoal ou exportação real.
- Fixtures, E2E, screenshots e relatórios públicos usam conteúdo fictício.
- Logs e diagnósticos não contêm conteúdo pessoal nem caminhos sensíveis.
- Todo arquivo externo é não confiável até passar por validação estrita.
- Não limpe ou restaure dados reais sem confirmação explícita e estratégia de recuperação.

## Verificação

Use comandos proporcionais ao escopo:

```text
npm run format
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run audio:check
npm run build
npm run performance:report
npm run test:e2e
npm run android:sync
npm run android:build:debug
git diff --check
git status --short
```

Playwright não substitui aparelho Android real. Não alegue teste manual, TalkBack, áudio percebido ou desempenho físico sem evidência humana registrada.

## Git, Android e documentação

Sem autorização explícita, não faça commit, push, tag, rebase, force push, exclusão de branch, reset destrutivo, assinatura, publicação ou mudança de versão. Preserve alterações preexistentes.

Atualize `docs/STATUS.md` para o presente, `docs/ROADMAP.md` para trabalho futuro aprovado, o documento técnico da área para o contrato vigente, `CHANGELOG.md` para mudanças observáveis e `docs/decisions/` para decisões arquiteturais.
