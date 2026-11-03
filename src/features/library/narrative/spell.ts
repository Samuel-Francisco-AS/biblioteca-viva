import type { QuestDefinition } from "./contracts";
import { story, remember, scene, inspect, bond } from "./writing";
const { n, c, id } = story("spell");
export const spell: QuestDefinition = {
  questId: "spell",
  title: "O Feitiço Mal Copiado",
  owner: "lua",
  start: id("start"),
  nodes: [
    n(
      "start",
      "lua",
      "Antes que a folha dobre de novo: sim, fui eu. Não, não foi de propósito. O símbolo devia fazer uma palavra flutuar, não convencer o papel de que é uma mariposa cansada. Conheço esse encanto há séculos. Talvez eu tenha parado de olhar para ele por isso. Você vai me dizer para não tentar?",
      "Investigar o símbolo no folio de treino de D.",
      [
        c(
          "review",
          "Pedir que Lua compare a cópia com o traço original.",
          "review",
          [remember("spell:review")],
        ),
        c(
          "encourage",
          "Encorajar sua ideia e propor um teste pequeno antes de repetir.",
          "test",
          [remember("spell:encouraged")],
        ),
        c(
          "team",
          "Perguntar quem ela gostaria de convidar para conferir.",
          "help",
          [remember("spell:asked")],
        ),
        c(
          "stop-rush",
          "Questionar a pressa e pedir que explique o risco.",
          "pride",
          [remember("spell:challenged")],
        ),
      ],
    ),
    n(
      "review",
      "lua",
      "Três curvas, um ponto e... ah. Eu copiei o retorno como uma seta de entrada. Não é um erro de principiante; é um erro que eu cometo quando acho que já passei dessa parte. A folha prende a energia, dobra e solta uma pontinha chamuscada. Posso corrigir sem fingir que foi uma invenção?",
      "Confirmar a inversão com uma observação independente.",
      [
        c("globe-proof", "Comparar a direção com o globo de D.", "globe", [
          inspect("living:globe"),
          remember("spell:direction"),
        ]),
        c(
          "samael-proof",
          "Pedir a Samael que meça só o calor, mantendo Lua na condução.",
          "samael",
          [remember("spell:samael")],
        ),
        c(
          "aryn-proof",
          "Pedir a Aryn que estabilize a folha enquanto Lua testa o traço.",
          "aryn",
          [remember("spell:aryn")],
        ),
      ],
      { action: "work" },
    ),
    n(
      "test",
      "lua",
      "Um quadradinho de papel. Nenhum móvel voador. Prometo tentar achar isso empolgante. Lua desenha o símbolo reduzido: as bordas se dobram para dentro. Ela interrompe antes de aquecer. 'Está vendo? Não é falta de potência. É falta de saída.'",
      "Escolher entre revisar o retorno e repetir uma hipótese arriscada.",
      [
        c(
          "learn-test",
          "Usar o teste para revisar a seta de retorno.",
          "review",
          [remember("spell:safe-test")],
        ),
        c(
          "boost-test",
          "Sugerir um pouco mais de energia e ouvir a avaliação dela.",
          "spill",
          [remember("spell:overload"), scene("spell", "experimental")],
        ),
        c("invite-choice", "Deixar Lua escolher a ajuda necessária.", "help", [
          remember("spell:agency"),
        ]),
      ],
      { action: "magic" },
    ),
    n(
      "pride",
      "lua",
      "Tenho idade para ter cometido erros antes da invenção de certos nomes de erro. Isso não me torna incapaz. Também não me torna imune. O risco é a energia voltar para a folha. Eu estava prestes a tentar mais força para não ter que admitir isso. Obrigada por perguntar em vez de arrancar meu lápis.",
      "Converter a pausa em uma investigação que Lua conduza.",
      [
        c(
          "respect-review",
          "Devolver a ela o tempo de revisar o símbolo.",
          "review",
          [remember("spell:admitted")],
        ),
        c(
          "respect-help",
          "Perguntar que colaboração preservaria sua autoria.",
          "help",
          [remember("spell:agency")],
        ),
        c(
          "respect-test",
          "Propor um ensaio mínimo, com interrupção combinada.",
          "test",
          [remember("spell:limit")],
        ),
      ],
    ),
    n(
      "spill",
      "lua",
      "A folha dobra numa pequena espiral lilás. Lua fecha a mão e interrompe: 'Não. Mais energia alimenta a mesma saída errada. Fui eu que quis provar que dava conta. Não vou provar duas vezes às custas da mesa.' O efeito fica restrito ao papel de treino, reversível.",
      "Recuar da sobrecarga e identificar a direção errada.",
      [
        c(
          "own-stop",
          "Reconhecer a decisão dela de parar e revisar a cópia.",
          "review",
          [remember("spell:stopped")],
        ),
        c(
          "get-aryn",
          "Pedir apoio de Aryn para estabilizar a espiral.",
          "aryn",
          [
            remember("spell:aryn"),
            bond(
              "aryn",
              "lua",
              "trust",
              "Lua interrompeu a sobrecarga e chamou Aryn por decisão própria.",
            ),
          ],
        ),
        c(
          "get-samael",
          "Pedir a Samael um aterramento, com Lua indicando o ponto.",
          "samael",
          [
            remember("spell:samael"),
            bond(
              "samael",
              "lua",
              "repair",
              "A rivalidade cedeu lugar a um aterramento orientado por Lua.",
            ),
          ],
        ),
      ],
      { action: "react" },
    ),
    n(
      "help",
      "lua",
      "Quero ajuda, não uma cerimônia de entrega do meu lápis. Aryn pode segurar as fibras. Samael entende do calor que sobra. Ou podemos comparar com o globo, sem plateia. Eu explico a hipótese em qualquer dos casos. Se estiver errada, prefiro descobrir acompanhada.",
      "Escolher uma colaboração concreta.",
      [
        c(
          "choose-aryn",
          "Convidar Aryn a estabilizar o papel, sem redesenhar por Lua.",
          "aryn",
          [
            remember("spell:aryn"),
            bond(
              "aryn",
              "lua",
              "trust",
              "Lua pediu ajuda e definiu que a correção do símbolo seria sua.",
            ),
          ],
        ),
        c(
          "choose-samael",
          "Convidar Samael a conter o calor, seguindo o traço de Lua.",
          "samael",
          [
            remember("spell:samael"),
            bond(
              "samael",
              "lua",
              "trust",
              "Lua convidou Samael para conter o calor sem disputar a autoria.",
            ),
          ],
        ),
        c(
          "choose-globe",
          "Conferir a seta no globo com ela, em particular.",
          "globe",
          [inspect("living:globe"), remember("spell:private")],
        ),
      ],
    ),
    n(
      "aryn",
      "aryn",
      "Vou segurar estas fibras. Posso? — Lua assente e indica o centro. 'Não feche a dobra ainda; ela está mostrando por onde a energia entrou.' Aryn espera. Lua compara o traço e encontra a seta invertida. Desta vez a restauradora acompanha a descoberta, em vez de antecipá-la.",
      "Corrigir o símbolo com estabilização consentida.",
      [
        c(
          "careful-correction",
          "Lua inverte o retorno; Aryn só recompõe a folha depois do sinal.",
          "correct",
          [
            remember("spell:collaborative"),
            bond(
              "aryn",
              "lua",
              "repair",
              "Aryn aguardou o sinal; Lua encontrou e corrigiu a seta invertida.",
            ),
          ],
        ),
        c(
          "explain-first",
          "Pedir a Lua que explique o traço antes de corrigi-lo.",
          "globe",
          [inspect("living:globe"), remember("spell:explained")],
        ),
        c(
          "change-plan",
          "Preferir conter primeiro o calor com Samael.",
          "samael",
          [remember("spell:samael")],
        ),
      ],
    ),
    n(
      "samael",
      "samael",
      "Posso segurar o calor. Não o seu orgulho; minhas mãos têm limite. — Lua aponta o ponto de aterramento: 'Aqui. E o orgulho eu seguro.' A corrente pára de puxar a margem. Samael observa a seta: 'Sua entrada está vestida de saída.' — 'Já vi. Você ensaiou essa frase?'",
      "Lua escolhe como corrigir o retorno enquanto Samael contém o calor.",
      [
        c(
          "contained-correction",
          "Manter a contenção e deixar Lua redesenhar o retorno.",
          "correct",
          [
            remember("spell:contained"),
            bond(
              "samael",
              "lua",
              "trust",
              "Samael conteve o calor; Lua corrigiu o símbolo e os dois reconheceram as competências um do outro.",
            ),
          ],
        ),
        c(
          "understand-arrow",
          "Comparar com o globo antes de redesenhar.",
          "globe",
          [inspect("living:globe"), remember("spell:explained")],
        ),
        c(
          "invite-restoration",
          "Pedir a Aryn o apoio das fibras, com permissão de Lua.",
          "aryn",
          [remember("spell:aryn")],
        ),
      ],
    ),
    n(
      "globe",
      "lua",
      "O globo devolve a luz por uma curva aberta. Minha cópia fechou a curva e apontou para dentro. Eu lembrava do desenho, não do movimento. Séculos repetindo uma coisa podem ensinar exatamente isso: a parar de vê-la. Quero desenhar de novo olhando o que cada linha faz.",
      "Escolher o desenho corrigido e seu modo de teste.",
      [
        c(
          "small-open",
          "Abrir uma janela mínima e testar só uma palavra fictícia.",
          "correct",
          [remember("spell:small")],
        ),
        c(
          "ask-company",
          "Lua chama Aryn para conferir o retorno, sem lhe entregar o lápis.",
          "aryn",
          [remember("spell:aryn")],
        ),
        c(
          "new-design",
          "Lua redesenha o encanto como uma constelação de três pontos.",
          "correct",
          [remember("spell:invented")],
        ),
      ],
      { action: "work" },
    ),
    n(
      "correct",
      "lua",
      "Lua apaga a seta, desenha uma volta aberta e interrompe para conferir. A folha se desdobra. A palavra inventada 'luméria' sobe um palmo e retorna ao papel. 'Pronto. Não copiei direito da primeira vez. Corrigi porque entendi, não porque alguém tomou o lápis.'",
      "Decidir o que fazer com o erro compreendido.",
      [
        c(
          "keep-study",
          "Guardar a folha de teste como estudo e combinar revisão futura.",
          "study-end",
          [scene("spell", "restored"), remember("spell:study")],
        ),
        c(
          "show-work",
          "Convidar Lua a mostrar a correção e creditar quem ajudou.",
          "team-end",
          [
            scene("spell", "restored"),
            remember("spell:credit"),
            bond(
              "aryn",
              "lua",
              "trust",
              "Lua explicou sua correção e passou a tratar ajuda como parte do trabalho, não perda de autoria.",
            ),
          ],
        ),
        c(
          "make-new",
          "Celebrar o novo traçado e deixar Lua dar nome à variante.",
          "invent-end",
          [scene("spell", "restored"), remember("spell:variant")],
        ),
      ],
      { action: "magic" },
    ),
    n(
      "study-end",
      "lua",
      "Escrevi 'conferir o retorno' na margem. Minha letra, meu erro, meu lembrete. Você pode rir da mariposa de papel. Eu também ri. Só não faça dela a única história que conta sobre mim. Tenho outras. Algumas até deram certo antes de pegar fogo.",
      "Concluída — folio corrigido; revisão assumida por Lua.",
      [],
      {
        outcome:
          "Lua reconheceu a seta invertida, interrompeu a falha e corrigiu o feitiço. O folio voltou inteiro e a folha de teste ficou como estudo escolhido por ela.",
      },
    ),
    n(
      "team-end",
      "lua",
      "Vou contar a versão comprida: eu errei, pedi a parte da ajuda de que precisava e corrigi. Não 'me salvaram'. Nem 'fiz tudo sozinha'. A versão comprida é melhor. Tem gente nela. E uma palavra flutuante que não tenta fugir com a mesa.",
      "Concluída — correção autoral e ajuda reconhecida.",
      [],
      {
        outcome:
          "Lua corrigiu e explicou o retorno, creditando a colaboração. O papel foi restaurado e pedir ajuda passou a fazer parte de sua autoria.",
      },
    ),
    n(
      "invent-end",
      "lua",
      "Chamei de Volta da Luméria. Não dei nome ao erro: dei nome ao que aprendi depois. O desenho tem três pontos para eu ter que olhar entre eles. Se um dia eu disser que não preciso conferir... pode apontar o segundo ponto. Com delicadeza. Ou com uma sobrancelha excelente.",
      "Concluída — folio restaurado; variante de retorno criada por Lua.",
      [],
      {
        outcome:
          "Lua transformou a correção numa variante de três pontos, a Volta da Luméria. O folio foi restaurado e a criatividade ganhou um método de revisão.",
      },
    ),
  ],
};
