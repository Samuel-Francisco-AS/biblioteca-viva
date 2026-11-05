import { BVSelectSheet } from "../../ui/BVPicker";
import {
  physicalProfileSchema,
  type PhysicalProfile,
} from "../../domain/workouts";
import { useEffect, useState, type FormEvent } from "react";
import type { PhysicalProfilePort } from "../../application/workouts";
export function PhysicalProfilePanel({
  profile,
}: {
  readonly profile: PhysicalProfilePort;
}) {
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<PhysicalProfile["gender"]>();
  const [atlas, setAtlas] = useState<PhysicalProfile["atlas"]>("auto");
  const [exists, setExists] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void profile.load().then(
      (p) => {
        if (active) {
          setWeight(p?.weightKg === undefined ? "" : String(p.weightKg));
          setGender(p?.gender);
          setAtlas(p?.atlas ?? "auto");
          setExists(Boolean(p));
          setReady(true);
        }
      },
      () => {
        if (active)
          setError("Não foi possível consultar o perfil. Reabra Ajustes.");
      },
    );
    return () => {
      active = false;
    };
  }, [profile]);
  async function save(event?: FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await profile.save(
        event
          ? physicalProfileSchema.parse({
              weightKg: weight ? Number(weight) : undefined,
              gender,
              atlas,
            })
          : undefined,
      );
      setExists(Boolean(event));
      if (!event) {
        setWeight("");
        setGender(undefined);
        setAtlas("auto");
      }
      setMessage(
        event
          ? "Perfil salvo neste dispositivo."
          : "Perfil removido. Estimativas anteriores preservam o peso usado.",
      );
    } catch {
      setError("Não foi possível salvar o perfil.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="content-card" aria-labelledby="physical-profile-title">
      <h2 id="physical-profile-title">Perfil físico</h2>
      <p>
        Opcional, local e removível. Apenas o peso participa da estimativa MET.
        O gênero não descreve sua anatomia; escolha o atlas livremente. Incluído
        no backup local.
      </p>
      <form onSubmit={(e) => void save(e)}>
        <label className="form-field">
          Peso (kg)
          <input
            type="number"
            min="20"
            max="400"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={!ready || busy}
          />
        </label>
        <div className="form-field">
          <label htmlFor="physical-profile-gender">Gênero (opcional)</label>
          <BVSelectSheet
            id="physical-profile-gender"
            value={gender ?? ""}
            disabled={!ready || busy}
            onChange={(e) =>
              setGender(
                physicalProfileSchema.shape.gender.parse(
                  e.target.value || undefined,
                ),
              )
            }
          >
            <option value="">Não preenchido</option>
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
            <option value="other">Outro</option>
            <option value="undisclosed">Prefiro não informar</option>
          </BVSelectSheet>
        </div>
        <div className="form-field">
          <label htmlFor="physical-profile-atlas">Apresentação do atlas</label>
          <BVSelectSheet
            id="physical-profile-atlas"
            value={atlas ?? "auto"}
            disabled={!ready || busy}
            onChange={(e) =>
              setAtlas(physicalProfileSchema.shape.atlas.parse(e.target.value))
            }
          >
            <option value="auto">Automático</option>
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </BVSelectSheet>
        </div>
        <div className="form-actions">
          <button className="button" disabled={!ready || busy}>
            Salvar perfil
          </button>
          <button
            className="button button--secondary"
            type="button"
            disabled={!ready || busy || !exists}
            onClick={() => void save()}
          >
            Remover perfil
          </button>
        </div>
      </form>
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
