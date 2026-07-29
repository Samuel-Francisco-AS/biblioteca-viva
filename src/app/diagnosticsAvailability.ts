export function isDiagnosticsEnabled(
  isDevelopment: boolean,
  diagnosticsFlag: string | undefined,
): boolean {
  return isDevelopment || diagnosticsFlag === "true";
}
