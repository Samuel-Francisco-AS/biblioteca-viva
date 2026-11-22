# BF-5.7B — Reforma do Arcanário: visão, decomposição e critérios

> **DECISÃO SUPERVENIENTE — 12/11/2026, após B2.1:** o proprietário confirmou expressamente que **todos os dados locais atualmente existentes no APK são exclusivamente de teste e podem ser descartados**. Portanto, a exigência anterior de preservar as cartas/partidas históricas do TCG, restaurar backups legados e manter leitores de `combat`/`combat_match` **não é requisito da B2**. Essa autorização substitui os gates de retenção definidos antes desta data. O relatório [B1](BF-5_7B1_AUDITORIA_HANDOFF.md) permanece válido como **mapa de dependências**, mas suas instruções de compatibilidade são **históricas e não vinculantes**. A [PR #53](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/53) contém testes do contrato antigo; não exigir sua correção/merge como condição para a B2.2. Ainda não há autorização para executar o reset no aparelho nesta PR documental.

### Política atual de dados e simplificação técnica

- **Dados atuais:** registros de teste do APK podem ser apagados integralmente, inclusive cartas, partidas, sessões, baralhos, flashcards, questões, treinos, configurações e mídias locais. Não é necessário migrá-los nem manter suporte de restauração a backups históricos para sua recuperação.
- **Produto futuro:** preservar o funcionamento **dos recursos educacionais e físicos no código** e a integridade de dados **novos criados após a reforma**; descarte de dados de teste não autoriza excluir features úteis nem deixar persistência, backup corrente ou testes novos quebrados.
- **Corte limpo:** o agente deve escolher e documentar um mecanismo explícito e testável para que instalações existentes não tentem interpretar bancos incompatíveis (por exemplo, inicialização com schema/identidade de banco renovada ou reset intencional versionado). **Não** depender de falha de parser, limpeza parcial ou exceção silenciosa. Se houver limpeza automática, ela é destrutiva e deve ser comunicada claramente.
- **Backup:** simplificar contratos, validadores e versões conforme necessário para o novo formato; backups anteriores à reforma podem ser recusados com erro explícito, sem falsa promessa de compatibilidade. O backup do **novo** estado educacional deve continuar íntegro e testado.
- **TCG:** pode-se retirar domínio, motor, replay, variantes de schema, mídia e assets exclusivos após verificar dependências e assegurar build/testes. Não manter código obsoleto apenas para reproduzir dados descartáveis.
- **Controle de escopo:** não implementar ainda cartas físicas, importar ENEM/concursos, redesenhar toda a UX ou iniciar BF-6 nesta retirada. PRs draft, checkpoints verificáveis e merge somente com aceite.

**Esta decisão prevalece** sobre qualquer trecho abaixo que prescreva retenção de `combat`, `combat_match`, deck/partida legados, backup v11 histórico ou bloqueio de B2.2 até aprovação de F2/F3. Os textos anteriores são mantidos como registro cronológico da auditoria.

> **Atualização de auditoria B1 — 12/11/2026:** concluída uma **auditoria estática diretamente no remoto**, dividida em CP1–CP5, com diagnóstico de rotas, domínio, Dexie v19, backup v11, recursos 3D e regressões. [Relatório técnico e handoff para Copilot](BF-5_7B1_AUDITORIA_HANDOFF.md). **Parecer:** iniciar somente B2.1 (testes preventivos com fixtures legadas) mediante autorização específica; não executar retirada em massa do TCG nem apagar dados autorais/históricos. **Nenhum código produtivo, teste local, APK ou CI foi executado nesta PR**. A BF-5.7B e a B2 permanecem abertas; merge exige aceite explícito.

**Data da decisão:** 12/11/2026
**Estado:** plano e direção de produto acordados; **somente documentação nesta PR**. Implementação, migrações, exclusões, testes de produção e merge **não iniciados** por este registro.
**Base:** main após conclusão da BF-5.7A (PR #51), mantendo as ressalvas já conhecidas.
**Vínculo:** [BF-5.7 / issue #50](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/50).

> **Decisão do proprietário:** retirar o Duelo Arcano/TCG e as cartas exclusivas de combate, pois a Biblioteca Viva deve priorizar utilidade funcional e educacional. Reorientar o Arcanário para **flashcards**, **questões de múltipla escolha** (incluindo expansão futura para ENEM e concursos) e uma nova família de **cartas de atividade física**. Esta última está em concepção: pode representar uma ficha de treino e/ou um resumo estilizado do desempenho em determinado período.

## 1. Por que mudar

A BF-5.6A–D entregou uma base educacional aproveitável: cartas globais, baralhos, oficina, flashcards, Provações, taxonomia, filtros, diagnósticos, pacotes opcionais e operação local/offline. As etapas E–F acrescentaram um produto de entretenimento independente (motor TCG, cartas de combate, fluxo de duelo e Arena Viva 3D), com custos contínuos de apresentação, manutenção e testes.

A mudança **não invalida o trabalho histórico da BF-5.6**, encerrada com ressalvas; é uma nova decisão de escopo da BF-5.7. O objetivo não é remover a linguagem fantástica, e sim fazer a magia **servir às tarefas reais**, em vez de gerar um jogo paralelo dentro da BV.

### Princípios de produto

1. **Utilidade antes do espetáculo:** cada carta deve ajudar a estudar, praticar, consultar, planejar ou representar dados reais.
2. **Identidade fantástica preservada:** manter a linguagem do Códice Iluminado, cristais, fólios e materiais mágicos, sem sobrepor ornamentação à leitura.
3. **Uma fonte de verdade:** cartas vinculadas a Estudos ou Atividade Física não devem manter um segundo histórico editável e divergente.
4. **Offline-first e privacidade:** dados e sessões locais por padrão; pacotes externos opcionais, explicitamente instalados e validados.
5. **Progressão pessoal sem competição compulsória:** acompanhar evolução física individual, sem rankings nem recompensas por excesso de exercício.
6. **Fluxos mobile verificáveis:** legibilidade, foco, toque, Voltar Android, retrato/paisagem e desempenho no Moto G06.
7. **Mudanças reversíveis e auditáveis:** refatorar com inventário, testes de migração/restore e aceite antes de descarte irreversível.

## 2. Nova visão funcional do Arcanário

O Arcanário passa a ser um **acervo de cartas úteis**, com três frentes principais: Conhecimento, Provações e Feitos. Os nomes são provisórios; não substituem nomenclatura de componentes, rotas nem contratos até decisão técnica.

### 2.1 Cartas de Conhecimento — flashcards

**Finalidade:** memorização, evocação ativa e revisão de conhecimentos.

- Frente e verso com conteúdo autoral, vínculos opcionais a Estudos, disciplinas/assuntos, etiquetas e coleções temáticas.
- Criação, edição, busca, organização, revisão, retomada e histórico de acertos/dificuldades, respeitando o modelo já existente de cartas globais.
- A mesma carta pode participar de mais de um baralho sem replicação independente; preservar a relação com a área Estudos.
- Revisão espaçada é desejável, mas algoritmo, intervalos e UX precisam de avaliação antes de impor nova regra a dados existentes.
- Miniaturas econômicas para listagens e carta completa para revisão/detalhes; animação de virar só quando agrega clareza, com alternativa acessível.
- Estados relevantes: nova, revisada, devida para revisão (se houver agenda), arquivada, rascunho e ausência de resultados; não confundir ausência de resposta com erro.

**Cuidado:** não tornar o formato visual obrigatório para textos extensos. O conteúdo legível tem prioridade sobre a proporção de uma carta colecionável.

### 2.2 Cartas de Provação — questões

**Finalidade:** exercícios de múltipla escolha, correção explicada e diagnóstico de estudo.

- Questões autorais e conteúdo de provas externas com enunciado, alternativas, gabarito, resolução/explicação, tags e proveniência.
- Expansão desejada: ENEM e concursos públicos, filtráveis por exame, edição/ano, aplicação, banca/órgão, área, disciplina, assunto e caderno quando pertinente.
- Sessões com seleção por filtros, histórico de respostas, retomada, revisão de erros e relatório por assunto.
- Questões extensas, tabelas e futuras imagens exigem apresentação adaptativa, área de leitura adequada, alternativas tocáveis e fluxo de correção claro.
- Distinguir acerto bruto, repetição da mesma questão e evidência de domínio; não inferir aprendizado robusto de um único acerto.
- Manter histórico vinculado à versão da questão respondida, inclusive quando enunciado, classificação ou gabarito forem corrigidos.
- Preservar arquitetura de **pacotes educativos opcionais**, manifestos, identidade, integridade, atualização idempotente e instalação offline; não colocar automaticamente acervos volumosos dentro do APK.

**Direitos e procedência:** importar ou redistribuir conteúdo ENEM/concursos exige verificar fonte oficial, condições de utilização, autoria/licença, gabarito e eventuais restrições. O fato de uma prova estar publicamente acessível não é, por si só, autorização irrestrita de redistribuição. Não alegar que a BV já distribui questões oficiais: o catálogo atual da BF-5.6D contém exercícios originais de demonstração.

### 2.3 Cartas de Feitos — atividade física (visão ainda aberta)

**Finalidade:** transformar dados reais da área Atividade Física em representações consultáveis, úteis e visualmente interessantes. A concepção possui **duas candidatas complementares**, não uma obrigação de criar ambas na BF-5.7B.

| Formato candidato             | O que representa                                                                                    | Possível interação                                                                                     | Origem dos dados                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| **Carta de Treinamento**      | A ficha/plano reutilizável: exercícios, séries, metas, dias previstos e observações relevantes      | Consultar ficha, abrir o registro original, eventualmente acessar a execução do dia                    | Ficha viva de Atividade Física        |
| **Carta de Desempenho/Feito** | Um período delimitado: semana, mês ou intervalo personalizado, com os registros efetivamente salvos | Consultar resumo, abrir dias registrados, opcionalmente gerar imagem compartilhável por ação explícita | Execuções e histórico real do período |

**Hipótese de projeto:** a carta de treinamento pode ser uma **visão viva** do plano atual; a carta de desempenho pode ser uma **projeção por intervalo**, gerada sob demanda, com eventual snapshot apenas para exportação ou registro histórico intencional. A decisão entre projeção dinâmica, snapshot persistente e mistura dos dois pertence à B5.

**Métricas candidatas:** treinos previstos/realizados, duração quando informada, aderência ao calendário, exercícios concluídos e comparações entre metas e execuções na **mesma unidade**. Não somar segundos a repetições, nem interpretar volume maior como qualidade automaticamente. Dados faltantes devem ser apresentados como ausentes, não convertidos em zero ou valores fictícios.

**Atenção aos limites existentes:** a ficha viva registra séries, metas, execução por dia, duração/intensidade opcionais e estimativa metabólica aproximada condicionada a dados suficientes. Uma carta não deve transformar estimativa de calorias em medição clínica, criar novos diagnósticos, prescrever treino ou pressionar o usuário a ultrapassar limites pessoais.

**Princípios gráficos:** a carta representa uma atividade real, não equipamento de batalha; pode usar gravuras/ornamentos originais, mas precisa oferecer uma alternativa textual clara, exportação respeitosa da privacidade e foco em leitura.

**Questões explicitamente em aberto:** uma ou duas subfamílias? Criação manual ou automática? Vinculação da carta ao plano alterado? Intervalos fixos ou livres? Acervo, área de Atividade Física ou ambos como ponto de entrada? Exportação PNG nesta fase ou depois? Não cristalizar o esquema de dados antes de responder.

### 2.4 Infraestrutura compartilhada e funcionalidades legadas

- Aproveitar identidade global, revisão, etiquetas, baralhos/coleções, Oficina, Acervo, Provações e Pacotes sem forçar que uma carta de treino se comporte como uma questão ou pertença a um baralho de revisão.
- **Ecos, Relicário e cartas decorativas/lembranças:** inventariar uso, dados e valor antes de decidir reposicionamento ou eventual retirada. A decisão atual elimina explicitamente **o TCG e cartas de combate**, não autoriza excluir indiscriminadamente outras cartas pessoais.
- A arquitetura de cartas pode evoluir para uma família física tipada ou para **projeções de apresentação** sobre registros existentes. Esta PR não determina migração nem criação de tabela.

## 3. Navegação e experiência pretendidas

Em vez de expor todos os destinos simultaneamente, o Portal deve dar acesso claro a tarefas frequentes: **revisar flashcards**, **resolver questões**, **consultar/acessar cartas de treino** e **criar/organizar conteúdo**. Acervo, Oficina e detalhes mantêm navegação contextual; funções secundárias podem ser agrupadas, sem desaparecer.

O desenho definitivo da hierarquia depende de avaliação em retrato/paisagem. Usar linguagem fantástica como camada de apresentação, com feedback de toque contínuo, estados claros, carregamento sem piscadas e comportamento coerente de Voltar e foco. O gesto físico de virar carta pode permanecer no estudo; enunciados longos e resultados físicos não devem ser confinados a cartões rígidos ou a efeitos 3D onerosos.

A antiga **construção orbital** pode ser reaproveitada como acesso ao Arcanário educativo, se isso preservar coerência e não exigir uma Arena Viva residente. A arena de duelo e seus recursos exclusivos não devem continuar carregando por inércia. A decisão artística e técnica é matéria da B1/B2.

## 4. Decomposição da BF-5.7B

As etapas seguintes são **recortes de trabalho**, não autorização de execução automática nem compromisso de um único PR de código. Cada implementação futura poderá ter sua própria PR, evidência e aceite, evitando mudanças destrutivas em lote.

### B1 — Inventário técnico e decisão arquitetural

**Objetivo:** mapear o que pertence exclusivamente ao TCG e o que serve ao Arcanário educacional.

- Inventariar rotas, componentes, serviços, domínio, tabelas/índices, backups, assets 2D/3D, portal orbital, testes e documentação; identificar dependências compartilhadas e dados autorais.
- Distinguir **arte de cartas de combate**, cartas de outras categorias, baralhos, sessões/replays, histórico e exportações.
- Delimitar o caminho de descontinuação e a política de retenção/compatibilidade para backups antigos e registros já criados.
- Propor novo mapa de navegação e contratos de carta física sem implementá-los precocemente.

**Saída/gate:** matriz de dependências, proposta de migração/retirada sem perda silenciosa e decisão explícita sobre dados legados.

### B2 — Descontinuação do Duelo Arcano

**Objetivo:** retirar o modo TCG, cartas e recursos exclusivos de combate da experiência ativa.

- Remover superfícies e rotas de duelo; desativar/retirar motor, apresentação, cards exclusivos, dependências e assets **somente após confirmação das referências**.
- Revisar lua/portal orbital, links, acessibilidade, navegação e carregamento de recursos para não deixar entradas órfãs.
- Preservar/inventariar conteúdo autoral e histórico legado; decidir entre retenção oculta compatível, exportação e/ou migração antes de qualquer exclusão definitiva.
- Garantir leitura/restauração suportada dos backups anteriores, ou formalizar política de conversão/compatibilidade testada, sem presumir downgrade de banco.

**Saída/gate:** TCG inacessível na UI ativa, ausência de referências quebradas, dados legados tratados segundo política aprovada, regressão educacional preservada. **Não basta esconder um botão.**

### B3 — Reforma das salas e navegação

**Objetivo:** fazer Portal, Acervo, Oficina, Provações e superfícies adjacentes refletirem o Arcanário funcional.

- Reduzir densidade de navegação e priorizar ações por tarefa.
- Unificar estados, hierarquia de informação, miniaturas leves e detalhes legíveis.
- Rever rotas profundas, histórico, Voltar Android, teclado, focus management, safe areas e movimento reduzido.
- Avaliar Ecos/Relicário sem eliminação automática de dados.

**Saída/gate:** fluxos compreensíveis em retrato/paisagem, sem perda de função educacional e com gate físico dirigido.

### B4 — Consolidação dos flashcards e questões

**Objetivo:** aperfeiçoar revisão, autoria, sessões de questões, filtros e integração dos pacotes.

- Revisar experiência do flashcard, feedback de revisão, retomada e acesso pelo Estudos.
- Refinar editor de questões, alternativas, correção, explicação e diagnósticos.
- Testar tags, metadados editoriais, revisão de versões, filtros, performance e casos de conteúdo longo.
- Preparar fluxo editorial verificável para pacotes ENEM/concursos, sem prometer distribuição imediata nem obtenção automática de direitos.

**Saída/gate:** fluxos autorais e de estudo completos, offline, recuperáveis após reinício, com histórico íntegro.

### B5 — Prototipação e contrato das cartas de atividade física

**Objetivo:** amadurecer os dois formatos candidatos sem comprometer a integridade da ficha viva.

- Criar wireframes ou protótipos de carta de plano e carta de desempenho por período.
- Definir vínculo com registros, atualização, calendário, campos opcionais, fonte canônica e apresentação de ausência de dados.
- Escolher a menor entrega útil. Implementar um protótipo funcional **somente após validação específica do proprietário**; adiar o restante se o conceito ainda não estiver maduro.
- Verificar que um card não modifica a execução real ao ser criado, filtrado ou exportado.

**Saída/gate:** decisão de produto registrada, contrato tipado proposto e validação visual/funcional do recorte efetivamente autorizado; pendências documentadas.

### B6 — Regressões, Android e aceite

**Objetivo:** consolidar uma reforma segura antes de proposta de merge/fechamento.

- Testes de domínio/aplicação, persistência e restauração: versões antigas, conteúdo autoral, baralhos, questões, flashcards, execuções físicas, exclusões e rollback.
- E2E de rotas, estados vazios/erro, importação de pacotes, retomada, foco e gestos.
- Gate físico no Moto G06: retrato/paisagem, rolagem, teclado, Back, fluidez ao tocar/revelar/virar, memória e ausência de cenas WebGL desnecessárias.
- Documentar PASS, FAIL e não executado separadamente; CI sem cota não vira PASS por suposição.

**Saída/gate:** relatório de evidência, ressalvas e pedido de aceite explícito do proprietário antes de qualquer merge de implementação.

## 5. Dados, compatibilidade e limites de segurança

O estado verificado na auditoria BF-5.6G tinha **Dexie v19 e backup v11**. Esses números são referência de baseline, **não** instrução para congelar versões ou criar migração de imediato.

1. **Nada de apagar bancos ou tabelas por conveniência:** mudanças de esquema devem ser justificadas, aditivas quando viável, idempotentes e transacionais, com caminho de restauração.
2. **Dados antigos de TCG não equivalem a código TCG ativo:** decidir preservação/exportação de cartas autorais, baralhos e replays antes de retirar persistência; não manter motor pesado só para guardar registros, se alternativa segura existir.
3. **Históricos educacionais imutáveis por versão respondida:** edição de conteúdo não reescreve tentativas passadas; não duplicar cartas globais em cada baralho.
4. **Cartas físicas derivadas de fonte canônica:** guardar preferências de apresentação/vínculo apenas quando necessário; não criar nova ficha de treino independente por acidente.
5. **Pacotes externos são dados não confiáveis:** validar manifestos, limites, hashes, versões, proveniência e direitos; não executar scripts/HTML de terceiros.
6. **Privacidade e compartilhamento:** nenhum envio automático de dados de desempenho físico; exportação eventual exige ação explícita.
7. **Arquitetura em camadas:** domain → application → infrastructure, interfaces React usando serviços/portas; evitar acesso direto à Dexie na UI e dependência de Three nos modelos educativos.

## 6. Fora de escopo nesta PR e dependências

**Esta PR documental não:** remove TCG, apaga cartas, altera UI, cria modelo físico, importa provas reais, instala pacotes, muda Dexie/backup, adiciona serviços online, gera APK, executa gates, nem inicia BF-6.

A BF-5.7C prevista anteriormente como reforma do Arcanário passa a precisar de **replanejamento após B**; não faz sentido duplicar trabalhos. A auditoria geral de UX originalmente planejada como B pode ser distribuída pelas frentes posteriores da BF-5.7, conservando o backlog de propostas como hipóteses, não como aceites automáticos. A issue #50 deve ser atualizada quando houver decisão sobre a nova repartição global.

## 7. Decisões estabelecidas x decisões pendentes

| Tema                                                             | Estado em 12/11/2026                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| Abandonar Duelo Arcano e cartas exclusivas de combate            | **Decidido como direção da B; implementação pendente**               |
| Priorizar flashcards e questões                                  | **Decidido**                                                         |
| Buscar expansão futura de questões ENEM/concursos                | **Decidido como objetivo; corpus/licenças/importação pendentes**     |
| Cartas de atividade física                                       | **Decidida a exploração conceitual; formato/escopo final pendentes** |
| Candidatos: ficha estilizada e desempenho por período            | **Ambos em avaliação; podem coexistir**                              |
| Preservar registros pessoais, histórico e backup                 | **Restrição obrigatória; estratégia detalhada em B1**                |
| Destino de lembranças, Ecos e Relicário                          | **Pendente de inventário e decisão específica**                      |
| Reutilização do portal orbital                                   | **Candidata; não aprovada tecnicamente**                             |
| Layout, nomes definitivos, algoritmo de revisão e exportação PNG | **Pendentes de prototipação/gates**                                  |
| Autorização de implementação, merges e fechamento da fase        | **Não concedida por esta PR documental**                             |

## 8. Referências de continuidade

- [Issue #50 — BF-5.7](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/50)
- [BF-5.7A — termo de fechamento](BF-5_7A_FECHAMENTO_2026-11-12.md)
- [Caderno de UX e fluidez — propostas](BF-5_7_CADERNO_PROPOSTAS_UX_FLUIDEZ_2026-11-11.md)
- [BF-5.6 — plano original do Arcanário](BF-5_6_ARCANARIO_PLANO.md)
- [BF-5.6G — auditoria e inventário](BF-5_6G_AUDITORIA_CONSOLIDACAO_2026-11-11.md)
- [BF-5.6D — pacotes educativos](BF-5_6D_PACOTES_OFICIAIS_IMPLEMENTACAO.md)
- [BF-5 Parte 2C — ficha viva de Atividade Física](BF-5_PARTE2C_ATIVIDADE_FISICA.md)
- [ADR-020 — identidade global, vínculos e migrações](decisions/ADR-020-baralhos-e-cartas-globais.md)

**Próximo passo proposto:** iniciar **B1** apenas por nova autorização operacional; inventariar dependências e apresentar uma política concreta para a retirada do TCG antes de qualquer mudança destrutiva.
