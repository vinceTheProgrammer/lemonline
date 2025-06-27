import { MessageFlags, type GuildMember, type ModalSubmitInteraction } from "discord.js";
import { verifyMember } from "./roles.js";
import type { Command } from "@sapphire/framework";
import { CustomError } from "./errors.js";
import { ErrorMessage, ErrorType } from "../constants/errors.js";
import { getLevelEmbed } from "./embeds.js";
import type { Prisma } from "@prisma/client";
import { updateIntroByDiscordIdAndIntro } from "./database.js";
import { getLevelFromXp, getTotalXp, totalXpFormula, xpCache } from "./xp.js";

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
        let levelsString = ``;
        levelMappings.forEach((xp, level_) => {
            if (level_ <= level) levelsString += `Level ${level_} - ${xp}\n`;
        });
        await interaction.editReply({content: levelsString });
    } catch (error) {
        throw error;
    }
}