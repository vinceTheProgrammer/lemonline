// backend/routes/auth.ts
import { Route } from "@sapphire/plugin-api";

export class LogoutRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    response.cookies.remove("SAPPHIRE_AUTH");
    response.status(205);
    response.end();
  }
}
