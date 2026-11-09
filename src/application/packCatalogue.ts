import type { PackManifest } from "../domain/packManifest";
export interface PackCatalogueEntry {
  manifest: PackManifest;
  editions: { version: number; label: string }[];
}
export interface PackCataloguePort {
  list(): Promise<PackCatalogueEntry[]>;
  load(id: string, version: number): Promise<string>;
}
