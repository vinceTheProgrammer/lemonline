// src/routes/api/xp/fullXpConfig.post.ts
import { Route } from '@sapphire/plugin-api';
import { updateFullXpConfigWeb } from '../../../services/xpConfig';
import { XpConfig } from '../../../types/xp';
import { isAdmin } from '../../../lib/isAdmin';

export class FullXpConfigPostRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await isAdmin(request))) {
      return response.unauthorized();
    }

    try {
      const body = (await request.readBodyJson()) as XpConfig;

      await updateFullXpConfigWeb(body, this.container);

      return response.noContent();
    } catch (error) {
      console.log(error);
      return response.error(JSON.stringify(error));
    }
  }
}