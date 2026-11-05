import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom has no browser top layer. Interaction tests use the same open/close state;
// actual modal focus containment and top-layer behavior are covered by Chromium.
if (
  typeof HTMLDialogElement !== "undefined" &&
  !HTMLDialogElement.prototype.showModal
) {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
}
