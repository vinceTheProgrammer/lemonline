interface LeaderboardControlsProps {
    sortBy: "xp" | "messageCount";
    ascending: boolean;
    perPage: number;
    onChange: (next: {
      sortBy?: "xp" | "messageCount";
      ascending?: boolean;
      perPage?: number;
    }) => void;
  }
  
  export function LeaderboardControls(props: LeaderboardControlsProps) {
    return (
      <div
        class="
          mb-4 flex flex-wrap items-center gap-3
          rounded-lg border border-zinc-800 bg-zinc-800 p-4
        "
      >
        {/* Sort by */}
        <div class="flex items-center gap-2">
          <label class="text-sm text-zinc-400">Sort by</label>
          <select
            class="
              rounded-md border border-zinc-700 bg-zinc-900
              px-2 py-1 text-sm text-zinc-100
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
            value={props.sortBy}
            onChange={(e) =>
              props.onChange({
                sortBy: e.currentTarget.value as "xp" | "messageCount",
              })
            }
          >
            <option value="xp">XP</option>
            <option value="messageCount">Messages</option>
          </select>
        </div>
  
        {/* Order */}
        <button
          class="
            flex items-center gap-1 rounded-md
            border border-zinc-700 bg-zinc-900
            px-3 py-1 text-sm text-zinc-100
            hover:bg-zinc-700 transition
          "
          onClick={() =>
            props.onChange({ ascending: !props.ascending })
          }
          title="Toggle sort order"
        >
          {props.ascending ? "↑ Ascending" : "↓ Descending"}
        </button>
  
        {/* Per page */}
        <div class="flex items-center gap-2">
          <label class="text-sm text-zinc-400">Per page</label>
          <select
            class="
              rounded-md border border-zinc-700 bg-zinc-900
              px-2 py-1 text-sm text-zinc-100
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
            value={props.perPage}
            onChange={(e) =>
              props.onChange({
                perPage: Number(e.currentTarget.value),
              })
            }
          >
            {[10, 25, 50, 100].map((n) => (
              <option value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }
  