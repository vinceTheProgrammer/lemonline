import { Route } from '@sapphire/plugin-api';
import { fetchServerXpConfig } from '../../../services/xpConfig';

export class XpServerRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    const config = await fetchServerXpConfig();

    if (!config) {
      return response.notFound('Server XP config not found');
    }

    return response.ok(config);
  }
}
