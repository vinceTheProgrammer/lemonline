import { createMemo, createResource, createSignal, For, Show } from "solid-js";
import { apiUri } from "../api/xp";
import { XpCurveUplot } from "./XpCurveUplot";

interface LevelsPreviewProps {
  formula: () => string;
}

type PreviewResponse =
  | { ok: true; levels: number[] }
  | { ok: false; error: string };

async function fetchPreviewLevels(
  formula: string,
  maxLevel: number
): Promise<PreviewResponse> {
  const res = await fetch(apiUri("xp/levels-preview"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formula, maxLevel }),
  });

  return res.json();
}

export function LevelsPreview(props: LevelsPreviewProps) {
  const [previewFormula, setPreviewFormula] = createSignal<string | null>(null);
  const [maxLevel, setMaxLevel] = createSignal(50);
  const [mode, setMode] = createSignal<"total" | "delta">("total");

  const previewSource = createMemo<
    [string, number] | null
  >(() => {
    const formula = previewFormula();
    if (!formula) return null;
    return [formula, maxLevel()];
  });

  const [preview] = createResource(
    previewSource,
    ([formula, levelCount]) =>
      fetchPreviewLevels(formula, levelCount)
  );

  const rows = createMemo(() => {
    const data = preview();
    if (!data || !data.ok) return [];

    return data.levels.map((totalXp, index) => {
      const prev = data.levels[index - 1] ?? 0;
      return {
        level: index + 1,
        totalXp,
        deltaXp: totalXp - prev,
      };
    });
  });

  const graphValues = createMemo(() =>
    mode() === "total"
      ? rows().map(r => r.totalXp)
      : rows().map(r => r.deltaXp)
  );

  const previewError = createMemo(() => {
    const p = preview();
    return p && p.ok === false ? p.error : null;
  });

  return (
    <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6 space-y-4">
      {/* Header + Controls */}
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-medium">XP Curve Preview</h2>
          <p class="text-sm text-zinc-400">
            Preview total XP or per-level XP.
          </p>
        </div>

        <div class="flex items-center gap-3">
          {/* Mode toggle */}
          <select
            class="rounded-md bg-zinc-700 px-3 py-2 text-sm text-zinc-100"
            value={mode()}
            onChange={e => setMode(e.currentTarget.value as any)}
          >
            <option value="total">Total XP</option>
            <option value="delta">XP per Level</option>
          </select>

          {/* Level count */}
          <input
            type="number"
            min={5}
            max={500}
            value={maxLevel()}
            onInput={e => setMaxLevel(e.currentTarget.valueAsNumber || 50)}
            class="w-20 rounded-md bg-zinc-700 px-2 py-2 text-sm text-zinc-100"
          />

          {/* Update */}
          <button
            type="button"
            class="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
            onClick={() => setPreviewFormula(props.formula())}
            disabled={preview.loading}
          >
            {preview.loading ? "Updating…" : "Update Preview"}
          </button>
        </div>
      </header>

      {/* Errors */}
      <Show when={previewError()}>
        {(err) => (
          <div class="rounded-md border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-300">
            Invalid formula: {err()}
          </div>
        )}
      </Show>

      {/* Graph */}
      <Show when={graphValues().length > 0}>
        <XpCurveUplot
          values={graphValues()}
          label={mode() === "total" ? "Total XP" : "XP per Level"}
        />
      </Show>

      {/* Table */}
      <Show
        when={rows().length > 0}
        fallback={
          <p class="text-sm text-zinc-400">
            No preview yet. Click “Update Preview”.
          </p>
        }
      >
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-700 text-zinc-400">
                <th class="py-2 text-left">Level</th>
                <th class="py-2 text-right">Total XP</th>
                <th class="py-2 text-right">XP From Previous</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-900">
              <For each={rows()}>
                {(row) => (
                  <tr>
                    <td class="py-2 font-medium text-zinc-100">{row.level}</td>
                    <td class="py-2 text-right text-zinc-300">
                      {row.totalXp.toLocaleString()}
                    </td>
                    <td class="py-2 text-right text-zinc-300">
                      +{row.deltaXp.toLocaleString()}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </section>
  );
}
