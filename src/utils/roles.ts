import type { Guild, GuildMember } from "discord.js";
import { handleGenericError } from "./errors.js";
import { ErrorType } from "../constants/errors.js";
import { RoleId } from "../constants/roles.js";
import type { User } from "@prisma/client";
import { getRoleDeltaForLevelChange } from "./database.js";
import { getLevelFromXp } from "./xp.js";
import { CustomError } from "./custom-error.js";

export async function verifyMember(discordMember: GuildMember) {
    try {
        await discordMember.roles.add(RoleId.Member);
        await discordMember.roles.remove(RoleId.Unverified);
    } catch (error) {
        throw new CustomError(`Failed to remove Unverified role or add Member role from/to <@${discordMember.id}>`, ErrorType.Error, error as Error);
    }
}

export async function updateUserRoles(
  user: User,
  oldXp: number,
  guild: Guild
) {
  try {
    const oldLevel = getLevelFromXp(oldXp);
    const newLevel = getLevelFromXp(user.xp);

    // No level change → nothing to do
    if (oldLevel === newLevel) return;

    const { add, remove } = await getRoleDeltaForLevelChange(
      oldLevel,
      newLevel
    );

    if (add.length === 0 && remove.length === 0) return;

    // Fetch guild member
    const member = await guild.members.fetch(user.discordId);
    if (!member) return;

    // Filter roles that actually exist & avoid redundant operations
    const rolesToAdd = add.filter(
      roleId =>
        guild.roles.cache.has(roleId) &&
        !member.roles.cache.has(roleId)
    );

    const rolesToRemove = remove.filter(
      roleId =>
        guild.roles.cache.has(roleId) &&
        member.roles.cache.has(roleId)
    );

    // Apply changes
    if (rolesToAdd.length > 0) {
      await member.roles.add(rolesToAdd, "Level-up role update");
    }

    if (rolesToRemove.length > 0) {
      await member.roles.remove(rolesToRemove, "Level-down role update");
    }

  } catch (error) {
    handleGenericError(
      new CustomError(
        `Failed to update roles of ${user.discordId}.`,
        ErrorType.Error,
        error as Error
      )
    );
  }
}
