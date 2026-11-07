# Biblioteca Viva — ponto de retomada para R3 (07/11/2026)

> Registro canônico de continuidade após o aceite físico dirigido da R2 e de seus reparos. Complementa a matriz de achados e os relatórios históricos; não representa CI global verde, merge nem encerramento da recuperação.

## Estado e fontes

- Projeto: `Samuel-Francisco-AS/biblioteca-viva`. Branch de execução `perf/bv-recuperacao-integral`, [PR draft #38](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/38), base F `feat/bf-5-5f-real-session-response` em `254ae15d48a10896d00b8a6b539532725375d13c`. **Sem merge**; PRs #32–#37 permanecem separadas.
- **Último SHA de PRODUÇÃO validado:** `849dd290c2f715012257b5b49e3e8d59c7d6f50a` (R1 + R2A/B/C + saneamento pós-R2). O próximo commit de documentação não é outra implementação.
- História: R1 `bf26e8d`; R2A `50f425d`; R2B `291b0b4`; R2C `10c664c`; saneamento `849dd290`.
- Fontes: [auditoria integral](BV_AUDITORIA_ARQUITETURA_PERFORMANCE_STACK.md), [plano e matriz dos 18 achados](BV_PLANO_RECUPERACAO_EXECUCAO.md), [saneamento e evidências do Livro da Estrela](BV_SANEAMENTO_POS_R2.md), [ADR-024](../decisions/ADR-024-recuperacao-r2-componentes-e-assets.md).

## Aceite físico recebido do proprietário em 07/11/2026

Após atualizar o APK gerado **localmente no Fedora** e inspecionar a versão pós-R2 no **Moto G06**, o proprietário relatou:

1. **Melhora considerável no lag e nos travamentos do Canvas.** O avanço é perceptível, mas não equivale a FPS, latência P95/P99 ou GPU medidos, nem demonstra ausência absoluta de jank.
2. **Remodelagens aprovadas.** Os quatro artefatos refinados na rodada pós-R2 foram considerados bons: Estudo (mesa pequena com cadernos/elemento mágico), Trabalho (estojo de ofício), Filmes (projetor com efeito emissivo econômico) e Atividade Física (par de halteres). Livro e Série conservam os modelos da R2C.
3. **Livro da Estrela corrigido:** em resposta à pergunta explícita, confirmou que o reparo funcionou e que o bug de bater a capa sem conseguir abrir parou. Trata-se do livro cenográfico `living:book`, não do volume pessoal da sessão.
4. **R2 e saneamento aprovados para avançar à R3**, que será iniciada em conversa nova. Aceite **funcional/artístico dirigido**, não ensaio exaustivo de todo o aplicativo.

## Mudanças e evidências importantes

- **R1:** caches de câmera e eliminação de picking duplicado. Evidência de CPU do host, não medição Android.
- **R2A:** colisores autorais dissociados de ornamentos, grafo/índice espacial; mesmo cenário de benchmark passou de **1.220 a 155 obstáculos** inicialmente, depois **125** na consolidação. **65 rotas válidas e sete recusadas preservadas**; envelope de Ytha 0,92 m mantido.
- **R2B:** draw calls **353→326** na vista normal e **452→403** na afastada, com arte preservada nos frames de comparação. CPU misto e buffers/variantes de shader maiores; não há prova de FPS ganho global por essa mudança isolada.
- **R2C:** seis artefatos de registros próprios, IDs/slots/picking preservados e contratos de assets substituíveis. O saneamento remodelou especificamente quatro categorias; por uma peça de cada, **7.644→4.216 triângulos potenciais** (-44,8%), sem luz dinâmica nova para o efeito de filmes.
- **Causa do Livro da Estrela:** transporte restaurava rotação de capa fechada a cada frame, concorrendo com a animação. Correção deu ownership da capa ao update, deixou comandos de abrir/fechar convergirem, protegeu páginas e transporte. Testes automatizados e confirmação física disponíveis no relatório do saneamento.

## Pendências que NÃO foram fechadas

- [CI no SHA de produção `849dd290`](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42330962430): **estáticos/unitários/build PASS**, **ambos shards E2E FAIL**, global **FAIL**. O novo E2E React de seleção/reload continua sem passar; não inventar equivalência a partir do gate manual dirigido.
- Sem profiling quantitativo do Moto G06 (GPU, P95/P99, memória, temperatura, input-to-photon), gate exaustivo de lifecycle, TalkBack, backup/restore real ou certificação de toda a aplicação.
- BF-5.5F2A permanece funcionalmente parcial (F2B/F2C, leitura sentada/rigs não foram concluídos); **não incluir desenvolvimento dessas features na R3**.
- R4/R5 continuam abertas. A auditoria de Godot foi documental; **migração de stack não autorizada nesta recuperação**.

## Próxima execução: R3

**Objetivo:** reduzir custo contínuo do mundo, simplificar a agência e validar lifecycle/memória mantendo R1/R2 e a arte recém-aprovada. Trabalhar somente na branch/PR #38, sem merge, com três checkpoints publicados separadamente.

- **R3A — BV-05, BV-06, BV-08:** evitar scene.traverse para luz em cada frame, interpolação em repouso e recálculo de bounds/capa/leases; reduzir alocações/poses/snapshots de agência, livro e pergaminhos. Preservar magia, iluminação, transporte e identidade.
- **R3B — BV-10:** diminuir o acoplamento entre agência, visuais e coreografia; manter a autoridade única e exclusividade, sem reconstruir uma engine paralela ou ampliar o escopo artístico.
- **R3C — BV-15:** medição/reparos de lifecycle, pausa/retorno, tabs, listeners, loaders, recursos WebGL e memória. Só declarar leak se confirmado; teste físico no Moto G06 continua necessário.
- Por checkpoint: baseline dirigido, implementação, testes proporcionais, documentação, commit e push. Sem loops improdutivos ou refatoração ampla preventiva. Não alterar dados, schema, backup, artes aprovadas ou o status das PRs anteriores.
- **R4** contempla BV-09, BV-13, BV-14, BV-16, BV-17 e BV-18 (projeção, observabilidade, diagnóstico, WebView, integridade e E2E/CI). **R5** contempla BV-11 (rigs/animações) e pipeline de assets. O programa R1–R5 segue aberto.

**Mensagem sugerida para a nova conversa:** «Luna, vamos continuar a Biblioteca Viva pela R3. Consulte `docs/audits/BV_RETOMADA_R3_2026-11-07.md`, a matriz dos 18 achados e a PR #38; prepare a execução de R3A–R3C, preservando o aceite físico/artístico da R2 e sem merge.»
