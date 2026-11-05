import { useEffect, useState, type FormEvent } from "react";
import type { PhysicalProfilePort } from "../../application/workouts";
export function PhysicalProfilePanel({
  profile,
}: {
  readonly profile: PhysicalProfilePort;
}) {
  const [weight, setWeight] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void profile.load().then(
      (p) => {
        if (active) {
          setWeight(p ? String(p.weightKg) : "");
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
      await profile.save(event ? { weightKg: Number(weight) } : undefined);
      if (!event) setWeight("");
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
        Opcional · usado para estimar energia dos treinos. Incluído no backup
        local.
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
            required
          />
        </label>
        <div className="form-actions">
          <button className="button" disabled={!ready || busy}>
            Salvar perfil
          </button>
          <button
            className="button button--secondary"
            type="button"
            disabled={!ready || busy || !weight}
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
