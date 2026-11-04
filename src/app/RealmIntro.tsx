type RealmIntroProps = {
  readonly title: string;
  readonly description: string;
};

const realmLore = {
  acervo: {
    chapter: "PRIMEIRA ALA",
    subtitle: "O catálogo dos mundos",
    symbol: "I",
  },
  arquivo: {
    chapter: "SEGUNDA ALA",
    subtitle: "Onde as palavras repousam",
    symbol: "II",
  },
  observatorio: {
    chapter: "TERCEIRA ALA",
    subtitle: "O mapa do que foi vivido",
    symbol: "III",
  },
  atelie: {
    chapter: "QUARTA ALA",
    subtitle: "Os instrumentos do refúgio",
    symbol: "IV",
  },
  biblioteca: {
    chapter: "BIBLIOTECA VIVA",
    subtitle: "O refúgio dos mundos",
    symbol: "✦",
  },
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
  const lore = realmLore[realm];

  return (
    <div className="realm-intro" data-realm={realm}>
      <span className="realm-intro__filigree" aria-hidden="true" />
      <div className="realm-intro__number" aria-hidden="true">
        <span>{lore.symbol}</span>
        <small>✧</small>
      </div>
      <div className="realm-intro__copy">
        <span className="realm-intro__overtitle">
          BIBLIOTECA VIVA <span aria-hidden="true">·</span> {lore.chapter}
        </span>
        <h1>{title}</h1>
        <p className="realm-intro__description">{description}</p>
        <span className="realm-intro__signature" aria-hidden="true">
          {lore.subtitle}
        </span>
      </div>
      <svg
        aria-hidden="true"
        className="realm-intro__seal"
        fill="none"
        viewBox="0 0 160 160"
      >
        <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="0.75" />
        <circle
          cx="80"
          cy="80"
          r="56"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
        <path
          d="M80 18c7 18 21 30 40 36-19 7-33 21-40 41-7-20-21-34-40-41 19-6 33-18 40-36Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M44 99c16-6 28-5 36 4 8-9 20-10 36-4v27c-15-7-27-5-36 3-9-8-21-10-36-3V99Z"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <path d="M80 103v26M53 108l17-1M90 107l17 1" stroke="currentColor" />
        <path d="m80 39 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="currentColor" />
        <path
          d="M16 80h14M130 80h14M80 2v14M80 144v14"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
      <span className="realm-intro__line" aria-hidden="true" />
    </div>
  );
}
