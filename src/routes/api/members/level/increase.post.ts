import { Route } from '@sapphire/plugin-api';
import { requireAdmin } from '../../../../lib/requireAdmin';
import { findByDiscordId, setXp } from '../../../../utils/database';
import { getLevelFromXp, getTotalXp } from '../../../../utils/xp';
import { GuildId } from '../../../../constants/guilds';

export class MemberLevelIncreaseRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await requireAdmin(request, response))) return;

    const body = await request.readBodyJson() as {
      userId: string;
    };

    const dbUser = await findByDiscordId(body.userId);

    if (!dbUser) return response.error("user not found in database :(");

    const userXp = dbUser.xp;

    const level = getLevelFromXp(userXp);

    const xp = getTotalXp(level + 1);

    const guild = await this.container.client.guilds.fetch(GuildId.LemonlineStudios);

    await setXp(body.userId, xp, guild);
    
    return response.ok();
  }
}