# BF-5 — Atlas clássico projetado

Refinamento específico da [PR draft #30](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/30), encadeada à #29. Base sincronizada: `750dcf53046892d559a23a0b2ae30753ff23b36e`, worktree inicialmente limpo. O proprietário rejeitou o atlas articulado; esta entrega o substitui sem modificar Empreitadas, avaliações ou a execução/estimativa dos treinos. BF-5 permanece aberta, sem merge ou aceite humano presumido.

## Substituição

- Removidos `BodyStudy.tsx`, `atlasMotion.ts`, seus testes de poses e `living-atlas.css`, além dos estilos órfãos `.body-study`. Sem rig SVG, articulações, RAF contínuo, seletor de exercício ou coreografia.
- `ClassicAtlas.tsx` / `classicAtlas.ts` / `classic-atlas.css` apresentam três gravuras por conjunto. Artes frontais, em três quartos e estudo do passo, com desenhos próprios e linguagem clássica uniforme.
- Permanência de 8 s, seguida de dissolução de opacidade por 1,8 s. Decodificação antes da transição; no máximo duas camadas temporárias. Pausa manual, fora de viewport, página oculta e movimento reduzido. Avanço manual estático quando a rotação está pausada.
- Em Automático, gênero escolhe o conjunto; ausência/Outro/Prefiro não informar usam masculino como padrão editorial. A escolha manual existente em Ajustes continua independente e prevalece sobre o automático. O gênero não descreve anatomia individual nem altera MET.
- Arte protagonista em retrato; arte e dados diários lado a lado no fólio largo. Gráfico, ficha, registros, estimativa, seções recolhidas e perfil físico preservados. Sem schema/backup/dependência nova: Dexie v14 / backup v6.

Contrato técnico: [ADR-022](decisions/ADR-022-atlas-classico-projetado.md).

## Artes e origem

Seis arquivos em [`public/illustrations/atlas-classico/`](../public/illustrations/atlas-classico/): `{masculino,feminino}-{frontal,tres-quartos,movimento}.webp`. Criados com a skill `imagegen`, ferramenta integrada ImageGen, uma chamada por arte, com transparência solicitada. PNGs convertidos em WebP qualidade 88, 1024 × 1536, alpha preservado; sem edição criativa posterior. Tamanho aproximado do conjunto: 2 MiB. Originais mantidos no diretório padrão da ferramenta; o app depende somente dos WebPs versionados, offline. [Prompt comum e seis complementos exatos](../assets/atlas-classico/README.md).

São estudos artísticos estilizados, não demonstrações clínicas ou orientação de postura. Nenhuma imagem pessoal ou asset externo foi usado. Revisão visual assistida não representa aceite artístico do proprietário.

## Verificações

| Verificação                       | Resultado                                                                                                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run format` / `format:check` | PASS                                                                                                                                                                                          |
| `npm run lint` / `typecheck`      | PASS após corrigir doubles/lifecycle; sem regras desativadas                                                                                                                                  |
| Vitest dirigido                   | **19/19 PASS em 8 arquivos**: coleção/perfil, permanência, dissolução, pausa, movimento reduzido, visibilidade, cancelamento, falha de decode, MET/treino e preservação de perfil/arquitetura |
| E2E novos                         | **3/3 PASS**: masculino/rotação/pausa, feminino/redução/manual e falha de arquivos (15,5 s / 5,8 s / 3,1 s)                                                                                   |
| E2E regressão de Atividade Física | **2/2 PASS**, 14,6 s / 6,4 s, sem retry                                                                                                                                                       |
| `npm run build`                   | PASS; warning conhecido de chunks >500 kB, sem alterar limite                                                                                                                                 |
| `npm run android:sync`            | PASS, três plugins existentes                                                                                                                                                                 |
| `npm run android:build:debug`     | PASS, Gradle 184 tarefas (27 executadas / 157 atualizadas)                                                                                                                                    |
| `git diff --check`                | PASS na revisão                                                                                                                                                                               |

APK técnico: `android/app/build/outputs/apk/debug/app-debug.apk`, **8.363.209 bytes**. SHA-256 `a19e4fb998081ccef7268952e29bdef36aa4548623af81a5041fa42c0ccf013d`. Não instalado nesta entrega. Os cinco E2E são cenários distintos, sem ampliação de timeout ou retry. Não foi rodada a suíte ampla; áudio e engine 3D não foram alterados.

Falhas intermediárias, separadas do baseline:

A primeira rodada unitária teve 12 PASS/2 FAIL por mocks de preferência de movimento e seleção ambígua de status; os doubles foram corrigidos e a rodada seguinte passou 14/14. Lint apontou setters síncronos nos effects; a implementação passou a reconciliar estado nos callbacks de eventos/lifecycle, sem desativar regras. Typecheck identificou `scrollMargin` ausente no double de IntersectionObserver; o double foi completado. Uma execução de lint encontrou `ENOENT` ao percorrer `test-results` enquanto o Playwright recriava o diretório; foi repetida sequencialmente depois dos E2E, sem alterar configuração ou código por essa corrida. Não foram alterados timeouts nem removidas asserções do comportamento vigente.

Baseline da PR #30, SHA anterior: [CI 41966605609](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41966605609), gates estáticos/unitários/build PASS e dois shards E2E FAIL (12m08s / 8m37s). Não se repetiu a suíte ampla para buscar verde.

## Evidências e limitações

Evidências novas em [`evidence/BF-5_ATLAS_CLASSICO/`](evidence/BF-5_ATLAS_CLASSICO/), somente treino fictício. [Masculino em retrato](evidence/BF-5_ATLAS_CLASSICO/masculino-frontal-retrato.png) · [paisagem](evidence/BF-5_ATLAS_CLASSICO/masculino-paisagem.png) · [dissolução](evidence/BF-5_ATLAS_CLASSICO/dissolucao.png).

[Feminino frontal](evidence/BF-5_ATLAS_CLASSICO/feminino-frontal-retrato.png) · [três quartos](evidence/BF-5_ATLAS_CLASSICO/feminino-tres-quartos-retrato.png) · [passo](evidence/BF-5_ATLAS_CLASSICO/feminino-movimento-retrato.png) · [paisagem](evidence/BF-5_ATLAS_CLASSICO/feminino-paisagem.png) · [demonstração WebM](evidence/BF-5_ATLAS_CLASSICO/projecao.webm). Há também duas capturas de regressão de treino. Imagens revisadas visualmente quanto a carregamento, composição e ausência de rig; aprovação artística permanece humana.

Capturas antigas da Parte 2F são cronologia da candidata rejeitada, não o visual atual. Não sobrescrever essas evidências históricas.

- Pendente: avaliação artística do proprietário, instalação/fluidez no Moto G06, rotação física, teclado/Voltar, lifecycle Android e TalkBack humano.
- Geração é uma interpretação artística; não há correção biomecânica ou associação precisa entre prancha e exercício do dia.
- Projeção/pausa não são preferências persistidas. A visita inicia na primeira prancha do conjunto; pausas e saída da tela reiniciam a espera, sem trocas acumuladas.
- Arquivo indisponível mantém a imagem anterior e informa a falha; a funcionalidade de treino não depende das artes.
- Nenhuma mudança de fórmula, backup, migração ou dados do usuário.

## Roteiro Moto G06

1. Atualizar o APK preservando dados; abrir treino antigo com estimativa e conferir gráfico, ficha e histórico.
2. Em Ajustes, testar masculino/feminino em Automático, ausência de gênero e preferência visual manual; reabrir o treino e conferir o conjunto.
3. Observar pelo menos duas trocas completas; avaliar beleza, dissolução, ausência de piscadas e legibilidade em retrato/paisagem. Pausar e avançar manualmente.
4. Rolar para fora/voltar, bloquear/desbloquear a tela e alternar app; conferir retomada sem saltos. Ativar movimento reduzido no app/sistema e conferir arte estática com avanço manual.
5. Conferir foco/TalkBack nos controles e dados metabólicos. Empreitadas e avaliações continuam como na entrega anterior.

Não há aceite físico/artístico nem fechamento da BF-5 nesta entrega.
