import { createResource, Show } from "solid-js";
import { apiUri } from "../api/xp";

type XpProgress = {
  intoLevel: number;
  needed: number;
  percent: number;
};

type ProfileData = {
  avatar: string | null;
  username: string;
  id: string;
  roles: string[];
  isMember: boolean;
  joinDate: Date | null;
  xp: number | null;
  level: number | null;
  messageCount: number | null;
  xpProgress: XpProgress | null;
};

async function fetchProfile(): Promise<ProfileData | null> {
  const res = await fetch(apiUri("profile"), {
    credentials: "include"
  });
  if (!res.ok) return null;
  return res.json();
}

function formatDate(date: Date | string | null) {
  if (!date) return "Unknown";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export default function Profile() {
  const [profile] = createResource(fetchProfile);

  return (
    <section class="mx-auto max-w-3xl space-y-8">
      {/* HEADER */}
      <header class="space-y-2">
        <h1 class="text-3xl font-semibold tracking-tight">
          Your Profile
        </h1>
        <p class="text-zinc-400">
          Your Lemonline Bot stats and account details.
        </p>
      </header>

      <Show when={profile()} fallback={<p class="text-zinc-400">Loading…</p>}>
        {(p) => (
          <>
            {/* PROFILE CARD */}
            <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6">
              <div class="flex items-center gap-6">
                <img
                  src={p().avatar ?? "/default-avatar.png"}
                  alt={p().username}
                  class="h-20 w-20 rounded-full border border-zinc-700"
                />

                <div class="flex-1 space-y-1">
                  <h2 class="text-xl font-medium">
                    {p().username}
                  </h2>

                  <p class="text-sm text-zinc-400">
                    Discord ID: {p().id}
                  </p>

                  <div class="flex flex-wrap gap-2 pt-2">
                    <Show when={p().roles.includes("admin")}>
                      <span class="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">
                        Admin
                      </span>
                    </Show>

                    <Show when={p().isMember}>
                      <span class="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                        Server Member
                      </span>
                    </Show>
                  </div>
                </div>
              </div>
            </section>

            {/* XP PROGRESS */}
            <Show when={p().xpProgress && p().level !== null}>
              <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6 space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-zinc-400">
                    Level {p().level}
                  </span>
                  <span class="text-zinc-400">
                    {p().xpProgress!.intoLevel} / {p().xpProgress!.needed} XP
                  </span>
                </div>

                <div class="h-3 w-full overflow-hidden rounded-full bg-zinc-700">
                  <div
                    class="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${p().xpProgress!.percent}%` }}
                  />
                </div>

                <p class="text-xs text-zinc-400">
                  {p().xpProgress!.percent.toFixed(1)}% to next level
                </p>
              </section>
            </Show>

            {/* STATS */}
            <section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Level"
                value={p().level}
              />
              <StatCard
                label="Total XP"
                value={p().xp}
              />
              <StatCard
                label="Messages Sent"
                value={p().messageCount}
              />
            </section>

            {/* ACCOUNT INFO */}
            <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6 space-y-2">
              <h3 class="text-lg font-medium">
                Account Info
              </h3>

              <div class="flex justify-between text-sm">
                <span class="text-zinc-400">Joined Server</span>
                <span>{formatDate(p().joinDate)}</span>
              </div>
            </section>
          </>
        )}
      </Show>
    </section>
  );
}

function StatCard(props: {
  label: string;
  value: number | null;
}) {
  return (
    <div class="rounded-lg border border-zinc-800 bg-zinc-800 p-4 text-center">
      <p class="text-sm text-zinc-400">
        {props.label}
      </p>
      <p class="mt-1 text-2xl font-semibold">
        {props.value ?? "—"}
      </p>
    </div>
  );
}
