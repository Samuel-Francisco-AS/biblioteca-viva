import type {
  EntryType,
  PhysicalActivityCategory,
  StudyProgressUnit,
} from "../../domain";
export const studyUnitLabels: Record<StudyProgressUnit, string> = {
  hours: "horas",
  sessions: "sessões",
  modules: "módulos",
  topics: "tópicos",
  exercises: "exercícios",
  percent: "%",
};
export const activityLabels: Record<PhysicalActivityCategory, string> = {
  strength: "Força",
  cardio: "Cardio",
  mobility: "Mobilidade",
  sport: "Esporte",
  mixed: "Mista",
  other: "Outra prática",
};
export const entryExperience: Record<
  EntryType,
  {
    chapter: string;
    memory: string;
    invitation: string;
    sessions: string;
    record: string;
  }
> = {
  book: {
    chapter: "Sua leitura",
    memory: "Entre as páginas",
    invitation: "Uma ideia, uma passagem, algo para levar com você.",
    sessions: "Encontros com a leitura",
    record: "Registrar leitura",
  },
  series: {
    chapter: "Onde a história ficou",
    memory: "Impressões e falas",
    invitation:
      "O que ficou deste episódio? Guarde sua opinião e as falas favoritas.",
    sessions: "Episódios desta jornada",
    record: "Registrar episódios",
  },
  movie: {
    chapter: "Sua experiência de cinema",
    memory: "Depois dos créditos",
    invitation:
      "O que este filme deixou em você? Vale uma impressão, uma crítica ou uma fala.",
    sessions: "Exibições e reencontros",
    record: "Registrar exibição",
  },
  study: {
    chapter: "Sua trilha de aprendizado",
    memory: "Caderno de descobertas",
    invitation: "Guarde dúvidas, referências de materiais e o que aprendeu.",
    sessions: "Momentos de estudo",
    record: "Registrar estudo",
  },
  physical_activity: {
    chapter: "Sua prática",
    memory: "Escuta do corpo",
    invitation: "O que funcionou? Anote adaptações, cuidados e como se sentiu.",
    sessions: "Execuções do treino",
    record: "Registrar execução",
  },
  work: {
    chapter: "Sua empreitada",
    memory: "Diário da empreitada",
    invitation:
      "Uma decisão, um impedimento ou uma ideia para o próximo passo.",
    sessions: "Passos realizados",
    record: "Registrar avanço",
  },
};
