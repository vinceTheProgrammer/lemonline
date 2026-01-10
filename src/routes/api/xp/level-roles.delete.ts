import { Route } from '@sapphire/plugin-api';
import { requireAdmin } from '../../../lib/requireAdmin';
import { removeLevelRole } from '../../../services/xpConfig';

export class XpLevelRoleDeleteRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await requireAdmin(request, response))) return;

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
