import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags, ChannelType } from "discord.js";
import { ErrorType } from "../../../constants/errors.js";
import { getLevelRolesByLevel, setChannelMultiplier } from "../../../utils/database.js";
import { CustomError, handleCommandError } from "../../../utils/errors.js";
import { getDiscordRelativeTime } from "../../../utils/format.js";
import { parseRelativeDate } from "../../../utils/time.js";
import { getServerLevelEmbed } from "../../../utils/embeds.js";

export function scXpSummaryLevel(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('level')
            .setDescription('Summary of a specific level.')
            .addIntegerOption((option) => 
                option.setName('level').setDescription('Level to get the summary of.').setRequired(true))
        )
}

export async function chatInputLevelReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        let level = interaction.options.getInteger('level', true);

        const allRoles = await getLevelRolesByLevel(level);
        const gainedRoles = allRoles.filter(role => role.gained).map(role => role.roleId);
        const lostRoles = allRoles.filter(role => !role.gained).map(role => role.roleId);

        const embed = await getServerLevelEmbed(level, gainedRoles, lostRoles);

        return await interaction.editReply({ embeds: [embed]});
    } catch (error) {
        handleCommandError(interaction, error);
    }
}