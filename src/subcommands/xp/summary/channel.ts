import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags, ChannelType } from "discord.js";
import { ErrorType } from "../../../constants/errors.js";
import { getChannelXpSettings } from "../../../utils/database.js";
import { getChannelXpSettingsEmbed } from "../../../utils/embeds.js";
import { CustomError, handleCommandError } from "../../../utils/errors.js";

export function scXpSummaryChannel(builder: SlashCommandSubcommandGroupBuilder) {
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

export async function chatInputChannelReal(interaction: Command.ChatInputCommandInteraction) {
    try {
                let channel = interaction.options.getChannel('channel');
    
                await interaction.deferReply({flags: [MessageFlags.Ephemeral]});
    
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
            }
}