import type { EntryType } from "../domain";

/** Original engravings. Local vectors share a single pen and optical frame. */
export function ArtifactGlyph({ type }: { readonly type: EntryType }) {
  const paths: Record<EntryType, string> = {
    book: "M10 7h20v30H10zM14 7v30M18 13h8M18 17h6M18 29h8M20 21l3 3-3 3-3-3z",
    movie:
      "M8 11h24v24H8zM8 17h24M8 29h24M13 11v6M21 11v6M28 11v6M13 29v6M21 29v6M28 29v6M17 20l8 4-8 3z",
    series: "M8 13h24v22H8zM13 9h14M16 5h8M15 18l10 6-10 6z",
    study:
      "M8 11q6-3 12 1 6-4 12-1v23q-6-3-12 1-6-4-12-1zM20 12v23M12 17h4M12 21h4M24 17h4M24 21h4M24 25h4",
    physical_activity:
      "M9 30q1-12 11-22 10 10 11 22M9 30h22M15 30l5-10 5 10M20 8v6M6 35h28",
    work: "M8 13h24v22H8zM15 13V8h10v5M8 22q12 6 24 0M18 23h4v6h-4z",
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 44"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[type]} />
      <path opacity=".45" d="M4 8V4h4M32 4h4v4M4 36v4h4M32 40h4v-4" />
    </svg>
  );
}
