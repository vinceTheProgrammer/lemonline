import { createEffect, createSignal, For, Show } from "solid-js";
import { LevelRole } from "../types/xp";

export function LevelRoleEditor(props: {
  value: LevelRole[];
  onChange: (v: LevelRole[]) => void;
  roles: { id: string; name: string }[];
}) {
  const add = () =>
    props.onChange([
      ...props.value,
      { level: 1, roleId: "", result: "gain" }
    ]);  
  
  const refresh = () =>
    props.onChange([
      ...props.value
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

  const [userMergedRoles, setUserMergedRoles] =
  createSignal<Set<string>>(new Set());

  let didInit = false;

  createEffect(() => {
    if (didInit) return;
    if (!props.value.length) return;

    const next = new Set<string>();
    const byRole = new Map<string, LevelRole[]>();

    props.value.forEach(r => {
      if (!byRole.has(r.roleId)) byRole.set(r.roleId, []);
      byRole.get(r.roleId)!.push(r);
    });

    for (const [roleId, rules] of byRole) {
      const gain = rules.filter(r => r.result === "gain");
      const lose = rules.filter(r => r.result === "lose");

      if (rules.length === 2 && gain.length === 1 && lose.length === 1) {
        next.add(roleId);
      }
    }

    setUserMergedRoles(next);
    refresh();
    didInit = true;
  });

  const updateMergedRole = (
    gainIndex: number,
    loseIndex: number,
    roleId: string
  ) => {
    const copy = [...props.value];
  
    copy[gainIndex] = { ...copy[gainIndex], roleId };
    copy[loseIndex] = { ...copy[loseIndex], roleId };
  
    props.onChange(copy);
  };  

  const maybeSuggestMerge = (roleId: string) => {
    if (!roleId) return false;

    const rules = props.value.filter(r => r.roleId === roleId);
    const gain = rules.filter(r => r.result === "gain");
    const lose = rules.filter(r => r.result === "lose");
  
    return rules.length === 2 && gain.length === 1 && lose.length === 1;
  };

  const isMergeable = (rules: { rule: LevelRole }[]) => {
    if (rules.length !== 2) return false;
    const gain = rules.filter(r => r.rule.result === "gain");
    const lose = rules.filter(r => r.rule.result === "lose");
    return gain.length === 1 && lose.length === 1;
  };  

  /** ---- grouping logic ---- */
  const grouped = () => {
    const map = new Map<string, { rule: LevelRole; index: number }[]>();

    props.value.forEach((rule, index) => {
      const key = rule.roleId || "__unassigned__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ rule, index });
    });

    return [...map.entries()];
  };

  return (
    <section class="space-y-4">
      <header>
        <h3 class="text-lg font-semibold">Level Roles</h3>
        <p class="text-sm text-zinc-400">
          Grant or remove roles automatically when users reach a level.
        </p>
      </header>

      <For each={grouped()}>
        {([roleId, rules]) => {
          const gain = rules.find(r => r.rule.result === "gain");
          const lose = rules.find(r => r.rule.result === "lose");
          const isMerged =
            roleId &&
            userMergedRoles().has(roleId) &&
            isMergeable(rules);

          return (
            <div class="space-y-2 p-1 bg-zinc-950 rounded-lg">
              <Show when={roleId === "__unassigned__"}>
                <p class="text-xs text-zinc-500 italic">
                  These rules will be ignored unless a role is selected.
                </p>
              </Show>

              {/* ✅ MERGED UI */}
              <Show when={isMerged}>
                <div class="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">
                      {
                        (props.roles.find(r => r.id === roleId)?.name ??
                        "Unassigned role") + " (gain+lose pair)"
                      }
                    </span>

                    <button
                      class="text-zinc-400 hover:text-red-400"
                      onClick={() => {
                        remove(gain!.index);
                        remove(lose!.index > gain!.index ? lose!.index - 1 : lose!.index);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label class="flex flex-col gap-1 text-sm">
                      <span class="text-zinc-400">Gain at level</span>
                      <input
                        type="number"
                        min={1}
                        class="rounded-md bg-zinc-800 px-3 py-2 border border-zinc-700"
                        value={gain!.rule.level}
                        onInput={e =>
                          update(gain!.index, {
                            level: Number(e.currentTarget.value)
                          })
                        }
                      />
                    </label>

                    <label class="flex flex-col gap-1 text-sm">
                      <span class="text-zinc-400">Lose at level</span>
                      <input
                        type="number"
                        min={1}
                        class="rounded-md bg-zinc-800 px-3 py-2 border border-zinc-700"
                        value={lose!.rule.level}
                        onInput={e =>
                          update(lose!.index, {
                            level: Number(e.currentTarget.value)
                          })
                        }
                      />
                    </label>

                    <label class="flex flex-col gap-1 text-sm">
                      <span class="text-zinc-400">Role</span>
                      <select
                        class="rounded-md bg-zinc-800 px-3 py-2
                              border border-zinc-700 focus:outline-none
                              focus:ring-2 focus:ring-indigo-500"
                        value={validRoleId(gain!.rule.roleId)}
                        onChange={e =>
                          updateMergedRole(
                            gain!.index,
                            lose!.index,
                            e.currentTarget.value
                          )
                        }
                      >
                        <option value="" disabled>
                          Select a role
                        </option>
                        <For each={props.roles}>
                          {r => <option value={r.id}>{r.name}</option>}
                        </For>
                      </select>
                    </label>
                  </div>
                </div>
              </Show>

              {/* ❌ UNMERGED / FALLBACK */}
              <Show when={!isMerged}>
                <For each={rules}>
                  {({ rule, index }) => (
                    <div class="relative rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-2">
                      <Show when={roleId && maybeSuggestMerge(roleId)}>
                        <button
                          class="text-xs text-indigo-400 hover:underline"
                          onClick={() => {
                            setUserMergedRoles(prev => new Set(prev).add(roleId));
                            refresh();
                          }
                          }                          
                        >
                          💡 Merge gain + lose into a single rule
                        </button>
                      </Show>
                      <button
                        onClick={() => remove(index)}
                        class="absolute right-3 top-3 text-zinc-400 hover:text-red-400"
                      >
                        ✕
                      </button>

                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label class="flex flex-col gap-1 text-sm">
                          <span class="text-zinc-400">Level</span>
                          <input
                            type="number"
                            min={1}
                            class="rounded-md bg-zinc-800 px-3 py-2 border border-zinc-700"
                            value={rule.level}
                            onInput={e =>
                              update(index, {
                                level: Number(e.currentTarget.value)
                              })
                            }
                          />
                        </label>

                        <label class="flex flex-col gap-1 text-sm">
                          <span class="text-zinc-400">Action</span>
                          <select
                            class="rounded-md bg-zinc-800 px-3 py-2 border border-zinc-700"
                            value={rule.result}
                            onChange={e =>
                              update(index, {
                                result: e.currentTarget.value as "gain" | "lose"
                              })
                            }
                          >
                            <option value="gain">Gain</option>
                            <option value="lose">Lose</option>
                          </select>
                        </label>

                        <label class="flex flex-col gap-1 text-sm">
                          <span class="text-zinc-400">Role</span>
                          <select
                            class="rounded-md bg-zinc-800 px-3 py-2 border border-zinc-700"
                            value={validRoleId(rule.roleId)}
                            onChange={e =>
                              update(index, {
                                roleId: e.currentTarget.value
                              })
                            }
                          >
                            <option value="" disabled>
                              Select a role
                            </option>
                            <For each={props.roles}>
                              {r => (
                                <option value={r.id}>{r.name}</option>
                              )}
                            </For>
                          </select>
                        </label>
                      </div>

                      <Show when={rules.length === 1 && roleId !== "__unassigned__"}>
                        <button
                          class="text-xs text-indigo-400 hover:underline"
                          onClick={() => {
                            const base = rules[0].rule;
                            const newRule: LevelRole = {
                              level: base.level + 1,
                              roleId: base.roleId,
                              result: base.result === "gain" ? "lose" : "gain"
                            };

                            const copy = [...props.value, newRule];
                            props.onChange(copy);

                            setUserMergedRoles(prev => new Set(prev).add(base.roleId));
                            refresh();
                          }}
                        >
                          ➕ Convert to gain + lose pair
                        </button>
                      </Show>

                      <Show when={rules.length > 2 && roleId !== "__unassigned__"}>
                        <p class="text-xs text-amber-400">
                          ⚠ Multiple rules exist for this role.  
                          Only exactly one gain and one lose rule can be merged.
                        </p>
                      </Show>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          );
        }}
      </For>

      <button
        onClick={add}
        class="w-full sm:w-auto rounded-md bg-zinc-800 px-4 py-2 text-sm
               border border-zinc-700 hover:bg-zinc-700 transition"
      >
        + Add Level Role
      </button>
    </section>
  );
}
