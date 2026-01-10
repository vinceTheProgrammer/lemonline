import type { Route } from '@sapphire/plugin-api';
import { PermissionsBitField } from 'discord.js';
import { GuildId } from '../constants/guilds.js';
import { container } from '@sapphire/framework';
import { RoleId } from '../constants/roles.js';

export async function requireAdmin(
  request: Route.Request,
  response: Route.Response
) {
  const auth = request.auth;
  if (!auth?.id) {
    response.unauthorized();
    return null;
  }

  const guild = container.client.guilds.cache.get(GuildId.LemonlineStudios);
  if (!guild) {
    response.notFound('Guild not found');
    return null;
  }

  const member = await guild.members.fetch(auth.id).catch(() => null);
  if (!member) {
    response.forbidden('Not a member of this guild');
    return null;
  }

  if (!member.permissions.has(PermissionsBitField.Flags.Administrator) && !member.roles.cache.has(RoleId.Admin)) {
    response.forbidden('Admin permissions required');
    return null;
  }

  return member;
}
