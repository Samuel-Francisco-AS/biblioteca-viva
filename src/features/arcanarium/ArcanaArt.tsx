/** Original vector engravings authored for BF-5.6B; no external assets. */
export function ArcanaSeal({
  kind = "echo",
}: {
  readonly kind?: "echo" | "memory" | "workshop";
}) {
  return (
    <svg
      className="arcana-seal"
      viewBox="0 0 200 200"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="100" cy="100" r="89" strokeWidth=".7" />
      <circle cx="100" cy="100" r="80" strokeDasharray="1 7" />
      <path d="M100 4v24m0 144v24M4 100h24m144 0h24M32 32l17 17m102 102 17 17M32 168l17-17M151 49l17-17" />
      <path d="m100 18 71 123H29zm0 164L29 59h142z" opacity=".4" />
      {kind === "echo" ? (
        <>
          <path d="M57 69q20-9 43 4 23-13 43-4v65q-20-9-43 4-23-13-43-4zM100 73v65M66 85q12-4 25 3m18 0q13-7 25-3M66 99q12-4 25 3m18 0q13-7 25-3" />
          <path d="m100 37 7 13-7 13-7-13z" />
        </>
      ) : kind === "memory" ? (
        <>
          <path d="M100 52q-35 28-35 60a35 35 0 0 0 70 0q0-32-35-60zM100 76q-22 20-22 38a22 22 0 0 0 44 0q0-18-22-38z" />
          <path d="M100 97v37m-12-19 12-18 12 18M69 149h62" />
        </>
      ) : (
        <>
          <path d="m70 138 9-30 50-57 16 14-50 57zM79 108l16 14m34-71 6-7 16 14-6 7M70 138l17-8M51 150h98M52 59l7-13 7 13-7 13zM140 120l6-11 6 11-6 11z" />
        </>
      )}
    </svg>
  );
}
export function CardFrame({ frame }: { readonly frame: string }) {
  return (
    <svg
      className="arcana-frame"
      viewBox="0 0 300 420"
      preserveAspectRatio="none"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M28 8h244l20 20v364l-20 20H28L8 392V28zM34 16h232l18 18v352l-18 18H34l-18-18V34z"
        opacity=".75"
      />
      <path
        d={
          frame === "herbarium"
            ? "M23 100q35-30 5-70 35 4 40 19M23 78q28-4 14-31M277 320q-35 30-5 70-35-4-40-19M277 342q-28 4-14 31M24 390q32-7 42-25M276 30q-32 7-42 25"
            : frame === "illuminated"
              ? "M26 64V26h38M236 26h38v38M26 356v38h38M236 394h38v-38M24 24l36 36M276 24l-36 36M24 396l36-36M276 396l-36-36"
              : "M24 55l14-31 20 17-34 14 19 19-5-50M276 365l-14 31-20-17 34-14-19-19 5 50M265 26l9 12-9 12-9-12zM35 370l9 12-9 12-9-12z"
        }
      />
      <path d="m136 12 14 10 14-10m-28 396 14-10 14 10M12 198l10 12-10 12m276-24-10 12 10 12" />
    </svg>
  );
}
