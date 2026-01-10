import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags, ChannelType } from "discord.js";
import { ErrorType } from "../../../constants/errors.js";
import { getChannelXpSettings } from "../../../utils/database.js";
import { getChannelXpSettingsEmbed } from "../../../utils/embeds.js";
import { handleCommandError } from "../../../utils/errors.js";
import { CustomError } from "../../../utils/custom-error.js";

export function scXpSummaryChannel(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('channel')
            .setDescription('Summary of a channel\'s xp settings.')
            .addChannelOption((option) => 
                option.setName('channel').setDescription('Channel to get the xp settings of.').setRequired(false))
        )
}

export async function chatInputChannelReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        let channel = interaction.options.getChannel('channel');

        if (!channel) {
            const interactionChannel = interaction.channel;
            if (!interactionChannel) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not defined.", ErrorType.Error);
            if (!(interactionChannel.type == ChannelType.GuildText)) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not a guild text channel.", ErrorType.Error);
            channel = interactionChannel;
        }

        const channelXpSettings = await getChannelXpSettings(channel.id);

        const embed = await getChannelXpSettingsEmbed(channelXpSettings);

        return interaction.editReply({ embeds: [embed]});
    } catch (error) {
        handleCommandError(interaction, error);
        return;
    }
}