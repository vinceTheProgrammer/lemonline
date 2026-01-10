import { Route } from '@sapphire/plugin-api';
import { fetchChannelXpConfigs } from '../../../services/xpConfig';

export class XpChannelsRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    const channels = await fetchChannelXpConfigs();
    return response.ok(channels);
  }
}
