import { MessageFlags, type GuildMember, type ModalSubmitInteraction } from "discord.js";
import { verifyMember } from "./roles.js";
import { container, type Command } from "@sapphire/framework";
import { CustomError } from "./errors.js";
import { ErrorMessage, ErrorType } from "../constants/errors.js";
import { getLevelEmbed } from "./embeds.js";
import type { Prisma } from "@prisma/client";
import { getLevelRolesByLevel, updateIntroByDiscordIdAndIntro } from "./database.js";
import { getLevelFromXp, getTotalXp, totalXpFormula, xpCache } from "./xp.js";
import { truncateString } from "./format.js";

export async function formatIntroModalSubmit(interaction: ModalSubmitInteraction, intro: Prisma.IntroUpdateInput) {
    try {
        await updateIntroByDiscordIdAndIntro(interaction.user.id, intro);
    } catch (error) {
        throw error;
    }
}

export async function handleLevelInteraction(interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction, userId: string) {
    try {
        const guild = interaction.guild;

        if (!guild) throw new CustomError(ErrorMessage.GuildNotDefined, ErrorType.Error, null);

        const member = guild.members.cache.get(userId);

        if (!member) throw new CustomError(ErrorMessage.MemberNotDefined, ErrorType.Error, null);

        const embed = await getLevelEmbed(member);

        await interaction.editReply({embeds: [embed]});
    } catch (error) {
        throw error;
    }
}

export async function handlePrintLevelsInteraction(interaction: Command.ChatInputCommandInteraction, level: number) {
    try {
        const totalXp = totalXpFormula(level);
        getLevelFromXp(totalXp);
        const levelMappings = xpCache;
        const levelsStringArr: string[] = [];
        const promises: Promise<void>[] = [];
        levelMappings.forEach((xp, level_) => {
            promises.push(
                new Promise<void>(async res => {
                    let levelRoles = await getLevelRolesByLevel(level_);
                    let gainedRoles = levelRoles.filter(role => role.gained).map(role => truncateString(container.client.guilds.cache.get('1376370662360481812')?.roles.cache.get(role.roleId)?.name ?? '!!!', 4)).map(str => '+' + str);
                    let lostRoles = levelRoles.filter(role => !role.gained).map(role => truncateString(container.client.guilds.cache.get('1376370662360481812')?.roles.cache.get(role.roleId)?.name ?? '!!!', 4)).map(str => '-' + str);

                    let allRoles = gainedRoles.concat(lostRoles);

                    let rolesString = allRoles.join(", ");

                    if (level_ <= level) levelsStringArr[level_] = (`**Lvl ${level_} - ${xp}**${rolesString.length > 0 ? '\n' : ''}${rolesString}\n`);

                    res();
                })
            )
        });

        await Promise.all(promises);

        const levelsString = levelsStringArr.join('');

        await interaction.editReply({content: levelsString });
    } catch (error) {
        throw error;
    }
}