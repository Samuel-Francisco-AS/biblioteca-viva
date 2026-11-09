import type { CombatDefinition } from "../../domain/duel/contracts";
import { traditions } from "../../domain/duel/catalogue";
import { kindNames, rulesText } from "../../domain/duel/text";
import "./duel.css";
export function CombatCard({
  name,
  definition: c,
  compact = false,
  official = false,
}: {
  readonly name: string;
  readonly definition: CombatDefinition;
  readonly compact?: boolean;
  readonly official?: boolean;
}) {
  const tradition = traditions[c.affinity];
  return (
    <article
      className={`combat-card ${compact ? "combat-card--compact" : ""}`}
      data-affinity={c.affinity}
      data-kind={c.kind}
      aria-label={`${name}, ${kindNames[c.kind]}, ${tradition.name}, custo ${c.cost}`}
    >
      <header className="combat-card__title">
        <span className="combat-card__cost" aria-label={`${c.cost} energia`}>
          {c.cost}
        </span>
        <h3>{name}</h3>
        <span className="combat-card__sigil" aria-hidden="true">
          {tradition.symbol}
        </span>
      </header>
      <div className="combat-card__illustration">
        <img
          src={`/assets/duel/${c.artId}.svg`}
          alt={`Ilustração de ${name}`}
          loading="lazy"
          decoding="async"
          width="480"
          height="360"
        />
        <span>
          {tradition.symbol} {tradition.name} · {kindNames[c.kind]}
        </span>
      </div>
      <div className="combat-card__rules">
        <p>{rulesText(c)}</p>
        {!compact && <p className="combat-card__flavor">{c.flavor}</p>}
      </div>
      <footer>
        <small>{official ? "ARQUIVO OFICIAL · I" : "CRIAÇÃO AUTORAL"}</small>
        {c.kind === "creature" && (
          <strong aria-label={`${c.attack} ataque, ${c.health} resistência`}>
            <span>⚔ {c.attack}</span>
            <span>◆ {c.health}</span>
          </strong>
        )}
      </footer>
    </article>
  );
}
