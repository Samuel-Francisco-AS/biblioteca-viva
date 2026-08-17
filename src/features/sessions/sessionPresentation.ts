export function formatSessionDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0
    ? `${minutes} min ${remainder.toString().padStart(2, "0")} s`
    : `${remainder} s`;
}
