import { Route } from '@sapphire/plugin-api';
import { setLevelFormula } from '../../../services/xpConfig';
import { requireAdmin } from '../../../lib/requireAdmin';

export class XpServerFormulaRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    if (!(await requireAdmin(request, response))) return;

    const body = await request.readBodyJson() as { formula?: string };

    if (!body.formula) {
      return response.badRequest('Formula is required');
    }

    await setLevelFormula(body.formula);
    return response.ok();
  }
}
