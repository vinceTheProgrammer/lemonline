import { A } from "@solidjs/router";

export default function Admin(props: any) {
  return (
    <div class="flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)] gap-6">
      {/* SIDEBAR */}
      <aside class="w-full md:w-56 shrink-0">
        <h1 class="mb-4 text-lg font-semibold">
          Admin
        </h1>

        <nav class="space-y-1">
          <A
            href="xp"
            class="block rounded-md px-3 py-2 text-sm transition
                   text-zinc-300 hover:bg-zinc-700 hover:text-white"
            activeClass="bg-indigo-500 text-white font-medium"
          >
            XP Config
          </A>

          <A
            href="levels"
            class="block rounded-md px-3 py-2 text-sm transition
                   text-zinc-300 hover:bg-zinc-700 hover:text-white"
            activeClass="bg-indigo-500 text-white font-medium"
          >
            Levels Config
          </A>

          <A
            href="level-roles"
            class="block rounded-md px-3 py-2 text-sm transition
                   text-zinc-300 hover:bg-zinc-700 hover:text-white"
            activeClass="bg-indigo-500 text-white font-medium"
          >
            Level Roles Config
          </A>

          <A
            href="members"
            class="block rounded-md px-3 py-2 text-sm transition
                   text-zinc-300 hover:bg-zinc-700 hover:text-white"
            activeClass="bg-indigo-500 text-white font-medium"
          >
            Member XP Management
          </A>
        </nav>
      </aside>

      {/* CONTENT */}
      <section class="flex-1">
        {props.children}
      </section>
    </div>
  );
}
