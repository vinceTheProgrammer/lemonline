import { Route } from '@sapphire/plugin-api';
import { fetchLevelRoles } from '../../../services/xpConfig';

export class XpLevelRolesRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    const roles = await fetchLevelRoles();
    return response.ok(roles);
  }
}
