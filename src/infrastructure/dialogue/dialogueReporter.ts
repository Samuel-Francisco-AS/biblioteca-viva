import type { DialogueErrorReporter } from "../../application";

export const consoleDialogueErrorReporter: DialogueErrorReporter = {
  warn(code) {
    console.warn(`Diálogo degradado: ${code}.`);
  },
};
