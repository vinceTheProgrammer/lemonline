import { createMemo, createSignal, Show, Suspense, type Component } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { createResource } from "solid-js";
import { UserMenu } from './components/UserMenu';
import { apiUri } from './api/xp';
import { authVersion } from './auth';
import { Address } from './constants/address';

async function fetchMe() {
  const res = await fetch(apiUri('me'), {
    credentials: "include"
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json;
}

const App: Component<{ children: Element }> = (props) => {

  const [user] = createResource(authVersion, fetchMe);

  const location = useLocation();

  const [mobileNavOpen, setMobileNavOpen] = createSignal<boolean>(false);

  const navLink = (path: string) => {
    const active =
      location.pathname === path ||
      location.pathname.startsWith(path + "/");
  
    return `
      px-3 py-2 rounded-md text-sm font-medium transition
      ${active
        ? 'bg-zinc-700 text-white'
        : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'}
    `;
  };
  

  const isAdmin = createMemo(() =>
    user()?.roles?.includes("admin")
  );

  const isMember = createMemo(() =>
    user()?.roles?.includes("member")
  );

  return (
    <div class="min-h-screen bg-zinc-900 text-zinc-100">
      {/* NAVBAR */}
      <nav class="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div class="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}lemon.png`} class="w-10"/>
            <span class="text-lg font-semibold tracking-tight">
              Lemonline Bot
            </span>
          </div>

          <ul class="hidden md:flex items-center gap-1">
            <li>
              <A href="/" class={navLink('/')}>Home</A>
            </li>
            <Show when={user()}>
              <li>
              <A href="/profile" class={navLink('/profile')}>Profile</A>
              </li>
            </Show>
            <Show when={isMember()}>
              <li>
                <A href="/leaderboard" class={navLink('/leaderboard')}>Leaderboard</A>
              </li>
            </Show>
            <Show when={isAdmin()}>
              <li>
                <A href="/admin/xp" class={navLink("/admin")}>Admin</A>
              </li>
            </Show>
          </ul>

          {/* MOBILE NAV */}
          <div class="md:hidden">
            <button
              aria-label="Open menu"
              class="rounded-md p-2 text-zinc-300 hover:bg-zinc-700 transition"
              onClick={() => setMobileNavOpen(v => !v)}
            >
              ☰
            </button>
          </div>

          <Show when={mobileNavOpen()}>
            <div
              class="fixed inset-x-0 top-14 z-40
                    border-b border-zinc-800
                    bg-zinc-900/95 backdrop-blur
                    shadow-lg"
            >
              <nav class="mx-auto max-w-7xl px-4 py-4 space-y-1">
                {/* PRIMARY LINKS */}
                <A
                  href="/"
                  onClick={() => setMobileNavOpen(false)}
                  class="block rounded-lg px-4 py-3 text-base font-medium
                        text-zinc-100 hover:bg-zinc-800 transition"
                >
                  Home
                </A>

                <Show when={user()}>
                  <A
                    href="/profile"
                    onClick={() => setMobileNavOpen(false)}
                    class="block rounded-lg px-4 py-3 text-base font-medium
                          text-zinc-100 hover:bg-zinc-800 transition"
                  >
                    Profile
                  </A>
                </Show>

                <Show when={isMember()}>
                  <A
                    href="/leaderboard"
                    onClick={() => setMobileNavOpen(false)}
                    class="block rounded-lg px-4 py-3 text-base font-medium
                          text-zinc-100 hover:bg-zinc-800 transition"
                  >
                    Leaderboard
                  </A>
                </Show>

                <Show when={isAdmin()}>
                  <div class="pt-2 mt-2 border-t border-zinc-800">
                    <A
                      href="/admin/xp"
                      onClick={() => setMobileNavOpen(false)}
                      class="block rounded-lg px-4 py-3 text-base font-medium
                            text-indigo-400 hover:bg-zinc-800 transition"
                    >
                      Admin
                    </A>
                  </div>
                </Show>
              </nav>
            </div>
          </Show>

          <div>
            <Suspense fallback={null}>
              <Show
                when={user()}
                fallback={
                  <button
                    onClick={() => (window.location.href = import.meta.env.DEV ? `${Address.LOCALHOSTNUMBACK}/auth` : `${Address.BACKEND}/auth`)}
                    class="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium
                          text-white transition hover:bg-indigo-400 active:bg-indigo-600"
                  >
                    Login with Discord
                  </button>
                }
              >
                <UserMenu user={user()!} />
              </Show>
            </Suspense>
          </div>

        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main class="mx-auto max-w-7xl px-4 py-4 md:py-8">
        <Suspense fallback={<p class="text-zinc-400">Loading…</p>}>
          {props.children}
        </Suspense>
      </main>
    </div>
  );
};

export default App;
