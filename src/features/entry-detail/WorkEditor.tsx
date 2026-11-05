import { useEffect, useRef, useState, type FormEvent } from "react";
import { BVDatePicker, BVSelectSheet } from "../../ui/BVPicker";
import {
  TASK_STATES,
  taskStateLabels,
  JOURNAL_KINDS,
  journalKindLabels,
  type WorkStage,
  type WorkTask,
  type WorkPlan,
} from "../../domain/endeavors";
import type { WorkOperation } from "../../application/endeavors";
export type WorkEditorTarget =
  | { kind: "stage"; value?: WorkStage }
  | { kind: "task"; value?: WorkTask; stageId?: string }
  | { kind: "journal"; value?: WorkPlan["journal"][number] }
  | { kind: "next"; taskId?: string; text?: string };
export function WorkEditor({
  target,
  stages,
  tasks,
  busy,
  onSave,
  onClose,
}: {
  readonly target: WorkEditorTarget;
  readonly stages: readonly WorkStage[];
  readonly tasks: readonly WorkTask[];
  readonly busy: boolean;
  readonly onSave: (operation: WorkOperation) => Promise<boolean>;
  readonly onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dirty = useRef(false);
  const busyRef = useRef(busy);
  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);
  const [error, setError] = useState("");
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const node = dialog.current;
    const opener = document.activeElement;
    node?.showModal();
    function close() {
      if (
        !busyRef.current &&
        (!dirty.current ||
          window.confirm("Descartar as alterações não salvas?"))
      )
        closeRef.current();
    }
    const cancel = (event: Event) => {
      event.preventDefault();
      close();
    };
    const back = (event: Event) => {
      if (Array.from(document.querySelectorAll("dialog[open]")).at(-1) !== node)
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    };
    node?.addEventListener("cancel", cancel);
    window.addEventListener("biblioteca-viva:native-back", back, true);
    return () => {
      node?.close();
      node?.removeEventListener("cancel", cancel);
      window.removeEventListener("biblioteca-viva:native-back", back, true);
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => {
      const value = form.get(key);
      return typeof value === "string" ? value.trim() || undefined : undefined;
    };
    let operation: WorkOperation;
    if (target.kind === "stage")
      operation = {
        kind: "stage",
        itemId: target.value?.id,
        value: {
          title: text("title") ?? "",
          description: text("description"),
          deadline: text("deadline"),
          reference: text("reference"),
        },
      };
    else if (target.kind === "task")
      operation = {
        kind: "task",
        itemId: target.value?.id,
        value: {
          title: text("title") ?? "",
          state:
            TASK_STATES.find((state) => state === text("state")) ?? "pending",
          stageId: text("stageId"),
          description: text("description"),
          deadline: text("deadline"),
          reference: text("reference"),
        },
      };
    else if (target.kind === "journal")
      operation = {
        kind: "journal",
        itemId: target.value?.id,
        value: {
          kind:
            JOURNAL_KINDS.find((kind) => kind === text("journalKind")) ??
            "advance",
          content: text("content") ?? "",
        },
      };
    else
      operation = {
        kind: "next",
        itemId: text("nextTaskId"),
        text: text("nextAction"),
      };
    setError("");
    if (await onSave(operation)) {
      dirty.current = false;
      onClose();
    } else
      setError(
        "Alterações não salvas. Revise a mensagem no fólio; seu rascunho foi preservado.",
      );
  }
  const value = target.kind === "next" ? undefined : target.value;
  return (
    <dialog
      ref={dialog}
      className="work-editor"
      aria-labelledby="work-editor-title"
    >
      <h3 id="work-editor-title">
        {target.kind === "stage"
          ? value
            ? "Editar etapa"
            : "Nova etapa"
          : target.kind === "task"
            ? value
              ? "Editar tarefa"
              : "Nova tarefa"
            : target.kind === "journal"
              ? value
                ? "Editar registro do diário"
                : "Escrever no diário"
              : "Escolher próxima ação"}
      </h3>
      <form
        onSubmit={(event) => void submit(event)}
        onChange={() => {
          dirty.current = true;
        }}
      >
        <fieldset disabled={busy}>
          {(target.kind === "stage" || target.kind === "task") && (
            <>
              <label className="form-field">
                {target.kind === "task" ? "Título da tarefa" : "Nome da etapa"}
                <input
                  name="title"
                  defaultValue={target.value?.title}
                  required
                  maxLength={300}
                  autoFocus
                />
              </label>
              {target.kind === "task" && (
                <div className="work-editor__pair">
                  <div className="form-field">
                    <label htmlFor="work-editor-state">Estado</label>
                    <BVSelectSheet
                      id="work-editor-state"
                      name="state"
                      defaultValue={target.value?.state ?? "pending"}
                    >
                      {TASK_STATES.map((state) => (
                        <option key={state} value={state}>
                          {taskStateLabels[state]}
                        </option>
                      ))}
                    </BVSelectSheet>
                  </div>
                  <div className="form-field">
                    <label htmlFor="work-editor-stage">Etapa</label>
                    <BVSelectSheet
                      id="work-editor-stage"
                      name="stageId"
                      defaultValue={
                        target.value?.stageId ?? target.stageId ?? ""
                      }
                    >
                      <option value="">Sem etapa</option>
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.title}
                        </option>
                      ))}
                    </BVSelectSheet>
                  </div>
                </div>
              )}
              <div className="form-field">
                <label htmlFor="work-editor-deadline">Prazo (opcional)</label>
                <BVDatePicker
                  id="work-editor-deadline"
                  name="deadline"
                  defaultValue={target.value?.deadline}
                />
              </div>
              <label className="form-field">
                {target.kind === "task"
                  ? "Descrição ou critério de conclusão"
                  : "Descrição curta"}
                <textarea
                  name="description"
                  rows={3}
                  maxLength={4000}
                  defaultValue={target.value?.description}
                />
              </label>
              <label className="form-field">
                Referência (opcional)
                <input
                  name="reference"
                  type="url"
                  placeholder="https://"
                  maxLength={2000}
                  defaultValue={target.value?.reference}
                />
              </label>
            </>
          )}
          {target.kind === "journal" && (
            <>
              <div className="form-field">
                <label htmlFor="work-editor-journal-kind">
                  Tipo de registro
                </label>
                <BVSelectSheet
                  id="work-editor-journal-kind"
                  name="journalKind"
                  defaultValue={target.value?.kind ?? "advance"}
                >
                  {JOURNAL_KINDS.map((kind) => (
                    <option value={kind} key={kind}>
                      {journalKindLabels[kind]}
                    </option>
                  ))}
                </BVSelectSheet>
              </div>
              <label className="form-field">
                Registro do diário
                <textarea
                  name="content"
                  rows={6}
                  required
                  maxLength={8000}
                  defaultValue={target.value?.content}
                  autoFocus
                />
              </label>
            </>
          )}
          {target.kind === "next" && (
            <>
              <div className="form-field">
                <label htmlFor="work-editor-next-task">Tarefa escolhida</label>
                <BVSelectSheet
                  id="work-editor-next-task"
                  name="nextTaskId"
                  defaultValue={target.taskId ?? ""}
                >
                  <option value="">Nenhuma tarefa escolhida</option>
                  {tasks
                    .filter((task) => task.state !== "completed")
                    .map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                </BVSelectSheet>
              </div>
              <label className="form-field">
                Próxima ação escrita
                <textarea
                  name="nextAction"
                  maxLength={4000}
                  rows={3}
                  defaultValue={target.text}
                />
              </label>
            </>
          )}
          {error && <p role="alert">{error}</p>}
          <div className="form-actions">
            <button className="button button--primary" disabled={busy}>
              {busy ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                if (
                  !dirty.current ||
                  window.confirm("Descartar as alterações não salvas?")
                )
                  onClose();
              }}
            >
              Cancelar
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
