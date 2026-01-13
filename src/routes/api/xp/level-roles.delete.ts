import { Route } from '@sapphire/plugin-api';
import { isAdmin } from '../../../lib/isAdmin';
import { removeLevelRole } from '../../../services/xpConfig';

export class XpLevelRoleDeleteRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await isAdmin(request))) {
      return response.unauthorized();
    }

    const body = await request.readBodyJson() as {
      level?: number;
      roleId?: string;
    };

    if (typeof body.level !== 'number' || !body.roleId) {
      return response.badRequest('level and roleId required');
    }

    await removeLevelRole({ level: body.level, roleId: body.roleId });
    return response.noContent();
  }
}
