export interface WorkshopDrafts {
  read(key: string): string | undefined;
  write(key: string, value: string): void;
  remove(key: string): void;
}
