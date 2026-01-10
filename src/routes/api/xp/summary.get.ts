import { Route } from '@sapphire/plugin-api';
import { fetchXpSummary } from '../../../services/xpConfig';

export class XpSummaryRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    const data = await fetchXpSummary();
    return response.ok(data);
  }
}
