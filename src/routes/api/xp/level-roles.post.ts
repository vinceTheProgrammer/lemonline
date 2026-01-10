import { Route } from '@sapphire/plugin-api';
import { setLevelRole } from '../../../services/xpConfig';
import { requireAdmin } from '../../../lib/requireAdmin';

export class XpLevelRoleCreateRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await requireAdmin(request, response))) return;

    const body = await request.readBodyJson() as {
      level?: number;
      roleId?: string;
      type?: 'gain' | 'lose';
    };

    if (
      typeof body.level !== 'number' ||
      !body.roleId ||
      (body.type !== 'gain' && body.type !== 'lose')
    ) {
      return response.badRequest('Invalid level role payload');
    }

    await setLevelRole({ level: body.level, roleId: body.roleId, type: body.type });
    return response.created();
  }
}
