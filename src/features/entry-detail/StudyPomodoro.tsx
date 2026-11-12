import { BVSelectSheet } from "../../ui/BVPicker";
import { useState } from "react";
import { Link } from "react-router-dom";
import { type Session, type StudyEntry } from "../../domain";
import type { SessionApplication } from "../sessions/SessionPanel";
import { useSessionClock } from "../sessions/useSessionClock";
const clockFace = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export function StudyPomodoro({
  application,
  entry,
  open,
  loading,
  busy,
  act,
}: {
  readonly application: SessionApplication;
  readonly entry: StudyEntry;
  readonly open?: Session;
  readonly loading: boolean;
  readonly busy: boolean;
  readonly act: (
    operation: () => Promise<unknown>,
    message: string,
  ) => Promise<void>;
}) {
  const [minutes, setMinutes] = useState(25);
  const session = open?.entryId === entry.id ? open : undefined;
  const elapsed = useSessionClock(session);
  const duration =
    session?.kind === "study" ? session.focusDurationSeconds : undefined;
  const target = duration ?? minutes * 60;
  const remaining = Math.max(0, target - elapsed);
  const finished = session && duration !== undefined && remaining === 0;
  const start = () =>
    application.commands.startSession.execute({
      entryId: entry.id,
      entryType: "study",
      focusDurationSeconds: minutes * 60,
    });
  return (
    <section className="study-focus" aria-labelledby="study-focus-title">
      <div className="study-focus__intro">
        <p className="study-kicker">I · Um instante de presença</p>
        <h3 id="study-focus-title">Acenda seu foco</h3>
        <p>Uma página, uma ideia, um passo de cada vez.</p>
        <label className="study-duration">
          Duração do foco
          <BVSelectSheet
            value={minutes}
            disabled={Boolean(open) || busy || loading}
            onChange={(event) => setMinutes(Number(event.target.value))}
          >
            <option value={15}>15 minutos · breve encontro</option>
            <option value={25}>25 minutos · pomodoro</option>
            <option value={45}>45 minutos · imersão</option>
          </BVSelectSheet>
        </label>
      </div>
      <div className="study-clock-area">
        <div
          className="study-clock"
          role="timer"
          aria-label={
            duration === undefined && session
              ? "Tempo estudado"
              : "Tempo restante"
          }
        >
          <svg viewBox="0 0 240 240" aria-hidden="true">
            <circle className="study-clock__track" cx="120" cy="120" r="104" />
            <circle
              className="study-clock__progress"
              cx="120"
              cy="120"
              r="104"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 - Math.min(elapsed / target, 1) * 100}
            />
          </svg>
          <div className="study-clock__face">
            <span aria-hidden="true">✦</span>
            <strong>
              {clockFace(
                session && duration === undefined ? elapsed : remaining,
              )}
            </strong>
            <small>
              {finished
                ? "Foco concluído"
                : session?.status === "paused"
                  ? "Em pausa"
                  : session
                    ? "Sua chama está acesa"
                    : "Seu próximo encontro"}
            </small>
          </div>
        </div>
        <div className="study-clock-controls">
          {!session && (
            <button
              className="button button--primary"
              type="button"
              disabled={busy || loading || Boolean(open)}
              onClick={() =>
                void act(
                  start,
                  "Foco iniciado. O tempo está guardado neste dispositivo.",
                )
              }
            >
              Iniciar foco
            </button>
          )}
          {session && !finished && (
            <button
              className="button button--primary"
              disabled={busy}
              type="button"
              onClick={() =>
                void act(
                  () =>
                    session.status === "active"
                      ? application.commands.pauseSession.execute({
                          id: session.id,
                        })
                      : application.commands.resumeSession.execute({
                          id: session.id,
                        }),
                  session.status === "active"
                    ? "Foco pausado."
                    : "Foco retomado.",
                )
              }
            >
              {session.status === "active" ? "Pausar foco" : "Retomar foco"}
            </button>
          )}
          {session && (
            <button
              className={`button ${finished ? "button--primary" : "button--secondary"}`}
              disabled={busy}
              type="button"
              onClick={() =>
                void act(
                  () =>
                    application.commands.completeSession.execute({
                      id: session.id,
                    }),
                  "Foco registrado no seu percurso.",
                )
              }
            >
              {finished ? "Registrar foco" : "Encerrar e registrar"}
            </button>
          )}
          {session && (
            <button
              className="text-button"
              disabled={busy}
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Reiniciar este ciclo? O tempo deste foco será descartado; sessões anteriores permanecem.",
                  )
                )
                  void act(
                    () =>
                      application.commands.deleteSession.execute({
                        id: session.id,
                      }),
                    "Ciclo reiniciado. Escolha a duração e acenda um novo foco.",
                  );
              }}
            >
              Reiniciar ciclo
            </button>
          )}
        </div>
        {open && !session && (
          <p role="status">
            Há uma sessão em outro registro.{" "}
            <Link to={`/registros/${encodeURIComponent(open.entryId)}`}>
              Abrir sessão em andamento
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
