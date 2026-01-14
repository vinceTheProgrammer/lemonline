import { createEffect, createResource, createSignal, Show } from "solid-js";
import { apiUri, fetchXpConfig, updateXpConfig } from "../../api/xp";
import { LevelRoleEditor } from "../../components/LevelRoleEditor";
import { createAsync, query } from "@solidjs/router";
import { ChannelNameIdType } from "../../types/xp";
import { LevelRolesPreview } from "../../components/LevelRolesPreview";

const getAllRolesQuery = query(async () => {
  const response = await fetch(apiUri("roles"), {
    credentials: "include",
  });
  return response.json();
}, "allRoles");

export default function LevelRoles() {
  const [configResource] = createResource(
    () => "1376370662360481812",
    fetchXpConfig
  );

  const [config, setConfig] = createSignal<any>();
  const [savedConfig, setSavedConfig] = createSignal<any>();

  createEffect(() => {
    const data = configResource();
    if (data) {
      const clone = structuredClone(data);
      setConfig(clone);
      setSavedConfig(structuredClone(clone));
    }
  });

  const hasUnsavedChanges = () => {
    const current = config();
    const saved = savedConfig();
    if (!current || !saved) return false;
    return JSON.stringify(current) !== JSON.stringify(saved);
  };

  const allRoles = createAsync(() => getAllRolesQuery());

  const save = async () => {
    const current = config();
    if (!current) return;

    await updateXpConfig(current);
    setSavedConfig(structuredClone(current));
    alert("Saved!");
  };

  window.addEventListener("beforeunload", e => {
    if (hasUnsavedChanges()) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  return (
    <main class="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6">
      {/* HEADER */}
      <div>
        <h1 class="text-xl sm:text-2xl font-semibold tracking-tight">
          Level Roles
        </h1>
        <p class="mt-1 text-sm text-zinc-400">
          Configure which roles are granted at each level.
        </p>
      </div>

      {config() && (
        <div class="space-y-6">
          {/* EDITOR CARD */}
          <section
            class="rounded-lg border border-zinc-800 bg-zinc-800
                   p-4 sm:p-6
                   overflow-x-auto"
          >
            <Show when={allRoles() && (allRoles() as ChannelNameIdType[]).length}>
              <div class="min-w-0">
                <LevelRoleEditor
                  value={config()!.levelRoles}
                  onChange={v =>
                    setConfig(c => ({ ...c, levelRoles: v }))
                  }
                  roles={allRoles() as ChannelNameIdType[]}
                />
              </div>
            </Show>
          </section>

          {/* PREVIEW */}
          <section
            class="rounded-lg border border-zinc-800 bg-zinc-800
                   p-4 sm:p-6
                   overflow-x-auto"
          >
            <div class="min-w-0">
              <LevelRolesPreview levelRoles={config()!.levelRoles} />
            </div>
          </section>

          {/* SAVE BAR */}
          <Show when={hasUnsavedChanges()}>
            <div
              class="fixed inset-x-0 bottom-0 z-50
                     border-t border-zinc-800
                     bg-zinc-900/95 backdrop-blur
                     px-4 sm:px-6 py-4 pb-safe"
            >
              <div
                class="mx-auto max-w-6xl
                       flex flex-col gap-3
                       sm:flex-row sm:items-center sm:justify-between"
              >
                <span class="text-sm text-zinc-300">
                  You have unsaved changes
                </span>

                <div class="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <button
                    class="w-full sm:w-auto
                           rounded-md border border-zinc-700
                           px-4 py-2 text-sm text-zinc-300
                           hover:bg-zinc-800 transition"
                    onClick={() =>
                      setConfig(structuredClone(savedConfig()))
                    }
                  >
                    Discard
                  </button>

                  <button
                    class="w-full sm:w-auto
                           rounded-md bg-indigo-500
                           px-5 py-2 text-sm font-medium text-white
                           hover:bg-indigo-400 transition"
                    onClick={save}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </Show>
        </div>
      )}
    </main>
  );
}
