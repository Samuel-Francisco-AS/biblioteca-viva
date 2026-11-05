# BF-5 Parte 2F — Empreitadas, Atlas Vivo e avaliações

Candidata de implementação de 2026-11-05. Branch `feat/bf5-parte2f-empreitadas-atlas-avaliacoes`, derivada da PR #29 (`7267a3e4a268d0e8ac6a91f1d15b1b538c59df4f`). Fetch remoto confirmou branch/HEAD idênticos, worktree limpo e dependências instaladas (`npm ls --depth=0`, Node 24.18.0/npm 12.0.2). Preserva #25–#29. Sem alteração da main, merge, fechamento da BF-5 ou aceite artístico/físico.

## Experiência entregue

- **Empreitadas:** fólio contínuo com identidade, progresso real, etapas/tarefas, próxima ação escolhida, diário cronológico e seções recolhidas de sessões/organização. Criar somente com título; planejar depois. Estados, edição, reordenação por toque/teclado, transferência de etapa, referências manuais e confirmações de exclusão. Etapa excluída devolve tarefas a Sem etapa. Sessões/resultados e notas anteriores preservados. Os casos conceituais Biblioteca Viva/My-CT orientam fases, critérios, links e diário, sem importar/cadastrar seus dados; testes usam observatório/obras fictícias.
- **Atlas Vivo:** duas gravuras SVG originais e articuladas; repouso, agachamento, braços e aeróbico. Categoria sugere movimento, seleção manual e apresentação estática disponíveis. Pausa por viewport, página oculta e movimento reduzido. Perfil físico local permite peso/gênero voluntários e preferência visual independente. MET inalterado.
- **Avaliações:** cinco estrelas nativas compartilhadas entre Livro/audiovisual/formulários, confirmação imediata de persistência e recuperação em falha. Remoção/alteração no próprio fólio. Canvas exporta nota persistida em cinco estrelas geométricas, com opção de ocultar, nos três formatos atuais.

Contrato detalhado, invariantes, limites e justificativa de agregado embutido: [ADR-021](decisions/ADR-021-empreitadas-atlas-avaliacoes.md). Dexie **v14** aditiva; backup **v6** compatível com v6 anterior, sem downgrade garantido. Nenhuma dependência, conta, sincronização ou entidade espacial adicionada.

## Verificações

| Verificação                                    | Resultado realmente observado                                                                             |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `npm run format` / `format:check`              | PASS; sem ajuste de configuração                                                                          |
| `npm run lint`                                 | PASS; lint dirigido adicional no E2E legado atualizado                                                    |
| `npm run typecheck`                            | PASS, incluindo testes/E2E                                                                                |
| Vitest ampliado                                | 214 PASS em 30 arquivos; arquivo novo de Canvas corrigido e 2/2 PASS isolados                             |
| Vitest final dirigido                          | 75/75 PASS em 10 arquivos, com sobreposição à rodada ampliada                                             |
| E2E novos                                      | Quatro cenários distintos aprovados: Empreitadas, Livro/PNG/teclado, audiovisual e perfil/Atlas/lifecycle |
| E2E de regressão                               | Dois cenários anteriores de treino aprovados; seis cenários distintos aprovados ao todo entre rodadas     |
| Rodada web final de atlas/empreitada + treinos | 3 PASS/1 FAIL por seletor raster obsoleto; após adequação, cenário restante 1/1 PASS (14,5 s)             |
| `npm run audio:check`                          | PASS, dois assets verificados                                                                             |
| `npm run build`                                | PASS; warning conhecido de chunks >500 kB, sem alteração do limite                                        |
| `npm run performance:report`                   | PASS; inicial 659.253 bytes; sem inferência de FPS físico                                                 |
| `npm run android:sync`                         | PASS, três plugins existentes                                                                             |
| `npm run android:build:debug`                  | PASS; Gradle 184 tarefas, 27 executadas / 157 atualizadas                                                 |
| `git diff --check`                             | PASS na revisão final                                                                                     |

Os totais Vitest têm sobreposição e não são somados como testes distintos. A bateria inclui domínio/aplicação, concorrência real Dexie, rollback, upgrade v13→v14/reabertura, backup v6 novo/antigo, imagens, sessões, organização, formulários, fólios, projeções e fronteiras 3D/acessíveis. O teste de corrida intercala uma gravação de tarefa/avaliação entre a leitura inicial de sessão manual e o commit; planejamento/nota mais recentes sobrevivem. A apresentação de Empreitadas também verifica contraste ≥4,5:1 para títulos, links e ações principais sobre o papel.

APK técnico final: `android/app/build/outputs/apk/debug/app-debug.apk`, **6.362.997 bytes**, SHA-256 `7b8892331a4e1528cf08fce66c80fd9059d09667360a092eefe05bca3dd02377`. Não foi instalado nesta entrega. Nenhuma execução equivale a CI global verde.

Baseline remoto da #29: [CI 41955573638](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41955573638), gates estáticos/unitários/build PASS; dois shards E2E FAIL (9m35s / 8m34s). Dívidas anteriores #21–#24 continuam abertas. Não foram repetidos os shards amplos para tentar obter verde.

Falhas intermediárias desta entrega, separadas do baseline: primeira rodada dirigida **121 PASS/1 FAIL**, por duplicidade da exibição antiga de avaliação em Mais informações, removida em favor das estrelas. Rodada ampliada **214 PASS e um arquivo novo sem compilar**, por erro de sintaxe no mock do renderizador; corrigido sem remover asserts. Lint inicialmente apontou handlers async, stringificação de FormData e mocks sem await; corrigidos. Build inicialmente encontrou sintaxe de E2E/mock, corrigida. Nenhum timeout foi aumentado e nenhum teste foi enfraquecido.

Demais falhas intermediárias, resolvidas e não atribuídas ao baseline:

- E2E inicialmente não iniciou porque `video` estava configurado dentro de `describe`; configuração movida ao nível do arquivo.
- Primeira rodada E2E: 2 PASS/2 FAIL — rótulo implícito do estado no editor e fixture de treino sem calendário/exercício. Rótulos de controles novos passaram a associações explícitas e a fixture passou a respeitar o cadastro vigente.
- Segunda: 3 PASS/1 FAIL — expectativa textual exata ignorava o símbolo de bloqueio. A asserção passou a conferir o texto no estado da tarefa correta, preservando a exigência de Bloqueada.
- Dirigida seguinte: Atlas PASS, Trabalho FAIL — `check()` verificava o estado antes do commit assíncrono. O fluxo agora toca e aguarda explicitamente checkbox marcado/desmarcado e porcentagem correspondente. Trabalho 1/1 PASS após a correção.
- Regressão nova de avaliação esperava remoção física da propriedade, mas o contrato anterior representa nota removida por `undefined`; asserção verifica essa ausência semântica após reabrir. Fixture da corrida de sessão usava `durationSeconds` em vez do `duration` vigente; corrigida sem mudar schema de sessão. Rodada final 75/75 PASS.
- Rodada web com regressões: seletor antigo de imagem raster não existe mais. Substituído por SVG acessível visível, dez grupos articulados e dimensões efetivas >100 px, mantendo verificações de treino/MET/remoção de perfil. Reexecução desse cenário 1/1 PASS.
- Inspeção das capturas encontrou herança de cores claras em títulos/ações de Trabalho, controles de pose excessivamente grandes e mãos fora da composição em elevação. Corrigidos estilos locais/contraste, controles compactos, margem superior e articulação dos tornozelos. Novas capturas e assert de contraste aprovados; sem alegação de aceite artístico.

## Evidências

Capturas e demonstração web em [`evidence/BF-5P2F/`](evidence/BF-5P2F/), somente conteúdo fictício. PNGs exportados são os próprios artefatos Canvas, não capturas do DOM. Vídeo registra animações web; não é benchmark nem evidência Android. São 16 PNGs e uma demonstração WebM. Inspeção visual automatizada assistida das capturas confirmou legibilidade após o reparo de contraste, presença de poses diferentes, ambos os desenhos e estrelas nos banners. Isso é revisão da candidata, não aceite artístico humano.

- [Empreitada em retrato](evidence/BF-5P2F/empreitada-retrato.png) · [paisagem](evidence/BF-5P2F/empreitada-paisagem.png).
- [Atlas masculino: repouso](evidence/BF-5P2F/atlas-masculino-rest.png) · [agachamento](evidence/BF-5P2F/atlas-masculino-squat.png) · [braços](evidence/BF-5P2F/atlas-masculino-shoulders.png) · [aeróbico](evidence/BF-5P2F/atlas-masculino-aerobic.png).
- [Atlas feminino em retrato](evidence/BF-5P2F/atlas-feminino-retrato.png) · [paisagem](evidence/BF-5P2F/atlas-feminino-paisagem.png) · [demonstração de movimentos](evidence/BF-5P2F/atlas-demonstracao.webm).
- [Livro e estrelas](evidence/BF-5P2F/avaliacao-livro-retrato.png) · [audiovisual em paisagem](evidence/BF-5P2F/avaliacao-cinema-paisagem.png).
- [PNG Livro 4:5](evidence/BF-5P2F/banner-livro-1350.png) · [9:16](evidence/BF-5P2F/banner-livro-1920.png) · [1:1](evidence/BF-5P2F/banner-livro-1080.png) · [PNG audiovisual](evidence/BF-5P2F/banner-cinema.png).
- Regressão de treino em [retrato](evidence/BF-5P2F/regressao-treino-retrato.png) e [paisagem](evidence/BF-5P2F/regressao-treino-paisagem.png). As evidências históricas da Parte 2C não foram sobrescritas.

## Limitações

- Arte, movimento anatômico percebido, conforto e fluidez exigem avaliação humana. Atlas é um estudo estilizado frontal, sem demonstração técnica/correção postural de exercícios reais.
- Padrão editorial automático para ausência/outras respostas é masculino; qualquer pessoa pode selecionar o feminino independentemente do gênero ou remover todo o perfil.
- Planejamento tem limites explícitos; não há dependências entre tarefas, Kanban, anexos, integração remota, tarefa recorrente automática ou objetos 3D de tarefas. “Trabalho recorrente” classifica a empreitada.
- Próximo prazo considera datas vencidas ainda abertas. Progresso muda com inclusão/exclusão/reabertura de tarefas; não encerra a empreitada automaticamente.
- Diário novo é manual. Anotações anteriores preservam o contrato anterior e aparecem identificadas; seus editores continuam disponíveis. Nenhuma sessão antiga é convertida em tarefa/diário.
- Backup conserva limite global de 10 MiB incluindo capas; excesso falha explicitamente. APK antigo pode rejeitar campos novos. Backup pessoal não foi usado.
- Falha de publicação após commit continua seguindo a sinalização existente da aplicação; reabrir os dados antes de repetir evita reaplicar uma operação confirmada. O controle de revisão impede duplicação por repetição da revisão anterior.
- TalkBack humano, teclado virtual, Voltar físico, áudio percebido, SAF/Share, processo encerrado e desempenho sustentado não foram validados nesta entrega.

## Roteiro físico curto — Moto G06

1. Atualizar o APK preservando dados. Reabrir um Trabalho, treino e livro anteriores; conferir sessões, notas, capas e objetos no Canvas/seleção/navegação.
2. Ajustes → Perfil físico: escolher gênero sem peso, alternar Automático/Masculino/Feminino independentemente, reabrir e remover perfil. Conferir que treinos continuam utilizáveis e estimativas antigas não mudam.
3. Treino: observar ambos os desenhos, quatro movimentos, alternância e apresentação estática. Rolar para fora/voltar, bloquear/desbloquear tela e ativar movimento reduzido. Avaliar articulações, estética e fluidez em retrato/paisagem.
4. Livro e audiovisual: tocar 1–5 estrelas, mudar, limpar, reabrir. Usar foco/TalkBack. Exportar com/sem nota nos formatos 4:5, 9:16 e 1:1; conferir PNG recebido/salvo e preservação das notas privadas.
5. Criar empreitada só com título; incluir etapas/tarefas com prazo, critério e link. Bloquear, concluir/reabrir, reorganizar, mover de etapa e escolher próxima ação. Conferir contagens e porcentagens, diário e sessões recolhidas.
6. Digitar com teclado em retrato/paisagem, abrir escolhas/datas, usar Voltar, cancelar edição/exclusão; conferir dock/safe areas, foco e rolagem. Exportar backup e testar restauração somente em ambiente descartável com recuperação preservada. Não limpar dados pessoais.

O aceite amplo físico foi acumulado para etapa posterior pelo proprietário. Esta entrega não declara esse aceite nem encerra BF-5.
