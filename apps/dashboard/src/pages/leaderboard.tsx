import { createResource, createSignal, Show } from "solid-js";
import { apiUri } from "../api/xp";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { Pagination } from "../components/Pagination";
import { LeaderboardControls } from "../components/LeaderboardControls";

export default function Leaderboard() {
  const [params, setParams] = createSignal({
    perPage: 25,
    page: 1,
    sortBy: "xp" as "xp" | "messageCount",
    ascending: false,
  });

  const [leaderboard] = createResource(params, async (p) => {
    const query = new URLSearchParams({
      perPage: p.perPage.toString(),
      page: p.page.toString(),
      sortBy: p.sortBy,
      ascending: String(p.ascending),
    });

    const res = await fetch(
      `${apiUri("leaderboard")}?${query.toString()}`,
      { credentials: "include" }
    );

    if (!res.ok) throw new Error("Failed to load leaderboard");
    return res.json();
  });

  return (
    <section class="mx-auto max-w-5xl space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-semibold tracking-tight">
          Leaderboard
        </h1>
        <p class="text-zinc-400">
          See which members are leading the pack.
        </p>
      </header>

      <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6">
      <Show when={leaderboard()}>
        {(data) => (
          <>
            <LeaderboardControls
              sortBy={params().sortBy}
              ascending={params().ascending}
              perPage={params().perPage}
              onChange={(next) =>
                setParams((v) => ({
                  ...v,
                  ...next,
                  page: 1, // reset page on parameter change
                }))
              }
            />

            <LeaderboardTable
              rows={data().data}
              page={params().page}
              perPage={params().perPage}
              sortBy={params().sortBy}
            />

            <Pagination
              page={data().meta.currentPage}
              totalPages={data().meta.totalPages}
              onPageChange={(page) =>
                setParams((v) => ({ ...v, page }))
              }
            />
          </>
        )}
      </Show>
      </section>
    </section>
  );
}