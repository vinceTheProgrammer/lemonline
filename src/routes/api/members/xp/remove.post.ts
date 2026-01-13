import { Route } from '@sapphire/plugin-api';
import { isAdmin } from '../../../../lib/isAdmin';
import { removeXp } from '../../../../utils/database';
import { GuildId } from '../../../../constants/guilds';

export class MemberXpRemoveRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await isAdmin(request))) {
      return response.unauthorized();
    }

    const body = await request.readBodyJson() as {
      userId: string;
      amount: number;
    };

    const guild = await this.container.client.guilds.fetch(GuildId.LemonlineStudios);

    await removeXp(body.userId, body.amount, guild);
    
    return response.ok();
  }
}