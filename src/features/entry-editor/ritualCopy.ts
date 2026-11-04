import type { EntryType } from "../../domain";

export const ritualCopy: Record<
  EntryType,
  { title: string; invitation: string; craft: string }
> = {
  book: {
    title: "Um volume encontra seu lugar",
    invitation: "Abra espaço para uma nova voz no acervo.",
    craft: "Tomo",
  },
  movie: {
    title: "Uma memória em cena",
    invitation: "Guarde uma obra e prepare seu próximo encontro com o cinema.",
    craft: "Projeção",
  },
  series: {
    title: "Uma crônica por continuar",
    invitation: "Toda história longa começa com um episódio.",
    craft: "Crônica",
  },
  study: {
    title: "Trace um caminho de descoberta",
    invitation: "Dê nome ao conhecimento que deseja cultivar.",
    craft: "Grimório",
  },
  physical_activity: {
    title: "Prepare seu ritual de prática",
    invitation: "Um espaço para o movimento, no seu ritmo.",
    craft: "Prática",
  },
  work: {
    title: "Dê forma à sua empreitada",
    invitation: "Transforme uma intenção concreta em um próximo passo.",
    craft: "Empreitada",
  },
};
