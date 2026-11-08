import type { WorkshopDrafts } from "../../application/workshopDrafts";
/** Local, private recovery only; never exported in backups or deck exchange. */
export class BrowserWorkshopDrafts implements WorkshopDrafts {
  constructor(private readonly databaseName: string) {}
  private key(key: string) {
    return `bv:workshop:v1:${this.databaseName}:${key}`;
  }
  read(key: string) {
    return localStorage.getItem(this.key(key)) ?? undefined;
  }
  write(key: string, value: string) {
    if (value.length > 550000)
      throw new Error("Rascunho acima do limite local.");
    localStorage.setItem(this.key(key), value);
  }
  remove(key: string) {
    localStorage.removeItem(this.key(key));
  }
}
