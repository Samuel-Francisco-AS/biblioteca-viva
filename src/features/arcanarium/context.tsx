import { createContext, useContext } from "react";
import type { ApplicationRuntime } from "../../app/createApplication";
import type { ArcanariumData } from "../../domain/arcanarium";
import type { LibraryEntry } from "../../domain";
export interface ArcanaContext {
  app: ApplicationRuntime;
  data: ArcanariumData;
  entries: readonly LibraryEntry[];
  reload(this: void): Promise<void>;
}
export const Arcana = createContext<ArcanaContext | undefined>(undefined);
export function useArcana() {
  const c = useContext(Arcana);
  if (!c) throw new Error("Arcanário indisponível.");
  return c;
}
export function arcanaError(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "CONFLICT"
  )
    return "Os dados mudaram em outra tela. Seu rascunho foi preservado. Confira a versão atual antes de tentar novamente.";
  if (
    error instanceof Error &&
    error.name !== "ZodError" &&
    error.name !== "DatabaseError"
  )
    return error.message;
  return "Não foi possível concluir. Seu trabalho foi preservado; tente novamente.";
}
export const cardPath = (id: string) =>
  `/arcanario/cartas/${encodeURIComponent(id)}`;
export const deckPath = (id: string) =>
  `/arcanario/baralhos/${encodeURIComponent(id)}`;
export const editorPath = (id: string) =>
  `/arcanario/oficina/${encodeURIComponent(id)}`;
