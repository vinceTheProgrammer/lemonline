import { Route } from '@sapphire/plugin-api';
import { isAdmin } from '../../../lib/isAdmin';
import { searchMembers } from '../../../utils/database';
import { GuildId } from '../../../constants/guilds';
import { getLevelFromXp } from '../../../utils/xp';

export class LeaderboardRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await isAdmin(request))) {
      return response.unauthorized();
    }
    
    const params = request.query;

    let q = params["q"];

    if (Array.isArray(q)) q = q.join("");

    const qTrimmed = q.trim();

    if (!qTrimmed || qTrimmed.length < 2) return [];

    const guild = await this.container.client.guilds.fetch(GuildId.LemonlineStudios);

    const users = await searchMembers(qTrimmed, guild);

    const mappedWebResponse = await Promise.all(users.map(async user => {
        const discordMember = await guild.members.fetch(user.discordId);
        const discordUser = discordMember.user;
        const username = discordUser.username;
        const avatar = discordUser.avatarURL();
        return {
            id: user.discordId,
            username,
            avatar: avatar,
            xp: user.xp,
            level: getLevelFromXp(user.xp)
        }
    }));

    return response.json(mappedWebResponse);
  }
}