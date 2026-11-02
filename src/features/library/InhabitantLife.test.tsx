import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { InhabitantLife } from "./InhabitantLife";
import { InhabitantAgency } from "./inhabitantAgency";
import { InhabitantNavigation } from "./inhabitantNavigation";

it("preserves four semantic activities and six individual relationships without numbers, fabricated motion or a permanent panel", () => {
  const agency = new InhabitantAgency(new InhabitantNavigation([]));
  const view = render(
    <InhabitantLife snapshot={agency.getSnapshot()} failed={false} />,
  );
  const region = screen.getByRole("region", {
    name: "Convivência dos habitantes",
  });
  for (const name of ["Samael", "Aryn", "Ytha", "Lua"])
    expect(within(region).getByText(name, { exact: true })).toBeInTheDocument();
  const details = view.container.querySelector("details")!;
  expect(details.open).toBe(false);
  details.open = true;
  expect(within(details).getAllByRole("listitem")).toHaveLength(6);
  expect(region).not.toHaveTextContent(/trust|affinity|XP|pontuação/);
  agency.setMode("reduced");
  view.rerender(
    <InhabitantLife snapshot={agency.getSnapshot()} failed={false} />,
  );
  expect(region).toHaveTextContent("percursos suspensos, sem teletransporte");
  view.rerender(<InhabitantLife snapshot={agency.getSnapshot()} failed />);
  expect(region).toHaveTextContent("nenhum movimento é simulado");
  expect(region).not.toHaveTextContent("Em deslocamento real");
  agency.dispose();
});
