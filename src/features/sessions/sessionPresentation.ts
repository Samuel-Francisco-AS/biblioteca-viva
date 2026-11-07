export function formatSessionDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0
    ? `${minutes} min ${remainder.toString().padStart(2, "0")} s`
    : `${remainder} s`;
}

export function formatSessionClock(seconds: number): string {
  return [
    Math.floor(seconds / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
}
