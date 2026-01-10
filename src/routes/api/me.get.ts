import { Route } from '@sapphire/plugin-api';
import { requireAdmin } from '../../lib/requireAdmin';

export class MeRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    const auth = _request.auth;
    if (auth) {
      const user = await this.container.client.users.fetch(auth.id);

      const avatar = user.avatarURL();
      const username = user.username;
      const id = user.id;
      const roles = [];
      
      const adminCheckResult = await requireAdmin(_request, response);

      if (adminCheckResult) roles.push('admin');

      return response.ok({
        avatar,
        username,
        id,
        roles,
      });
    }
    else return response.unauthorized();
  }
}