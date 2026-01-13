import { Route } from '@sapphire/plugin-api';
import { setServerCooldown } from '../../../services/xpConfig';
import { isAdmin } from '../../../lib/isAdmin';

export class XpServerCooldownRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await isAdmin(request))) {
      return response.unauthorized();
    }

    const body = await request.readBodyJson() as { seconds?: number };

    if (typeof body.seconds !== 'number' 
        // || body.seconds < 0
    ) {
      return response.badRequest('Invalid cooldown value');
    }

    await setServerCooldown(body.seconds);
    return response.ok();
  }
}
