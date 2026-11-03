import type { QuestDefinition } from "./contracts";
import { story, remember, scene, inspect, bond } from "./writing";
const { n, c, id } = story("anatomy");
export const anatomy: QuestDefinition = {
  questId: "anatomy",
  title: "O Livro de Anatomia Rasgado",
  owner: "aryn",
  start: id("start"),
  nodes: [
    n(
      "start",
      "aryn",
      "Faltam três fibras na lombada do Atlas dos Corpos Impossíveis. É um volume de treino, mas a gravura da mão tem sete dedos e era minha preferida. Lua esteve perto dele. Eu sei, isso não é prova. Mesmo assim já estou preparando a cola. Pode segurar?",
      "Decidir entre estabilizar o atlas ficcional e investigar primeiro.",
      [
        c(
          "stabilize",
          "Segurar a lombada e estabilizar antes de procurar a causa.",
          "first-aid",
          [remember("anatomy:repair-first")],
        ),
        c(
          "investigate",
          "Pedir que espere: examinar a direção do rasgo em C.",
          "tear",
          [inspect("living:book"), remember("anatomy:evidence-first")],
        ),
        c(
          "challenge",
          "Questionar a suspeita sobre Lua e convidá-la a explicar.",
          "lua",
          [
            remember("anatomy:challenged"),
            bond(
              "aryn",
              "lua",
              "friction",
              "Aryn suspeitou de Lua antes de examinar o atlas; a suspeita foi questionada.",
            ),
          ],
        ),
      ],
    ),
    n(
      "first-aid",
      "aryn",
      "Obrigada. Prendi a lombada; o rasgo não avança. Mas a cola cobriu parte de um pó prateado. Eu quis cuidar depressa e apaguei uma pista. Que hábito desagradável: consigo reconhecer todos os ossos de uma criatura inventada e não reconheço quando devo esperar.",
      "Encontrar uma pista que a cola não tenha coberto.",
      [
        c("ask-ytha", "Pedir a Ytha que examine as fibras restantes.", "ytha", [
          remember("anatomy:ytha"),
          bond(
            "aryn",
            "ytha",
            "trust",
            "Aryn pediu uma leitura que sua própria pressa não podia oferecer.",
          ),
        ]),
        c("ask-lua", "Ouvir Lua antes de atribuir a ela o pó.", "lua", [
          remember("anatomy:lua"),
        ]),
        c(
          "check-hinge",
          "Examinar a impressão deixada na borda do suporte em C.",
          "tear",
          [inspect("living:book"), remember("anatomy:imprint")],
        ),
      ],
      { action: "work" },
    ),
    n(
      "tear",
      "aryn",
      "O rasgo aponta para baixo e há uma meia-lua de latão impressa no couro. Uma mão impaciente rasgaria de outro modo. O suporte fechou sobre a capa. Eu o apertei ontem para o livro não cair. Talvez eu tenha protegido o livro de tudo, menos da minha proteção.",
      "Confirmar o comportamento do suporte antes do reparo.",
      [
        c(
          "trace-pollen",
          "Convidar Ytha a distinguir pólen de pó metálico.",
          "ytha",
          [remember("anatomy:imprint"), remember("anatomy:ytha")],
        ),
        c(
          "hear-witness",
          "Perguntar a Lua o que viu quando o suporte fechou.",
          "lua",
          [remember("anatomy:imprint"), remember("anatomy:lua")],
        ),
        c(
          "test-empty",
          "Testar a dobradiça com uma tira cenográfica, sem o atlas.",
          "cause",
          [remember("anatomy:imprint"), remember("anatomy:tested")],
        ),
      ],
      { action: "work" },
    ),
    n(
      "ytha",
      "ytha",
      "Posso tocar na pontinha? Não é pólen. São fibras da fita que você usou para prender o suporte. Se molhar a fita, ela encolhe. Eu sei porque amarrei um vaso com ela uma vez. O vaso venceu. Posso propor outra amarração, em vez de só segurar onde você mandar?",
      "Dar espaço para a contribuição de Ytha.",
      [
        c("delegate", "Convidar Ytha a escolher a nova amarração.", "cause", [
          remember("anatomy:delegated"),
          bond(
            "aryn",
            "ytha",
            "trust",
            "Ytha passou de auxiliar a autora da nova amarração do atlas.",
          ),
        ]),
        c(
          "share-test",
          "Propor que as duas testem a fita num suporte vazio.",
          "cause",
          [
            remember("anatomy:tested"),
            bond(
              "aryn",
              "ytha",
              "repair",
              "Aryn compartilhou o teste e ouviu a experiência de Ytha.",
            ),
          ],
        ),
        c(
          "control",
          "Pedir que Ytha apenas segure a fita enquanto Aryn decide.",
          "boundary",
          [
            remember("anatomy:control"),
            bond(
              "aryn",
              "ytha",
              "friction",
              "Ytha não aceitou ser apenas um par de mãos para a solução de Aryn.",
            ),
          ],
        ),
      ],
    ),
    n(
      "lua",
      "lua",
      "Eu estava perto. É um lugar onde costumo estar quando existo. Vi a fita encolher depois da limpeza e tirei uma página do caminho. Não fui elegante, fui rápida. Guardei o pedacinho da fita porque sabia que alguém confundiria brilho com magia minha. Detesto estar certa desse jeito.",
      "Responder ao testemunho de Lua e testar a fita.",
      [
        c(
          "apology",
          "Pedir a Aryn que reconheça a suspeita e convide Lua ao reparo.",
          "cause",
          [
            remember("anatomy:lua"),
            bond(
              "aryn",
              "lua",
              "repair",
              "Aryn pediu desculpas pela suspeita e convidou Lua a projetar o apoio.",
            ),
          ],
        ),
        c(
          "credit",
          "Registrar que Lua evitou um dano maior e comparar o fragmento.",
          "cause",
          [
            remember("anatomy:witness"),
            bond(
              "aryn",
              "lua",
              "trust",
              "O testemunho de Lua foi tratado como evidência e seu cuidado reconhecido.",
            ),
          ],
        ),
        c(
          "doubt",
          "Pedir uma demonstração da fita antes de aceitar a explicação.",
          "cause",
          [remember("anatomy:tested"), remember("anatomy:doubt")],
        ),
      ],
    ),
    n(
      "boundary",
      "ytha",
      "Eu seguro, se for preciso. Mas minha ideia não fica menor porque eu falo baixo. Uma fita folgada protege melhor que uma cinta apertada. Quero que você escute antes de consertar tudo sozinha. Até o que eu ainda nem terminei de dizer.",
      "Rever o acordo de colaboração.",
      [
        c(
          "listen",
          "Dar a Ytha tempo e autoria para demonstrar a amarração.",
          "cause",
          [
            remember("anatomy:delegated"),
            bond(
              "aryn",
              "ytha",
              "repair",
              "Aryn interrompeu suas instruções e ouviu a solução completa de Ytha.",
            ),
          ],
        ),
        c(
          "ask-permission",
          "Pedir permissão para testar juntas duas amarrações.",
          "cause",
          [
            remember("anatomy:tested"),
            bond(
              "aryn",
              "ytha",
              "repair",
              "As duas trocaram ordens por um teste combinado.",
            ),
          ],
        ),
        c(
          "admit-control",
          "Ajudar Aryn a dizer que tem medo de ser dispensável.",
          "fear",
          [remember("anatomy:vulnerable")],
        ),
      ],
    ),
    n(
      "fear",
      "aryn",
      "Se deixo uma coisa quebrada por cinco minutos, parece que falhei com quem precisava de mim. A cola não reclama quando decido por ela. Pessoas reclamam, com razão. Quero tentar de outro jeito. Ytha, você aceita conduzir o apoio? Eu sigo a sua orientação.",
      "Transformar a admissão em responsabilidade compartilhada.",
      [
        c(
          "accept-lead",
          "Deixar Ytha conduzir e Aryn restaurar as fibras.",
          "cause",
          [
            remember("anatomy:delegated"),
            bond(
              "aryn",
              "ytha",
              "repair",
              "Aryn nomeou seu medo e confiou a Ytha a condução do apoio.",
            ),
          ],
        ),
        c(
          "invite-lua-design",
          "Convidar Lua a desenhar um apoio que permita abrir a capa.",
          "cause",
          [
            remember("anatomy:lua"),
            bond(
              "aryn",
              "lua",
              "trust",
              "Lua desenhou um apoio articulado a convite de Aryn.",
            ),
          ],
        ),
        c(
          "slow-method",
          "Combinar uma revisão lenta, com consentimento a cada etapa.",
          "cause",
          [remember("anatomy:consent-method")],
        ),
      ],
    ),
    n(
      "cause",
      "aryn",
      "A fita úmida encolhe; a dobradiça puxa a capa e rasga a lombada. Repetimos no suporte vazio. Não foi um feitiço, nem descuido de quem folheou. Fui eu que apertei a fita. Vou restaurar o atlas. Antes, quero perguntar: quem deseja fazer qual parte?",
      "Restaurar o atlas com um novo acordo de cuidado.",
      [
        c(
          "shared-repair",
          "Ytha refaz o apoio; Aryn une as fibras com a permissão dela.",
          "shared",
          [
            scene("anatomy", "restored"),
            remember("anatomy:shared"),
            bond(
              "aryn",
              "ytha",
              "trust",
              "O atlas foi restaurado com autoria compartilhada e apoio flexível de Ytha.",
            ),
          ],
        ),
        c(
          "lua-repair",
          "Lua desenha a articulação; Aryn restaura e credita o desenho.",
          "lua-end",
          [
            scene("anatomy", "restored"),
            bond(
              "aryn",
              "lua",
              "repair",
              "O novo apoio traz a solução de Lua, reconhecida por Aryn.",
            ),
          ],
        ),
        c(
          "careful-repair",
          "Aryn conclui o reparo; vocês estabelecem uma pausa para perguntar antes de agir.",
          "careful",
          [scene("anatomy", "restored"), remember("anatomy:ask-first")],
        ),
      ],
      { action: "magic" },
    ),
    n(
      "shared",
      "aryn",
      "Sete dedos, nenhuma página presa. Ficou ótimo. Não: nós fizemos um ótimo trabalho. Ytha está corrigindo minha descrição do apoio e eu estou deixando. O atlas podia ter sido reparado mais cedo. Mas teria voltado ao mesmo suporte. Hoje consertamos também a pergunta que eu não fazia.",
      "Concluída — atlas restaurado; Ytha reconhecida como autora.",
      [],
      {
        outcome:
          "O atlas foi restaurado e ganhou apoio flexível de Ytha. Aryn assumiu a causa mecânica do rasgo e passou a dividir a condução do cuidado.",
      },
    ),
    n(
      "lua-end",
      "lua",
      "Incluí uma folga para a capa respirar. Aryn escreveu meu nome no desenho. Meu nome inteiro, sem um ponto de interrogação ao lado. Não preciso de uma absolvição por dia; um pedido de opinião de vez em quando já é excelente.",
      "Concluída — atlas restaurado; confiança reparada com Lua.",
      [],
      {
        outcome:
          "Aryn restaurou as fibras e reconheceu Lua como autora do apoio articulado. A suspeita deu lugar a uma contribuição creditada.",
      },
    ),
    n(
      "careful",
      "aryn",
      "O atlas está inteiro. Deixei a cola aberta e as mãos paradas por um momento. Não é uma cura milagrosa para o meu hábito. É uma pausa que posso aprender a fazer. Na próxima vez que eu disser 'segure', pode perguntar 'você já perguntou o que eu penso?'. Vou tentar agradecer.",
      "Concluída — atlas restaurado; novo compromisso de perguntar.",
      [],
      {
        outcome:
          "Aryn concluiu o reparo e afrouxou o suporte. Conservou a autoria técnica, mas reconheceu a pressa e assumiu o compromisso explícito de pedir permissão.",
      },
    ),
  ],
};
