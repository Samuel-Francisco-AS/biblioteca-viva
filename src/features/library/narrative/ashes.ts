import type { QuestDefinition } from "./contracts";
import { story, remember, scene, inspect, bond, fact } from "./writing";
const { n, c, id } = story("ashes");
export const ashes: QuestDefinition = {
  questId: "ashes",
  title: "As Cinzas do Caderno",
  owner: "samael",
  start: id("start"),
  nodes: [
    n(
      "start",
      "samael",
      "Se veio devolver uma página, ponha aí. Se veio perguntar por que ela está carbonizada, entre na fila. A fila sou eu. Meu caderno passou a noite fechado; agora há folhas junto ao braseiro de E. Não gosto de mistérios que usam a minha letra.",
      "Descobrir por que as páginas ficcionais saíram do caderno.",
      [
        c(
          "quiet",
          "Investigar com discrição, sem levar o caderno a ninguém.",
          "notebook",
          [remember("ashes:discreet")],
        ),
        c(
          "confront",
          "Perguntar com respeito o que ele fez antes do incidente.",
          "admission",
          [remember("ashes:confronted")],
        ),
        c(
          "aryn",
          "Pedir a Aryn uma leitura das marcas, deixando claro de quem são.",
          "aryn",
          [
            remember("ashes:exposed"),
            bond(
              "samael",
              "aryn",
              "friction",
              "Samael sente que sua falha foi discutida antes de ele consentir.",
            ),
          ],
        ),
      ],
    ),
    n(
      "notebook",
      "samael",
      "Anotações fictícias sobre calor residual, não confissões. Aqui: 'fechar o circuito antes de apagar a chama'. O risco atravessou a palavra fechar. Não leia o verso. Há uma receita de café tão ruim que prefiro assumir um incêndio.",
      "Comparar a anotação com uma pista ambiental.",
      [
        c(
          "check-heat",
          "Examinar o braseiro de E: procurar cinza recente.",
          "hearth",
          [inspect("living:hearth"), remember("ashes:heat")],
        ),
        c(
          "check-clock",
          "Examinar o relógio de B: procurar o instante do deslocamento.",
          "clock",
          [inspect("living:clock"), remember("ashes:time")],
        ),
        c(
          "ask-permission",
          "Pedir autorização para Aryn examinar só a margem queimada.",
          "consent",
          [remember("ashes:consent")],
        ),
      ],
      { action: "work" },
    ),
    n(
      "admission",
      "samael",
      "Eu tentei aquecer tinta antiga com a mão. Sim, uma ideia brilhante. Literalmente, por uns três segundos. Mas apaguei o fogo. Se acha que estou escondendo a parte importante... estou tentando lembrar dela sem inventar uma desculpa.",
      "Testar a hipótese de calor residual sem condenação precipitada.",
      [
        c(
          "own-account",
          "Agradecer a franqueza e comparar sua lembrança com o caderno.",
          "notebook",
          [remember("ashes:honest")],
        ),
        c("direct-heat", "Examinar juntos o braseiro de E.", "hearth", [
          inspect("living:hearth"),
          remember("ashes:heat"),
        ]),
        c(
          "public-help",
          "Dizer que Aryn precisa saber para evitar outra ocorrência.",
          "aryn",
          [
            remember("ashes:exposed"),
            bond(
              "samael",
              "aryn",
              "friction",
              "A responsabilidade é discutida, mas Samael se sente exposto.",
            ),
          ],
        ),
      ],
    ),
    n(
      "consent",
      "samael",
      "Só a margem? Consegue convencer uma restauradora a ignorar o resto do papel? Está bem. Eu levo. Não quero que minha vergonha chegue antes de mim.",
      "Levar uma amostra autorizada a Aryn.",
      [
        c(
          "consent-sample",
          "Separar com ele a margem que pode ser mostrada.",
          "aryn",
          [
            remember("ashes:consent"),
            bond(
              "samael",
              "aryn",
              "trust",
              "Samael escolheu o que mostrar; Aryn respeitou a margem autorizada.",
            ),
          ],
        ),
        c(
          "keep-private",
          "Respeitar a hesitação e investigar o braseiro em particular.",
          "hearth",
          [
            remember("ashes:discreet"),
            inspect("living:hearth"),
            remember("ashes:heat"),
          ],
        ),
        c("timing", "Antes da amostra, conferir o relógio de B.", "clock", [
          inspect("living:clock"),
          remember("ashes:time"),
        ]),
      ],
    ),
    n(
      "aryn",
      "aryn",
      "A borda queimou de dentro para fora. Não vou abrir o caderno para provar isso. A tinta guardou calor depois que a chama acabou; o papel procurou o foco mais quente, em E. Mas por que o lacre ficou aberto? Essa resposta pertence a ele.",
      "Entender o lacre antes de reparar as folhas.",
      [
        c(
          "defend-boundary",
          "Reconhecer que mostrar as folhas sem consentimento foi precipitado.",
          "return",
          [
            remember("ashes:apology"),
            bond(
              "samael",
              "aryn",
              "repair",
              "O limite do caderno foi reconhecido; a ajuda passa a ser consentida.",
            ),
          ],
        ),
        c(
          "technical",
          "Guardar a hipótese técnica e examinar as brasas de E.",
          "hearth",
          [
            remember("ashes:aryn-help"),
            inspect("living:hearth"),
            remember("ashes:heat"),
          ],
        ),
        c(
          "invite",
          "Convidar Aryn a perguntar a Samael antes de tocar no lacre.",
          "return",
          [remember("ashes:aryn-help"), remember("ashes:consent")],
        ),
      ],
      { action: "work" },
    ),
    n(
      "hearth",
      "samael",
      "A cinza está fria. A margem lilás, não. A folha veio buscar calor aqui; não foi o braseiro que a queimou. Essa curva... é minha marca de fechamento. Incompleta. Não há um sabotador interessante. Só um idiota meticuloso que esqueceu a última etapa.",
      "Decidir como reparar o lacre e assumir a falha.",
      [
        c(
          "private-proof",
          "Entregar a prova em particular e deixar que ele refaça o lacre.",
          "repair",
          [remember("ashes:private-repair"), scene("ashes", "examined")],
        ),
        c(
          "shared-proof",
          "Propor reparo com Aryn, sob os limites que ele escolher.",
          "together",
          [
            remember("ashes:aryn-help"),
            remember("ashes:consent"),
            scene("ashes", "examined"),
          ],
        ),
        c(
          "name-harm",
          "Pedir que reconheça o susto dos outros antes de corrigir.",
          "return",
          [remember("ashes:accountable"), scene("ashes", "examined")],
        ),
      ],
      { action: "react" },
    ),
    n(
      "clock",
      "samael",
      "O ponteiro tem um grão de tinta lilás. A corrente passou por B quando a Biblioteca mudou de temperatura. As páginas seguiram o calor, até E. Isso explica o trajeto; não me absolve do lacre aberto. Seria conveniente se relógios aceitassem culpa.",
      "Confirmar a origem da corrente no braseiro de E.",
      [
        c("follow-current", "Seguir a corrente até o braseiro.", "hearth", [
          inspect("living:hearth"),
          remember("ashes:heat"),
        ]),
        c(
          "request-review",
          "Pedir uma segunda leitura a Aryn com consentimento.",
          "consent",
          [remember("ashes:time")],
        ),
        c(
          "tell-truth",
          "Pedir que ele conte sua hipótese, sem se esconder no sarcasmo.",
          "return",
          [remember("ashes:accountable")],
        ),
      ],
    ),
    n(
      "return",
      "samael",
      "Fui eu. Deixei o lacre aberto porque achei que controlar fogo era o mesmo que controlar o que ele deixa para trás. Não é. Agradeço que tenha investigado em vez de escolher a história mais fácil sobre mim. Ainda estou irritado. Consigo fazer duas coisas.",
      "Escolher uma reparação responsável.",
      [
        c(
          "alone-not-lonely",
          "Oferecer companhia silenciosa enquanto ele corrige o lacre.",
          "repair",
          [remember("ashes:private-repair")],
        ),
        c(
          "consented-team",
          "Chamar Aryn agora, explicando os limites combinados.",
          "together",
          [
            remember("ashes:aryn-help"),
            bond(
              "samael",
              "aryn",
              "repair",
              "Aryn só participa do lacre depois de um convite explícito.",
            ),
          ],
        ),
        c(
          "written-note",
          "Propor que ele acrescente um aviso de segurança às próprias notas fictícias.",
          "repair",
          [remember("ashes:warning")],
        ),
      ],
    ),
    n(
      "repair",
      "samael",
      "Você segura a borda. Eu fecho o traço. Devagar: é responsabilidade, não penitência. Pronto. As folhas pararam de puxar calor. Vou conservar uma margem queimada. Caso meu ego precise de um marcador de página.",
      "Encerrar o circuito e escolher o que a lembrança significa.",
      [
        c(
          "private-ending",
          "Guardar o episódio entre vocês, com o aviso de lacre.",
          "end-private",
          [scene("ashes", "restored"), remember("ashes:trusted-player")],
        ),
        c(
          "tell-by-choice",
          "Deixar que ele conte a Aryn, com as próprias palavras.",
          "end-shared",
          [
            scene("ashes", "restored"),
            bond(
              "samael",
              "aryn",
              "trust",
              "Samael relatou a falha por escolha própria, sem entregar o caderno.",
            ),
          ],
        ),
        c(
          "offer-tea",
          "Oferecer café e pedir que ele avise se o lacre voltar a aquecer.",
          "end-private",
          [scene("ashes", "restored"), remember("ashes:check-in")],
        ),
      ],
      { action: "magic" },
    ),
    n(
      "together",
      "aryn",
      "Posso unir as fibras? — pergunta Aryn. Samael mantém o lacre entre as mãos: 'Pode. A última linha é minha.' Ela espera. Duas luzes diferentes percorrem o papel; a margem escura permanece, mas o calor se extingue.",
      "Reconhecer ajuda sem transferir a responsabilidade.",
      [
        c(
          "shared-credit",
          "Agradecer aos dois e deixar Samael registrar a causa.",
          "end-shared",
          [
            scene("ashes", "restored"),
            bond(
              "samael",
              "aryn",
              "trust",
              "Reparo com permissão: Aryn recompõe as fibras e Samael fecha seu próprio lacre.",
            ),
          ],
        ),
        c(
          "repair-exposure",
          "Reconhecer diante dos dois que exposição e ajuda são coisas diferentes.",
          "end-exposed",
          [
            scene("ashes", "restored"),
            remember("ashes:boundary"),
            bond(
              "samael",
              "aryn",
              "repair",
              "A ajuda não apaga o desconforto; combinaram pedir autorização na próxima vez.",
            ),
          ],
        ),
        c(
          "protect-margin",
          "Pedir que a margem queimada permaneça como lembrança escolhida.",
          "end-shared",
          [scene("ashes", "restored"), remember("ashes:kept-margin")],
        ),
      ],
      { action: "magic" },
    ),
    n(
      "end-private",
      "samael",
      "Mistério resolvido: a tinta reteve meu calor e o lacre aberto carregou as páginas até o braseiro. Você não fez daquilo um espetáculo. Isso... torna menos difícil abrir o caderno na sua presença. Não abuse. Minha receita de café continua sigilosa.",
      "Concluída — lacre corrigido; confiança discreta.",
      [],
      {
        variants: [
          {
            condition: fact("ashes:exposed"),
            text: "O lacre está fechado e as páginas pararam de puxar calor. Você ficou comigo no reparo, mas ainda não gosto de ter virado assunto antes de ser ouvido. Da próxima vez, pergunte. Eu... vou tentar responder antes de me esconder atrás da capa.",
          },
        ],
        outcome:
          "O lacre foi corrigido por Samael, com companhia discreta. A margem queimada virou lembrança de responsabilidade, e ele passou a confiar ao jogador seus avisos de calor.",
      },
    ),
    n(
      "end-shared",
      "samael",
      "Aryn deixou a página torta porque eu pedi. Imagine: restauração com direito a imperfeição. A causa era meu lacre, não uma ameaça na Biblioteca. Posso aceitar ajuda sem entregar tudo. Uma descoberta terrivelmente inconveniente para a minha reputação.",
      "Concluída — responsabilidade compartilhada com limites.",
      [],
      {
        variants: [
          {
            condition: fact("ashes:exposed"),
            text: "Aryn respeitou a margem que escolhi conservar. O lacre era minha responsabilidade; mostrar a página antes de perguntar foi outra coisa. O reparo ajudou. Não apagou o desconforto. Posso agradecer e pedir um limite ao mesmo tempo. Terrivelmente adulto da minha parte.",
          },
        ],
        outcome:
          "Samael assumiu o lacre incompleto; a participação consentida de Aryn aproximou os dois e preservou as anotações privadas do personagem.",
      },
    ),
    n(
      "end-exposed",
      "samael",
      "Resolvido não quer dizer esquecido. Não gostei de virar assunto antes de virar pergunta. Mas você voltou, ouviu e reparou isso também. Da próxima vez, bata na capa antes de abrir a história. Eu tento responder antes de rosnar.",
      "Concluída — reparação feita; limites ainda em reconstrução.",
      [],
      {
        outcome:
          "O circuito foi fechado em conjunto. Samael reconheceu a própria falha e a ajuda recebida, mas guardou o desconforto da exposição; um novo limite foi combinado.",
      },
    ),
  ],
};
