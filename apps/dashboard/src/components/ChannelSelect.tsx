import { createSignal, For, Show } from "solid-js";
import { CHANNEL_ICONS } from "../constants/icons";

export function ChannelSelect(props: {
  value: string | null;
  channels: { id: string; name: string; type: string }[];
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = createSignal(false);

  const selected = () =>
    props.channels.find(c => c.id === props.value) ?? null;

  return (
    <div class="flex-1">
      {/* Button */}
      <button
        type="button"
        class="flex items-center gap-2 w-full rounded-md bg-zinc-800 px-3 py-2
               border border-zinc-700 text-sm"
        onClick={() => setOpen(v => !v)}
      >
        <Show
          when={selected()}
          fallback={<span class="text-zinc-400">Select channel</span>}
        >
          {c => (
            <>
              <img
                src={CHANNEL_ICONS[c().type]}
                class="w-4 h-4"
              />
              <span>#{c().name}</span>
            </>
          )}
        </Show>
      </button>

      {/* Dropdown */}
      <Show when={open()}>
        <div
          class="absolute z-50 mt-1 w-full rounded-md border border-zinc-700
                 bg-zinc-900 shadow-lg max-h-64 overflow-auto"
        >
          <For each={props.channels}>
            {c => (
              <button
                type="button"
                class="flex items-center gap-2 w-full px-3 py-2 text-sm
                       hover:bg-zinc-800 text-left"
                onClick={() => {
                  props.onChange(c.id);
                  setOpen(false);
                }}
              >
                <img
                  src={CHANNEL_ICONS[c.type]}
                  class="w-4 h-4"
                />
                <span>#{c.name}</span>
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
