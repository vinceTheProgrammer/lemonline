import { Route } from '@sapphire/plugin-api';
import { fetchChannelXpConfig } from '../../../../services/xpConfig';

export class XpChannelRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    const channelId = request.params.id;

    const channel = await fetchChannelXpConfig(channelId);

    if (!channel) {
      return response.notFound('Channel config not found');
    }

    return response.ok(channel);
  }
}
