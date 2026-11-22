> **Nota de estado — 22/11/2026:** a PR #51 foi integrada à `main`; BF-5.7A está concluída com ressalvas. As menções abaixo a PR draft, gates G3/G4 pendentes e “próxima etapa” registram o estado de 11/11 e não são atuais. As 17 propostas AG-01–AG-09 e FP-01–FP-08 permanecem um backlog de hipóteses; este caderno não autoriza execução automática. O planejamento vigente é a estrutura A–H da [Issue #50](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/50).

---

# Biblioteca Viva — Caderno de propostas de UX, direção artística e fluidez perceptiva

**Data de registro:** 11/11/2026  
**Origem:** auditoria propositiva da branch `feat/bf-5-7a-crystal-controls` e duas discussões subsequentes com o proprietário sobre experiência do usuário.  
**Vínculos:** [charter da BF-5.7, issue #50](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/50) · [PR draft #51](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/51) · [documentação de execução BF-5.7A](BF-5_7A_CRYSTAL_CONTROLS.md) · [continuidade anterior do toque](BV_UX_CONTINUIDADE_TOQUE_2026-11-09.md) · [auditoria das quests](audits/BV_UXC_R62_QUEST_CARD_2026-11-10.md).  
**Estado deste documento:** **17 propostas registradas; nenhuma aprovada para execução exclusivamente por este registro.** Este caderno é um backlog de hipóteses e possibilidades, não um charter de implementação nem um laudo de desempenho.

## 1. Princípio central: fluidez é sensação de continuidade

> A interface não deve apenas executar a intenção do usuário. Deve acompanhá-la desde o primeiro contato até o último instante da transformação.

O proprietário distinguiu explicitamente **velocidade de processamento** de **fluidez percebida**. Uma ação concluída rapidamente mas exibida de maneira seca, com corte súbito, piscada ou salto espacial, pode parecer um engasgo. Uma interação mais longa, porém coerente, pode ser mais agradável: o usuário sente que foi reconhecido, vê o aplicativo acompanhar a intenção e percebe quando o movimento termina.

As propostas abaixo devem respeitar estas diretrizes:

1. **Contato perceptível:** o gesto recebe reconhecimento visual apropriado antes ou durante o trabalho necessário, sem prometer que a operação terminou.
2. **Transformação contínua:** estados visuais conectados, sem dupla pressão, flash de conteúdo sob cortina, layout que surge no meio da animação ou componente que aparece seco.
3. **Processamento integrado:** trabalho de React, dados, GPU e navegação deve ocorrer na janela de apresentação quando viável, sem bloquear o primeiro sinal.
4. **Desaceleração e repouso:** o fechamento é tão cuidadosamente desenhado quanto a abertura. Entrada, saída, interrupção e cancelamento devem terminar em um estado estável.
5. **Coerência material:** cristais, pergaminhos, cartas e habitantes podem usar movimentos diferentes, com uma gramática compartilhada.
6. **Verdade operacional:** confirmação definitiva somente após sucesso real; erro/cancelamento preservam contexto e rascunhos.
7. **Sem espetáculo permanente:** estabilidade visual é preferível a animar tudo. Não impor atrasos fixos para decorar processamento; respeitar movimento reduzido, gestos alternativos e acessibilidade.
8. **Eficiência como suporte, não como fim:** otimização de CPU/GPU, memória e DOM importa para sustentar apresentação suave, mas milissegundos isolados não comprovam boa experiência.

**Ciclo perceptivo de referência:** *contato → resposta/transformação → revelação/resultado → repouso*. Não são obrigatórias quatro animações distintas. Sempre definir o que acontece ao repetir, cancelar, pressionar Voltar, perder foco ou mudar de rota.

## 2. Grupo AG — nove propostas da auditoria geral

São as **nove** sugestões apresentadas na auditoria anterior. Impactos abaixo são hipóteses de priorização, não benefícios mensurados.

### AG-01 — Reorganizar a navegação do Arcanário
- **Problema observado no código:** `ArcanariumPage.tsx` apresenta **11 destinos** simultâneos na navegação das salas, inclusive em conteúdo interno. Em retrato, isso gera várias fileiras acima da atividade atual.
- **Proposta:** hierarquia entre destinos essenciais e complementares; agrupar por função ou contexto, mantendo o Portal como referência clara e rotas profundas acessíveis. Preservar o acesso rápido a ações frequentes, estado ativo e navegação assistiva.
- **Cuidados:** não esconder funções sem caminho evidente, nem criar um menu que exija mais toques para tarefas comuns. Comparar antes/depois com pessoas usando o Moto G06.
- **Impacto presumido:** alto. **Esforço/risco:** médio, principalmente pelas rotas e regressões de foco.

### AG-02 — Miniaturas de verdade simples no Acervo
- **Problema observado no código:** a otimização G4 da PR #51 oculta a face traseira das cartas compactas por CSS; `ArcanaCard.tsx` ainda contém a estrutura de frente/verso 3D.
- **Proposta:** variante de *tile* do catálogo genuinamente plana e econômica no React/DOM, mantendo a carta virável completa em detalhes, Oficina, Ecos e Duelo.
- **Cuidados:** não reduzir conteúdo essencial, seleção/filtros ou identidade da carta; medir a rolagem antes e depois, não presumir que menos nós resolve sozinho o problema de *checkerboarding*.
- **Impacto presumido:** alto para Acervo longo. **Esforço/risco:** médio; exigir gate de cards e navegação.

### AG-03 — Retorno contextual unificado
- **Problema observado no código:** o cabeçalho global em `App.tsx` favorece voltar à Coleção a partir de registros, enquanto links dos fólios podem respeitar `from` e apontar ao Arquivo/Biblioteca. Podem coexistir duas ideias de “Voltar”.
- **Proposta:** um contrato de histórico/contexto de origem para cabeçalho, fólio e botão Voltar do Android, com *fallback* conhecido quando a origem não estiver disponível.
- **Cuidados:** deep links, rotas recarregadas, rascunhos não salvos, histórico interno e proteção contra sair de edições.
- **Impacto presumido:** alto. **Esforço/risco:** médio; testar árvore de navegação e retorno.

### AG-04 — Transições adaptativas, não apenas mais curtas
- **Problema observado no código:** o sistema de passagem e revelação aplica coreografias compartilhadas a contextos diferentes; há limites mínimos e animações que requerem avaliação perceptiva.
- **Proposta:** medir contato, cobertura, prontidão do destino, revelação e estabilização; distinguir transições globais, trocas de salas relacionadas e aberturas locais.
- **Revisão conceitual obrigatória:** **não perseguir a menor duração como objetivo.** Uma operação de 80 ms pode merecer apresentação de 350 ms se isso comunicar a transformação; 600 ms de trabalho não autorizam congelar ou fabricar conclusão.
- **Cuidados:** preservar o contrato de cortina opaca aprovado anteriormente, evitar flash intermediário, toques duplicados e interrupções em Voltar.
- **Impacto presumido:** alto. **Esforço/risco:** alto; exigir probe e gate perceptivo.

### AG-05 — Índice discreto para fólios extensos
- **Problema observado:** Livros, Estudos, Trabalho e Atividade Física possuem seções longas; funções relevantes frequentemente exigem rolagem repetida.
- **Proposta:** pequeno índice de capítulos *dentro* do fólio, com âncoras e rolagem cuidadosa para Marcador, Sessão, Notas e Ações, ou equivalentes de cada tipo.
- **Cuidados:** não adicionar segundo dock fixo que cubra a tela, considerar espaço do dock inferior, foco, retorno e expansão de painéis.
- **Impacto presumido:** médio-alto. **Esforço/risco:** médio.

### AG-06 — Refinar a abertura das quests
- **Evidência histórica:** a auditoria BV-UXC R6.2 registra microengasgos residuais ao selecionar habitantes, mesmo após melhorias relevantes de foco e estilo. Não foram medidos novamente nesta auditoria.
- **Proposta:** medir do contato no Canvas até confirmação de seleção, preparação do card, primeiro quadro visível e assentamento; coordenar reação do habitante com a abertura.
- **Cuidados:** não recolocar skinning/raycast caro no toque, nem forçar render 3D adicional ou foco síncrono caro na montagem.
- **Impacto presumido:** médio-alto. **Esforço/risco:** médio-alto.

### AG-07 — Acessibilidade interativa consistente
- **Exemplo de código:** pontos SVG do gráfico em `StatisticsPage.tsx` usam `role="button"`, `tabIndex` e click, mas não há tratamento explícito de Enter/Espaço nesse ponto.
- **Proposta:** revisar ativação por teclado/controle, foco restaurado após modais, TalkBack, nomes/estados acessíveis, contraste e alvos de toque em gráficos, cartas, selects e demais controles.
- **Cuidados:** componentes nativos quando possíveis e resultados testados com navegação real, não apenas checks DOM.
- **Impacto presumido:** médio, com valor inclusivo transversal. **Esforço/risco:** baixo a médio por recorte.

### AG-08 — Recompensas artísticas contextualizadas
- **Oportunidade criativa:** a identidade mágica pode aparecer principalmente em momentos significativos, não apenas como decoração persistente.
- **Proposta:** resposta visual discreta ao concluir leitura, estudo, tarefa ou carta; brilho, símbolo e eventualmente reação de habitante, preferencialmente reutilizando recursos existentes.
- **Cuidados:** confirmar persistência antes de sinal de sucesso, evitar bombardeio de partículas/som e tornar os efeitos opcionais/reduzidos.
- **Impacto artístico presumido:** alto. **Esforço/risco:** médio, dependente da direção artística.

### AG-09 — Consolidar o sistema visual gradualmente
- **Problema de manutenção observado:** `styles.css`, `styles-legacy.css`, `styles-atelier.css` e `styles-crystal.css` acumulam milhares de linhas; existem outras folhas de módulos e seletores com especificidade concorrente.
- **Proposta:** inventariar tokens, cores, bordas, estados, elevação, botão e tipografia; extrair padrões testados aos poucos, sem reescrever toda a camada de estilos.
- **Cuidados:** tamanho de CSS isolado não prova lentidão; prioridade é evitar regressão, colisão de estilos e dificuldade de evolução.
- **Impacto estrutural presumido:** alto no longo prazo. **Esforço/risco:** médio-alto se feito em lote; preferir pequenos recortes.

## 3. Grupo FP — oito propostas de fluidez perceptiva

Estas são as **oito** sugestões adicionais apresentadas após a discussão sobre “velocidade ≠ fluidez”. Complementam AG; não substituem automaticamente os itens anteriores.

### FP-01 — Cristais que respondem como objetos táteis
- **Proposta:** pressionar deve parecer um cristal cedendo; o brilho se concentra durante o contato e retorna suavemente ao repouso. Diferenciar seleção persistente, confirmação de ação e passagem de navegação.
- **Critério:** um único gesto produz **um único ciclo** visual, não alterna aparência duas vezes entre pointerup/click e não congela no estado pressionado.
- **Cuidados:** teclado, pointercancel, drag, toque prolongado, redução de movimento e estados disabled.
- **Impacto:** muito alto; recorte transversal com alto reaproveitamento. **Risco:** médio, porque os CSS antigos competem com cristal.

### FP-02 — Coreografia própria para cada nível de navegação
- **Proposta:** passagem mais cerimonial entre áreas grandes; transição interna mais local entre salas do Arcanário; expansão localizada para detalhes, seletor ou modal.
- **Critério:** a estrutura que deve permanecer estável não pisca; o usuário percebe que mudou de contexto sem sentir ruptura entre telas relacionadas.
- **Cuidados:** preservar o sistema de passagem e o feedback já aprovado, especialmente sob carregamento assíncrono.
- **Impacto:** muito alto. **Risco:** alto se redesenhar router/transições simultaneamente.

### FP-03 — Personagens reagindo antes das quests
- **Proposta:** o habitante reconhece o toque com um gesto coerente com sua personalidade antes/junto da revelação do card: Samael com aura, Ytha com voo/luz, Aryn com movimento atento, Lua com gesto arcano.
- **Critério:** a percepção de contato e o card constituem uma sequência, sem congelar o mundo ou disputar renderização.
- **Cuidados:** preferir clips/efeitos já disponíveis; reação cancelável, sem recursos caros por toque.
- **Impacto:** alto. **Risco:** médio-alto. Relacionada a AG-06.

### FP-04 — Formulários como fólios que se desdobram
- **Proposta:** `details`, seletores e seções se expandem com continuidade; o conteúdo adjacente desloca-se de modo previsível. A nota salva aparece no histórico sem substituição abrupta da região.
- **Critério:** abrir e fechar não faz o layout saltar, e o foco continua correto após animação.
- **Cuidados:** altura dinâmica, teclado Android, conteúdos longos, scroll ancorado, movimento reduzido e falhas de salvamento.
- **Impacto:** alto. **Risco:** médio; começar por um componente reutilizado.

### FP-05 — Cartas com presença física no Arcanário
- **Proposta:** seleção dá destaque à carta; visualização de detalhe parece continuidade do objeto selecionado; giro frente/verso é estável e com eixo coerente. Prévia da Oficina reage sem reconstruções secas a cada alteração.
- **Critério:** sem quadros em branco, flashes de verso ou alterações inesperadas de escala/posição; a face correta permanece legível.
- **Cuidados:** não reintroduzir composição 3D pesada nas miniaturas do catálogo (AG-02), reservar 3D para locais em que a interação justifica o custo.
- **Impacto:** alto. **Risco:** médio.

### FP-06 — Rolagem contínua e previsível
- **Proposta:** conteúdo já carregado permanece estável no vai-e-vem; listas, cartas e filtros não devem surgir progressivamente como se fossem carregados só depois do scroll. Não adicionar entrada animada a cada tile.
- **Critério:** rolagem média e flings rápidos repetidos não expõem fundo vazio nem causam reposicionamento de controles.
- **Cuidados:** verificar primeiro o gate do reparo G4 da PR #51; não presumir sucesso por CSS estático. Distinguir rasterização WebView, DOM, layout e assets.
- **Impacto:** alto. **Risco:** médio-alto se exigir refatoração de catálogo. Relacionada a AG-02.

### FP-07 — Conclusões de ações que transmitem confiança
- **Proposta:** ao salvar leitura, completar tarefa ou criar carta, o botão reconhece o contato; após sucesso real o resultado aparece no contexto e se assenta com suavidade; em erro, o dado editado permanece acessível.
- **Critério:** nenhuma falsa confirmação otimista de persistência; feedback acessível, retorno suave e proteção contra duplo envio.
- **Cuidados:** concorrência, revision/conflict, falha IndexedDB, navegação durante salvamento, redução de movimento.
- **Impacto:** muito alto. **Risco:** médio.

### FP-08 — Saídas e cancelamentos tão cuidados quanto as entradas
- **Proposta:** card/quest/modal se recolhe ou dissolve em direção contextual; a interface de origem reaparece e recupera o foco gradualmente, sem corte seco.
- **Critério:** Back Android, Escape, cancelar, duplo toque e fechamento durante carregamento não deixam sobreposição fantasma, scroll deslocado, camada bloqueante ou animação parada.
- **Cuidados:** priorizar um contrato de encerramento idempotente e cancelável, sincronizado à semântica da rota e às necessidades de acessibilidade.
- **Impacto:** muito alto. **Risco:** médio-alto.

## 4. Relações entre os itens e prevenção de trabalho duplicado

| Frente compartilhada | Propostas relacionadas | Separação útil |
| --- | --- | --- |
| Navegação | AG-01, AG-03, AG-04, FP-02, FP-08 | Estrutura e destino das rotas ≠ movimento entre estados ≠ saída/Voltar |
| Arcanário | AG-01, AG-02, FP-05, FP-06 | Hierarquia, custo da miniatura, experiência do detalhe e continuidade da lista |
| Habitantes e quests | AG-06, FP-03, FP-08 | Medir engasgo existente, coordenar reação e resolver fechamento |
| Fólios | AG-05, FP-04, FP-07 | Achar uma função, desdobrá-la e confirmar resultado são momentos diferentes |
| Sistema transversal | AG-07, AG-09, FP-01, FP-07 | Acessibilidade, tokens e ciclo tátil são trabalhos complementares |
| Direção artística | AG-08, FP-03, FP-05, FP-07 | Recompensa contextual não deve virar animação constante |

## 5. Possível sequência para avaliação — ainda não aprovada

**Etapa 0 — Gate da candidata existente:** testar as últimas mudanças G1–G4 da PR draft #51, especialmente destino do Portal lunar e flings do Acervo. A versão anterior do APK foi aceita pelo proprietário, mas **G3/G4 aguardam confirmação no Moto G06**; não transferir automaticamente o aceite anterior.

**Frente A — baixo risco e alto impacto:** AG-03 (retorno contextual), AG-07 (teclado/TalkBack) e AG-02 (miniaturas realmente simples). Testes funcionais, de render e de scroll dirigidos. Inclui primeiros inventários AG-09, sem reformulação global.

**Frente B — experiência cotidiana:** FP-01 (ciclo tátil), FP-07 (salvamento que se assenta), FP-08 (saída/reversão) em um componente piloto, depois expandindo. Preservar a cortina e os contratos de dados aprovados.

**Frente C — estrutura e orientação:** AG-01 (navegação do Arcanário), AG-05 (índice de fólios) e FP-02/AG-04 (hierarquia de passagem). Confirmar concepção antes de mudar todos os caminhos; observar movimento e organização juntos.

**Frente D — acabamento vivo:** AG-06/FP-03 (habitantes), FP-04 (fólios), FP-05 (cartas), AG-08 (recompensas) e FP-06 (scroll, conforme diagnóstico). Não adicionar efeitos permanentes por padrão.

**Frente E — consolidação:** AG-09, acessibilidade, regressões e medições físicas; estabilizar antes da BF-6. Esta sequência é uma **hipótese de planejamento**, não a reordenação oficial do roadmap nem autorização para nova fase.

## 6. Como decidir e validar cada proposta

Para um recorte ser autorizado, registrar:

- **Situação atual e hipótese:** referenciar captura/vídeo/gate físico ou trecho de código. Separar evidência, suspeita e preferência estética.
- **Intenção perceptiva:** o que deve ser visto/sentido no *contato*, na *transformação* e no *repouso*. Definir explicitamente saída, cancelamento e redução de movimento.
- **Limites:** dados, Dexie/backup, offline, mecânicas, FPS, foco e gestos que não podem regredir.
- **Critério de aceite:** um roteiro curto e repetível, incluindo falhas, toques repetidos, abrir/fechar, retrato ↔ paisagem, Voltar/Escape e ações assistivas.
- **Evidência dupla:** qualidade percebida no Moto G06 **e** indicadores técnicos relevantes. A BV já possui `uiActionProbe.ts` e `WorldDiagnosticPanel.tsx`, capazes de apoiar medições de frames, commits e P50/P95/P99; nenhum deles mede sozinho a sensação humana nem prova o instante exato em que pixels chegam à tela.
- **Escopo da PR:** alterações agrupadas, gates locais antes de testes físicos, e nenhuma integração na main sem autorização expressa.

### Perguntas de avaliação perceptiva

1. O contato foi reconhecido antes de parecer que nada aconteceu?
2. A transformação saiu naturalmente de um estado para o seguinte?
3. O conteúdo apareceu na hora certa, sem flash, sobreposição ou competição com a transição?
4. A ação terminou de forma suave, legível e inequívoca?
5. Repetir dez vezes, cancelar no meio e usar Voltar continua natural e seguro?
6. A mesma experiência funciona com movimento reduzido e navegação assistiva?

## 7. Preservação de decisões e pendências

- **Sem implementação automática:** este caderno não aprova nenhuma das 17 propostas, não cria tarefas de execução, não fecha a BF-5.7 e não inaugura a BF-6.
- **Estado técnico (registro histórico de 11/11):** a PR #51 foi posteriormente integrada à `main`; BF-5.7A está concluída com ressalvas. Os gates e limites de CI/performance descritos neste caderno permanecem apenas como evidência histórica e não certificam métricas que não foram executadas.
- **Núcleo preservado:** Códice Iluminado, Arena Viva, persistência/offline, capacidades do Android, navegação acessível e mecânicas atuais permanecem contratos obrigatórios.
- **Decisões futuras:** o proprietário escolherá o recorte, prioridade e momento de execução após revisar este caderno; propostas rejeitadas ou adiadas devem manter histórico em vez de desaparecer sem registro.

---

**Documento de ideação controlada — 17 propostas (AG-01 a AG-09; FP-01 a FP-08).**
