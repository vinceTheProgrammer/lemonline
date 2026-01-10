import { Route } from '@sapphire/plugin-api';
import { requireAdmin } from '../../../../lib/requireAdmin';
import { addXp } from '../../../../utils/database';
import { GuildId } from '../../../../constants/guilds';

export class MemberXpAddRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await requireAdmin(request, response))) return;

    const body = await request.readBodyJson() as {
      userId: string;
      amount: number;
    };

    const guild = await this.container.client.guilds.fetch(GuildId.LemonlineStudios);

    await addXp(body.userId, body.amount, guild);
    
    return response.ok();
  }
}
