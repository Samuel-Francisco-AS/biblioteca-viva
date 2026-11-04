# BF-5 — Direção Visual Global: Fantasia Sobrenatural Editorial

> **Candidata implementada BF-5R4:** papel/tinta, gravuras locais e materiais por área substituem a direção roxa das primeiras candidatas. Formulários específicos por capítulos e pátio cenográfico; ver [contrato efetivo, testes e limitações](BF-5R4_RELATORIO.md). Aceite artístico humano pendente.

- **Estado:** direção artística **global aprovada em conceito**; guia de exploração visual e UX, **não** design system final homologado nem autorização de implementação
- **Data:** 2026-11-03
- **Abrangência:** Biblioteca, Coleção, Arquivo, Resumo, Ajustes e navegação entre elas, em retrato e paisagem
- **Formulação de trabalho:** **Fantasia Sobrenatural Editorial**
- **Prioridade:** identidade, magia, estética, conforto, interatividade e organização; otimização apenas diante de gargalo real demonstrado
- **Referências internas:** [ADR-014](decisions/ADR-014-replanejamento-pos-bf4.md) · [BF-5 Tela Biblioteca](BF-5_BIBLIOTECA_MANIFESTO_CONTRATO.md) · [ART_DIRECTION](ART_DIRECTION.md) · [UX](UX.md) · [ACCESSIBILITY](ACCESSIBILITY.md) · [STATUS](STATUS.md)

> **Visão:** ao trocar de aba, o usuário **não sai da Biblioteca Viva**: atravessa diferentes facetas do mesmo refúgio arcano. O aplicativo pode evoluir em direção a um RPG estilizado; toda sua interface deve partilhar essa atmosfera sem transformar funções práticas em enigmas.

## 1. O que foi decidido e o que permanece aberto

**Decisões expressas pelo usuário:**
- a identidade de **todas as abas** terá a direção de **fantasia sobrenatural**, com beleza, mistério, magia e um universo coerente com o mundo fantástico da Biblioteca;
- a interface deve ser **ergonômica, organizada, agradável de navegar, pensada para o toque** e visualmente refinada;
- a magia deve aparecer também **nos comportamentos, feedbacks e transições**, com suavidade e sem poluição visual;
- a Biblioteca principal será cenário de **exploração 3D em tela cheia** com dock inferior estilizado e interações de RPG, conforme seu contrato específico;
- a BF-5 terá **uma grande reforma integrada** e **refinamentos posteriores até aceite**, não entregas obrigatórias em pequenos checkpoints; a aparência e a criatividade têm precedência sobre otimizações especulativas.

**Hipóteses de design propostas neste guia, ainda abertas:** paleta exata, fontes, iconografia final, materiais de interface, composição de cada tela, estilo de componentes, duração/easing de transições, intensidade dos efeitos, renomeação de abas, padrões de navegação secundária e uso de som/háptica. São referências para exploração e escolha humana, **não especificações imutáveis nem escopo de código liberado**.

**Não é uma decisão de game completo:** considerar a linguagem de RPG na UX não introduz progressão, XP, combates, economias, novas histórias, LLM ou persistência de mundo sem planejamento próprio.

## 2. Manifesto: o sobrenatural como presença

A Biblioteca Viva deve ser **mística, sofisticada, íntima, viva e ligeiramente inquietante**, sem cair em terror agressivo, fantasia infantil ou excesso medieval. Há conhecimento, história, segredo e encantamento nos livros, nos cômodos e nos personagens. A interface deve parecer feita para esse lugar.

**A magia é uma resposta, não um ruído de fundo.** Ela pode despertar à aproximação, iluminar uma seleção, revelar um registro, sugerir uma consequência, abrir uma passagem visual entre seções e depois descansar. Se tudo brilha, nada é especial.

**O editorial dá forma à fantasia.** Uma biblioteca precisa de excelente tipografia, ritmo de leitura, hierarquia e silêncio visual. O objetivo é uma experiência com personalidade de jogo, mas confiável como ferramenta cotidiana.

**A beleza não depende de densidade.** Profundidade, materiais, composição, luz e movimento selecionados deliberadamente devem produzir riqueza. Ornamentação que compete com conteúdo ou toca mal sai.

### Seis pilares

| Pilar | Aplicação |
| --- | --- |
| **Arcano** | sinais mágicos localizados, resposta luminosa aos eventos, símbolos quando informativos |
| **Sobrenatural** | contraste de luz/sombra, atmosferas evocativas, presença de mistério sem prejudicar leitura |
| **Editorial** | tipografia, ritmo de títulos e corpo, grade, alinhamento, leitura clara de registros |
| **Orgânico** | entradas/saídas fluidas, estados que se transformam com lógica e continuidade |
| **Ergonômico** | polegar, alvos grandes, gestos compreensíveis, foco/voltar previsíveis |
| **Contido** | pouco ruído, hierarquia estável, animação com começo e fim |

## 3. Sistema de atmosfera: luz, matéria, espaço

### Luz

A identidade pode usar um **fundo escuro profundo**, com volumes diferenciados por contraste, luz localizada e bordas apenas onde ajudam a perceber estrutura. Não colocar glow global em todos os elementos. Uma ação relevante pode acender por instantes uma runa ou uma borda; o estado normal deve ser calmo.

Permitir **contrastes de temperatura**: calor de leitura e papel, frio espectral em descobertas e lilás/violeta quando a ficção exigir. Atmosferas locais das cenas não obrigam a recolorir todas as telas ou alterar seu significado funcional.

### Matéria

Materiais de referência:
- **madeira escura, pedra e latão envelhecido** como memória da arquitetura;
- **pergaminho/marfim** para leitura quando apropriado, evitando fundos texturizados atrás de parágrafos longos;
- **vidro fumê ou superfície escura translúcida** para sobreposições próximas ao mundo, somente se o contraste sobreviver ao cenário;
- **tinta, relevo discreto e filigrana econômica** para títulos, divisores e estados relevantes;
- **luminescência espectral** como acento narrativo, não como borda padrão de todo controle.

Não simular textura pesada em cada componente nem copiar objetos 3D literalmente para uma UI de formulário. **Uma tela de dados pode ser sobrenatural sem fingir ser um livro físico em cada linha.**

### Profundidade e composição

Trabalhar com três planos perceptivos:
1. **Ambiente** — mundo 3D ou fundo atmosférico muito discreto.
2. **Conteúdo** — a superfície clara e priorizada para leitura/ação.
3. **Fenômeno** — foco, aviso, diálogo, revelação ou transição momentânea.

A interface deve manter **um único foco visual dominante por estado**. Elementos secundários recuam; espaços de respiro fazem parte da ambientação.

## 4. Paleta exploratória — papéis antes de cores finais

**Exemplos de candidatos, não tokens aprovados:** usar as cores abaixo apenas como linguagem de estudo; testar combinações reais, contraste, brilho do aparelho e tema antes de adotá-las.

| Papel | Referência de cor ilustrativa | Intenção |
| --- | --- | --- |
| Fundo / noite | `#10171C` | profundidade azul-esverdeada |
| Superfície / pedra fria | `#1B292D` | elevar conteúdo sem branco ofuscante |
| Estrutura / bronze | `#927451` | calor antigo e pontos de hierarquia |
| Texto primário / marfim | `#F2E9D8` | leitura confortável |
| Texto secundário | `#B8C3BF` | metadados sem perder contraste |
| Magia arcana | `#B99DF2` | foco narrativo e mistério |
| Energia espectral | `#83D0C9` | descoberta ou presença contextual |
| Vinho narrativo | `#88475F` | tensão, escolhas, detalhes de histórias |

**Regra de uso:** cores mágicas não devem significar simultaneamente seleção, erro, sucesso, informação e personagem. Definir semântica funcional consistente (sucesso, alerta, perigo, seleção, foco) independentemente do tema. O estado ativo também depende de forma, rótulo e contraste — nunca só de cor.

Cores ligadas a personagens ou ambientes (ex.: lilás de uma fenda) são **camadas contextuais**, não substitutos de estados do sistema. Considerar modo de alto contraste e legibilidade em ambiente claro/escuro do dispositivo quando o design avançar.

## 5. Tipografia e iconografia

**Tipografia:** estudar uma dupla ou família coerente: títulos com personalidade editorial/literária; texto, botões, filtros e dados com fonte de alta legibilidade em telas pequenas. Manter excelente suporte a português, acentos, números e expansão de texto. Evitar corpo excessivamente ornamental, todo-caps longas e fontes exóticas que tornem leitura lenta. Fontes específicas ainda não foram selecionadas; eventual licença, download e bundle exigem verificação posterior.

**Ícones:** desenhar um vocabulário reconhecível para cinco destinos e ações recorrentes. A silhueta pode remeter a tomos, passagem, arquivo, observatório e instrumentos arcanos, mas deve continuar compreensível sem legenda esotérica. Escolher espessura, detalhes, preenchimento e estado ativo com consistência; não transformar cada ícone em ilustração distinta.

**Componentes:** títulos, navegação, ações primárias/secundárias, busca, filtros, itens de registro, seleção, vazio, erro, confirmações, painéis e diálogos compartilham dimensões, superfícies, foco, resposta tátil e espaçamentos. Variações artísticas pertencem ao **contexto da aba**, não a padrões incompatíveis de usabilidade.

## 6. Gramática de interação: um toque deve ter resposta

### Estados úteis e visíveis

Para um elemento interativo, distinguir **normal → disponível/pressionado → selecionado/aberto → concluído/erro**, com retorno claro e não necessariamente o mesmo efeito visual para todos. O feedback pode usar uma breve intensificação de luz, pequena mudança de profundidade, traço de tinta, expansão ou movimento de foco. Evitar efeitos que pareçam sucesso antes de a ação ter sucesso.

### Padrões a estudar

| Situação | Resposta sobrenatural sugerida | Limite de UX |
| --- | --- | --- |
| Abrir um registro | a superfície se revela como folha/tomo, com detalhes surgindo por continuidade | não esconder dados nem exigir animação para tocar novamente |
| Selecionar um filtro | marca discreta de energia que se acomoda na escolha | estado visível sem brilho e acessível por teclado/leitor |
| Alternar abas | transição compartilhada de luz/profundidade ou “passagem” breve | orientação clara; não manter o usuário preso a uma sequência |
| Criar/alterar registro | tinta/selo breve de confirmação depois do resultado real | salvar/erro precisam ter texto e significado inequívoco |
| Conversar/decidir em RPG | foco narrativo, painel contextual, destaque momentâneo da consequência | escolhas e saída continuam alcançáveis |
| Exibir vazio | atmosfera e convite útil, não tela deserta ou falsa coleção | caminho concreto para criar/buscar dados reais |
| Erro/indisponibilidade | manifestação discreta de ruptura e explicação com recuperação | sem usar só cor, magia ou som para comunicar falha |

### Movimento e ritmo

Explorar **fade com profundidade, revelação por camadas, deslizamento curto desacelerado e pulso de luz localizado**. Preferir microtransições rápidas nas ações frequentes e momentos um pouco mais expressivos em revelações relevantes. Não fixar milissegundos ou curvas nesta etapa; escolher durações em protótipos/implementação integrada e validar sensação de resposta.

Animações devem poder **ser interrompidas sem perda de estado**. Back/Escape, troca de aba, scroll, orientação e toque seguinte precisam preservar orientação. Respeitar redução de movimento com alterações simples de opacidade/estado ou transição instantânea e evitar flashes, oscilação permanente ou múltiplas partículas competindo com texto.

**Áudio e háptica** podem complementar um toque mágico, mas são opcionais, configuráveis e nunca provas exclusivas de que a ação ocorreu.

## 7. Navegação e ergonomia global

O **dock inferior** de Biblioteca, Coleção, Arquivo, Resumo e Ajustes é o eixo de orientação. Deve parecer parte da Biblioteca, com leitura imediata de destino ativo, alvos confortáveis e convivência correta com barras/gestos do Android. **A aparência final e eventual renomeação das abas continuam abertas.**

- Priorizar acesso com o polegar a ações frequentes, sem enviar as principais para cantos superiores distantes.
- Em retrato, permitir superfícies compactas e painéis que se ajustem ao teclado e safe areas; em paisagem, reorganizar informação em colunas quando útil.
- Não aplicar a mesma animação a todo toque: **navegar, selecionar, salvar e descobrir** são acontecimentos diferentes.
- Não depender de hover nem de long press como único meio de executar tarefa essencial.
- Busca, criação, edição, filtros, detalhes, confirmação e retorno devem ter ritmo coerente entre abas.
- Não sacrificar espaços de conteúdo por decoração fixa; as telas devem ter densidade variável conforme o trabalho.
- Modal, painel contextual, teclado e dock precisam de ordem explícita de z-index, foco e Back para evitar sobreposição e toque acidental.

Na **Biblioteca**, o canvas domina toda a área disponível e o dock é a única navegação persistente. Nas **outras abas**, a informação pode ocupar a tela com listas, cards e formulários **redesenhados**, sem fingir que tudo precisa ser um canvas 3D. Consistência de universo **não** significa idêntica composição.

## 8. Personalidade de cada aba — um universo, cinco ofícios

As cinco abas compartilham o sistema de design, mas cada uma enfatiza uma metáfora diferente. Os nomes conceituais abaixo **não renomeiam rotas**.

| Aba / metáfora de trabalho | Papel real preservado | Atmosfera | O que a UI deve privilegiar | Gestos/efeitos a explorar |
| --- | --- | --- | --- | --- |
| **Biblioteca / Mundo Vivo** | exploração 3D, seleção de objetos/registros, habitantes e quests existentes | presença, descoberta, mistério | canvas full-screen, HUD contextual, dock, diálogos legíveis | foco breve no alvo, efeitos ao toque, revelação de diálogo |
| **Coleção / Acervo Encantado** | visualizar, buscar, filtrar, criar e editar os seis tipos convencionais | curadoria, descoberta, apreço pelo registro | cartões/listas flexíveis, miniaturas/capas quando disponíveis, categorias claras, detalhes e ação de criar | abrir ficha como tomo/folha, alternar filtros com feedback |
| **Arquivo / Câmara dos Registros** | manter seus fluxos atuais de busca, filtros e parâmetros, sem trocar a semântica funcional por um “lore” inventado | profundidade, organização, silêncio | densidade controlada, estruturas pesquisáveis, rastreabilidade e leitura | revelar agrupamentos, transição sóbria de seções |
| **Resumo / Observatório** | mostrar métricas e sínteses **derivadas de dados reais** | contemplação, perspectiva, constelações | informação correta, gráficos legíveis, unidades e períodos explícitos, hierarquia de insights | revelação progressiva opcional de gráficos, sem distorcer números |
| **Ajustes / Ateliê Arcano** | controlar preferências, áudio, diagnóstico, backup e opções reais | precisão, ritual de preparação, confiança | seções bem separadas, controles previsíveis, ações destrutivas claramente sinalizadas | resposta sutil de controles; confirmações inequívocas |

### Biblioteca

É a única aba cuja **apresentação-padrão é exploratória e centrada no mundo**. O [manifesto e contrato da tela Biblioteca](BF-5_BIBLIOTECA_MANIFESTO_CONTRATO.md) governa viewport, HUD, seleção, ações contextuais, diálogo e fallback. **Não reintroduzir listagens e diagnóstico permanentes sobre o canvas** como solução fácil de desenvolvimento.

### Coleção

Não deve ser uma grade decorativa impossível de usar. Considerar alternância de densidade (grade editorial e lista compacta), filtros/ordenação fáceis de alcançar, estado vazio expressivo e detalhes agradáveis de abrir. As seis categorias não podem desaparecer por linguagem artística; miniaturas precisam ter fallback. A magia de “revelar um tomo” é metáfora de movimento/organização — **não** restringe a interface a livros, nem pressupõe capas em todos os registros.

### Arquivo

A direção visual pode sugerir memória, organização e documentos preservados, mas a implementação deve partir das **funções reais da aba**. Não presumir arquivo de quests, backup, histórico cronológico ou uma nova base de dados só pelo nome. Utilidade e busca continuam diretas, com animações mais discretas do que na Biblioteca.

### Resumo

O conceito de observatório inspira gráficos, sínteses e composição de dados; não permite números fictícios, métricas gamificadas inventadas nem esconder escalas/unidades. Explorar clareza acima de teatralidade.

### Ajustes

Tratar essa aba como parte da experiência, **não** como painel feio deixado para o fim. Preferências e diagnóstico precisam ser fáceis de encontrar; backup, restauração e controles sensíveis mantêm confirmações explícitas e segurança. O visual deve ser belo justamente por sua organização.

## 9. Regras de contenção visual

1. **Um protagonista por estado:** mundo, conteúdo principal, diálogo ou aviso; não cinco disputando atenção.
2. **Magia como pontuação:** concentrar efeitos em toque, mudança de estado, descoberta e transição; não manter todo componente animado.
3. **Ornamento com função:** bordas, símbolos, metais e glows devem apoiar organização, contexto ou significado.
4. **Respiro é material:** espaço negativo e contraste são parte da identidade, não falta de design.
5. **Texto é inviolável:** nunca sacrificar corpo de texto, foco, contraste ou conteúdo longo por textura/brilho.
6. **Tela densa pode ser bonita:** listas e configurações merecem hierarquia limpa em vez de decoração excessiva.
7. **Transições têm interrupção e escape:** nenhuma cerimônia deve atrasar a navegação ou impedir voltar.

## 10. Acessibilidade, mobile e limites da fantasia

A experiência visual não substitui HTML/React semântico para funções essenciais. Preservar navegação/foco e alternativa sem canvas, nomes acessíveis, texto redimensionável, mensagens de erro e status anunciáveis, alto contraste, preferência por movimento reduzido, alvos de toque e safe areas. Não usar apenas magia, cor ou áudio para informar seleção, erro, conclusão ou destino atual.

Todo acabamento final deve ser verificado em **retrato, paisagem, com teclado e no Moto G06**, com julgamento humano do conforto. **TalkBack físico permanece NOT RUN** no baseline BF-4 e não é aprovado por esta concepção.

A primazia criativa **não** suspende integridade de dados, lifecycle, limites arquiteturais ou diagnóstico de falhas concretas. Fases BF-6/7 permanecem separadas. Este guia não autoriza mudanças de schema, Dexie, backup, provedores externos, LLM, novos sistemas de RPG ou nova stack.

## 11. Critérios de avaliação da reforma integrada

A BF-5 não será concluída por simplesmente adotar uma cor ou implementar um pacote de componentes. A primeira versão reformulada deve ser avaliada **como experiência unificada**:

- **Reconhecimento:** todas as abas parecem pertencer ao mesmo mundo de fantasia sobrenatural, sem ficarem visualmente iguais.
- **Identidade:** mistério, refinamento e magia aparecem pela luz, matéria, tipografia e movimento, sem clichê ou “dark theme” genérico.
- **Uso real:** encontrar um registro, filtrar, editar, interpretar resumo e ajustar preferências é mais direto e agradável, não mais difícil.
- **Interatividade:** toques têm feedback oportuno; transições são fluidas, interrompíveis e semanticamente claras.
- **Conforto:** ações frequentes acessíveis, espaço para leitura, safe areas, retrato/paisagem e ausência de sobreposição prejudicial.
- **Biblioteca explorável:** canvas protagonista e HUD que surge somente quando necessária, com acesso aos recursos essenciais em fallback sem WebGL.
- **Acessibilidade:** estado e significado não dependem exclusivamente de animação, cor, som ou gesto preciso.
- **Refinamento iterativo após a grande reforma:** as revisões posteriores são orientadas pelo julgamento visual/ergonômico do usuário e por defeitos reais, não por “checkpoints pequenos” impostos como processo.

A direção global e a visão da primeira tela **podem evoluir durante a conversa**. A aprovação do **conceito** não equivale a aprovar cada código de cor, layout, fluxo ou animação descrito aqui.

## 12. Próximas decisões de planejamento

Antes de implementar, explorar e comparar **tratamentos visuais concretos** (preferencialmente estados representativos em retrato/paisagem), escolher gradualmente tipografia, paleta, materiais, ícones, dock, gramática de transição e componentes. Refinar a Biblioteca e discutir as demais abas **tela por tela**, sem perder a consistência global.

**Sem implementação por este documento.** Não houve alteração de runtime, UI, animação, assets, dependências, testes, schema, backup ou APK. Não há novo PASS físico nem CI verde; continuam as ressalvas de BF-4/PR #18, inclusive issues #4/#11/#15, R-19, folio de Lua, TalkBack e avaliação sustentada.
