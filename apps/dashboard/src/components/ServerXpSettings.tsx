export function ServerXpSettings(props: {
    cooldown: number;
    formula: string;
    onChange: (v: { cooldown: number; formula: string }) => void;
  }) {
    return (
      <section class="space-y-4">
        <header>
          <h3 class="text-lg font-semibold">Server XP Settings</h3>
          <p class="text-sm text-zinc-400">
            Global rules that apply to all XP calculations.
          </p>
        </header>
  
        <div class="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
          <label class="flex flex-col gap-1 text-sm max-w-xs">
            <span class="text-zinc-400">XP Cooldown (seconds)</span>
            <input
              type="number"
              min={0}
              class="rounded-md bg-zinc-800 px-3 py-2
                     border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={props.cooldown}
              onInput={e =>
                props.onChange({
                  cooldown: Number(e.currentTarget.value),
                  formula: props.formula
                })
              }
            />
          </label>
  
          <label class="flex flex-col gap-1 text-sm">
            <span class="text-zinc-400">Level Formula</span>
            <textarea
              rows={4}
              class="rounded-md bg-zinc-800 px-3 py-2
                     border border-zinc-700 font-mono text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={props.formula}
              onInput={e =>
                props.onChange({
                  cooldown: props.cooldown,
                  formula: e.currentTarget.value
                })
              }
            />
            <span class="text-xs text-zinc-500">
              Whatever this expression evaluates to when passed in a level, will be the XP needed to progress to that level from the previous level. i.e. the XP delta from the previous level.
              Supports basic Javascript expressions. This includes but is not limited to numbers, operators, functions from the Math library, etc.
            </span>
          </label>
        </div>
      </section>
    );
  }
  