import { Route } from '@sapphire/plugin-api';
import { requireAdmin } from '../../../../lib/requireAdmin';
import { setXp } from '../../../../utils/database';
import { getTotalXp } from '../../../../utils/xp';
import { GuildId } from '../../../../constants/guilds';

export class MemberLevelSetRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await requireAdmin(request, response))) return;

    const body = await request.readBodyJson() as {
      userId: string;
      level: number;
    };

    const xp = getTotalXp(body.level);

    const guild = await this.container.client.guilds.fetch(GuildId.LemonlineStudios);

    await setXp(body.userId, xp, guild);
    
    return response.ok();
  }
}