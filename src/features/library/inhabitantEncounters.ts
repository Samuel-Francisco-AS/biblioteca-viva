import type { InhabitantKey } from "./inhabitants";
export interface EncounterScript {
  readonly id: string;
  readonly pair: readonly [InhabitantKey, InhabitantKey];
  readonly place: "study" | "rest" | "plant" | "observation";
  readonly opening: string;
  readonly friction: string;
  readonly cooperation: string;
  readonly resolution: string;
  readonly trust: number;
  readonly tension: number;
}
/** Six distinct relationships. Prose describes enacted beats, never RPG dialogue. */
export const ENCOUNTERS: readonly EncounterScript[] = [
  {
    id: "order-and-embers",
    pair: ["samael", "aryn"],
    place: "study",
    opening:
      "Aryn quer reorganizar as anotações cenográficas; Samael protege o caderno com um gesto seco.",
    friction:
      "Samael abre a mão, sarcástico. Aryn recua ao perceber que estava decidindo por ele.",
    cooperation:
      "Aryn oferece restaurar uma folha de treino; Samael segura as bordas e aceita a ajuda.",
    resolution:
      "Samael agradece com uma inclinação discreta. Aryn deixa a organização nas mãos dele.",
    trust: 2,
    tension: 1,
  },
  {
    id: "quiet-company",
    pair: ["samael", "ytha"],
    place: "rest",
    opening:
      "Ytha hesita, depois se aproxima do café de Samael; ele abre espaço sem fazer alarde.",
    friction: "Ytha observa o cansaço dele antes de oferecer companhia.",
    cooperation:
      "Ytha mostra sua flor; Samael abaixa a aura e confere o suporte cenográfico para ela.",
    resolution:
      "Os dois permanecem em silêncio confortável. Ytha ganha confiança para voltar a procurá-lo.",
    trust: 3,
    tension: -2,
  },
  {
    id: "rival-inventors",
    pair: ["samael", "lua"],
    place: "observation",
    opening:
      "Lua desafia Samael a explicar um mecanismo imaginário; ele responde com um gesto de dúvida.",
    friction:
      "Lua insiste na própria teoria. Samael cruza o braço, impaciente com a provocação.",
    cooperation:
      "Os dois conferem o desenho do mecanismo e dividem a responsabilidade pela experiência.",
    resolution:
      "Lua comemora a revisão; Samael disfarça o orgulho e cede o último gesto a ela.",
    trust: 2,
    tension: 1,
  },
  {
    id: "shared-restoration",
    pair: ["aryn", "ytha"],
    place: "plant",
    opening:
      "Aryn chama Ytha para cuidar da planta estrelada, mas começa apontando cada detalhe.",
    friction:
      "Ytha firma a postura e propõe seu próprio cuidado. Aryn interrompe as instruções.",
    cooperation:
      "Ytha conduz a florada e Aryn sustenta a restauração: duas magias complementares.",
    resolution:
      "Aryn reconhece a iniciativa de Ytha e passa a oferecer ajuda antes de comandar.",
    trust: 4,
    tension: -2,
  },
  {
    id: "permission-to-try",
    pair: ["aryn", "lua"],
    place: "study",
    opening:
      "Aryn encontra Lua revisando um desenho mágico e se oferece para conferir.",
    friction:
      "Aryn aponta uma correção cedo demais. Lua recolhe o grimório, contrariada.",
    cooperation:
      "Aryn espera o sinal de Lua; juntas refazem o símbolo em uma folha de treino.",
    resolution:
      "Lua mostra a correção com satisfação. Aryn reconhece a autoria e aprende a esperar.",
    trust: 3,
    tension: 1,
  },
  {
    id: "stories-in-bloom",
    pair: ["ytha", "lua"],
    place: "plant",
    opening:
      "Lua procura companhia para mostrar um desenho; Ytha se aproxima com as asas recolhidas.",
    friction: "Ytha hesita em opinar; Lua abaixa o lápis e dá tempo à amiga.",
    cooperation:
      "Ytha mostra o contorno de uma folha e Lua desenha uma constelação de pétalas.",
    resolution:
      "As duas celebram a florada. Lua se sente acolhida e Ytha toma a próxima iniciativa.",
    trust: 4,
    tension: -1,
  },
];
