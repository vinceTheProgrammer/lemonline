import { Route } from '@sapphire/plugin-api';
import { setLevelRole } from '../../../services/xpConfig';
import { isAdmin } from '../../../lib/isAdmin';

export class XpLevelRoleCreateRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await isAdmin(request))) {
      return response.unauthorized();
    }

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
