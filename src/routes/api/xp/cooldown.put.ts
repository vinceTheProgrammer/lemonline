import { Route } from '@sapphire/plugin-api';
import { setServerCooldown } from '../../../services/xpConfig';
import { requireAdmin } from '../../../lib/requireAdmin';

export class XpServerCooldownRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await requireAdmin(request, response))) return;

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
