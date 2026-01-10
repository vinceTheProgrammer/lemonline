import { Route } from '@sapphire/plugin-api';
import { GuildId } from '../../constants/guilds';

export class RolesRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    const roles : {
        id: string,
        name: string
    }[] = await this.container.client.guilds.cache.get(GuildId.LemonlineStudios)?.roles.cache.map(role => {return {id: role.id, name: role.name}}) || [];
    return response.ok(roles);
  }
}
