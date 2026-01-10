export default function Home() {
  return (
    <section class="mx-auto max-w-3xl space-y-8">
      <header class="space-y-2">
        <h1 class="text-3xl font-semibold tracking-tight">
          Lemonline Studio Bot
        </h1>
        <p class="text-zinc-400">
          A Discord bot with XP, leveling, and future community features.
        </p>
      </header>

      <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6">
        <h2 class="text-lg font-medium mb-3">
          What does the bot do?
        </h2>

        <ul class="list-disc list-inside space-y-1 text-zinc-300">
          <li>XP & leveling system</li>
        </ul>
      </section>

      <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6">
        <h2 class="text-lg font-medium mb-2">
          Anything else?
        </h2>
        <p class="text-zinc-300">
          Not yet — more features coming soon.
        </p>
      </section>

      <section class="rounded-lg border border-zinc-800 bg-zinc-800 p-6">
        <h2 class="text-lg font-medium mb-2">
          Who made this?
        </h2>
        <p class="text-zinc-300">
          Built by <span class="font-medium text-white">Vince</span>
          {" "}(<span class="text-zinc-400">vincetheprogrammer / vincetheanimator</span>).
          Blame all bugs and jank on me 🙂
        </p>
      </section>
    </section>
  );
}
