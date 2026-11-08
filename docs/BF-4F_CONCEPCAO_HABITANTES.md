> **R5E — refinamento autorizado (07/11/2026):** o proprietário observou melhora na R5D no Moto G06, mas considerou a arte insuficiente para a fase. A candidata R5E refina os quatro habitantes na mesma PR #40, com Ytha menor (1,32 m de geometria) e suspensa 0,16 m acima do piso; raio físico 0,92 m preservado. Não há novo aceite, fechamento R5 ou F2B/F2C. [Relatório vigente](audits/BV_RECUPERACAO_R5E.md). Notas anteriores são cronologia.

# BF-4F — Bíblia dos quatro habitantes: concepção, narrativa e interação

> Atualização BF-4F1 (2026-11-02): quatro modelos candidatos implementados e integrados, com fontes Blender, GLB animado por nó e seleção React/canvas. **F1 aberta** para revisão independente, refinamento de aura/asas e aceite artístico/físico. Trechos anteriores sobre ausência de código BF-4F descrevem a situação prévia. [Entrega, testes e pendências](BF-4F1_RELATORIO.md).

> **Estado em 2026-11-02:** **concepção criativa aprovada pelo usuário e documentada**; execução orientada pelo [plano técnico BF-4F](BF-4F_PLANO_TECNICO.md), **sem preflight independente**. Não é implementação. BF-4F1–F4, builds, testes, assets definitivos, auditoria e gate humano ainda estão pendentes. Referência canônica de **produto e narrativa** para o Codex, em conjunto com [BF-4 — Plano e contrato](BF-4_PLANO_CONTRATO.md), [ADR-013](decisions/ADR-013-bf-4f-quatro-habitantes-rpg.md), [ADR-012](decisions/ADR-012-bf-4-mundo-vivo.md), [ART_DIRECTION](ART_DIRECTION.md), [WORLD](WORLD.md) e [BF-4E — Objetos Vivos](BF-4E_VISAO_CONTRATO.md).
>
> **Mudança expressa em relação à BF-4A:** o objetivo inicial agora é **QUATRO habitantes** — **Samael, Aryn, Ytha e Lua**, não três. Conversas são **árvores de diálogo de RPG com três ou quatro respostas predefinidas**; **não há LLM**, campo obrigatório de texto livre nem serviço externo. Os detalhes adicionais descritos aqui são orientação criativa para implementação e validação, não prova de que um asset, interação ou quest já existe.

## 1. Visão e premissas

A Biblioteca Viva é um espaço antigo, acolhedor, fantástico e um pouco misterioso. Os quatro habitantes **vivem nele**, com gostos, limites, hábitos, horários de maior atividade, rotinas, atritos, afeto e histórias próprias. Não são quatro menus falantes, nem quatro avatares parados aguardando o usuário. Devem iniciar ações entre si, perceber acontecimentos autorizados, desenvolver relações e, quando o usuário intervém, responder com **consequências visíveis e narrativas**, sem depender de IA generativa.

Cada personagem tem **vontade dramática reconhecível**, mas sua autonomia técnica é limitada a ações explicitamente previstas. O mundo **já existente de cinco cômodos A–E é o palco completo**, sem atribuir identidade temática permanente a nenhum cômodo. Rotinas variam pelas zonas livres da BF-4D; nenhum personagem é confinado por categoria de registro. Interações podem utilizar **objetos ambientais da BF-4E**, nunca alterar livros, filmes, séries, estudos, atividades físicas ou trabalhos pessoais em razão de uma história fictícia.

**Tom:** aconchego + humor + curiosidade + mistério, com espaço para melancolia, frustração, falhas mágicas, cuidado e conflitos reparáveis. O ambiente não deve se tornar um campo de batalha nem usar efeitos de destruição que tornem o espaço indisponível. A confiança entre personagens **não significa ausência de discordâncias**.

### 1.1 Núcleo dramático

| Habitante | Natureza e altura | Força temática | Horário/atividade preferida | Contradição essencial |
| --- | --- | --- | --- | --- |
| **Samael** | Espírito demoníaco / entidade rancorosa, **2,00 m** | Sombra, fogo, tecnologia e melancolia | **Noite**, notebook, café, escrita e observação | Parece ameaçador; trata os outros com consideração, mas reage com sarcasmo |
| **Aryn** | **Elfa**, **1,70 m** | Luz, restauração, iniciativa e ordem | **Dia**, livros, reparo, anatomia e diálogo | Cuida de todos; por vezes se intromete e tenta controlar demais |
| **Ytha** | **Fada**, **1,70 m**, asas de borboleta | Natureza, cura, empatia e fantasia | Leitura de ficção, plantas, séries e animes | Tímida nas interações; encontra coragem quando alguém precisa de ajuda |
| **Lua** | **Maga imortal**, **1,60 m** | Magia instável, desenho, imaginação e erro | Cadernos, grimório, experimentos e companhia | Muito experiente em tempo de vida; emocionalmente impulsiva e ainda aprende |

**Aprovação criativa:** raças, nomes, alturas, interesses e traços centrais vieram do usuário; soluções de roupa, cores, micro-histórias, falas e nomes de quests são propostas aceitas como **guia inicial**, passíveis de lapidação visual e narrativa, não como contratos rígidos de cada vértice ou texto final.

## 2. Fichas individuais

### 2.1 Samael — A sombra que permanece

**Identidade:** espírito demoníaco antigo, fisicamente corpulento, de aproximadamente **2,00 m**. Sua presença tem peso, mas não deve comunicar maldade automática. Pode carregar mágoas e lembranças difíceis, que ele desvia com ironia. **Normalmente mal-humorado e sarcástico, porém gentil nas ações**; humor ácido em vez de crueldade gratuita. Às vezes perde o controle e destrói um **prop cenográfico reparável**. Aryn ou Ytha podem ajudá-lo depois, revelando tanto responsabilidade quanto vínculos.

**Silhueta e visual:** ombros largos, mãos grandes, postura pesada; corpo grafite/carvão com rachaduras ou filamentos lilás escuro, olhos lilás ou âmbar, aura negra esfumaçada com veios violeta profundos. Casaco escuro longo ou sobreposição gótico-moderna; detalhes minimalistas em metal envelhecido. Sua expressão pode ser construída por olhos, sobrancelhas, inclinação do tronco e postura: jamais depender só da cor para expressividade. **Aura de assinatura** visível mesmo em idle, com intensidade proporcional ao humor e à atividade.

**Objetos pessoais:** notebook/computador ou terminal arcanotecnológico **cenográfico e offline**, xícara de café, caderno e opcionalmente cigarro como traço ficcional adulto. Se a animação de fumar existir, tratá-la como hábito de personagem, **sem mecânica de recompensa, glamourização, publicidade ou instruções**; não exigir que outro personagem fume nem adicionar tabaco ao inventário do usuário. O computador não deve abrir terminal real, navegar na rede, acessar arquivos privados nem executar código arbitrário.

**Comportamento:** mais ativo à noite, prefere silêncio, digita, toma café, anota teorias e observa dispositivos/luminárias/relógios. Pode reparar problemas tecnológicos menores, mas sua magia destrutiva é impulsiva. Em interação com Aryn, tenta fazer pouco caso do dano; com Ytha, abranda o tom; com Lua, assume postura competitiva. Mesmo quando irritado, **não ameaça o usuário, não pune recusas e não causa dano irreversível**.

**Animações características:** caminhada pesada, repouso inclinado, digitação e olhar para tela, escrita, café, gesto sarcástico com mão aberta, cruzar braços, rubor lilás da aura, fagulha ou pequena chama controlada, irritação/impacto curto sobre prop fictício, constrangimento ao pedir ajuda e retorno ao trabalho. Reação ao toque/conversa distinta das outras três pessoas.

**Quest própria — _As Cinzas do Caderno_:** páginas de suas anotações sobre fenômenos da Biblioteca surgem queimadas ou deslocadas. Ele reluta em admitir que tem medo de descobrir sua própria participação. O jogador pode ajudar discretamente, pedir explicação, procurar Aryn ou provocá-lo; escolhas abrem pistas diferentes e afetam confiança, sem impedir uma conclusão recuperável. Possíveis ações: consultar notebook **ficcional**, observar uma luminária, recuperar páginas cênicas, pedir a Aryn restauração, conversar depois com Samael. **Desfecho:** assumir o ocorrido, reconhecer ajuda ou esclarecer a origem das páginas; sem apagar registros pessoais.

**Frases de referência (tom, não texto imutável):**
- “Se isso explodir, eu nego qualquer envolvimento. Tecnicamente, ainda nem comecei.”
- “Agradeço. Não faça disso um acontecimento histórico.”

### 2.2 Aryn — A restauradora que não consegue ficar parada

**Identidade:** **elfa**, **1,70 m**, magra, pele clara, cabelos escuros, **óculos**. É ativa, animada, generosa e um pouco agitada; gosta de romances e de estudar anatomia. **Mais ativa durante o dia.** Conserta e cuida dos livros, das estantes e de outros elementos e inicia conversas espontâneas com os demais.

**Silhueta e visual:** figura esguia e ereta, orelhas élficas evidentes, cabelo preso ou parcialmente solto para leitura da face, óculos marcantes, traje prático de restauradora em creme, verde profundo e dourado suave. Cinto ou bolsa de instrumentos finos, marcadores e frascos; **aura luminosa suave, intermitente**, diferente do brilho vegetal de Ytha. Evitar que as duas sejam apenas “personagens luminosas”: Aryn tem gesto rápido e preciso, Ytha move-se com delicadeza e asas.

**Habilidades:** magia de **cura e reparo**, especialmente livros, papel e objetos de cenário. Não deve modificar campos ou conteúdo de livros reais do usuário; “restaurar um livro” refere-se a **prop ficcional da quest** ou animação ambiental. Curiosidade anatômica pode aparecer como leitura/estudo com respeito, sem diagnóstico real ou aconselhamento médico.

**Comportamento:** organiza estantes, inspeciona lombadas e páginas, limpa móveis, repara pequenas avarias e inicia aproximação social. Sua boa vontade pode se tornar controle excessivo; aprende a pedir permissão e confiar nos outros. Se um evento de dano reparável ocorrer, sua prioridade sobe, mas não interrompe permanentemente conversas ou caminhos. Pode colaborar com Ytha em restaurações.

**Animações características:** passos rápidos, olhar curioso, ajustar óculos, tirar e recolocar livro cênico, folhear romance, inspeção com lupa, costura/restauração mágica de página, luz de cura, apontar para objeto, chamar outro habitante, expressão de desaprovação seguida de alívio.

**Quest própria — _O Livro de Anatomia Rasgado_:** um volume **ficcional** da coleção cenográfica está danificado. O jogador escolhe ajudar no reparo, investigar primeiro, sugerir o auxílio arriscado de Lua ou acusar alguém sem provas; respostas alteram se Aryn aprende a escutar os outros, revelam pistas diferentes e podem trazer Ytha ao conserto. **Desfecho:** livro cenográfico restaurado e responsabilidade compartilhada, independentemente do caminho recuperável.

**Falas de referência:**
- “Eu consigo consertar isto. O que não consigo é fazer alguém admitir que foi descuidado.”
- “Uma história de amor com páginas faltando? Isso é praticamente uma emergência.”

### 2.3 Ytha — A fada das histórias que florescem

**Identidade:** **fada**, **1,70 m** na forma humanoide, bondosa, animada e um pouco tímida. Cabelos com tonalidades **rosa/lilás** (podendo usar degradê), **asas translúcidas de borboleta** e aura luminosa própria. Gosta de ficção, séries e animes, e sente afinidade com plantas, cura e acolhimento.

**Silhueta e visual:** forma esguia, movimento leve, roupa fluida lavanda/rosa/verde-sálvia, pequenas peças botânicas, **duas asas grandes de borboleta como assinatura inequívoca**, mesmo quando dobradas. Aura feérica com partículas delicadas, visualmente distinta da luz de restauração de Aryn e da magia errática de Lua. Evitar efeitos densos que escondam o rosto, atrapalhem picking ou obstruam passagens.

**Poderes:** cura gentil, estimulação vegetal, floração temporária e pequenos fenômenos luminosos. Uma planta pode inclinar-se, florescer ou recuperar brilho; não alterar objetos reais nem exigir persistência. A timidez não implica falta de opinião: quando alguém está mal, Ytha pode tomar a iniciativa com delicadeza.

**Comportamento:** cuida de plantas, lê ficção em lugares aconchegantes, acompanha narrativas ficcionais em objeto ambiental (sem reproduzir obras protegidas), observa os demais antes de falar. Ao perceber tristeza ou um problema botânico, pode superar a retração e agir. Gosta de conversar com Lua, e a presença de Samael não precisa amedrontá-la.

**Animações características:** asas em batida lenta de idle, abertura/recolhimento de asas, caminhada leve (voo curto apenas se viável sem burlar circulação), leitura sentada, tocar folhas, cuidar/regá-las, feitiço de florada/cura, recuo tímido, sorriso e comemoração discreta; respeito ao modo de movimento reduzido.

**Quest própria — _As Pétalas que Esquecem_:** flores começam a perder cor, como se carregassem memórias intensas. O jogador pode investigar com Ytha, procurar Aryn, pedir auxílio a Samael ou tentar magia de Lua. Os caminhos geram reações sociais diferentes, mas a planta pode ser estabilizada sem punir a curiosidade. **Desfecho:** vitalidade cenográfica restaurada; Ytha demonstra autonomia, não apenas dependência da aprovação de outros.

**Falas de referência:**
- “Eu acho que elas querem dizer alguma coisa. Só não sei se estão prontas para contar.”
- “Pode parecer bobo, mas às vezes uma história ajuda uma planta a florescer.”

### 2.4 Lua — A imortal que ainda erra os feitiços

**Identidade:** **maga imortal**, **1,60 m**, usa **óculos**, alterna humor, irritação e necessidade de companhia. É imaginativa, impaciente, às vezes imatura e estressada, mas frequentemente engraçada. Gosta de **desenhar, ler, fazer anotações e conjurar magias** que **costumam falhar**. Sua imortalidade não a torna infalível nem dona de todas as respostas.

**Silhueta e visual:** menor e mais compacta que os demais; cabelo escuro, branco-prateado ou azul profundo com mechas encantadas — **variação artística ainda a validar**. Óculos expressivos, roupas acadêmico-arcanas assimétricas em vinho/azul-noturno/roxo com detalhes prateados, grimório de tamanho marcante, lápis e caderno de desenhos. Um chapéu é opcional, nunca exigido; personalidade deve aparecer em postura e atuação, não só na roupa.

**Magia:** capaz de feitos genuinamente fortes, mas com dificuldade de calibrar feitiços; às vezes cria fumaça, troca a cor de luz, bagunça um prop cênico ou abre um mecanismo errado. Os acidentes são **reversíveis**, explicáveis como eventos autorizados, não mudanças aleatórias que prejudiquem os usuários. Aryn ou Ytha podem ajudar; Lua pode aprender a reparar sozinha em arcos posteriores.

**Comportamento:** desenha e escreve em mesas, lê grimórios, procura companhia quando está sozinha, tenta exercícios mágicos, frustra-se e volta a tentar. Às vezes pede conselho sem admitir. Pode ser cúmplice de Samael e provocar nervosismo em Aryn; encontra em Ytha um espaço de confiança. Seu arco não deve humilhá-la repetidamente só para criar humor.

**Animações características:** desenhar, folhear grimório, levantar o lápis e pensar, traçar círculo mágico, magia errada com partículas, pulo de susto, comemorar antes do fim, ficar emburrada, ajustar óculos, convidar alguém e pedir ajuda com hesitação.

**Quest própria — _O Feitiço Mal Copiado_:** Lua reproduz um encantamento de um pergaminho fictício, invertendo um símbolo. O jogador pode sugerir revisão, encorajá-la, ocultar temporariamente o incidente ou chamar Aryn/Ytha/Samael; consequências afetam relação e pistas, sem travar a história. **Desfecho:** compreender o erro, reparar o cenário e recuperar confiança com capacidade de pedir apoio.

**Falas de referência:**
- “Eu sei exatamente o que estou fazendo. Só não sei por que o feitiço discorda.”
- “Se alguém perguntar, isso foi uma demonstração avançada de efeitos inesperados.”

## 3. Relações que mudam mesmo sem o usuário

| Par | Dinâmica inicial | Cena emergente | Evolução desejada |
| --- | --- | --- | --- |
| Samael ↔ Aryn | Atrito entre pragmatismo e ordem, respeito velado | Ela restaura prop que ele queimou; ele tenta disfarçar gratidão | Aprendem a confiar e a discordar sem ferir |
| Samael ↔ Ytha | Sombra e leveza, acolhimento sem medo | Ytha nota cansaço; Samael reduz intensidade da aura e oferece ajuda prática | Ele aprende a pedir companhia; ela ganha firmeza |
| Samael ↔ Lua | Rivalidade brincalhona, talento perigoso | Debate sobre mecanismo; faísca aciona reação inesperada | Assumir responsabilidade compartilhada |
| Aryn ↔ Ytha | Cooperação de cura/reparo | Restauram objeto danificado com duas magias complementares | Aryn aprende a delegar; Ytha assume liderança pontual |
| Aryn ↔ Lua | Paciência testada, carinho e broncas | Aryn questiona magia mal preparada; Lua busca aprovação | Menos tutela; mais parceria |
| Ytha ↔ Lua | Imaginação, leitura e cumplicidade | Trocam histórias, investigam florada e experimento | Ajudam-se a vencer timidez e impulsividade |

**Relação é bidirecional e contextual, não um único medidor de “amizade do usuário”.** Um mesmo par pode ter confiança e irritação simultaneamente. Recomenda-se estado pequeno e efêmero por par (afinidade/confiança, tensão e histórico curto de eventos), limitado e testável; essas métricas **não** são uma nova mecânica de XP/níveis e não precisam aparecer em HUD numérico. Os personagens podem iniciar encontros, reagir às ações uns dos outros e realizar pequenos pedidos mesmo sem clique humano.

**Conflitos:** sarcasmo, broncas e acidentes coexistem com cuidado. Não criar agressão gráfica, punição permanente, humilhação sistemática nem destruição real de conteúdo do usuário. Depois de um acidente, oferecer caminhos narrativos de reparo, desculpa, pacificação ou humor.

## 4. Quests individuais — contrato narrativo inicial

Cada habitante estreia com **uma quest individual de fato ramificada e completa**, e não um menu que só muda o próximo texto.

| Quest / responsável | Gatilho | Prova/ações possíveis | Variáveis de sessão | Saída de sucesso |
| --- | --- | --- | --- | --- |
| **As Cinzas do Caderno** / Samael | Ao observá-lo escrever ou após pequeno evento de fogo | Falar, examinar anotação **ficcional**, investigar luminária ou pedir restauração a Aryn | `trust_samael`, `pages_found`, `told_aryn` | Páginas contextualizadas, vínculo alterado e cena de agradecimento discreto |
| **O Livro de Anatomia Rasgado** / Aryn | Ao observar estante/prop ficcional danificado | Examinar, reconstruir pistas, chamar Ytha/Lua, restaurar | `aryn_book_repaired`, `suspected_other` | Livro cenográfico restaurado, confiança/reparação |
| **As Pétalas que Esquecem** / Ytha | Planta reage a evento de magia ou tristeza | Inspecionar planta, escolher colaboração, estimular floração | `plant_memory_found`, `ytha_took_initiative` | Planta melhora, pista revelada, cena com outro habitante |
| **O Feitiço Mal Copiado** / Lua | Experimento em mesa aciona efeito visual | Revisar símbolo, pedir ajuda, assumir erro, conjurar correção | `lua_spell_understood`, `admitted_mistake` | Prop reparado, reação distinta e nova capacidade de cooperação |

**Regras das quests:**
- Histórias e objetos-alvo são **ficcionais**. Quest não altera `entryId`, metadados, textos, arquivos, backups ou progresso das seis categorias reais.
- Estados pequenos e explícitos: `locked` / `available` / `active` / `resolved` (e `paused` ou `failed-recoverable` somente quando necessário). Não criar falha irreversível por toque acidental.
- Escolhas realmente mudam **um estado, uma informação, uma relação ou uma ação no mundo**, sem depender de um texto alternativo superficial.
- Quests podem continuar mais tarde na **mesma sessão**; reabrir conversa retoma nó/objetivo apropriado. Novo início de sessão pode reiniciar progressos (sem persistência durável nesta fase).
- Provas de resultado devem estar disponíveis em diálogo textual acessível além do efeito no canvas; não prender a jornada ao reconhecimento de partículas ou áudio.

## 5. Quests compartilhadas e arco de convivência

### 5.1 _A Noite da Fenda Lilás_ — primeira grande quest compartilhada (prioridade narrativa)

**Gancho:** durante um evento noturno, uma descarga de energia lilás percorre a Biblioteca. Samael percebe a fonte, Lua admite que testava algo, Ytha nota plantas reagindo e Aryn tenta proteger os objetos. A “fenda” é um **fenômeno cênico localizado**, não um sexto cômodo nem um portal funcional para outra área.

**Fases observáveis:**
1. **Alerta:** luzes e aura reagem, um pequeno prop cenográfico sofre dano reversível; os quatro interrompem atividades de formas próprias.
2. **Escolha do caminho:** falar primeiro com Samael, Lua, Ytha ou Aryn gera pista inicial distinta e ajuste de relação.
3. **Colaboração:** o jogador escolhe quem examina energia, quem estabiliza plantas, quem restaura o mecanismo e quem testa o encanto. Pode optar por solução cautelosa ou improvisada, sempre com recuperação.
4. **Resolução:** cada um realiza **uma animação/ação autorizada** (Samael contém fogo, Aryn repara, Ytha estabiliza vida, Lua corrige conjuração). Efeitos se encerram e cenas/falas refletem a estratégia adotada.
5. **Epílogo:** os personagens lembram brevemente quem ajudou, quem assumiu erro e quem foi corajoso; não é preciso amizade perfeita para a missão concluir.

**Gate narrativo:** mostrar os **quatro** participantes em cenas/diálogo dentro do mundo real; pelo menos duas rotas de escolhas distintas convergem em resolução coerente. A quest não deve exigir que o jogador fume, quebre algo real ou forneça texto livre.

### 5.2 _O Catálogo das Coisas Perdidas_

Pequenos **props cenográficos** mudam de lugar ou parecem desaparecer. Samael suspeita de interferência arcana, Aryn de desorganização, Ytha de um eco emocional e Lua de um encanto próprio. O jogador coleta pistas com cada um; a conclusão revela um fenômeno mágico reparável e ilustra **pontos de vista complementares**. Não mover nem alterar registros reais, nem inventar exclusão de conteúdo pessoal.

### 5.3 _As Quatro Chaves do Arquivo Velado_

Quatro símbolos/propriedades simbólicas se combinam em um artefato ou compartimento **dentro dos cinco cômodos existentes**: energia de Samael, reparo de Aryn, vida de Ytha e conjuração de Lua. O desfecho revela história ou objeto decorativo, **não abre novo cômodo** nem redefine mapa. O título descreve uma colaboração futura e pode ser uma quest secundária ao arco inicial; não exige editor, coleção persistente de chaves ou bloqueio de funcionalidades comuns.

**Integração com BF-4E:** luminária `living:lamp`, mesa/pergaminho `living:table`, livro decorativo `living:book`, armário `living:cabinet`, planta `living:plant`, relógio `living:clock`, braseiro `living:hearth` e demais props são **fontes potenciais de eventos autorizados**. Inspecionar IDs reais do catálogo e estados vigentes no checkout antes de vincular uma quest. Não reutilizar nem alterar os flags privados do Segredo do Pergaminho de forma que sua descoberta se quebre; integrar por eventos/contratos explícitos.

## 6. Conversação: escolhas de RPG, não chat livre

**Decisão de produto:** tocar em um dos quatro habitantes inicia um **diálogo textual com resposta dele e 3–4 escolhas de texto predefinidas em botões**. Cada escolha pode revelar pista, iniciar/avançar/adiar missão, alterar relação, solicitar ação ou encerrar respeitosamente a conversa. A seleção deve ser clara, rápida, offline, e a tela não deve exigir teclado, microfone, IA generativa ou login.

### 6.1 Exemplo de nó e ramificação (Aryn)

**Situação:** um livro cenográfico foi rasgado; Aryn está na frente de uma estante.

**Aryn:** “Um livro importante está danificado. Estou tentando descobrir como aconteceu antes de repará-lo.”

| Botão do jogador | Próxima fala / cena | Consequência testável |
| --- | --- | --- |
| **“Posso ajudar a restaurá-lo.”** | “Ótimo. Primeiro precisamos encontrar as páginas certas.” Aryn aponta para um objeto. | `quest:aryn-book=active`, objetivo de inspeção visível |
| **“Tem certeza de que foi um acidente?”** | “Não. Mas prefiro uma prova a uma acusação.” | Habilita nó de investigação e flag `asked_about_cause` |
| **“Talvez Lua consiga ajudar.”** | “Talvez... desde que ela não experimente outro feitiço.” Aryn ajusta os óculos. | Desbloqueia diálogo com Lua e evento de parceria |
| **“Volto depois.”** | “Está bem. Não vou mexer nas evidências ainda.” | Fecha diálogo e preserva quest disponível |

No segundo nó da opção 1, oferecer novamente **3 ou 4 alternativas** (ex.: examinar, perguntar por pista, pedir colaboração, sair). Os caminhos precisam **convergir ou divergir por condições explícitas**, sem gerar nó inacessível, saída órfã ou missão presa. Um botão só produz efeito quando escolhido; não disparar ações pela renderização de componentes.

### 6.2 Contrato de dados proposto para o Codex

Modelar declarações tipadas, não um interpretador arbitrário de comandos:

- `characterId`, `dialogueId`, `nodeId`, `speakerId`, `text`, `choices[]`, `fallback/exit`.
- Cada opção: `choiceId`, texto (idealmente 3–4 por nó de decisão), `nextNodeId` ou término, `conditions[]` explícitas, `effects[]` **enumerados e autorizados** (ativar quest, gravar flag de sessão, ajustar reação/relação, pedir animação, emitir evento BF-4E).
- Nó de conclusão pode ter menos escolhas (por exemplo, “Encerrar” ou “Voltar”), sem gerar opções falsas apenas para cumprir contagem.
- `questId`, estado/objetivo atual, fatos de sessão observáveis e memória curta permitida; relações podem modular texto, disponibilidade e animações.
- Validar grafos antes de publicar: IDs únicos, destinos existentes, alcançabilidade, condição sem efeito colateral, transições válidas, efeitos idempotentes, caminho de saída e de recuperação. Sem `eval`, scripts vindos do diálogo, texto livre como instrução de runtime ou requisições externas.
- Prioridade de eventos: uma quest ativa não pode disparar outra automaticamente em loop; diálogos em andamento devem pausar/retomar o agente sem corromper movimentação ou disparar duplo clique.

### 6.3 UX e acessibilidade

- **Toque no personagem no canvas** → destaque/olhar/gesto e **painel de diálogo contextual React**, próximo do mundo, com nome, fala e **3–4 botões grandes** de respostas. O mundo continua visível; não abrir uma enorme lista de comandos.
- Manter via React alternativa semanticamente completa e acessível para **selecionar personagem, ler falas, escolher opção, revisar objetivo, voltar e encerrar** se WebGL falhar; foco/teclado, textos para leitores de tela e `prefers-reduced-motion`.
- Em telas móveis retrato/paisagem, o painel não pode roubar pan/pinch/zoom fora dele, bloquear passagens ou impedir seleção convencional de registros. Escolhas não devem depender de precisão no mesh minúsculo.
- Escolhas e efeitos são observáveis por texto mesmo sem a animação; não declarar TalkBack PASS sem teste humano.

## 7. Rotinas e agência local com personalidade

**Agente autônomo não é NPC aleatório em círculo.** Cada habitante usa uma pequena FSM, árvore de comportamento ou avaliação de prioridades controlada, com estados sugeridos `idle`, `navigate`, `use-object`, `socialize`, `converse`, `react`, `recover` e `pause`. O conjunto final pode ser menor se o código comprovadamente cobrir os contratos.

**Regras de decisão iniciais:**
1. **Segurança de navegação e lifecycle**: falha/pausa/interrupção bloqueia movimento e ações tardias.
2. **Conversa ativa**: olhar, reagir e pausar o objetivo interrompido, sem teleportar nem trocar personagem selecionado.
3. **Evento urgente autorizado**: prop danificado (Aryn/Ytha), reação a chama/experimento (Samael/Lua), planta instável (Ytha).
4. **Compromisso de quest**: cumprir etapa pendente sem sequestrar o fluxo do usuário.
5. **Rotina pessoal**: notebook/café/escrita (Samael), estantes/romances/anatomia (Aryn), plantas/ficção (Ytha), desenhos/experimentos (Lua).
6. **Sociabilidade contextual**: procurar outro habitante por relação, proximidade e disponibilidade; pedir desculpas, oferecer ajuda, trocar informação, brincar.
7. **Repouso**: idle expressivo com variação; evitar passeios incessantes e loops de spam.

**Ritmo temporal:** Samael prefere noite; Aryn prefere dia. Ytha e Lua não precisam ter ciclo rígido. Usar **horário local do aparelho** como contexto opcional e determinístico, não obrigar usuário a esperar até de noite para encontrar conteúdo; quests devem ser acessíveis também em horário alternativo por encontros/diálogo. Atividades interrompidas podem ser retomadas ou abandonadas explicitamente, com cooldown de repetição.

**Memória e evolução próprias:** registrar durante a sessão eventos de relação entre habitantes (ajuda, irritação, reparo, conversa, descoberta), decisões do jogador, intenções e objetivos de quest. Personagens podem mudar atitudes por **seus próprios encontros**, não apenas pelos botões do usuário. Estado **efêmero**, limitado e com seed/clock injetável em testes; não criar simulação em segundo plano quando o aplicativo foi suspenso nem persistência Dexie/backup sem nova autorização.

**Acidentes e reparo:** eventos com ciclo explícito `intact → damaged-cosmetic → repairing → intact`, tempo/cooldown, e objetos da BF-4E com contratos de estado verificados. Fogo, rasgos e magia instável são **efeitos visuais reversíveis e controlados**, não física de destruição, exclusão real, alteração de arquivos do usuário ou bloqueio definitivo de corredor.

**Circulação:** usar os pontos, zonas, raios, orientações e regiões BF-4D existentes (18 zonas/pontos e 18 regiões, quatro passagens de 1,2 m). Conferir dimensões reais dos quatro personagens: 2 m de Samael não significa raio arbitrário de colisão; asas de Ytha e aura de Samael exigem avaliar largura/oclusão. Definir rotas/ocupação e tratamento de bloqueios com dados validados; **os pontos BF-4D não equivalem a navmesh pronta**. Personagens não devem atravessar estantes, paredes, mesas nem bloquear permanentemente o caminho ou um objeto selecionável.

## 8. Animação e direção de arte

### 8.1 Assinaturas mínimas por habitante

| Habitante | Idle e locomoção | Atividade principal | Interação social/emoção | Evento mágico |
| --- | --- | --- | --- | --- |
| Samael | repouso pesado, caminhar, virar | notebook, escrita, café; fumar pode ser apenas detalhe ficcional opcional | sarcasmo, cruzar braços, irritação e pedido relutante de ajuda | aura lilás responde; fogo curto controlado |
| Aryn | passos ágeis, olhar e óculos | alinhar livro, estudar, restaurar | chamar outro, censura afetuosa, sorriso | luz dourada de restauração |
| Ytha | postura leve, asas em repouso/batida, caminhar | planta, leitura, cuidado | timidez, curiosidade e iniciativa | floração/partículas vegetais |
| Lua | postura compacta, passos expressivos | desenhar, escrever, consultar grimório | emburrar, provocar, se assustar e celebrar | conjuração, falha e correção |

**Gates de qualidade artística:** quatro silhuetas diferentes **mesmo sem cor**; rostos/gestos legíveis em escala móvel ortográfica; identidade por traje, acessórios e movimento, não por simples recoloração; materiais e luzes coerentes com madeira, pedra, latão, pergaminho, bordô e verde profundo do mundo. Cada personagem requer **várias animações específicas**, não apenas idle/caminhar genéricos; transições, foco de olhar, direcionamento do gesto ao objeto e recuperação de pose sem saltos.

**Animação articulada e asset:** a ADR-010 aprova GLB produtivo **rígido/estático**; **não presumir suporte skinned mesh/rigging/GLB animado**. A rota preferencial de personagens editáveis articulados/animados será **validada durante a produção de um dos quatro personagens reais na BF-4F1**, sem prova experimental independente. Se o fluxo produtivo usar rigging/clips, estender a ADR-010 de forma localizada com evidência de importação, fonte, licença, ownership e testes; procedural articulado é alternativa condicionada à qualidade, não licença para personagens genéricos. Ver [plano técnico BF-4F](BF-4F_PLANO_TECNICO.md). Não usar limitação presumida do Moto G06 para empobrecer a ambição; **medir no aparelho**. Não adicionar novos formatos/dependências sem justificativa.

**Efeitos:** auras de Samael (preto/lilás), Aryn (dourado suave), Ytha (perolado/floral), Lua (arcano instável) são opcionais em intensidade e não substituem geometria detalhada. Redução de movimento remove oscilações/flicker sem apagar informações essenciais. Efeitos não criam loops RAF individuais nem vazam recursos.

## 9. Plano de implementação orientador (F1–F4, não executado)

**F1 — Concepção visual e personagens integrados.** **Sem preflight separado**: inspecionar renderer, pipeline e pontos de atividade em leitura normal do checkout, validar modelo/articulação/exportação e integrá-los durante a produção de um habitante definitivo, replicando o fluxo para os outros. Definir modelos **individuais e reconhecíveis dos QUATRO** em A–E, com dimensões/poses/seleção e dados de identidade estáveis. Demonstrar mundo inteiro com os quatro e sem colisão séria; não criar protótipo descartável de uma única sala.

**F2 — Animações expressivas.** Criar repertório geral e específico, mistura/transições e ações de objeto/gesto/conversa. Definir ownership/pausa/retomada/disposal e comportamento no modo de movimento reduzido.

**F3 — Comportamento e relações.** Agentes locais, rotinas variáveis dia/noite, deslocamento seguro, percepção autorizada de eventos BF-4E, relações entre os seis pares, acidentes cênicos e reparos, decisões determinísticas com seed/clock em testes. Os quatro devem interagir entre si sem depender de toque humano.

**F4 — Diálogo RPG e quests.** Árvores de escolhas locais com 3–4 opções nos nós decisórios, **quatro quests próprias** e **primeira quest compartilhada com os quatro** como alvo de aceite inicial; as outras duas quests compartilhadas são conceitos preparados, implementáveis na fase se couber, mas não devem diluir a qualidade do arco principal. Integrar diálogo e progressão com estados/eventos do mundo. React e canvas, fallback, retorno de conversa, acessibilidade, sem LLM.

**Fronteira de autorização:** este documento aprova a **concepção e o planejamento**, não autoriza implicitamente scripts, migrações de banco, reestruturação do runtime, publicação de APK, commit de implementação ou merge em futuras PRs. A próxima solicitação ao Codex deve explicitar sincronização segura, checkpoint/branch, testes, push e PR sem merge, conforme autorização específica.

## 10. Gates mínimos de entrega da BF-4F

- **Quatro**, não três, habitantes visualmente distintos e escalados conforme as alturas propostas; nenhum personagem é mero marcador, esfera ou recoloração como produto final.
- Todos aparecem, se movem e interagem em **cinco cômodos existentes** com quatro passagens e limites BF-4D. Sem nova sala temática ou alteração não autorizada dos registros.
- Idle, caminhada, virada, reação à seleção, gestos de conversa, atividade ambiental e pelo menos **dois comportamentos/gestos específicos por personagem** com animação observável. Personalidade se manifesta no movimento, não apenas na fala.
- IA local oferece rotinas e respostas a eventos, incluindo pelo menos um episódio de interação espontânea entre personagens e um acidente cenográfico reparável, **sem efeitos permanentes no domínio**.
- Diálogos **offline**, escolhas predefinidas de 3–4 botões, quatro quests individuais com ramos observáveis, **uma quest compartilhada protagonizada pelos quatro**, retomada e saída acessível; não usar LLM nem fingir compreensão aberta de texto livre.
- Progressão de sessão e relações testáveis; validadores de grafo de diálogos, efeitos autorizados, prevenção de loops/repetição e cancelamento após desmontagem.
- Seleção e picking de personagens não substituem touch de objetos vivos e registros convencionais; fallback React sem WebGL, teclado, feedback textual e redução de movimento.
- Rotas, oclusão, alvos de toque, quatro habitantes concorrentes, montagem/descarte, orientação retrato/paisagem, background/resume e F5 isolado cobertos proporcionalmente.
- Gates automáticos do projeto e **APK físico Moto G06**; CI de cada revisão deve registrar PASS/FAIL verídico. Dívidas de CI [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4) e [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11), R-19 e TalkBack humano seguem em aberto até prova específica. BF-4G faz consolidação integrada; não declarar beta/release pela BF-4F.
- **Aspecto final aprovado pelo usuário, não por suposição do Codex**: caso um modelo, expressão, asa, aura, diálogo ou circulação não comunique o personagem esperado, tratar como lacuna criativa a resolver antes de gate, não como “aceito” por passar unitários.

## 11. Critérios narrativos e pendências conscientes

**Não negociável na direção aprovada:** quatro nomes/naturezas, traços centrais, contraste de silhueta, relações próprias, quests ramificadas, conversa por botões, agentes locais e ausência de LLM. **A lapidar no gate artístico:** aparência exata do rosto, cabelos/roupas/cor do figurino de Lua, textura final das asas, material do corpo de Samael, voz/efeitos sonoros opcionais, densidade de partículas, falas definitivas e balanço de horários e relações.

**Inspiração não é cópia:** não usar modelos de pessoas reais, personagens de animes, frases de obras protegidas, assets pagos ou conteúdo de terceiros sem proveniência/licença apropriada. “Gosta de animes e séries” descreve Ytha; não autoriza reproduzir episódios ou marcas na Biblioteca.

**Privacidade:** missões/reações não devem analisar conteúdo pessoal da coleção para inventar histórias, enviar telemetria, usar rede ou tornar diálogos dependentes de acesso a registros privados. Nenhum login, servidor, API de texto ou custo novo.

**Continuidade:** a Biblioteca deve existir e reagir antes, durante e depois de uma conversa. O usuário pode assistir personagens trocarem impressões e cooperarem, não apenas escolher respostas. A meta não é simular consciência: é produzir um mundo coerente, encantador e testável, em que **quatro pessoas extraordinárias convivem com suas imperfeições**.
