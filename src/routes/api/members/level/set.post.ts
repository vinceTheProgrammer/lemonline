import { Route } from '@sapphire/plugin-api';
import { isAdmin } from '../../../../lib/isAdmin';
import { setXp } from '../../../../utils/database';
import { getTotalXp } from '../../../../utils/xp';
import { GuildId } from '../../../../constants/guilds';

export class MemberLevelSetRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await isAdmin(request))) {
      return response.unauthorized();
    }

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