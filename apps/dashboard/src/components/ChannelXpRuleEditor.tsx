import { For, Show } from "solid-js";
import { ChannelNameIdType } from "../types/xp";
import { ChannelSelect } from "./ChannelSelect";

export type ChannelXpRule = {
  channelId: string | null;

  baseMessageCreateAmount: number;
  baseThreadCreateAmount: number;

  multiplier: number;
  expiration: string | null;
};

function toDatetimeLocal(value: string | null) {
  if (!value) return "";

  const d = new Date(value);
  if (isNaN(d.getTime())) return "";

  // Convert to local datetime-local format
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    `${d.getFullYear()}-` +
    `${pad(d.getMonth() + 1)}-` +
    `${pad(d.getDate())}T` +
    `${pad(d.getHours())}:` +
    `${pad(d.getMinutes())}`
  );
}

function getLocalDate(expiration: string | null) {
  if (!expiration) return "";
  const d = new Date(expiration);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function getLocalTime(expiration: string | null) {
  if (!expiration) return "";
  const d = new Date(expiration);
  return d.toTimeString().slice(0, 5); // HH:mm
}


function fromDatetimeLocal(value: string) {
  if (!value) return null;

  // Browser interprets this as local time
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;

  return d.toISOString(); // store UTC
}

export function ChannelXpRuleEditor(props: {
  value: ChannelXpRule[];
  onChange: (v: ChannelXpRule[]) => void;
  channels: ChannelNameIdType[];
}) {

  function isAllowedChannelType(type: string) {
    const allowedTypes = [
      "text" , 
      // "voice" , 
      "forum" , 
      "announcement" , 
      // "thread_public" , 
      // "thread_private" , 
      // "thread_announcement" , 
      "category" , 
      // "media" , 
      // "directory" , 
      // "stage" , 
      // "dm" , 
      // "dm_group" , 
      // "unknown"
      ]
    if (allowedTypes.includes(type)) return true;
    return false;
  }

  const filteredChannels = props.channels.filter(channel => isAllowedChannelType(channel.type));

  const addRow = () =>
    props.onChange([
      ...props.value,
      {
        channelId: null,
        baseMessageCreateAmount: 10,
        baseThreadCreateAmount: 0,
        multiplier: 1.0,
        expiration: null
      }
    ]);

  const update = (i: number, patch: Partial<ChannelXpRule>) => {
    const copy = [...props.value];
    copy[i] = { ...copy[i], ...patch };
    props.onChange(copy);
  };

  const remove = (i: number) => {
    const copy = [...props.value];
    copy.splice(i, 1);
    props.onChange(copy);
  };

  function isExpired(expiration: string | null) {
    if (!expiration) return false;
    return new Date(expiration).getTime() <= Date.now();
  }
  
  function relativeTime(expiration: string) {
    const diff = new Date(expiration).getTime() - Date.now();
    const abs = Math.abs(diff);
  
    const minutes = Math.round(abs / 60000);
    const hours = Math.round(abs / 3600000);
    const days = Math.round(abs / 86400000);
  
    const value =
      minutes < 60 ? `${minutes}m`
      : hours < 48 ? `${hours}h`
      : `${days}d`;
  
    return diff >= 0
      ? `Expires in ${value}`
      : `Expired ${value} ago`;
  }
  
  function isNoopRule(rule: ChannelXpRule) {
    return (
      rule.baseMessageCreateAmount === 0 &&
      rule.baseThreadCreateAmount === 0 &&
      rule.multiplier === 1.0
    );
  }

  const visibleRules = () =>
    props.value
      .map((rule, index) => ({ rule, index }))
      .filter(({ rule }) => !isNoopRule(rule));

  const validChannelId = (id: string | null) =>
    id && props.channels.some(c => c.id === id) ? id : "";

  return (
    <section class="space-y-4">
      <header>
        <h3 class="text-lg font-semibold">Channel XP Rules</h3>
        <p class="text-sm text-zinc-400">
          Configure base XP and optional multipliers per channel.
        </p>
      </header>

      <For each={visibleRules()}>
        {({rule: row, index }) => (
          <div class="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
            {/* Channel + remove */}
            <div class="flex items-center gap-4 min-w-0">
              <ChannelSelect
                value={row.channelId}
                channels={filteredChannels}
                onChange={id => update(index, { channelId: id })}
              />


              <button
                type="button"
                onClick={() => remove(index)}
                class="text-zinc-400 hover:text-red-400 transition"
                title="Remove rule"
              >
                ✕
              </button>
            </div>

            {/* Base XP */}
            <div class="grid grid-cols-2 gap-4">
              <label class="flex flex-col gap-1 text-sm min-w-0">
                <span class="text-zinc-400">Message XP</span>
                <input
                  type="number"
                  min={0}
                  class="rounded-md bg-zinc-800 px-3 py-2
                         border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={row.baseMessageCreateAmount}
                  onInput={e =>
                    update(index, {
                      baseMessageCreateAmount: Number(e.currentTarget.value)
                    })
                  }
                />
              </label>

              <label class="flex flex-col gap-1 text-sm min-w-0">
                <span class="text-zinc-400">Thread XP</span>
                <input
                  type="number"
                  min={0}
                  class="rounded-md bg-zinc-800 px-3 py-2
                         border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={row.baseThreadCreateAmount}
                  onInput={e =>
                    update(index, {
                      baseThreadCreateAmount: Number(e.currentTarget.value)
                    })
                  }
                />
              </label>
            </div>

            {/* Multiplier */}
            <div class={`grid grid-cols-2 gap-4 rounded-lg border p-4 space-y-4
                ${isExpired(row.expiration)
                  ? "border-red-500/40 bg-red-500/5"
                  : "border-zinc-800 bg-zinc-900"
                }`}>
              <label class="flex flex-col gap-1 text-sm min-w-0">
                <span class="text-zinc-400">XP Multiplier</span>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  class="rounded-md bg-zinc-800 px-3 py-2
                         border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled"
                  value={row.multiplier}
                  onInput={e =>
                    update(index, {
                      multiplier: Number(e.currentTarget.value)
                    })
                  }
                />
                <span class="text-xs text-zinc-500">
                  1.0 = normal XP
                </span>
              </label>

              {/* Expiration */}
              <label class="flex flex-col gap-1 text-sm min-w-0">
                <span class="text-zinc-400">Boost Expiration</span>

                <div class="flex gap-2 min-w-0">
                  <input
                    type="date"
                    class="flex-1 min-w-0 rounded-md bg-zinc-800 px-3 py-2
                          border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={getLocalDate(row.expiration)}
                    onInput={e => {
                      const date = e.currentTarget.value;
                      if (!date) {
                        update(index, { expiration: null });
                        return;
                      }
                    
                      const prev = row.expiration ? new Date(row.expiration) : new Date();
                      const [h, m] = row.expiration
                        ? [prev.getHours(), prev.getMinutes()]
                        : [23, 59]; // default if no time chosen
                    
                      const local = new Date(
                        Number(date.slice(0, 4)),
                        Number(date.slice(5, 7)) - 1,
                        Number(date.slice(8, 10)),
                        h,
                        m
                      );
                    
                      update(index, { expiration: local.toISOString() });
                    }}                    
                  />

                  <input
                    type="time"
                    class="w-32 rounded-md bg-zinc-800 px-3 py-2
                          border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={getLocalTime(row.expiration)}
                    onInput={e => {
                      const time = e.currentTarget.value;
                      if (!row.expiration || !time) return;
                    
                      const [h, m] = time.split(":").map(Number);
                      const d = new Date(row.expiration);
                    
                      const local = new Date(
                        d.getFullYear(),
                        d.getMonth(),
                        d.getDate(),
                        h,
                        m
                      );
                    
                      update(index, { expiration: local.toISOString() });
                    }}                    
                  />
                </div>

                <Show when={row.expiration}>
                <span
                  class={`text-xs ${
                    isExpired(row.expiration) ? "text-red-400" : "text-zinc-400"
                  }`}
                >
                  {relativeTime(row.expiration!)}
                </span>
              </Show>

                <span class="text-xs text-zinc-500">
                  Empty date = permanent
                </span>
                <span class="text-xs text-zinc-500">
                  Times are shown in your local timezone
                </span>
              </label>
            </div>

            {/* Optional hint */}
            <Show when={row.multiplier === 1 && row.expiration === null}>
              <p class="text-xs text-zinc-500 italic">
                This rule applies base XP only (no boost).
              </p>
            </Show>
          </div>
        )}
      </For>

      <button
        type="button"
        onClick={addRow}
        class="rounded-md bg-zinc-800 px-4 py-2 text-sm
               border border-zinc-700 hover:bg-zinc-700 transition"
      >
        + Add Channel Rule
      </button>
    </section>
  );
}
