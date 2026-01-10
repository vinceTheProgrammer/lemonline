import { Route } from '@sapphire/plugin-api';
import { requireAdmin } from '../../../../lib/requireAdmin';
import { setXp } from '../../../../utils/database';
import { GuildId } from '../../../../constants/guilds';

export class MemberXpSetRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await requireAdmin(request, response))) return;

    const body = await request.readBodyJson() as {
      userId: string;
      xp: number;
    };

    const guild = await this.container.client.guilds.fetch(GuildId.LemonlineStudios);

    await setXp(body.userId, body.xp, guild);
    
    return response.ok();
  }
}
