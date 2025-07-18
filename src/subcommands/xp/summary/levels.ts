import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags } from "discord.js";
import { handleCommandError } from "../../../utils/errors.js";
import { handlePrintLevelsInteraction } from "../../../utils/interactions.js";

export function scXpSummaryLevels(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('levels')
            .setDescription('Summary of levels. Useful for visualizing the server level formula.')
            .addIntegerOption((option) => 
                option.setName('level').setDescription('Highest level to print up to.').setRequired(false))
        )
}

export async function chatInputLevelsReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        const level = interaction.options.getInteger('level');

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        if (level)
            await handlePrintLevelsInteraction(interaction, level);
        else
            await handlePrintLevelsInteraction(interaction, 100);
    } catch (error) {
        handleCommandError(interaction, error);
    }
}