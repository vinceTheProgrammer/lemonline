import { createSignal, Show, For } from "solid-js";
import { apiUri } from "../../api/xp";

type Member = {
  id: string;
  username: string;
  avatar: string | null;
  xp: number;
  level: number;
};

export default function Members() {
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<Member[]>([]);
  const [selected, setSelected] = createSignal<Member | null>(null);

  const [xpAmount, setXpAmount] = createSignal<number>(0);
  const [levelAmount, setLevelAmount] = createSignal<number>(0);

  const search = async () => {
    const res = await fetch(
      `${apiUri("members/search")}?q=${encodeURIComponent(query())}`,
      { credentials: "include" }
    );
    if (res.ok) {
      setResults(await res.json());
    }
  };

  const refreshSelected = async () => {
    if (!selected()) return;
    const res = await fetch(
      `${apiUri("members/search")}?q=${selected()!.id}`,
      { credentials: "include" }
    );
    if (res.ok) {
      setSelected((await res.json())[0]);
    }
  };

  const action = async (endpoint: string, body: object) => {
    await fetch(apiUri(endpoint), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await refreshSelected();
  };

  return (
    <main class="space-y-8">
      {/* HEADER */}
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          Member XP Management
        </h1>
        <p class="mt-1 text-sm text-zinc-400">
          View and manually adjust XP and levels for individual members.
        </p>
      </div>

      {/* MEMBER SEARCH */}
      <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6 space-y-4">
        <h2 class="text-lg font-medium">Find Member</h2>

        <div class="flex gap-2">
          <input
            class="flex-1 rounded-md bg-zinc-900 px-3 py-2 text-sm
                   border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Username or Discord ID"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
          />

          <button
            onClick={search}
            class="rounded-md bg-indigo-500 px-4 py-2 font-medium
                   text-white transition hover:bg-indigo-400 active:bg-indigo-600"
          >
            Search
          </button>
        </div>

        <Show when={results().length > 0}>
          <div class="divide-y divide-zinc-700">
            <For each={results()}>
              {(m) => (
                <button
                  onClick={() => {
                    setSelected(m);
                    setLevelAmount(m.level);
                  }}
                  class="w-full flex items-center gap-3 px-2 py-3
                         text-left hover:bg-zinc-700/50 transition"
                >
                  <img
                    src={m.avatar ?? "/default-avatar.png"}
                    class="h-8 w-8 rounded-full"
                  />
                  <div>
                    <div class="font-medium">{m.username}</div>
                    <div class="text-xs text-zinc-400">
                      Level {m.level} • {m.xp.toLocaleString()} XP
                    </div>
                  </div>
                </button>
              )}
            </For>
          </div>
        </Show>
      </section>

      {/* MEMBER CONTROLS */}
      <Show when={selected()}>
        {(member) => (
          <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6 space-y-6">
            <div class="flex items-center gap-4">
              <img
                src={member().avatar ?? "/default-avatar.png"}
                class="h-12 w-12 rounded-full"
              />
              <div>
                <h2 class="text-lg font-medium">{member().username}</h2>
                <p class="text-sm text-zinc-400">
                  Level {member().level} • {member().xp.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* XP CONTROLS */}
            <div class="grid gap-4 md:grid-cols-3">
              <input
                type="number"
                class="rounded-md bg-zinc-900 px-3 py-2 text-sm
                       border border-zinc-700 focus:ring-indigo-500"
                placeholder="XP amount"
                value={xpAmount()}
                onInput={(e) => setXpAmount(+e.currentTarget.value)}
              />

              <button
                onClick={() =>
                  action("members/xp/add", {
                    userId: member().id,
                    amount: xpAmount(),
                  })
                }
                class="rounded-md bg-emerald-500 px-4 py-2 font-medium
                       text-white hover:bg-emerald-400"
              >
                Add XP
              </button>

              <button
                onClick={() =>
                  action("members/xp/remove", {
                    userId: member().id,
                    amount: xpAmount(),
                  })
                }
                class="rounded-md bg-red-500 px-4 py-2 font-medium
                       text-white hover:bg-red-400"
              >
                Remove XP
              </button>
            </div>

            {/* SETTERS */}
            <div class="grid gap-4 md:grid-cols-2">
              <button
                onClick={() =>
                  action("members/xp/set", {
                    userId: member().id,
                    xp: xpAmount(),
                  })
                }
                class="rounded-md bg-indigo-500 px-4 py-2 font-medium
                       text-white hover:bg-indigo-400"
              >
                Set XP Exactly
              </button>

              <div class="flex gap-2">
                <input
                  type="number"
                  class="flex-1 rounded-md bg-zinc-900 px-3 py-2 text-sm
                         border border-zinc-700"
                  value={levelAmount()}
                  onInput={(e) =>
                    setLevelAmount(+e.currentTarget.value)
                  }
                />

                <button
                  onClick={() =>
                    action("members/level/set", {
                      userId: member().id,
                      level: levelAmount(),
                    })
                  }
                  class="rounded-md bg-indigo-500 px-4 py-2 font-medium
                         text-white hover:bg-indigo-400"
                >
                  Set Level
                </button>
              </div>
            </div>
          </section>
        )}
      </Show>
    </main>
  );
}
