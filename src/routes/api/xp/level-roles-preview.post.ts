import { Route } from '@sapphire/plugin-api';
import { getLevelMappingsWithRolesRounded } from '../../../utils/xp';
import { GuildId } from '../../../constants/guilds';
import { LevelRoleConfig } from '../../../types/xp';

export class LevelRolesPreviewRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    const { maxLevel = 50, roleConfigs } = await request.readBodyJson() as {
      maxLevel?: number;
      roleConfigs: LevelRoleConfig[];
    };

    if (!Number.isInteger(maxLevel) || maxLevel < 1) {
      return response.json({ ok: false, error: "Invalid maxLevel" });
    }

    const guild = await this.container.client.guilds.fetch(GuildId.LemonlineStudios);
    const roles = guild.roles;

    const result = await getLevelMappingsWithRolesRounded(maxLevel, roles, roleConfigs);

    return response.ok(result);
  }
}
