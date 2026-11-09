import { useDuelDraft } from "./drafts";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import type { Card } from "../../domain/arcanarium";
import {
  affinitySchema,
  allowedEffectTargets,
  creationPower,
  definitionSchema,
  effectIds,
  targetSchema,
  validateCreation,
  type CombatDefinition,
  type DuelAbility,
  type DuelEffect,
  type TargetKind,
} from "../../domain/duel/contracts";
import { officialEntries, traditions } from "../../domain/duel/catalogue";
import {
  abilityText,
  effectNames,
  kindNames,
  targetNames,
} from "../../domain/duel/text";
import { Choices } from "../arcanarium/Choices";
import { arcanaError, cardPath, useArcana } from "../arcanarium/context";
import { CombatCard } from "./CombatCard";
const draftSchema = z.strictObject({
  name: z.string().max(160),
  definition: z.strictObject(definitionSchema.shape),
  revision: z.int().positive().optional(),
  free: z.boolean(),
});
const firstEffect = (): DuelEffect => ({
  definitionId: "damage",
  value: 1,
  target: "enemy",
  duration: "permanent",
});
const firstAbility = (id = "manifestar"): DuelAbility => ({
  id,
  trigger: "play",
  cost: 0,
  effects: [firstEffect()],
});
function targets(
  id: DuelEffect["definitionId"],
  kind: CombatDefinition["kind"],
  trigger: DuelAbility["trigger"],
): readonly TargetKind[] {
  return allowedEffectTargets[id].filter(
    (t) =>
      (t !== "self" || kind === "creature") &&
      (trigger !== "start" ||
        !["self", "enemy-unit", "ally-unit", "enemy-any"].includes(t)),
  );
}
export function CombatEditor({ card }: { readonly card?: Card }) {
  const { app, data, reload } = useArcana(),
    navigate = useNavigate(),
    [params] = useSearchParams();
  const original = data.cards.find((c) => c.id === params.get("copia")),
    source = card ?? original;
  const sourceContent =
    source?.content.type === "combat" ? source.content : undefined;
  const key = `combat:${card?.id ?? `nova:${original?.id ?? ""}`}`;
  const [recovery] = useState(() => {
    const initial: z.infer<typeof draftSchema> = {
      name: card
        ? (sourceContent?.name ?? "")
        : original
          ? `Cópia · ${sourceContent?.name ?? ""}`
          : "",
      definition: sourceContent?.combat ?? {
        version: 1,
        kind: "creature",
        affinity: "ruin",
        cost: 2,
        attack: 2,
        health: 3,
        keywords: [],
        abilities: [],
        flavor: "",
        artId: "cinder-imp",
      },
      ...(card && { revision: card.revision }),
      free: false,
    };
    try {
      const saved = app.workshopDrafts.read(key);
      return {
        draft: saved ? draftSchema.parse(JSON.parse(saved)) : initial,
        notice: saved ? "Rascunho de combate recuperado deste aparelho." : "",
      };
    } catch {
      return {
        draft: initial,
        notice:
          "O rascunho não pôde ser recuperado. A carta salva foi preservada.",
      };
    }
  });
  const [draft, setDraft] = useState(recovery.draft),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [savedId, setSavedId] = useState("");
  const { storageError, finish } = useDuelDraft(app.workshopDrafts, key, draft);

  const def = draft.definition;
  const parsed = definitionSchema.safeParse(def);
  let budget = "";
  try {
    validateCreation(def);
  } catch (e) {
    budget = e instanceof Error ? e.message : "Carta inválida.";
  }
  const update = (definition: CombatDefinition) =>
    setDraft({ ...draft, definition });
  const changeKind = (value: string) => {
    const kind = z.enum(["creature", "spell", "artifact"]).parse(value);
    const { attack: _a, health: _h, ...base } = def;
    void _a;
    void _h;
    update({
      ...base,
      kind,
      ...(kind === "creature" ? { attack: 2, health: 3 } : {}),
      keywords: [],
      abilities: kind === "spell" ? [firstAbility()] : [],
    });
  };
  const replaceAbility = (index: number, ability: DuelAbility) =>
    update({
      ...def,
      abilities: def.abilities.map((a, i) => (i === index ? ability : a)),
    });
  const readonly = card?.origin.kind === "official" || card?.archived;
  if (readonly)
    return <p>Esta carta é imutável. Crie uma cópia autoral pelo salão.</p>;
  return (
    <section className="duel" aria-label="Oficina de cartas de combate">
      <Link to="/arcanario/duelos">← Duelo Arcano</Link>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">OFICINA · COMBATE ARCANO</p>
          <h2>
            {card ? "Reescrever um encantamento" : "Criar carta de combate"}
          </h2>
          <p>
            Escolha efeitos conhecidos. Cada revisão conserva a identidade
            global, sem alterar partidas antigas.
          </p>
        </div>
      </div>
      {recovery.notice && <p role="status">{recovery.notice}</p>}
      {storageError && <p role="alert">{storageError}</p>}
      <div className="combat-editor-layout">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            setError("");
            void app.workshop
              .save({
                ...(card && {
                  cardId: card.id,
                  expectedRevision: draft.revision,
                }),
                content: {
                  type: "combat",
                  name: draft.name,
                  attributes: {},
                  effects: [],
                  combat: def,
                },
                studyIds: [],
                decks: [],
                combatMode: draft.free ? "free" : "creator",
              })
              .then(async (saved) => {
                setSavedId(saved.id);
                finish();
                await reload();
                void navigate(cardPath(saved.id));
              })
              .catch((e) => setError(arcanaError(e)))
              .finally(() => setBusy(false));
          }}
        >
          <label>
            Nome da carta de combate
            <input
              required
              maxLength={160}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <Choices
            label="Tipo de combate"
            value={def.kind}
            options={Object.entries(kindNames).map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={changeKind}
          />
          <Choices
            label="Afinidade da carta"
            value={def.affinity}
            options={Object.entries(traditions).map(([value, t]) => ({
              value,
              label: `${t.symbol} ${t.name}`,
            }))}
            onChange={(v) =>
              update({ ...def, affinity: affinitySchema.parse(v) })
            }
          />
          <div className="combat-attributes">
            <NumberField
              label="Custo de energia"
              value={def.cost}
              min={1}
              max={6}
              onChange={(cost) => update({ ...def, cost })}
            />
            {def.kind === "creature" && (
              <>
                <NumberField
                  label="Ataque"
                  value={def.attack ?? 0}
                  min={0}
                  max={8}
                  onChange={(attack) => update({ ...def, attack })}
                />
                <NumberField
                  label="Resistência"
                  value={def.health ?? 1}
                  min={1}
                  max={10}
                  onChange={(health) => update({ ...def, health })}
                />
              </>
            )}
          </div>
          {def.kind === "creature" && (
            <fieldset>
              <legend>Palavras-chave</legend>
              {(["guard", "haste"] as const).map((k) => (
                <label className="arcana-check" key={k}>
                  <input
                    type="checkbox"
                    checked={def.keywords.includes(k)}
                    onChange={(e) =>
                      update({
                        ...def,
                        keywords: e.target.checked
                          ? [...def.keywords, k]
                          : def.keywords.filter((v) => v !== k),
                      })
                    }
                  />
                  {k === "guard"
                    ? "Guardião · atrai ataques enquanto estiver vivo"
                    : "Ímpeto · ataca no turno da invocação"}
                </label>
              ))}
            </fieldset>
          )}
          <h3>Habilidades estruturadas</h3>
          <p>
            Até duas habilidades, dois efeitos por habilidade; ativações uma vez
            por turno. Ações não aceitam código.
          </p>
          {def.abilities.map((ability, index) => (
            <fieldset className="combat-ability-editor" key={ability.id}>
              <legend>Habilidade {index + 1}</legend>
              <Choices
                label={`Momento da habilidade ${index + 1}`}
                value={ability.trigger}
                options={[
                  { value: "play", label: "Ao jogar" },
                  ...(def.kind !== "spell"
                    ? [{ value: "activate", label: "Ativar por botão" }]
                    : []),
                  ...(def.kind === "artifact"
                    ? [{ value: "start", label: "Início do seu turno" }]
                    : []),
                ]}
                onChange={(v) => {
                  const trigger = z
                    .enum(["play", "start", "activate"])
                    .parse(v);
                  replaceAbility(index, {
                    ...ability,
                    trigger,
                    cost: 0,
                    effects:
                      trigger === "start" ? [firstEffect()] : ability.effects,
                  });
                }}
              />
              {ability.trigger === "activate" && (
                <NumberField
                  label={`Custo de ativação ${index + 1}`}
                  value={ability.cost}
                  min={0}
                  max={3}
                  onChange={(cost) =>
                    replaceAbility(index, { ...ability, cost })
                  }
                />
              )}
              {ability.effects.map((effect, ei) => (
                <EffectEditor
                  key={ei}
                  effect={effect}
                  kind={def.kind}
                  trigger={ability.trigger}
                  index={`${index + 1}.${ei + 1}`}
                  onChange={(next) =>
                    replaceAbility(index, {
                      ...ability,
                      effects: ability.effects.map((e, i) =>
                        i === ei ? next : e,
                      ),
                    })
                  }
                  onRemove={() =>
                    replaceAbility(index, {
                      ...ability,
                      effects: ability.effects.filter((_, i) => i !== ei),
                    })
                  }
                  removable={ability.effects.length > 1}
                />
              ))}
              {ability.effects.length < 2 && (
                <button
                  type="button"
                  onClick={() =>
                    replaceAbility(index, {
                      ...ability,
                      effects: [...ability.effects, firstEffect()],
                    })
                  }
                >
                  Adicionar segundo efeito
                </button>
              )}
              <p className="combat-ability-explanation">
                {abilityText(ability)}
              </p>
              <button
                type="button"
                disabled={def.kind === "spell" && def.abilities.length === 1}
                onClick={() =>
                  update({
                    ...def,
                    abilities: def.abilities.filter((_, i) => i !== index),
                  })
                }
              >
                Remover habilidade {index + 1}
              </button>
            </fieldset>
          ))}
          {def.abilities.length < 2 && (
            <button
              type="button"
              onClick={() => {
                const id = def.abilities.some((a) => a.id === "manifestar")
                  ? "canalizar"
                  : "manifestar";
                update({
                  ...def,
                  abilities: [...def.abilities, firstAbility(id)],
                });
              }}
            >
              Adicionar habilidade
            </button>
          )}
          {!parsed.success && (
            <p role="alert">
              {parsed.error.issues.map((i) => i.message).join(" ")}
            </p>
          )}
          <div className="combat-power" role="status">
            <strong>
              Poder aproximado {creationPower(def).toFixed(1)} /{" "}
              {(def.cost * 2.6 + 2).toFixed(1)}
            </strong>
            <p>
              {budget ||
                "Dentro do orçamento do Criador. Isso não garante equilíbrio competitivo."}
            </p>
          </div>
          <label className="arcana-check">
            <input
              type="checkbox"
              checked={draft.free}
              onChange={(e) => setDraft({ ...draft, free: e.target.checked })}
            />
            Permitir salvar acima do orçamento para o Modo Livre
          </label>
          <label>
            Texto de ambientação
            <textarea
              maxLength={300}
              value={def.flavor}
              onChange={(e) => update({ ...def, flavor: e.target.value })}
            />
          </label>
          <details>
            <summary>Escolher gravura e tema da moldura</summary>
            <p>
              A moldura acompanha a afinidade. As gravuras são assets originais
              do jogo; a carta permanece identificada como autoral.
            </p>
            <Choices
              label="Gravura da carta"
              value={def.artId}
              options={officialEntries.map((e) => ({
                value: e.slug,
                label: e.name,
              }))}
              onChange={(artId) => update({ ...def, artId })}
            />
          </details>
          {error && <p role="alert">{error}</p>}
          {card && draft.revision !== card.revision && (
            <div role="alert">
              <p>
                O rascunho usa uma revisão anterior. Compare a carta salva antes
                de aplicar.
              </p>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, revision: card.revision })}
              >
                Usar revisão atual como base e manter meu texto
              </button>
            </div>
          )}
          <div className="duel-actions">
            <button
              type="submit"
              disabled={
                busy ||
                !!savedId ||
                !parsed.success ||
                (!draft.free && !!budget)
              }
            >
              {busy ? "Guardando…" : "Guardar carta de combate"}
            </button>
            <button
              type="button"
              onClick={() => {
                finish();
                void navigate("/arcanario/duelos");
              }}
            >
              Descartar rascunho de combate
            </button>
          </div>
        </form>
        <aside aria-label="Prévia da carta de combate">
          <CombatCard
            name={draft.name || "Seu encantamento ganha um nome"}
            definition={def}
          />
          <p>
            Prévia autoral · {kindNames[def.kind]} · alterações refletidas antes
            de salvar.
          </p>
        </aside>
      </div>
    </section>
  );
}
function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly onChange: (value: number) => void;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        inputMode="numeric"
        required
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isInteger(n) && n >= min && n <= max) onChange(n);
        }}
      />
    </label>
  );
}
function EffectEditor({
  effect,
  kind,
  trigger,
  index,
  onChange,
  onRemove,
  removable,
}: {
  readonly effect: DuelEffect;
  readonly kind: CombatDefinition["kind"];
  readonly trigger: DuelAbility["trigger"];
  readonly index: string;
  readonly onChange: (effect: DuelEffect) => void;
  readonly onRemove: () => void;
  readonly removable: boolean;
}) {
  return (
    <fieldset className="combat-effect-editor">
      <legend>Efeito {index}</legend>
      <Choices
        label={`Catálogo do efeito ${index}`}
        value={effect.definitionId}
        options={effectIds
          .filter((id) => targets(id, kind, trigger).length)
          .map((value) => ({ value, label: effectNames[value] }))}
        onChange={(v) => {
          const definitionId = z.enum(effectIds).parse(v),
            possible = targets(definitionId, kind, trigger);
          onChange({
            definitionId,
            value: ["exhaust", "shatter"].includes(definitionId)
              ? 1
              : ["summon", "draw"].includes(definitionId)
                ? Math.min(2, effect.value)
                : effect.value,
            target: possible.includes(effect.target)
              ? effect.target
              : possible[0],
            duration: "permanent",
          });
        }}
      />
      <NumberField
        label={`Valor do efeito ${index}`}
        value={effect.value}
        min={1}
        max={
          ["exhaust", "shatter"].includes(effect.definitionId)
            ? 1
            : ["draw", "summon"].includes(effect.definitionId)
              ? 2
              : 6
        }
        onChange={(value) => onChange({ ...effect, value })}
      />
      <Choices
        label={`Alvo do efeito ${index}`}
        value={effect.target}
        options={targets(effect.definitionId, kind, trigger).map((value) => ({
          value,
          label: targetNames[value],
        }))}
        onChange={(target) =>
          onChange({ ...effect, target: targetSchema.parse(target) })
        }
      />
      {effect.definitionId === "empower" && (
        <Choices
          label={`Duração do efeito ${index}`}
          value={effect.duration}
          options={[
            { value: "permanent", label: "Permanente na criatura" },
            { value: "turn", label: "Até encerrar este turno" },
          ]}
          onChange={(v) =>
            onChange({
              ...effect,
              duration: z.enum(["permanent", "turn"]).parse(v),
            })
          }
        />
      )}
      {removable && (
        <button type="button" onClick={onRemove}>
          Remover efeito {index}
        </button>
      )}
    </fieldset>
  );
}
