import { createEffect, createResource, createSignal, Show } from "solid-js";
import { apiUri, fetchXpConfig, updateXpConfig } from "../../api/xp";
import { LevelRoleEditor } from "../../components/LevelRoleEditor";
import { ServerXpSettings } from "../../components/ServerXpSettings";
import { createAsync, query } from "@solidjs/router";
import { ChannelNameIdType } from "../../types/xp";
import { ChannelXpRuleEditor } from "../../components/ChannelXpRuleEditor";
import { LevelsPreview } from "../../components/LevelsPreview";

const getAllChannelsQuery = query(async () => {
  const response = await fetch(apiUri('channels'), {
    credentials: "include",
  });
  return response.json();
}, "allChannels");

const getAllRolesQuery = query(async () => {
  const response = await fetch(apiUri('roles'), {
    credentials: "include",
  });
  return response.json();
}, "allRoles");

export default function Levels() {
  const [configResource] = createResource(
    () => '1376370662360481812',
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
  
  const allChannels = createAsync(() => getAllChannelsQuery());
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
    <main class="space-y-8">
      {/* HEADER */}
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          XP Configuration
        </h1>
        <p class="mt-1 text-sm text-zinc-400">
          Configure XP gain, boosts, and level rewards for your server.
        </p>
      </div>

      {config() && (
        <div class="space-y-6">
          {/* CARD */}
          <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6">
            <Show when={config()}>
            <ServerXpSettings
              cooldown={config()!.serverCooldownSeconds}
              formula={config()!.levelFormula}
              onChange={v =>
                setConfig(c => ({
                  ...c,
                  serverCooldownSeconds: v.cooldown,
                  levelFormula: v.formula
                }))
              }
            />
            </Show>
          </section>

          <Show when={hasUnsavedChanges()}>
            <div
              class="fixed bottom-0 inset-x-0 z-50 pb-safe
                    border-t border-zinc-800 bg-zinc-900/95 backdrop-blur
                    px-6 py-4"
            >
              <div class="mx-auto flex max-w-6xl items-center justify-between">
                <span class="text-sm text-zinc-300">
                  You have unsaved changes
                </span>

                <div class="flex gap-3">
                  <button
                    class="rounded-md border border-zinc-700 px-4 py-2 text-sm
                          text-zinc-300 hover:bg-zinc-800 transition"
                    onClick={() => setConfig(structuredClone(savedConfig()))}
                  >
                    Discard
                  </button>

                  <button
                    class="rounded-md bg-indigo-500 px-5 py-2 text-sm font-medium
                          text-white hover:bg-indigo-400 transition"
                    onClick={save}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </Show>

          <LevelsPreview formula={() => config()?.levelFormula ?? ""} />
        </div>
      )}
    </main>
  );
}
