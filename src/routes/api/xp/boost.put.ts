import { Route } from '@sapphire/plugin-api';
import { requireAdmin } from '../../../lib/requireAdmin';
import { setChannelBoost } from '../../../services/xpConfig';

export class XpChannelBoostRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await requireAdmin(request, response))) return;

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
