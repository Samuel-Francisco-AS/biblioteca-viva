# ADR-021 — Empreitadas, Atlas Vivo e avaliações

- Data: 2026-11-05.
- Estado: implementação candidata BF-5 Parte 2F, autorizada pelo proprietário; aceite humano pendente.
- Base: PR #29, `7267a3e4a268d0e8ac6a91f1d15b1b538c59df4f`; preserva #25–#29 e ADR-014–020.

## Empreitadas

O discriminante continua `work`. Metadados opcionais `kind`, `startDate` (data civil), `reference` e `initialNotes` complementam área, cliente/organização, descrição, prazo UTC anterior e próxima ação escrita. Criar exige somente título. Datas/escolhas usam os controles internos da Parte 2E.

`WorkEntry.plan?` é um agregado limitado com etapas, tarefas, diário manual e `nextTaskId?`. Etapas/tarefas/inscrições têm IDs estáveis únicos dentro do agregado; a ordem dos arrays é a ordem escolhida. Cada comando relê o proprietário em transação, exige `expectedRevision`, aplica validação estrita e incrementa a revisão do registro. A revisão é do agregado inteiro, não uma revisão independente que permita sobrescrever subitens concorrentes. Dois comandos com a mesma revisão: somente um confirma. Edição dos metadados pelo novo formulário também envia revisão e relê em transação. Eventos são publicados depois do commit. Organização de favoritos/etiquetas relê o proprietário dentro da transação; sessões manuais de Livro/Trabalho reconciliam o registro corrente no commit para preservar nota/planejamento gravados durante o rascunho.

A escolha por estruturas vinculadas ao registro, em vez de tabelas próprias, é deliberada: operação pessoal de um único fólio, sem consultas globais de tarefas, relação exclusiva e exclusão/restauração naturalmente atômicas. Evita um novo grafo de ownership no banco/backup. Limites de validação: 100 etapas, 2.000 tarefas e 5.000 inscrições; título até 300, descrição até 4.000, diário até 8.000 e link até 2.000 caracteres. São limites de entrada, não budgets artísticos/desempenho. Tabelas próprias devem ser reconsideradas se houver necessidade real de busca global, volume superior ou concorrência granular; não são antecipadas aqui.

Estado da tarefa: pendente, em andamento, bloqueada, concluída. Concluir/reabrir não muda automaticamente o estado da empreitada. Progresso = concluídas / tarefas atuais, arredondado; sem tarefas não existe porcentagem. Bloqueada não é conclusão; sessões/anotações não entram na conta. Etapa calcula com suas próprias tarefas. Próximo prazo é a menor data de empreitada, etapas ainda abertas e tarefas não concluídas, inclusive vencida. Próxima ação é explicitamente escolhida/escrita, nunca prioridade inferida. Concluir/excluir a tarefa escolhida limpa sua seleção, preservando a próxima ação escrita independente.

Mover tarefa na lista troca sua posição com a vizinha da mesma etapa; transferir entre etapas usa o editor. Excluir etapa confirma e preserva tarefas sem etapa. Exclusão da empreitada remove o agregado junto com os dependentes anteriores na transação já existente. Diário mantém data original ao editar; inscrições são manuais, sem eventos automáticos disfarçados. Notas anteriores permanecem legíveis no histórico e editáveis pelas ferramentas existentes. Referências são `http`/`https`, manuais, nunca buscadas automaticamente; sem GitHub API, autenticação ou sincronização em runtime.

## Persistência e backup

Dexie **v14 aditiva**, mesmas dez tabelas/índices v13; upgrade só atualiza marcador, sem reescrever registros, sessões, mídia ou preferências. `plan?` e metadados são opcionais para registros antigos. Perfil físico aceita campos novos opcionais.

Backup **v6** é mantido porque os novos dados integram entidades/settings já contidos no envelope, com a mesma política de substituição, checksum canônico, limite global de 10 MiB e validação estrita compartilhada. A validação do plano verifica duplicatas, ownership de etapas e seleção de tarefa aberta. Backup v6 anterior sem campos novos mantém exatamente seu material de checksum e continua importável; teste cobre restore novo/antigo e reabertura. Sem downgrade para APK antigo: versões anteriores podem rejeitar estes campos. Exportação excessiva falha explicitamente; nada é truncado.

Nenhum `entryId`, `instanceId`, `modelTypeId`, namespace, renderer, seleção, navegação, ordenação ou estado RPG muda. Tarefas não viram objetos 3D. Teste compara a projeção antes/depois do planejamento.

## Atlas Vivo

Gravura SVG original em código, com desenhos próprios masculino/feminino de torso, cabeça/cabelo e contornos dos membros; indumentária/traço não sexualizados. Geometria editorial (círculos, quadrado, construção, hachuras e pergaminho) permanece estática. Hierarquia de quadril/joelho/tornozelo/ombro/cotovelo articula os segmentos; RAF altera somente transforms dos grupos, com interpolação entre movimentos. Repouso respira discretamente; agachamento flexiona quadril/joelhos e desce a pelve; braços elevam ombros e dobram cotovelos; aeróbico é um polichinelo estilizado. Nenhuma transformação da ilustração inteira substitui a articulação.

Categoria sugere apenas uma coreografia inicial (força → agachamento; resistência → braços; cardio/esporte → aeróbico; demais → repouso). Escolha manual acessível sempre disponível; não há reconhecimento específico de exercícios. IntersectionObserver, visibilitychange, preferência de movimento do app/sistema e cleanup cancelam RAF. Apresentação estática conserva uma pose reconhecível do movimento escolhido. Sem asset externo, rede, nova dependência, cálculo médico ou limite artístico baseado em especulação sobre Moto G06.

`physical.profile.v1` aceita peso opcional e `gender?: male|female|other|undisclosed`, `atlas?: auto|male|female`. Pode guardar somente preferência, sem peso/gênero. Automático seleciona feminino para feminino, masculino para masculino; ausência/outras respostas usam o estudo masculino como padrão editorial explicitamente identificado, sempre substituível pela escolha manual independente. Gênero não declara anatomia individual, não é obrigatório e não participa da função MET. Perfil é local, editável, removível e incluído no backup; estimativas antigas continuam com seu snapshot.

## Cinco estrelas

`StarRating` usa cinco rádios DOM nativos, alvos de 44 × 48 px, rótulos “N de 5 estrelas”, foco visível, preenchimento cumulativo e marca/escala da estrela selecionada. Valor textual fornece leitura além da cor. Teclado mantém navegação nativa; Limpar remove a nota. Mesmo componente nos dois formulários e nos fólios, sem input numérico concorrente.

`PersistedRating` apresenta feedback imediato provisório, bloqueia cliques concorrentes, confirma só após o comando e restaura o valor persistido em falha. Usa `BookEntry.rating` e `catalog.rating`, com `UpdateBookEntry` e `SaveEntertainment`; não existe segunda avaliação. Livro ganha leitura dentro da transação e revisão esperada opcional no comando existente. Acompanhamento audiovisual preserva a avaliação já persistida; durante rascunho de acompanhamento a avaliação fica indisponível para não descartar o rascunho.

Ateliê oferece incluir/ocultar avaliação. Adaptadores fornecem apenas a nota persistida; Canvas 2D desenha cinco estrelas geométricas (douradas/apagadas), sem depender de fonte ou overlay DOM. Ausência/ocultação não desenha nem reserva a faixa. Linha própria abaixo da legenda preserva título e mensagem nas proporções 4:5, 9:16, 1:1. Nenhum texto privado é consultado; citações continuam exigindo escolha explícita. Modos, fundos, mídia, Share/SAF e arquivo da prévia permanecem os da Parte 2E.

## Evidência e limites

[Relatório da entrega](../BF-5_PARTE2F_EMPREITADAS_ATLAS_AVALIACOES.md). Verificações web e APK técnico não atestam arte, TalkBack, teclado virtual, fluidez, lifecycle ou exportação física no Moto G06. A BF-5 permanece aberta; sem merge automático nem declaração de CI global verde.
