import { Route } from '@sapphire/plugin-api';
import { fetchFullXpConfigWeb } from '../../../services/xpConfig';
import { XpConfig } from '../../../types/xp';

export class FullXpConfigRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    try {
        const fullXpConfig : XpConfig = await fetchFullXpConfigWeb();
        return response.ok(fullXpConfig);
    } catch (error) {
        return response.error(JSON.stringify(error));
    }
  }
}