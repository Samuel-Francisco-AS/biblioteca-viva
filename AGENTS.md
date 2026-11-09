> **BF-5.6A — candidata autorizada em 08/11/2026:** a implementação específica da fundação foi solicitada pelo proprietário, com Dexie v15/backup v7. Ler [relatório](docs/BF-5_6A_FUNDACAO_IMPLEMENTACAO.md) e [ADR-025](docs/decisions/ADR-025-arcanario-fundacao-persistencia.md). Aceite/merge pendentes; a autorização não se estende a B–G/BF-6/BF-7. As notas de planejamento abaixo antecedem esta candidata.

# Regras de contribuição automatizada

> **Atualização de planejamento — 08/11/2026:** BF-5.5 foi encerrada com ressalvas. A fase **BF-5.6 — O Arcanário** foi aprovada **somente como plano**, inserida antes da BF-6 (RPG) e BF-7 (consolidação). Ler [plano BF-5.6](docs/BF-5_6_ARCANARIO_PLANO.md) e [ADR-020 revisada](docs/decisions/ADR-020-baralhos-e-cartas-globais.md). As regras históricas de sequência BF-5→BF-6 nesta página não superam essa decisão. Não iniciar implementação A–G sem pedido próprio; nenhuma migração, backend, conta, jogo ou arena foi criada pela formalização. Dívidas BF-5.5 seguem abertas como ressalvas.

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
- A rota Biblioteca hospeda a Fundação Three.js por `WorldHost` e `ThreeWorldRuntime`; Three.js é o renderer aprovado.
- A cena atual é uma fixture técnica descartável: não existe ainda Biblioteca final nem persistência espacial. Não crie contratos espaciais especulativos antes das fases autorizadas.
- BF é a trilha funcional prioritária sob a ADR-011; P3D-B2–F estão adiados até necessidade demonstrada de GLB definitivo.
- Conteúdo procedural produtivo não promove fixtures F1/F4 ou cenários F5. A orientação histórica de checkpoints BF pequenos não se aplica à **BF-5 vigente**: a [ADR-014](docs/decisions/ADR-014-replanejamento-pos-bf4.md) estabelece uma **reforma global integrada de UI/UX**, seguida por rodadas de refinamento, sem subdivisão obrigatória em pequenos checkpoints. Preservar testes proporcionais, gates e segurança em qualquer método.

## Prioridade artística e economia responsável de cota (decisão de 2026-11-02)

**Ambição artística e criativa é requisito central da Biblioteca Viva.** Buscar um mundo fantástico rico, personagens expressivos, identidade própria, relações e narrativas significativas. Não adotar modelos simplórios, efeitos reduzidos ou animações mínimas por supor que o Moto G06 não aguenta: F5 não encontrou teto de capacidade, e BF-4F2 teve aceite físico sem queda de fluidez percebida. Isso não elimina os requisitos de segurança, acessibilidade, lifecycle e estabilidade real.

Produzir **trabalho útil e visualmente convincente primeiro**; medir gargalos reais antes de otimizar. Evitar preflights descartáveis, refatorações preventivas, hard budgets inventados e otimizações por contagem de meshes ou timeout headless isolado.

**Proteger a cota Codex:** leitura focada dos arquivos ativos, checkpoints produtivos, testes dirigidos na implementação e uma rodada final proporcional. Não consumir cota em loops de Playwright/SwiftShader, retries e ajustes de timeouts sem nova hipótese. Após até duas tentativas de correção fundamentadas sem progresso na mesma causa, registrar o bloqueio e preservar o trabalho seguro. Nunca omitir asserts ou testes, e registrar falhas novas da CI separadamente das antigas. Aceite artístico é humano; não implica CI verde. [Arte](docs/ART_DIRECTION.md), [testes](docs/TESTING.md), [desempenho](docs/PERFORMANCE.md).

**Regra pós-BF-4 (2026-11-03):** sequência **BF-5 UI/UX → BF-6 Mundo Vivo/RPG → BF-7 consolidação funcional/assistiva (antiga BF-5)**. Em BF-5, planejar primeiro o design geral e entregar uma reforma de interface substancial e coesa; somente depois refinar com feedback do usuário até o aceite. **Não impor pequenos checkpoints de implementação**, preflights descartáveis ou protótipos em substituição à reforma solicitada. Commits internos, testes dirigidos, validação no Moto G06 e triagem de falhas reais permanecem permitidos/necessários, sem alegação prematura de CI verde. Replanejamento documental **não autoriza execução**, nem altera limites arquiteturais ou gates assistivos. [ADR-014](docs/decisions/ADR-014-replanejamento-pos-bf4.md).

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
