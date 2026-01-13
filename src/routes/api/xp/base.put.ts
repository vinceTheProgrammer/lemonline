import { Route } from '@sapphire/plugin-api';
import { isAdmin } from '../../../lib/isAdmin';
import { setChannelBaseXp } from '../../../services/xpConfig';

export class XpChannelBaseRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await isAdmin(request))) {
      return response.unauthorized();
    }
    
    const body = await request.readBodyJson() as {
      channelId?: string;
      event?: 'messageCreate' | 'threadCreate';
      amount?: number;
    };

    if (!body.channelId || typeof body.amount !== 'number') {
      return response.badRequest('channelId and amount are required');
    }

    await setChannelBaseXp({
      channelId: body.channelId,
      event: body.event ?? 'messageCreate',
      amount: body.amount
    });

    return response.ok();
  }
}
