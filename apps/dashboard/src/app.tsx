import { createMemo, Show, Suspense, type Component } from 'solid-js';
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

  const navigate = useNavigate();

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

          <ul class="flex items-center gap-1">
            <li>
              <A href="/" class={navLink('/')}>Home</A>
            </li>
            <Show when={user()}>
              <li>
              <A href="/profile" class={navLink('/profile')}>Profile</A>
              </li>
            </Show>
            <Show when={user()}>
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

          <div>
            <Suspense fallback={null}>
              <Show
                when={user()}
                fallback={
                  <button
                    onClick={() => (window.location.href = `${Address.BACKEND}/auth`)}
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
      <main class="mx-auto max-w-7xl px-4 py-8">
        <Suspense fallback={<p class="text-zinc-400">Loading…</p>}>
          {props.children}
        </Suspense>
      </main>
    </div>
  );
};

export default App;
