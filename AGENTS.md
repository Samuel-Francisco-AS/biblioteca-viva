# Regras de contribuição automatizada

## Antes de alterar

1. Leia `docs/STATUS.md` e `docs/README.md`.
2. Leia apenas os documentos ativos relacionados ao escopo.
3. Consulte `docs/decisions/README.md` e as decisões aplicáveis.
4. Verifique código, testes, scripts e estado Git; documentação não substitui evidência do checkout.
5. Trate `docs/history/` como registro histórico, nunca como instrução operacional.
6. Se a documentação ativa contradisser o código ou uma decisão mais recente, interrompa somente a parte conflitante e relate a divergência.

## Limites arquiteturais

- `domain` não importa React, Phaser, Dexie, Capacitor, DOM ou browser.
- `application` coordena domínio e portas.
- `infrastructure` implementa portas e valida dados externos.
- React e Phaser não acessam Dexie diretamente.
- Phaser recebe projeções imutáveis, emite interações tipadas e não decide regras de negócio.
- `WorldStructureState` e `PlacedObject` são agregados distintos.
- Seleção, preview, câmera, pan, timers, tweens e realces são efêmeros.
- Eventos saem somente após o commit da transação correspondente.

## Escopo e qualidade

- Implemente apenas o pedido autorizado.
- Não introduza conta, backend, sincronização, nuvem, social, analytics, XP, moedas, streaks, porta vertical ou novos mundos sem decisão explícita.
- Preserve os seis tipos de registro já implementados.
- Não crie exceções estruturais por blueprint, coordenada ou `instanceId`.
- Mudança de schema exige migração aditiva, testes de upgrade/reabertura e revisão do backup.
- Mudança de comportamento exige regressão e atualização documental no mesmo checkpoint.
- Não oculte erros com `any`, `@ts-ignore`, casts cegos ou lint desativado.

## Dados, segurança e privacidade

- Nunca versione credencial, keystore, senha, token, backup pessoal ou exportação real.
- Fixtures, E2E, screenshots e relatórios públicos usam conteúdo fictício.
- Logs e diagnósticos não contêm conteúdo pessoal nem caminhos sensíveis.
- Todo arquivo externo é não confiável até passar por validação estrita.
- Não limpe ou restaure dados reais sem confirmação explícita e estratégia de recuperação.

## Verificação

Escolha os comandos proporcionais ao escopo, começando pelos focados e ampliando quando a mudança atravessar fronteiras:

```text
npm run format
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run audio:check
npm run wall-assets:check
npm run build
npm run performance:report
npm run test:e2e
npm run android:sync
npm run android:build:debug
git diff --check
git status --short
```

Playwright não substitui aparelho Android real. Não alegue teste manual, TalkBack, áudio percebido ou desempenho físico sem evidência humana registrada.

## Git, Android e release

Sem autorização explícita, não faça commit, push, tag, rebase, force push, exclusão de branch, reset destrutivo, assinatura, publicação ou mudança de versão. Preserve alterações preexistentes e não atribua ao trabalho atual arquivos que já estavam modificados.

## Atualização documental

- `docs/STATUS.md`: presente, problemas conhecidos e próxima decisão.
- `docs/ROADMAP.md`: trabalho futuro aprovado ou em avaliação.
- documento técnico da área: contrato vigente.
- `CHANGELOG.md`: mudança observável.
- `docs/decisions/`: decisão arquitetural nova ou substituição explícita.
- `docs/history/`: somente material encerrado que precisa ser preservado.
