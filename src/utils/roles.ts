import type { GuildMember } from "discord.js";
import { CustomError } from "./errors.js";
import { ErrorType } from "../constants/errors.js";
import { RoleId } from "../constants/roles.js";
import type { User } from "@prisma/client";

export async function verifyMember(discordMember: GuildMember) {
    try {
        await discordMember.roles.add(RoleId.Member);
        await discordMember.roles.remove(RoleId.Unverified);
    } catch (error) {
        throw new CustomError(`Failed to remove Unverified role or add Member role from/to <@${discordMember.id}>`, ErrorType.Error, error as Error);
    }
}

export async function updateUserRoles(user: User) {
    
}