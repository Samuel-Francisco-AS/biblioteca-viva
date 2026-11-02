/** Fictional identities, independent of personal entries and spatial persistence. */
export const INHABITANTS = [
  {
    id: "character:samael",
    key: "samael",
    label: "Samael",
    height: 2,
    x: -2,
    z: 1,
    description:
      "Espírito demoníaco de 2 m, casaco escuro, chifres, notebook e café.",
  },
  {
    id: "character:aryn",
    key: "aryn",
    label: "Aryn",
    height: 1.7,
    x: -13,
    z: -8,
    description:
      "Elfa de 1,70 m, óculos, avental de restauração e livro de anatomia.",
  },
  {
    id: "character:ytha",
    key: "ytha",
    label: "Ytha",
    height: 1.7,
    x: 12.4,
    z: -10.4,
    description: "Fada de 1,70 m, cabelo rosa, asas de borboleta e flor.",
  },
  {
    id: "character:lua",
    key: "lua",
    label: "Lua",
    height: 1.6,
    x: -13,
    z: 10,
    description: "Maga de 1,60 m, óculos, capa acadêmica, grimório e lápis.",
  },
] as const;

export type InhabitantAction =
  "idle" | "walk" | "turn" | "react" | "gesture" | "work" | "magic" | "recover";
export const INHABITANT_ACTIONS = [
  ["walk", "Caminhar"],
  ["turn", "Girar"],
  ["gesture", "Cumprimentar"],
  ["work", "Atividade"],
  ["magic", "Habilidade"],
  ["recover", "Recuperar postura"],
] as const;
export const INHABITANT_ACTIVITIES = {
  samael: ["Café e notebook cenográficos", "Gesto amplo com aura lilás"],
  aryn: [
    "Ajustar óculos e inspecionar livro cenográfico",
    "Luz suave de restauração",
  ],
  ytha: ["Cuidar da flor cenográfica", "Magia floral com asas articuladas"],
  lua: ["Desenhar com lápis e grimório", "Conjuração instável e recuperação"],
} as const;
/** Local X displacement, out and back; tested against the BF-4D geometry. */
export const INHABITANT_WALK_DISTANCE = {
  samael: 0.65,
  aryn: 0.65,
  ytha: 0.55,
  lua: 0.6,
} as const;
