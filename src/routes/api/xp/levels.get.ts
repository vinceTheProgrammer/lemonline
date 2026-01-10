import { Route } from '@sapphire/plugin-api';
import { getLevelMappingsRounded } from '../../../utils/xp';

export class XpLevelsRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    const levelMappings = getLevelMappingsRounded(25);
    return response.ok(levelMappings);
  }
}
