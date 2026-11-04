import { useEffect, useState } from "react";
import type { WorldRuntime } from "./worldRuntime";
import type { AgencySnapshot } from "./inhabitantAgency";
import { InhabitantLife } from "./InhabitantLife";
export function InhabitantRuntimeLife({
  runtime,
  failed,
}: {
  readonly runtime: WorldRuntime | null;
  readonly failed: boolean;
}) {
  const [snapshot, setSnapshot] = useState<AgencySnapshot | null>(null);
  useEffect(() => runtime?.onInhabitantsChange?.(setSnapshot), [runtime]);
  return <InhabitantLife snapshot={snapshot} failed={failed} />;
}
