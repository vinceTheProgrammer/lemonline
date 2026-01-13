// lib/isMember.ts
import type { Route } from '@sapphire/plugin-api';
import type { Guild } from 'discord.js';

export async function isMember(
  request: Route.Request,
  guild: Guild
): Promise<boolean> {
  const auth = request.auth;
  if (!auth) return false;

  try {
    await guild.members.fetch(auth.id);
    return true;
  } catch {
    return false;
  }
}
