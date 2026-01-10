import { A, useNavigate } from "@solidjs/router";
import { createSignal, onCleanup } from "solid-js";
import { apiUri } from "../api/xp";
import { bumpAuth } from "../auth";

export function UserMenu(props: {
  user: { avatar: string; username: string};
}) {
  const [open, setOpen] = createSignal(false);
  let menuRef: HTMLDivElement | undefined;

  // Close menu when clicking outside
  const onClickOutside = (e: MouseEvent) => {
    if (menuRef && !menuRef.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  document.addEventListener("click", onClickOutside);
  onCleanup(() => document.removeEventListener("click", onClickOutside));

  const navigate = useNavigate();

  return (
    <div ref={menuRef} class="relative">
      {/* Avatar button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open());
        }}
        class="rounded-full focus:outline-none"
      >
        <img
          src={props.user.avatar ?? "/default-avatar.png"}
          alt={props.user.username}
          class="h-9 w-9 rounded-full border border-zinc-700
                 hover:ring-2 hover:ring-indigo-400 transition"
        />
      </button>

      {/* Dropdown */}
      {open() && (
        <div
          class="absolute right-0 mt-2 w-48
                 rounded-md border border-zinc-800 bg-zinc-900 shadow-lg
                 z-50"
        >
          <div class="px-4 py-3 text-sm text-zinc-300 truncate">
            {props.user.username}
          </div>

          <div class="border-t border-zinc-800">
            <A
              href="/profile"
              class="block px-4 py-2 text-sm text-zinc-200
                     hover:bg-zinc-800 transition"
              onClick={() => setOpen(false)}
            >
              Profile
            </A>

            <button
              class="w-full px-4 py-2 text-left text-sm text-red-400
                     hover:bg-zinc-800 transition"
              onClick={async () => {
                await fetch(apiUri('logout'), {
                  method: "POST",
                  credentials: "include"
                });
                bumpAuth(v => v + 1);
                navigate("/", { replace: true });
              }}
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}