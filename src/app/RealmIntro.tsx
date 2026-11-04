type RealmIntroProps = {
  readonly title: string;
  readonly description: string;
};

export function RealmIntro({ title, description }: RealmIntroProps) {
  const realm =
    title === "Acervo encantado"
      ? "acervo"
      : title === "Câmara dos registros"
        ? "arquivo"
        : title === "Observatório"
          ? "observatorio"
          : title === "Ateliê arcano"
            ? "atelie"
            : "biblioteca";
  const chapter = {
    acervo: "I · ACERVO",
    arquivo: "II · MEMÓRIA",
    observatorio: "III · CONSTELAÇÕES",
    atelie: "IV · RITUAIS",
    biblioteca: "COMPÊNDIO",
  }[realm];

  return (
    <div className="realm-intro" data-realm={realm}>
      <div className="realm-intro__copy">
        <span className="realm-intro__overtitle">
          BIBLIOTECA VIVA / {chapter}
        </span>
        <h1>{title}</h1>
        <small>{description}</small>
      </div>
      <span className="realm-intro__line" aria-hidden="true" />
      <svg
        aria-hidden="true"
        className="realm-intro__seal"
        fill="none"
        viewBox="0 0 160 160"
      >
        <defs>
          <linearGradient id="arcane-foil" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#f5d9b1" />
            <stop offset=".48" stopColor="#c5a6f3" />
            <stop offset="1" stopColor="#8fd9d9" />
          </linearGradient>
        </defs>
        <circle
          cx="80"
          cy="80"
          r="66"
          stroke="url(#arcane-foil)"
          strokeOpacity=".35"
        />
        <circle
          cx="80"
          cy="80"
          r="55"
          stroke="url(#arcane-foil)"
          strokeDasharray="1 8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="80"
          cy="80"
          r="39"
          stroke="url(#arcane-foil)"
          strokeOpacity=".52"
        />
        <path
          d="M80 15v21M80 124v21M15 80h21M124 80h21"
          stroke="url(#arcane-foil)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d={
            realm === "acervo"
              ? "M47 47h66v69H47zM59 47v69M70 60h30M70 70h24M78 86l8 8-8 8-8-8z"
              : realm === "arquivo"
                ? "M52 40h46l14 15v65H52zM98 40v18h14M65 72h35M65 83h35M65 94h25M65 105h30"
                : realm === "observatorio"
                  ? "M45 103 65 60 91 89 113 48M65 60l48-12M45 103l46-14M80 30v100M30 80h100"
                  : "M52 110 97 45M49 48l60 62M91 40l16 10-8 17-15-10zM42 101l13 14M46 105l10-15M102 93l12 12-12 12-12-12z"
          }
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="80" cy="80" r="6" fill="#d8b5ff" />
      </svg>
    </div>
  );
}
