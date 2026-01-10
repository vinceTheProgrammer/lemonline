import { For } from "solid-js";
import { LevelRole } from "../types/xp";

export function LevelRoleEditor(props: {
  value: LevelRole[];
  onChange: (v: LevelRole[]) => void;
  roles: { id: string; name: string }[];
}) {
  const add = () =>
    props.onChange([
      ...props.value,
      { level: 1, roleId: props.roles[0]?.id ?? "", result: "gain" }
    ]);

  const update = (i: number, patch: Partial<LevelRole>) => {
    const copy = [...props.value];
    copy[i] = { ...copy[i], ...patch };
    props.onChange(copy);
  };

  const remove = (i: number) => {
    const copy = [...props.value];
    copy.splice(i, 1);
    props.onChange(copy);
  };

  const validRoleId = (id: string) =>
    props.roles.some(r => r.id === id) ? id : "";  

  return (
    <section class="space-y-4">
      <header>
        <h3 class="text-lg font-semibold">Level Roles</h3>
        <p class="text-sm text-zinc-400">
          Grant or remove roles automatically when users reach a level.
        </p>
      </header>

      <For each={props.value}>
        {(row, i) => (
          <div class="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex items-center gap-4">
            <label class="flex flex-col gap-1 text-sm w-28">
              <span class="text-zinc-400">Level</span>
              <input
                type="number"
                min={1}
                class="rounded-md bg-zinc-800 px-3 py-2
                       border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={row.level}
                onInput={e =>
                  update(i(), { level: Number(e.currentTarget.value) })
                }
              />
            </label>

            <select
              class="rounded-md bg-zinc-800 px-3 py-2 text-sm
                     border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={row.result}
              onChange={e =>
                update(i(), {
                  result: e.currentTarget.value as "gain" | "lose"
                })
              }
            >
              <option value="gain">Gain</option>
              <option value="lose">Lose</option>
            </select>

            <select
                class="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm
                        border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={validRoleId(row.roleId)}
                onChange={e =>
                    update(i(), { roleId: e.currentTarget.value })
                }
                >
                <option value="" disabled>
                    Select a role
                </option>

                <For each={props.roles}>
                    {r => <option value={r.id}>{r.name}</option>}
                </For>
            </select>

            <button
              onClick={() => remove(i())}
              class="text-zinc-400 hover:text-red-400 transition"
              title="Remove level role"
            >
              ✕
            </button>
          </div>
        )}
      </For>

      <button
        onClick={add}
        class="rounded-md bg-zinc-800 px-4 py-2 text-sm
               border border-zinc-700 hover:bg-zinc-700 transition"
      >
        + Add Level Role
      </button>
    </section>
  );
}
