import { Route } from '@sapphire/plugin-api';
import { DiscordAPIError } from 'discord.js';
import { isAdmin } from '../../lib/isAdmin';
import { GuildId } from '../../constants/guilds';
import { findByDiscordId } from '../../utils/database';
import { getLevelFromXp, getTotalXp } from '../../utils/xp';

function getXpProgress(xp: number, level: number) {
  const currentLevelXp = getTotalXp(level);
  const nextLevelXp = getTotalXp(level + 1);

  const intoLevel = xp - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;

  const percent = Math.min(100, Math.max(0, (intoLevel / needed) * 100));

  return { intoLevel, needed, percent };
}

export class ProfileRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    const auth = request.auth;
    if (!auth) return response.unauthorized();

    const client = this.container.client;

    // Fetch Discord user (always valid if authenticated)
    const user = await client.users.fetch(auth.id);

    const guild = client.guilds.cache.get(GuildId.LemonlineStudios);

    let member = null;

    if (guild) {
      try {
        member = await guild.members.fetch(user.id);
      } catch (error) {
        // Unknown Member = user is not in the guild → normal case
        if (
          error instanceof DiscordAPIError &&
          error.code === 10007
        ) {
          member = null;
        } else {
          // Unexpected error should still surface
          throw error;
        }
      }
    }

    const isMember = Boolean(member);
    const joinDate = member?.joinedAt ?? null;

    const databaseUser = await findByDiscordId(user.id);
    const xp = databaseUser?.xp ?? null;
    const level = xp !== null ? getLevelFromXp(xp) : null;
    const messageCount = databaseUser?.messageCount ?? null;
    const xpProgress =
      xp !== null && level !== null ? getXpProgress(xp, level) : null;

    const roles: string[] = [];

    if (await isAdmin(request)) {
      roles.push('admin');
    }

    const profile = {
      avatar: user.avatarURL(),
      username: user.username,
      id: user.id,
      roles,
      isMember,
      joinDate,
      xp,
      level,
      messageCount,
      xpProgress
    };

    return response.ok(profile);
  }
}
