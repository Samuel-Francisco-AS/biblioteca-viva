export function safeReturnPath(value: string | null): string {
  if (value === null || !value.startsWith("/")) return "/colecao";
  const parsed = new URL(value, "https://biblioteca-viva.local");
  if (parsed.origin !== "https://biblioteca-viva.local") return "/colecao";
  if (parsed.pathname !== "/colecao" && parsed.pathname !== "/arquivo") {
    return "/colecao";
  }
  return `${parsed.pathname}${parsed.search}`;
}
