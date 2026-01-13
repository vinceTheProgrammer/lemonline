import type { Route } from '@sapphire/plugin-api';
import { PermissionsBitField } from 'discord.js';
import { GuildId } from '../constants/guilds.js';
import { container } from '@sapphire/framework';
import { RoleId } from '../constants/roles.js';

export async function isAdmin(
  request: Route.Request
) {
  try {
    const auth = request.auth;
    if (!auth?.id) {
      return false;
    }

    const guild = container.client.guilds.cache.get(GuildId.LemonlineStudios);
    if (!guild) {
      return false;
    }

    const member = await guild.members.fetch(auth.id).catch(() => null);
    if (!member) {
      return false;
    }

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator) && !member.roles.cache.has(RoleId.Admin)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
  
}
