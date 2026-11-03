type RealmIntroProps = {
  readonly title: string;
  readonly description: string;
};

export function RealmIntro({ title, description }: RealmIntroProps) {
  return (
    <div className="realm-intro">
      <div className="realm-intro__copy">
        <span className="realm-intro__overtitle">
          ✧ &nbsp; BIBLIOTECA VIVA / COMPÊNDIO
        </span>
        <h1>{title}</h1>
        <small>{description}</small>
      </div>
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
          d="M80 42 89 71 118 80 89 89 80 118 71 89 42 80 71 71Z"
          stroke="url(#arcane-foil)"
          strokeWidth="1.8"
          fill="url(#arcane-foil)"
          fillOpacity=".12"
        />
        <circle cx="80" cy="80" r="6" fill="#d8b5ff" />
      </svg>
    </div>
  );
}
