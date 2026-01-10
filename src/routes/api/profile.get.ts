import { Route } from '@sapphire/plugin-api';
import { requireAdmin } from '../../lib/requireAdmin';
import { GuildId } from '../../constants/guilds';
import { findByDiscordId } from '../../utils/database';
import { getLevelFromXp, getTotalXp } from '../../utils/xp';


function getXpProgress(xp: number, level: number) {
  const currentLevelXp = getTotalXp(level);
  const nextLevelXp = getTotalXp(level + 1);

  const intoLevel = xp - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;

  const percent = Math.min(100, Math.max(0, (intoLevel / needed) * 100));

  return {
    intoLevel,
    needed,
    percent
  };
}

export class ProfileRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    const auth = _request.auth;
    if (auth) {
      const user = await this.container.client.users.fetch(auth.id);
      const member = await this.container.client.guilds.cache.get(GuildId.LemonlineStudios)?.members.fetch(user.id);

      const isMember = member ? true : false;
      const avatar = user.avatarURL();
      const username = user.username;
      const id = user.id;
      const roles = [];
      const joinDate = member?.joinedAt || null;
      const databaseUser = await findByDiscordId(user.id);
      const xp = databaseUser ? databaseUser.xp : null;
      const level = xp ? getLevelFromXp(xp) : null;
      const messageCount = databaseUser ? databaseUser.messageCount : null;
      const xpProgress = xp && level ? getXpProgress(xp, level) : null;
      
      const adminCheckResult = await requireAdmin(_request, response);

      if (adminCheckResult) roles.push('admin');

      const profile = {
        avatar,
        username,
        id,
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
    else return response.unauthorized();
  }
}