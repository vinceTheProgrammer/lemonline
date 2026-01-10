import { createEffect, createMemo, createResource, createSignal, For, Show } from "solid-js";
import { apiUri } from "../api/xp";
import { LevelRole } from "../types/xp";

// TODO MIRRORED ON THE BACKEND
export type LevelRoleConfig = {
    id: number;          // optional for unsaved/new entries
    levelId: number;
    roleId: string;
    gained: boolean;
  };

export type LevelRolePreview = {
    id: number;
    roleId: string;
    name: string;
    color: number;
    gained: boolean;
};
  
export type LevelPreviewRow = {
    level: number;
    totalXp: number;
    roles: LevelRolePreview[];
};
  
export type LevelRolesPreviewResponse =
    | { ok: true; levels: LevelPreviewRow[] }
    | { ok: false; error: string };
// TODO MIRRORED ON THE BACKEND

function roleColorToHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

async function fetchLevelRolesPreview(
  maxLevel: number,
  levelRoles: LevelRole[]
): Promise<LevelRolesPreviewResponse> {

  const roleConfigs: LevelRoleConfig[] = levelRoles.map(
    (levelRole) => ({
      id: 0,
      levelId: levelRole.level,
      roleId: levelRole.roleId,
      gained: levelRole.result === "gain",
    })
  );
  

  const res = await fetch(apiUri("xp/level-roles-preview"), {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({ maxLevel, roleConfigs }),
  });

  return res.json();
}

export function LevelRolesPreview(props: {
  levelRoles: LevelRole[];
}) {
  const [maxLevel, setMaxLevel] = createSignal(50);

  const [previewParams, setPreviewParams] = createSignal<{
    maxLevel: number;
    roleVersion: number;
  } | null>(null);
  
  const [roleVersion, bumpRoleVersion] = createSignal(0);
  
  const [preview] = createResource(
    previewParams,
    (params) =>
      params
        ? fetchLevelRolesPreview(
            params.maxLevel,
            props.levelRoles
          )
        : null
  );  

  const rows = createMemo(() => {
    const data = preview();
    return data && data.ok ? data.levels : [];
  });

  const previewError = createMemo(() => {
    const p = preview();
    return p && !p.ok ? p.error : null;
  });

  return (
    <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6 space-y-4">
      {/* Header + Controls */}
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-medium">Level Roles Preview</h2>
          <p class="text-sm text-zinc-400">
            View roles gained or removed at each level.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={500}
            value={maxLevel()}
            onInput={(e) =>
              setMaxLevel(e.currentTarget.valueAsNumber || 50)
            }
            class="w-20 rounded-md bg-zinc-700 px-2 py-2 text-sm text-zinc-100"
          />

          <button
            type="button"
            class="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
            onClick={() => {
              bumpRoleVersion((v) => v + 1);
              setPreviewParams({
                maxLevel: maxLevel(),
                roleVersion: roleVersion() + 1,
              });
            }}
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
            Failed to load level roles: {err()}
          </div>
        )}
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
                <th class="py-2 text-left">Roles</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-zinc-900">
              <For each={rows()}>
                {(row) => (
                  <tr class="align-top">
                    <td class="py-2 font-medium text-zinc-100">
                      {row.level}
                    </td>

                    <td class="py-2">
                      <Show
                        when={row.roles.length > 0}
                        fallback={
                          <span class="italic text-zinc-500">
                            No role changes
                          </span>
                        }
                      >
                        <ul class="flex flex-wrap gap-2">
                          <For each={row.roles}>
                            {(role) => {
                              const roleColor = roleColorToHex(role.color);

                              return (
                                <li
                                  class="flex items-center gap-2 rounded-md border px-2 py-1 text-sm"
                                  style={{
                                    "border-color": role.gained
                                      ? "var(--color-emerald-400)"
                                      : "var(--color-red-400)",
                                  }}
                                >
                                  <span
                                    class={
                                      role.gained
                                        ? "font-medium text-emerald-400"
                                        : "font-medium text-red-400"
                                    }
                                  >
                                    {role.gained ? "+" : "–"}
                                  </span>

                                  <span
                                    class="font-medium"
                                    style={{ color: roleColor }}
                                  >
                                    {role.name}
                                  </span>
                                </li>
                              );
                            }}
                          </For>
                        </ul>
                      </Show>
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
