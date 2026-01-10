// backend/routes/auth.ts
import { Route } from "@sapphire/plugin-api";
import { randomBytes } from "crypto";

export class AuthRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    // CSRF protection
    const state = randomBytes(16).toString("hex");

    // Store state in a cookie (or session)
    response.cookies.add("oauth_state", state, {
      httpOnly: true
    });

    const params = new URLSearchParams({
      client_id: process.env.BOT_CLIENT_ID!,
      redirect_uri: process.env.BOT_REDIRECT_URI!,
      response_type: "code",
      scope: "identify",
      state,
    });

    const url = `https://discord.com/oauth2/authorize?${params.toString()}`;
    response.status(302);
    response.setHeader("Location", url);
    response.end();
  }
}
