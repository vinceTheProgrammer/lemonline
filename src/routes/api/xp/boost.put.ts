import { Route } from '@sapphire/plugin-api';
import { isAdmin } from '../../../lib/isAdmin';
import { setChannelBoost } from '../../../services/xpConfig';

export class XpChannelBoostRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await isAdmin(request))) {
      return response.unauthorized();
    }

    const body = await request.readBodyJson() as {
      channelId?: string;
      multiplier?: number;
      expiresAt?: string | null;
    };

    if (!body.channelId || typeof body.multiplier !== 'number') {
      return response.badRequest('channelId and multiplier are required');
    }

    await setChannelBoost({
        channelId: body.channelId,
        multiplier: body.multiplier,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null
    });

    return response.ok();
  }
}
