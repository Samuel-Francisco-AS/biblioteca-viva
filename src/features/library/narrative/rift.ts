import type { QuestDefinition } from "./contracts";
import { story, remember, scene, inspect, bond, fact } from "./writing";
const { n, c, id } = story("rift");
const heardAll = {
  kind: "all",
  conditions: ["samael", "aryn", "ytha", "lua"].map((k) =>
    fact(`rift:heard-${k}`),
  ),
} as const;
export const rift: QuestDefinition = {
  questId: "rift",
  title: "A Noite da Fenda Lilás",
  owner: "lua",
  start: id("start"),
  nodes: [
    n(
      "start",
      "lua",
      "Você também viu? O ar no salão A tem uma costura lilás. Não é uma porta. Nenhum lugar devia caber ali, e no entanto a luz está tentando se dobrar. O relógio de B respondeu sem tocar. Eu conheço parte desse desenho. Conhecer parte é justamente o que me preocupa.",
      "Ato I — observar o presságio no salão A e escolher a primeira leitura.",
      [
        c(
          "omen-quiet",
          "Conter a aproximação e observar o ritmo antes de tocar.",
          "omen",
          [remember("rift:cautious-opening"), scene("rift", "troubled")],
        ),
        c("omen-echo", "Escutar a resposta do relógio de B.", "echo", [
          inspect("living:clock"),
          remember("rift:clock-first"),
          scene("rift", "troubled"),
        ]),
        c(
          "omen-ask",
          "Pedir a Lua que nomeie o que reconheceu, sem experimentar ainda.",
          "omen",
          [remember("rift:invited-honesty"), scene("rift", "troubled")],
        ),
      ],
    ),
    n(
      "echo",
      "ytha",
      "O relógio não está marcando horas. Entre um movimento e outro, a planta de D perde uma cor e o braseiro de E ganha uma ponta lilás. É como se uma lembrança atravessasse os cômodos sem encontrar por onde voltar. Não quero que a gente confunda silêncio com segurança.",
      "Ato I — levar a hipótese de circulação às quatro perspectivas.",
      [
        c(
          "echo-map",
          "Anotar o percurso B–D–E para discutir com os quatro.",
          "perspectives",
          [remember("rift:circulation"), scene("rift", "examined")],
        ),
        c(
          "echo-protect",
          "Priorizar a proteção da planta enquanto procuram a causa.",
          "perspectives",
          [remember("rift:protect-life"), scene("rift", "examined")],
        ),
        c(
          "echo-boundary",
          "Estabelecer que ninguém testa nada sozinho durante a investigação.",
          "perspectives",
          [remember("rift:consent-rule"), scene("rift", "examined")],
        ),
      ],
    ),
    n(
      "omen",
      "lua",
      "A costura ganha quatro bordas, como um desenho sem centro. O salão parece anoitecer por dentro, mesmo que seja dia lá fora. 'Reconheço uma conjuração de retorno', diz Lua. 'Mas a parte que falta não é uma palavra. São quatro coisas que nunca concordam sobre o que devem guardar.'",
      "Ato II — ouvir as quatro perspectivas, em qualquer ordem.",
      [
        c(
          "omen-map",
          "Propor uma investigação por pistas, sem escolher culpados.",
          "perspectives",
          [remember("rift:evidence"), scene("rift", "examined")],
        ),
        c(
          "omen-care",
          "Estabelecer primeiro proteção aos objetos e às plantas.",
          "perspectives",
          [remember("rift:protect-life"), scene("rift", "examined")],
        ),
        c(
          "omen-trust",
          "Pedir que cada um admita também o que não sabe.",
          "perspectives",
          [remember("rift:honesty"), scene("rift", "examined")],
        ),
      ],
    ),
    n(
      "perspectives",
      "lua",
      "Não quero uma votação de quem parece mais convincente. Quero quatro leituras que possam se corrigir. Você escolhe com quem começamos. Se precisar sair, a costura ficará contida neste instante da história; não depende da hora nem de um acidente que resolva aparecer.",
      "Ato II — conversar com Samael, Aryn, Ytha e Lua; reunir quatro pistas distintas.",
      [
        c(
          "visit-samael",
          "Ouvir Samael sobre o calor no braseiro de E.",
          "samael",
          [],
          fact("rift:heard-samael", true),
        ),
        c(
          "visit-aryn",
          "Ouvir Aryn sobre o volume cenográfico de C.",
          "aryn",
          [],
          fact("rift:heard-aryn", true),
        ),
        c(
          "visit-ytha",
          "Ouvir Ytha sobre a planta e o globo de D.",
          "ytha",
          [],
          fact("rift:heard-ytha", true),
        ),
        c(
          "visit-lua",
          "Ouvir Lua sobre o traço no salão A e o eco de B.",
          "lua",
          [],
          fact("rift:heard-lua", true),
        ),
        c(
          "gather",
          "Reunir as quatro pistas e decidir uma estratégia.",
          "decision",
          [remember("rift:all-perspectives")],
          heardAll,
        ),
      ],
    ),
    n(
      "samael",
      "samael",
      "A energia em E não está procurando combustível. Está devolvendo calor de quatro tentativas antigas de conservar alguma coisa. Uma delas tem minha assinatura. Posso segurar a descarga. Não posso prometer que fechar à força seja o mesmo que resolver. Detesto quando a opção prudente também exige humildade.",
      "Ler o braseiro de E: distinguir contenção de solução.",
      [
        c(
          "samael-proof",
          "Examinar a borda fria do braseiro e pedir uma margem segura.",
          "perspectives",
          [
            inspect("living:hearth"),
            remember("rift:heard-samael"),
            remember("rift:heat-limit"),
          ],
          undefined,
          "Pista de E: o calor retorna por um circuito; Samael definiu um limite de contenção.",
        ),
        c(
          "samael-account",
          "Perguntar pela assinatura dele sem transformar a pergunta em acusação.",
          "perspectives",
          [
            remember("rift:heard-samael"),
            remember("rift:shared-origin"),
            bond(
              "samael",
              "lua",
              "trust",
              "Samael admitiu uma assinatura antiga sem atribuir automaticamente a descarga ao experimento de Lua.",
            ),
          ],
        ),
        c(
          "samael-blame",
          "Perguntar se o experimento de Lua causou tudo e aceitar a correção dele.",
          "perspectives",
          [
            remember("rift:heard-samael"),
            remember("rift:blame-questioned"),
            bond(
              "samael",
              "lua",
              "friction",
              "A hipótese de culpar Lua foi levantada; Samael a contestou, mas a suspeita deixou atrito.",
            ),
          ],
        ),
      ],
      {
        action: "work",
        variants: [
          {
            condition: fact("rift:heard-lua"),
            text: "Lua já lhe mostrou a curva? Então falta o calor: em E ele retorna ao circuito, não procura combustível. Uma assinatura antiga é minha. O desenho de Lua não criou tudo isso sozinho. Posso segurar a descarga, mas fechar à força preserva parte da pressão. Prudência também tem custo.",
          },
          {
            condition: { kind: "resolved", quest: "ashes" },
            text: "Você já viu o que meu calor deixa num lacre. Em E acontece o mesmo princípio, em quatro fontes. Uma assinatura é minha. Desta vez vou dizer isso antes de alguém encontrar cinzas. Posso conter a descarga, mas o calor precisa de um destino, não de um culpado.",
          },
        ],
      },
    ),
    n(
      "aryn",
      "aryn",
      "O volume cenográfico de C se abriu na gravura de uma casa sem portas. A lombada está inteira; a sombra da dobradiça é que se separou dela. Não vou colar uma sombra por reflexo. Quero apoiar a estrutura enquanto entendemos o desencaixe. Preciso de alguém que diga quando a planta responder.",
      "Ler o volume de C: estabilizar o apoio sem aprisionar o retorno.",
      [
        c(
          "aryn-consent",
          "Pedir que Aryn combine os apoios com Ytha antes de estabilizar.",
          "perspectives",
          [
            inspect("living:book"),
            remember("rift:heard-aryn"),
            remember("rift:shared-support"),
            bond(
              "aryn",
              "ytha",
              "trust",
              "Aryn pediu o sinal de Ytha antes de estabilizar o apoio da fenda.",
            ),
          ],
        ),
        c(
          "aryn-suture",
          "Propor uma sutura provisória que possa ser aberta de novo.",
          "perspectives",
          [
            inspect("living:book"),
            remember("rift:heard-aryn"),
            remember("rift:reversible-seal"),
          ],
        ),
        c(
          "aryn-command",
          "Pedir que Aryn coordene tudo e ouvir por que ela recusa decidir sozinha.",
          "perspectives",
          [
            remember("rift:heard-aryn"),
            remember("rift:distributed"),
            bond(
              "aryn",
              "ytha",
              "repair",
              "Aryn recusou centralizar todas as decisões e reservou a leitura da planta a Ytha.",
            ),
          ],
        ),
      ],
      {
        action: "work",
        variants: [
          {
            condition: fact("rift:heard-ytha"),
            text: "Se Ytha percebe uma saída faltando, devo sustentar as bordas, não fechá-las. No volume cenográfico de C, a sombra da dobradiça se soltou sem rasgar o couro. Posso estabilizar a estrutura. Preciso do sinal dela para saber quando soltar. Pedir esse sinal é parte do reparo.",
          },
        ],
      },
    ),
    n(
      "ytha",
      "ytha",
      "A planta de D não está fugindo da fenda. Está inclinada para ela, como se ouvisse uma história sem final. As cores chegam ao globo e ficam presas. Eu consigo conduzi-las de volta. Não quero que decidam pelas raízes porque parecem frágeis. Fragilidade não é falta de vontade.",
      "Ler D: proteger a vida vegetal e reconhecer sua capacidade de retorno.",
      [
        c(
          "ytha-lead",
          "Convidar Ytha a definir o limite de segurança da planta.",
          "perspectives",
          [
            inspect("living:plant"),
            remember("rift:heard-ytha"),
            remember("rift:root-limit"),
            bond(
              "aryn",
              "ytha",
              "trust",
              "Ytha definiu o limite da planta; Aryn reconheceu sua condução.",
            ),
          ],
        ),
        c(
          "ytha-map",
          "Examinar o globo com ela e mapear a volta das cores.",
          "perspectives",
          [
            inspect("living:globe"),
            remember("rift:heard-ytha"),
            remember("rift:circulation"),
          ],
        ),
        c(
          "ytha-remove",
          "Sugerir retirar a planta e escutar a alternativa que Ytha propõe.",
          "perspectives",
          [
            remember("rift:heard-ytha"),
            remember("rift:plant-voice"),
            bond(
              "samael",
              "ytha",
              "trust",
              "Ytha defendeu proteger a planta sem isolá-la; Samael aceitou conter o calor ao redor.",
            ),
          ],
        ),
      ],
      {
        action: "work",
        variants: [
          {
            condition: fact("rift:heard-aryn"),
            text: "Aryn ofereceu apoio sem fechar a sombra? Então posso trabalhar com isso. A planta de D se inclina para a fenda: quer devolver as cores presas no globo. Eu marco o limite das raízes e aviso quando abrir o retorno. Quero ser ouvida antes de parecer corajosa.",
          },
        ],
      },
    ),
    n(
      "lua",
      "lua",
      "O eco em B repete uma curva que desenhei em A. Só uma curva. Encontrei sob ela traços mais velhos, de calor, reparo e crescimento. Meu experimento acordou uma tentativa antiga de guardar tudo para sempre. Eu a acordei. Não a inventei sozinha. Quero ajudar a escrever o que vem depois.",
      "Ler A e B: distinguir o gatilho recente das quatro assinaturas antigas.",
      [
        c(
          "lua-reconstruct",
          "Pedir que Lua reconstrua o traço, incluindo o retorno que falta.",
          "perspectives",
          [
            inspect("living:clock"),
            remember("rift:heard-lua"),
            remember("rift:open-return"),
            bond(
              "samael",
              "lua",
              "trust",
              "Lua assumiu o gatilho e ofereceu a reconstrução; Samael reconheceu as quatro fontes antigas.",
            ),
          ],
        ),
        c(
          "lua-review",
          "Propor revisão conjunta do traço antes de acendê-lo.",
          "perspectives",
          [
            remember("rift:heard-lua"),
            remember("rift:review-rule"),
            bond(
              "aryn",
              "lua",
              "trust",
              "Lua pediu revisão sem abrir mão da autoria da conjuração.",
            ),
          ],
        ),
        c(
          "lua-accuse",
          "Perguntar por que ela testou sem avisar e combinar um novo limite.",
          "perspectives",
          [
            remember("rift:heard-lua"),
            remember("rift:consent-rule"),
            bond(
              "aryn",
              "lua",
              "friction",
              "O teste sem aviso foi questionado; Lua aceitou combinar limites, ainda contrariada com a suspeita geral.",
            ),
          ],
        ),
      ],
      {
        action: "work",
        variants: [
          {
            condition: fact("rift:heard-samael"),
            text: "Samael reconheceu a assinatura dele? Eu reconheço a minha. O eco em B repete a curva recente que desenhei em A, mas sob ela há quatro traços antigos. Meu experimento foi o gatilho, não a origem inteira. Posso reconstruir o retorno. Quero revisão, não absolvição automática.",
          },
        ],
      },
    ),
    n(
      "decision",
      "samael",
      "Quatro assinaturas tentaram conservar calor, forma, cor e palavra sem deixar nada partir. A curva de Lua acordou o nó antigo. Podemos fechá-lo devagar: seguro, mas fica uma marca fria e parte da história ilegível. Ou abrir um retorno conjunto: preserva a leitura, mas as cores podem se deslocar até acertarmos o ritmo. Nada de decidir no lugar dos outros.",
      "Ato III — escolher contenção cautelosa ou retorno experimental colaborativo.",
      [
        c(
          "contain",
          "Conter e suturar. Aceitar a marca fria e abrir mão da leitura completa.",
          "contain",
          [scene("rift", "contained"), remember("rift:contained")],
        ),
        c(
          "experiment",
          "Abrir um retorno conjunto. Aceitar deslocamentos reversíveis e revisão em equipe.",
          "experiment",
          [scene("rift", "experimental"), remember("rift:experimental")],
        ),
        c(
          "review-pact",
          "Antes de decidir, estabelecer quem pode interromper o procedimento.",
          "pact",
          [remember("rift:stop-pact")],
        ),
      ],
    ),
    n(
      "pact",
      "ytha",
      "Qualquer um pode pedir para parar. Eu peço se as raízes perderem calor; Aryn, se o apoio ceder; Samael, se a energia passar da margem; Lua, se o retorno inverter. Uma pausa não vira voto de incompetência. Agora consigo escolher junto, sem ter que prometer que não vou tremer.",
      "Escolher a estratégia sob um pacto de interrupção compartilhado.",
      [
        c(
          "pact-contain",
          "Escolher a contenção, preservando o pacto.",
          "contain",
          [
            scene("rift", "contained"),
            remember("rift:contained"),
            bond(
              "aryn",
              "ytha",
              "trust",
              "O pacto deu a Ytha autoridade explícita para interromper a cooperação.",
            ),
          ],
        ),
        c(
          "pact-experiment",
          "Escolher o retorno experimental, preservando o pacto.",
          "experiment",
          [
            scene("rift", "experimental"),
            remember("rift:experimental"),
            bond(
              "ytha",
              "lua",
              "trust",
              "Ytha e Lua combinaram limites antes de experimentar juntas.",
            ),
          ],
        ),
        c(
          "pact-rest",
          "Adiar a decisão e manter a investigação neste ponto.",
          "decision",
          [remember("rift:deliberated")],
        ),
      ],
    ),
    n(
      "contain",
      "aryn",
      "Fechar devagar significa perder uma parte da inscrição. Não chamarei isso de restauração perfeita. Vou guardar uma borda que possa ser examinada depois, sem reabrir a descarga. Lua parece decepcionada. 'Eu queria ler', ela diz. 'Mas não vou forçar a planta a pagar pela minha curiosidade.'",
      "Ato IV — preparar uma contenção com custo reconhecido.",
      [
        c(
          "seal-margin",
          "Preservar uma margem legível para Lua estudar depois.",
          "energy",
          [
            remember("rift:kept-fragment"),
            bond(
              "aryn",
              "lua",
              "trust",
              "Aryn reservou uma margem de estudo para Lua dentro da contenção escolhida.",
            ),
          ],
        ),
        c(
          "seal-privacy",
          "Priorizar um selo opaco, sem prometer recuperar a inscrição.",
          "energy",
          [
            remember("rift:opaque-seal"),
            bond(
              "samael",
              "lua",
              "friction",
              "Lua aceitou o selo opaco, mas discordou da perda da leitura.",
            ),
          ],
        ),
        c(
          "seal-plant",
          "Dar a Ytha a decisão sobre a distância do selo às raízes.",
          "energy",
          [
            remember("rift:root-priority"),
            bond(
              "aryn",
              "ytha",
              "trust",
              "Ytha escolheu a distância segura entre selo e raízes.",
            ),
          ],
        ),
      ],
    ),
    n(
      "experiment",
      "lua",
      "Vamos devolver o que entrou. Não é 'mais potência'; é quatro saídas na ordem certa. Se eu errar, as cores migram por um instante entre planta e costura. Eu paro e redesenho. Aryn quer uma palavra de interrupção. 'Parar', digo. Estou ficando muito boa em nomes curtos.",
      "Ato IV — preparar o retorno com risco reversível e revisão conjunta.",
      [
        c(
          "experiment-review",
          "Pedir revisão do traço por Aryn antes da primeira abertura.",
          "energy",
          [
            remember("rift:reviewed"),
            bond(
              "aryn",
              "lua",
              "repair",
              "Lua pediu revisão prévia e Aryn respeitou a autoria do desenho.",
            ),
          ],
        ),
        c(
          "experiment-ytha",
          "Deixar Ytha marcar o ritmo pela resposta da planta.",
          "energy",
          [
            remember("rift:plant-rhythm"),
            bond(
              "ytha",
              "lua",
              "trust",
              "Lua aceitou o ritmo vegetal de Ytha como guia do retorno.",
            ),
          ],
        ),
        c(
          "experiment-samael",
          "Pedir a Samael uma reserva de contenção caso a curva inverta.",
          "energy",
          [
            remember("rift:backup"),
            bond(
              "samael",
              "lua",
              "trust",
              "Samael ofereceu contenção de reserva, sem substituir a correção de Lua.",
            ),
          ],
        ),
      ],
    ),
    n(
      "energy",
      "samael",
      "Samael firma as mãos e estreita a aura: 'O calor fica comigo até vocês darem destino a ele. Não estou fazendo isso sozinho. Estou segurando a primeira ponta.' A costura deixa de crescer; uma linha quente atravessa E em direção ao salão. Ele espera o sinal, sem arremessar energia contra a fenda.",
      "Cooperação 1/4 — Samael contém a energia; escolher como passar o apoio a Aryn.",
      [
        c(
          "energy-count",
          "Combinar três sinais curtos para passar a carga ao apoio.",
          "structure",
          [
            remember("rift:did-samael"),
            remember("rift:counted"),
            inspect("living:hearth"),
          ],
        ),
        c(
          "energy-consent",
          "Pedir que Samael anuncie seu limite e Aryn confirme antes de receber.",
          "structure",
          [
            remember("rift:did-samael"),
            remember("rift:limits-named"),
            bond(
              "samael",
              "aryn",
              "trust",
              "Aryn confirmou o apoio antes de Samael transferir o calor contido.",
            ),
          ],
        ),
        c(
          "energy-silence",
          "Respeitar a concentração e deixar Ytha dar o sinal visual.",
          "structure",
          [
            remember("rift:did-samael"),
            remember("rift:visual-signal"),
            bond(
              "samael",
              "ytha",
              "trust",
              "Samael confiou ao sinal de Ytha a passagem da energia contida.",
            ),
          ],
        ),
      ],
      { action: "magic" },
    ),
    n(
      "structure",
      "aryn",
      "Aryn alinha as mãos como quem sustenta um livro aberto. 'Não vou unir bordas que ainda precisam se mover.' O apoio cenográfico de C recebe uma luz dourada, e a sombra volta a acompanhar a dobradiça. Ela mantém a sutura provisória. 'Ytha, a estrutura está pronta. Você decide quando as raízes podem entrar.'",
      "Cooperação 2/4 — Aryn estabiliza a estrutura e entrega o ritmo a Ytha.",
      [
        c(
          "structure-open",
          "Manter uma folga no apoio para a circulação vegetal.",
          "life",
          [
            remember("rift:did-aryn"),
            remember("rift:flexible"),
            inspect("living:book"),
          ],
        ),
        c(
          "structure-test",
          "Testar o apoio sem carga antes de Ytha conduzir as cores.",
          "life",
          [remember("rift:did-aryn"), remember("rift:tested-support")],
        ),
        c(
          "structure-recognize",
          "Reconhecer o cuidado de Aryn e confirmar que Ytha pode pedir pausa.",
          "life",
          [
            remember("rift:did-aryn"),
            bond(
              "aryn",
              "ytha",
              "trust",
              "A sustentação de Aryn deu espaço à decisão de Ytha durante a fenda.",
            ),
          ],
        ),
      ],
      { action: "magic" },
    ),
    n(
      "life",
      "ytha",
      "Ytha abre as asas e pousa os dedos no ar acima da planta. 'Não vou guardar todas as cores comigo. Vou mostrar a volta.' Um rosa pálido reaparece nas pétalas. A corrente ganha um pulso que a luz sozinha não tinha. Ela olha para Lua: 'Eu abro o caminho. Você termina a frase.'",
      "Cooperação 3/4 — Ytha protege a planta e abre a circulação.",
      [
        c(
          "life-roots",
          "Dar tempo às raízes e seguir o pulso escolhido por Ytha.",
          "conjure",
          [
            remember("rift:did-ytha"),
            remember("rift:gentle-pulse"),
            inspect("living:plant"),
          ],
        ),
        c(
          "life-color",
          "Pedir que ela deixe uma pétala como sinal de limite.",
          "conjure",
          [remember("rift:did-ytha"), remember("rift:petal-signal")],
        ),
        c(
          "life-voice",
          "Convidar Ytha a dizer em voz alta quando Lua pode começar.",
          "conjure",
          [
            remember("rift:did-ytha"),
            bond(
              "ytha",
              "lua",
              "trust",
              "Lua esperou a autorização de Ytha para terminar a conjuração.",
            ),
          ],
        ),
      ],
      { action: "magic" },
    ),
    n(
      "conjure",
      "lua",
      "Lua desenha a volta aberta, apaga uma curva e a refaz antes de acender. 'Desta vez não estou copiando o final. Estou entendendo onde ele precisa chegar.' Quatro pontos se alinham na costura. Sua mão pára um instante para conferir cada um. Ela pede os três sinais e só então completa a conjuração.",
      "Cooperação 4/4 — Lua reconstrói a conjuração; concluir a estratégia escolhida.",
      [
        c(
          "finish-contain",
          "Confirmar os quatro sinais e fechar o selo cauteloso.",
          "sealed",
          [remember("rift:did-lua"), scene("rift", "restored")],
          fact("rift:contained"),
        ),
        c(
          "finish-open",
          "Confirmar os quatro sinais e abrir o retorno experimental.",
          "surge",
          [remember("rift:did-lua"), remember("rift:color-shift")],
          fact("rift:experimental"),
        ),
        c(
          "check-final",
          "Pedir uma última conferência dos quatro antes da conclusão.",
          "check",
          [remember("rift:final-check")],
        ),
      ],
      { action: "magic" },
    ),
    n(
      "check",
      "aryn",
      "Calor dentro da margem. Apoio firme. Raízes respondendo. Retorno voltado para fora. Ninguém prometeu certeza absoluta; cada um confirmou a parte que conhece. Aryn olha para Lua e retira a mão da linha final. 'É sua. Estamos aqui.'",
      "Concluir com quatro confirmações e autoria compartilhada.",
      [
        c(
          "checked-contain",
          "Lua conclui o selo de contenção.",
          "sealed",
          [remember("rift:did-lua"), scene("rift", "restored")],
          fact("rift:contained"),
        ),
        c(
          "checked-open",
          "Lua conclui o retorno aberto.",
          "surge",
          [remember("rift:did-lua"), remember("rift:color-shift")],
          fact("rift:experimental"),
        ),
      ],
    ),
    n(
      "sealed",
      "samael",
      "A costura se recolhe numa meia-lua fria de latão. O calor se extingue em E; em C, a sombra cabe outra vez na dobradiça. Uma parte da inscrição some. Lua encara o espaço vazio. Samael diz: 'Não vou fingir que não perdemos nada. Também não vou fingir que proteger o que estava aqui foi pouco.'",
      "Ato V — reconhecer o custo da contenção e ouvir o epílogo dos quatro.",
      [
        c(
          "sealed-record",
          "Guardar a margem e reconhecer o desacordo de Lua.",
          "epilogue",
          [
            remember("rift:acknowledged-loss"),
            bond(
              "samael",
              "lua",
              "repair",
              "Samael reconheceu a perda da inscrição sem exigir que Lua gostasse da contenção.",
            ),
          ],
        ),
        c(
          "sealed-care",
          "Agradecer a Ytha por preservar a planta, sem chamar a escolha de perfeita.",
          "epilogue",
          [
            remember("rift:life-thanked"),
            bond(
              "aryn",
              "ytha",
              "trust",
              "A preservação da vida vegetal foi reconhecida como contribuição necessária.",
            ),
          ],
        ),
        c(
          "sealed-future",
          "Propor que Lua estude apenas o fragmento estável, acompanhada.",
          "epilogue",
          [
            remember("rift:fragment-study"),
            bond(
              "aryn",
              "lua",
              "trust",
              "Lua ganhou um estudo consentido do fragmento estável, sem reabrir a fenda.",
            ),
          ],
        ),
      ],
    ),
    n(
      "surge",
      "lua",
      "Por um instante, as pétalas ficam lilás e a costura floresce em rosa. Lua interrompe no limite combinado. 'A volta está certa. O ritmo ainda não.' Ytha mantém as raízes vivas; Aryn segura o apoio; Samael retém o calor. Lua redesenha a pausa entre os pontos. O risco previsto aconteceu. Agora eles podem corrigi-lo juntos.",
      "Resolver o deslocamento reversível sem abandonar a estratégia nem a planta.",
      [
        c(
          "surge-rhythm",
          "Seguir o pulso de Ytha; Lua adapta a pausa ao ritmo da planta.",
          "opened",
          [
            scene("rift", "restored"),
            remember("rift:plant-led-correction"),
            bond(
              "ytha",
              "lua",
              "trust",
              "Ytha conduziu o ritmo que permitiu a Lua corrigir o retorno experimental.",
            ),
          ],
        ),
        c(
          "surge-backup",
          "Usar a reserva de Samael para Lua revisar sem pressão.",
          "opened",
          [
            scene("rift", "restored"),
            remember("rift:contained-correction"),
            bond(
              "samael",
              "lua",
              "trust",
              "A contenção de Samael deu a Lua tempo para corrigir o ritmo do retorno.",
            ),
          ],
        ),
        c(
          "surge-pause",
          "Pedir uma pausa compartilhada e retomar com quatro confirmações.",
          "opened",
          [
            scene("rift", "restored"),
            remember("rift:cooperative-pause"),
            bond(
              "aryn",
              "lua",
              "repair",
              "A pausa foi tratada como parte da cooperação; Lua concluiu a correção sem perder autoria.",
            ),
          ],
        ),
      ],
      { action: "work" },
    ),
    n(
      "opened",
      "ytha",
      "Verde nas folhas, rosa nas pétalas. O globo recebe e devolve a mesma luz. Na costura agora mansa, lemos: 'Nenhuma casa conserva seus habitantes prendendo todas as suas partidas.' A frase se dissolve num círculo de quatro cores. Não abriu uma porta. Abriu uma compreensão. Ytha sorri: 'Uma casa também aprende a respirar.'",
      "Ato V — reconhecer a leitura recuperada e o custo do experimento.",
      [
        c(
          "open-credit",
          "Creditar a correção aos quatro, incluindo a interrupção de Lua.",
          "epilogue",
          [
            remember("rift:shared-credit"),
            bond(
              "samael",
              "lua",
              "repair",
              "Lua assumiu o gatilho e corrigiu o retorno; os quatro compartilharam o mérito sem apagar o erro.",
            ),
          ],
        ),
        c(
          "open-warning",
          "Registrar que a planta não deve voltar a servir de margem de risco.",
          "epilogue",
          [
            remember("rift:future-limit"),
            bond(
              "aryn",
              "ytha",
              "trust",
              "Aryn apoiou o limite de Ytha para futuros experimentos junto à planta.",
            ),
          ],
        ),
        c(
          "open-memory",
          "Pedir que cada um guarde uma parte da frase, sem uma memória única.",
          "epilogue",
          [
            remember("rift:four-memories"),
            bond(
              "ytha",
              "lua",
              "trust",
              "Ytha e Lua escolheram lembrar de formas diferentes, preservando a circulação da história.",
            ),
          ],
        ),
      ],
    ),
    n(
      "epilogue",
      "aryn",
      "Aryn recolhe as mãos: 'Reparar não é devolver tudo ao que era.' Ytha responde: 'A planta está viva. Eu também participei de decidir como.' Lua fecha o grimório sem esconder a página errada. Samael se senta com o café já frio: 'Quatro opiniões, uma Biblioteca inteira. Estatística surpreendentemente boa.'",
      "Escolher como encerrar a noite que a própria fenda criou.",
      [
        c(
          "last-table",
          "Reunir os quatro para uma pausa, permitindo que ainda discordem.",
          "end",
          [
            remember("rift:table"),
            bond(
              "samael",
              "aryn",
              "trust",
              "Depois da fenda, os quatro aceitaram companhia sem exigir unanimidade.",
            ),
          ],
        ),
        c(
          "last-room",
          "Dar a cada um espaço para guardar sua parte da noite.",
          "end",
          [
            remember("rift:space"),
            bond(
              "samael",
              "ytha",
              "trust",
              "Ytha e Samael reconheceram que companhia também inclui respeitar o silêncio.",
            ),
          ],
        ),
        c(
          "last-promise",
          "Combinar que a próxima experiência começa com um convite aos quatro.",
          "end",
          [
            remember("rift:invitation"),
            bond(
              "aryn",
              "lua",
              "repair",
              "Os quatro combinaram convite e limites compartilhados para futuras experiências.",
            ),
          ],
        ),
      ],
      {
        variants: [
          {
            condition: fact("rift:contained"),
            text: "Aryn diz: 'A marca fria ficou; não vou chamar isso de reparo invisível.' Ytha confirma a planta viva. Lua guarda o fragmento: 'Eu ainda teria escolhido ler. Mas não vou tratar cuidado como covardia.' Samael deixa o café na mesa: 'Podemos discordar sentados, para variar.'",
          },
        ],
      },
    ),
    n(
      "end",
      "lua",
      "O círculo de quatro cores repousa no salão como uma lembrança que não exige ser repetida. Os cinco cômodos voltam à luz de seu próprio tempo. Lua olha para os outros: 'Não quero que essa seja a noite em que quase estraguei tudo. Quero que seja a noite em que cada um fez uma parte que ninguém faria sozinho.' Ninguém corrige o título.",
      "Concluída — os quatro resolveram a fenda; consequências registradas no diário.",
      [],
      {
        outcome:
          "Retorno experimental: os quatro corrigiram juntos o deslocamento reversível das cores. A inscrição foi lida, a planta recuperada e um círculo de quatro cores ficou como memória da cooperação.",
        variants: [
          {
            condition: fact("rift:contained"),
            text: "A meia-lua fria repousa no salão. A inscrição ficou incompleta, a planta vive e os cinco cômodos voltam à luz de seu próprio tempo. Lua guarda o fragmento sem fingir satisfação. Samael abre espaço na mesa. Aryn não exige gratidão. Ytha traz a flor. Discordar não os impede de permanecer juntos.",
          },
        ],
      },
    ),
  ],
};
