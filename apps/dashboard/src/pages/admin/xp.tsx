import { createEffect, createResource, createSignal, Show } from "solid-js";
import { apiUri, fetchXpConfig, updateXpConfig } from "../../api/xp";
import { LevelRoleEditor } from "../../components/LevelRoleEditor";
import { ServerXpSettings } from "../../components/ServerXpSettings";
import { createAsync, query } from "@solidjs/router";
import { ChannelNameIdType } from "../../types/xp";
import { Address } from "../../constants/address";
import { ChannelXpRuleEditor } from "../../components/ChannelXpRuleEditor";

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

export default function Xp() {
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
    <main class="space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* HEADER */}
      <div class="space-y-1">
        <h1 class="text-xl sm:text-2xl font-semibold tracking-tight">
          XP Configuration
        </h1>
        <p class="text-sm text-zinc-400 max-w-prose">
          Configure XP gain, boosts, and level rewards for your server.
        </p>
      </div>
  
      {config() && (
        <div class="space-y-6">
          {/* CARD */}
          <section
            class="rounded-lg border border-zinc-800 bg-zinc-800
                   p-4 sm:p-6
                   overflow-x-hidden"
          >
            <Show
              when={
                allChannels() &&
                (allChannels() as ChannelNameIdType[]).length &&
                config()
              }
            >
              {/* IMPORTANT: isolate horizontal overflow */}
              <div class="relative -mx-4 sm:mx-0">
                <div class="overflow-x-auto px-4 sm:px-0">
                  <div class="min-w-[640px] sm:min-w-0">
                    <ChannelXpRuleEditor
                      value={config()!.channelXpRules}
                      onChange={v =>
                        setConfig(c => ({ ...c, channelXpRules: v }))
                      }
                      channels={allChannels() as ChannelNameIdType[]}
                    />
                  </div>
                </div>
              </div>
            </Show>
          </section>
  
          {/* UNSAVED CHANGES BAR */}
          <Show when={hasUnsavedChanges()}>
            <div
              class="fixed inset-x-0 bottom-0 z-50 pb-safe
                     border-t border-zinc-800
                     bg-zinc-900/95 backdrop-blur"
            >
              <div
                class="mx-auto max-w-6xl
                       px-4 py-4
                       flex flex-col gap-3
                       sm:flex-row sm:items-center sm:justify-between"
              >
                <span class="text-sm text-zinc-300">
                  You have unsaved changes
                </span>
  
                <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    class="w-full sm:w-auto
                           rounded-md border border-zinc-700
                           px-4 py-2 text-sm
                           text-zinc-300 hover:bg-zinc-800 transition"
                    onClick={() =>
                      setConfig(structuredClone(savedConfig()))
                    }
                  >
                    Discard
                  </button>
  
                  <button
                    class="w-full sm:w-auto
                           rounded-md bg-indigo-500
                           px-5 py-2 text-sm font-medium
                           text-white hover:bg-indigo-400 transition"
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
