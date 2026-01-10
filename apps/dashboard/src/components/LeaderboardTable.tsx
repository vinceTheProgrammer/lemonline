import { For, Show } from "solid-js";

type LeaderboardRow = {
    discordId: string;
    username: string;
    avatar: string | null;
    xp: number;
    messageCount: number;
    createdAt: Date | string;
};

interface LeaderboardTableProps {
  rows: LeaderboardRow[];
  page: number;
  perPage: number;
  sortBy: "xp" | "messageCount";
}

export function LeaderboardTable(props: LeaderboardTableProps) {
  const baseRank = () => (props.page - 1) * props.perPage;

  return (
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-zinc-700 text-left text-zinc-400">
            <th class="py-2 px-2 w-12">#</th>
            <th class="py-2 px-2">User</th>
            <th class="py-2 px-2 text-right">
              {props.sortBy === "xp" ? "XP" : "Messages"}
            </th>
          </tr>
        </thead>

        <tbody>
          <Show
            when={props.rows.length > 0}
            fallback={
              <tr>
                <td
                  colspan={3}
                  class="py-6 text-center text-zinc-500"
                >
                  No users found
                </td>
              </tr>
            }
          >
            <For each={props.rows}>
              {(row, i) => (
                <tr
                  class="
                    border-b border-zinc-800
                    hover:bg-zinc-700/40
                    transition
                  "
                >
                  {/* Rank */}
                  <td class="py-2 px-2 text-zinc-400">
                    {baseRank() + i() + 1}
                  </td>

                  {/* User */}
                  <td class="py-2 px-2">
                    <div class="flex items-center gap-3">
                      {/* Avatar */}
                      <div class="h-8 w-8 shrink-0">
                        <Show
                          when={row.avatar}
                          fallback={
                            <div class="h-8 w-8 rounded-full bg-zinc-700" />
                          }
                        >
                          <img
                            src={row.avatar!}
                            alt={row.username}
                            class="h-8 w-8 rounded-full object-cover"
                          />
                        </Show>
                      </div>

                      {/* Username */}
                      <div class="font-medium text-zinc-100">
                        {row.username}
                      </div>
                    </div>
                  </td>

                  {/* XP / Messages */}
                  <td class="py-2 px-2 text-right font-medium text-zinc-100">
                    {props.sortBy === "xp"
                      ? row.xp.toLocaleString()
                      : row.messageCount.toLocaleString()}
                  </td>
                </tr>
              )}
            </For>
          </Show>
        </tbody>
      </table>
    </div>
  );
}
