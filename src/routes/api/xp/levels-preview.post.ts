import { Route } from '@sapphire/plugin-api';
import { previewLevelMappingsSafe } from '../../../utils/xp';

export class XpPreviewRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    const { formula, maxLevel = 50 } = await request.readBodyJson() as {
      formula: string;
      maxLevel?: number;
    };

    const result = previewLevelMappingsSafe(formula, maxLevel);
    return response.ok(result);
  }
}
