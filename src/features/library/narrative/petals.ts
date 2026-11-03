import type { QuestDefinition } from "./contracts";
import { story, remember, scene, inspect, bond } from "./writing";
const { n, c, id } = story("petals");
export const petals: QuestDefinition = {
  questId: "petals",
  title: "As Pétalas que Esquecem",
  owner: "ytha",
  start: id("start"),
  nodes: [
    n(
      "start",
      "ytha",
      "Ontem esta flor era da cor de uma história que eu lembrava. Hoje eu lembro da história, mas não da cor. A planta estrelada de D está ficando cinza. Eu disse que talvez fosse a estação. Não era uma resposta; era uma maneira de não pedir ajuda.",
      "Investigar com Ytha por que a planta perde suas cores.",
      [
        c(
          "listen",
          "Observar com ela uma pétala, antes de tentar curar.",
          "listen",
          [inspect("living:plant"), remember("petals:listened")],
        ),
        c(
          "aryn",
          "Convidar Aryn a procurar uma causa física com Ytha.",
          "aryn",
          [remember("petals:aryn")],
        ),
        c(
          "samael",
          "Pedir a Samael uma leitura da corrente mágica.",
          "samael",
          [remember("petals:samael")],
        ),
        c(
          "lua",
          "Propor a Lua um experimento pequeno, conduzido por Ytha.",
          "lua",
          [remember("petals:lua")],
        ),
      ],
    ),
    n(
      "listen",
      "ytha",
      "Quando digo que estou bem, ela empalidece. Quando digo que estou com medo, uma nervura acende. Não está roubando minhas lembranças. Está guardando tudo que eu não termino de sentir. E alguém lhe ensinou a guardar sem soltar. Consigo perceber o fio indo até o globo.",
      "Examinar o globo de D e a direção do fio de memória.",
      [
        c(
          "trace",
          "Confiar na observação de Ytha e seguir o fio até o globo.",
          "globe",
          [inspect("living:globe"), remember("petals:emotion")],
        ),
        c(
          "confirm-care",
          "Pedir a Aryn que confirme se as raízes estão saudáveis.",
          "aryn",
          [remember("petals:emotion")],
        ),
        c(
          "test-color",
          "Convidar Lua a testar uma única cor com permissão de Ytha.",
          "lua",
          [remember("petals:emotion")],
        ),
      ],
      { action: "work" },
    ),
    n(
      "aryn",
      "aryn",
      "As raízes não estão doentes. Minha luz devolve a cor por um instante, depois ela some. Eu poderia insistir... mas Ytha está dizendo alguma coisa. — 'A planta não precisa de mais energia. Precisa de uma saída.' Aryn abaixa as mãos: 'Mostre onde. Eu acompanho.'",
      "Dar a Ytha a condução da investigação.",
      [
        c(
          "ytha-leads",
          "Ytha segue o fio; Aryn sustenta as raízes, sem decidir por ela.",
          "globe",
          [
            inspect("living:globe"),
            remember("petals:supported"),
            bond(
              "aryn",
              "ytha",
              "trust",
              "Aryn suspendeu a cura automática para seguir a leitura de Ytha.",
            ),
          ],
        ),
        c(
          "overcare",
          "Sugerir outra aplicação de luz antes de seguir o fio.",
          "stand",
          [
            remember("petals:overcare"),
            bond(
              "aryn",
              "ytha",
              "friction",
              "Ytha precisou defender sua leitura diante de uma proposta de cura excessiva.",
            ),
          ],
        ),
        c(
          "quiet-test",
          "Propor um teste com uma raiz e deixar Ytha decidir o limite.",
          "globe",
          [
            inspect("living:globe"),
            remember("petals:measured"),
            bond(
              "aryn",
              "ytha",
              "repair",
              "Um teste limitado confirmou a leitura de Ytha sem sobrecarregar a planta.",
            ),
          ],
        ),
      ],
    ),
    n(
      "samael",
      "samael",
      "O fio não queima. Puxa. Há uma inscrição no globo: 'conservar o que não pode voltar'. Instrução péssima para uma planta. Plantas voltam de outro jeito. Ytha está olhando para mim como se eu devesse aplicar a observação a mim mesmo. Vou fingir que não percebi.",
      "Investigar a inscrição de conservação no globo.",
      [
        c(
          "ground",
          "Pedir que Samael aterre a corrente enquanto Ytha a segue.",
          "globe",
          [
            inspect("living:globe"),
            remember("petals:ground"),
            bond(
              "samael",
              "ytha",
              "trust",
              "Samael conteve a corrente para Ytha investigar sem pressa.",
            ),
          ],
        ),
        c(
          "ask-memory",
          "Perguntar a Ytha qual lembrança a planta tenta conservar.",
          "memory",
          [remember("petals:memory")],
        ),
        c(
          "force-cut",
          "Propor cortar o fio de uma vez e ouvir a resposta de Ytha.",
          "stand",
          [remember("petals:force")],
        ),
      ],
    ),
    n(
      "lua",
      "lua",
      "Um teste, uma pétala, e a palavra de parar é 'parar'. Aos meus primeiros duzentos anos eu teria escolhido uma palavra em sete sílabas. Evoluí. Ytha encosta numa pétala e eu desenho uma janela de luz: a cor sai da folha, dá uma volta e retorna. Falta uma janela no encanto original.",
      "Escolher entre observar a memória e revisar o circuito.",
      [
        c(
          "window",
          "Deixar Ytha desenhar a abertura de retorno no globo.",
          "globe",
          [
            inspect("living:globe"),
            remember("petals:window"),
            bond(
              "ytha",
              "lua",
              "trust",
              "Lua respeitou o limite do experimento; Ytha desenhou a abertura que faltava.",
            ),
          ],
        ),
        c(
          "memory-first",
          "Parar o teste e perguntar que lembrança está presa.",
          "memory",
          [remember("petals:memory")],
        ),
        c(
          "more-power",
          "Sugerir aumentar a luz; deixar Ytha aceitar ou recusar.",
          "stand",
          [
            remember("petals:pressure"),
            bond(
              "ytha",
              "lua",
              "friction",
              "Ytha recusou ampliar o experimento só para obter uma resposta rápida.",
            ),
          ],
        ),
      ],
      { action: "work" },
    ),
    n(
      "stand",
      "ytha",
      "Não. Quero dizer: não vamos cortar nem empurrar mais força para dentro. Sei que vocês querem ajudar. Eu também quero. E conheço esta planta. Vou abrir um retorno pequeno; se a cor não voltar, eu paro. Não preciso deixar de ter medo para escolher isso.",
      "Respeitar a iniciativa de Ytha e preparar um retorno seguro.",
      [
        c(
          "trust-her",
          "Apoiar seu limite e ajudá-la a ler a inscrição do globo.",
          "globe",
          [inspect("living:globe"), remember("petals:asserted")],
        ),
        c("hear-her", "Ouvir a lembrança antes de abrir o retorno.", "memory", [
          remember("petals:asserted"),
          remember("petals:memory"),
        ]),
        c(
          "ask-backup",
          "Perguntar que apoio ela deseja, sem tomar a decisão por ela.",
          "globe",
          [
            inspect("living:globe"),
            remember("petals:supported"),
            bond(
              "aryn",
              "ytha",
              "repair",
              "Ytha escolheu o limite; o cuidado passou a respeitar sua condução.",
            ),
          ],
        ),
      ],
    ),
    n(
      "memory",
      "ytha",
      "Eu contei a ela uma história sobre uma casa que não existe mais. Fiquei com vergonha de sentir saudade de uma casa inventada. A planta guardou esse fim interrompido. Mas uma história pode acabar e continuar sendo companhia. Quero dizer isso em voz alta, por mim, antes de dizer por ela.",
      "Dar uma saída à lembrança sem apagá-la.",
      [
        c(
          "tell-ending",
          "Ouvir Ytha terminar sua história, sem completar as palavras por ela.",
          "globe",
          [inspect("living:globe"), remember("petals:story-ended")],
        ),
        c(
          "invite-witness",
          "Convidar Aryn a ouvir, se Ytha quiser companhia.",
          "globe",
          [
            inspect("living:globe"),
            remember("petals:shared-memory"),
            bond(
              "aryn",
              "ytha",
              "trust",
              "Ytha escolheu compartilhar a lembrança, sem que Aryn tentasse corrigi-la.",
            ),
          ],
        ),
        c(
          "keep-memory",
          "Guardar a história entre vocês e procurar o retorno no globo.",
          "globe",
          [inspect("living:globe"), remember("petals:private-memory")],
        ),
      ],
    ),
    n(
      "globe",
      "ytha",
      "Encontrei. O mapa tem uma linha que entra na planta e nenhuma que sai. E sob ela há outra frase, mais antiga: 'a Biblioteca lembra por circulação, não por cárcere'. Alguém fechou um circuito que deveria respirar. Eu consigo devolver essa volta. Quero escolher como.",
      "Ytha decide como restaurar a circulação de memória.",
      [
        c(
          "gentle-return",
          "Abrir um retorno lento; conservar na flor uma nervura prateada.",
          "silver",
          [scene("petals", "restored"), remember("petals:silver")],
        ),
        c(
          "living-map",
          "Criar com Lua uma janela que mostre o percurso da memória.",
          "map",
          [
            scene("petals", "restored"),
            remember("petals:map"),
            bond(
              "ytha",
              "lua",
              "trust",
              "Ytha concebeu a janela vegetal e Lua ajudou a traçá-la, seguindo sua orientação.",
            ),
          ],
        ),
        c(
          "shared-roots",
          "Pedir a Aryn apoio nas raízes enquanto Ytha abre o retorno.",
          "roots",
          [
            scene("petals", "restored"),
            remember("petals:roots"),
            bond(
              "aryn",
              "ytha",
              "trust",
              "Ytha conduziu a recuperação; Aryn sustentou as raízes sem tomar a iniciativa dela.",
            ),
          ],
        ),
      ],
      { action: "magic" },
    ),
    n(
      "silver",
      "ytha",
      "Olhe: verde nas folhas, rosa nas pétalas. A nervura prateada ficou. Não é uma cicatriz que precisamos esconder. A planta solta uma cor de cada vez e recebe outra de volta. Eu abri a passagem. Minha voz tremeu. Minhas mãos não desistiram.",
      "Concluída — vitalidade recuperada; memória em circulação.",
      [],
      {
        outcome:
          "A planta voltou a florescer com uma nervura prateada. Ytha abriu o retorno por iniciativa própria e descobriu que a Biblioteca conserva memórias fazendo-as circular.",
      },
    ),
    n(
      "map",
      "ytha",
      "As cores voltaram e desenham uma pequena volta no ar. Lua perguntou que nome eu daria à janela. Disse 'respiro'. Ela não fez piada. Depois fez uma piada boa, sobre um globo com falta de ar. Eu ri. Fui eu que abri a janela; posso rir sem diminuir o que fiz.",
      "Concluída — florada e janela de memória concebida por Ytha.",
      [],
      {
        outcome:
          "Ytha restaurou a planta com uma janela de retorno, traçada em colaboração com Lua. A florada exibe um mapa vivo: a Biblioteca lembra por circulação.",
      },
    ),
    n(
      "roots",
      "aryn",
      "A cor voltou quando Ytha abriu o retorno, não quando eu tentei curar. Faço questão da diferença. — Ytha afasta as mãos das raízes, satisfeita: 'Na próxima vez, posso chamar você depois de começar?' — 'Pode. Posso perguntar antes de começar também.'",
      "Concluída — florada restaurada; Ytha conduz, Aryn acompanha.",
      [],
      {
        outcome:
          "A planta recuperou folhas verdes e pétalas rosa. Ytha abriu o circuito e Aryn sustentou as raízes; a autonomia de Ytha tornou-se parte explícita do vínculo.",
      },
    ),
  ],
};
