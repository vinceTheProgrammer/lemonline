import type { Guild, GuildMember } from "discord.js";
import { handleGenericError, handlePrismaError } from "./errors.js";
import { ErrorType } from "../constants/errors.js";
import { RoleId } from "../constants/roles.js";
import type { User } from "@prisma/client";
import { getAbsoluteRolesAtLevel, getAllLevelRoles } from "./database.js";
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

    if (oldLevel === newLevel) return;

    const { add, remove } = await getRoleDeltaForLevelChange(
      oldLevel,
      newLevel
    );

    if (add.length === 0 && remove.length === 0) return;

    const member = await guild.members.fetch(user.discordId);
    if (!member) return;

    await safeAddRoles(member, add, "Level change role update");
    await safeRemoveRoles(member, remove, "Level change role update");

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

export async function getRoleDeltaForLevelChange(
  oldLevel: number,
  newLevel: number
): Promise<{ add: string[]; remove: string[] }> {
  try {
    if (oldLevel === newLevel) {
      return { add: [], remove: [] };
    }

    const [allRoles, newRoles] = await Promise.all([
      getAllLevelRoles(),
      getAbsoluteRolesAtLevel(newLevel),
    ]);


    const allRolesSet = new Set<string>();
    for (const roleId of allRoles) {
        allRolesSet.add(roleId.roleId);
    }

    const remove = Array.from(setDifference(allRolesSet, newRoles));
    const add = Array.from(newRoles);
    return {
      add,
      remove
    }
  } catch (error) {
    throw handlePrismaError(error);
  }
}

async function safeAddRoles(
  member: GuildMember,
  roleIds: string[],
  reason?: string
) {
  for (const roleId of roleIds) {
    try {
      await member.roles.add(roleId, reason);
    } catch (err) {
      console.warn(`Failed to add ${roleId}:`, err);
    }
  }
}

async function safeRemoveRoles(
  member: GuildMember,
  roleIds: string[],
  reason?: string
) {
  for (const roleId of roleIds) {
    try {
      await member.roles.remove(roleId, reason);
    } catch (err) {
      console.warn(`Failed to remove ${roleId}:`, err);
    }
  }
}


function setDifference<T>(a: Set<T>, b: Set<T>): Set<T> {
  const result = new Set<T>();

  for (const value of a) {
    if (!b.has(value)) {
      result.add(value);
    }
  }

  return result;
}