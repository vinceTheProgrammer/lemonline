import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags } from "discord.js";
import { handleCommandError } from "../../../utils/errors.js";
import { handlePrintLevelsInteraction } from "../../../utils/interactions.js";

export function scXpSummaryLevels(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('channel-boost')
            .setDescription('Set xp gain multiplier for when any user event occurs in the specified channel.')
            .addNumberOption((option) => 
                option.setName('multiplier').setDescription('Number to multiply all xp gain by. Xp gain is rounded to nearest integer.').setRequired(true))
            .addChannelOption(option =>
                option.setName("channel")
                .setDescription("Channel to apply this xp multiplier to. Category channel will apply to all subchannels.")
                .setRequired(false)
            )
            .addStringOption(option =>
                option.setName("")
            )
        )
}

export async function chatInputLevelsReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        const level = interaction.options.getNumber('level');

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        if (level)
            await handlePrintLevelsInteraction(interaction, level);
        else
            await handlePrintLevelsInteraction(interaction, 100);
    } catch (error) {
        handleCommandError(interaction, error);
    }
}