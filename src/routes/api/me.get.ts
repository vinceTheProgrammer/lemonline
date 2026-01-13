import { Route } from '@sapphire/plugin-api';
import { isAdmin } from '../../lib/isAdmin';
import { isLemonLineMember } from '../../lib/isLemonLineMember';

export class MeRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    const auth = request.auth;
    if (auth) {
      const user = await this.container.client.users.fetch(auth.id);

      const avatar = user.avatarURL();
      const username = user.username;
      const id = user.id;
      const roles = [];
      
      const adminCheckResult = await isAdmin(request);

      const memberCheckRusult = await isLemonLineMember(request, this.container);

      if (adminCheckResult) roles.push('admin');
      if (memberCheckRusult) roles.push('member');

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