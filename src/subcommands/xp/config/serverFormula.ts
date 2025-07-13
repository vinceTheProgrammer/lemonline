import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags, ChannelType } from "discord.js";
import { ErrorType } from "../../../constants/errors.js";
import { setChannelMultiplier } from "../../../utils/database.js";
import { CustomError, handleCommandError } from "../../../utils/errors.js";
import { getDiscordRelativeTime } from "../../../utils/format.js";
import { parseRelativeDate } from "../../../utils/time.js";

export function scXpConfigServerFormula(builder: SlashCommandSubcommandGroupBuilder) {
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

export async function chatInputServerFormulaReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        let channel = interaction.options.getChannel('channel');
        let multiplier = interaction.options.getNumber('multiplier', true);
        let expiration = interaction.options.getString('expiration');

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        if (!channel) {
            const interactionChannel = interaction.channel;
            if (!interactionChannel) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not defined.", ErrorType.Error);
            if (!(interactionChannel.type == ChannelType.GuildText)) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not a guild text channel.", ErrorType.Error);
            channel = interactionChannel;
        }

        let expirationString = '';
        let expirationDate = undefined;
        if (expiration) {
            expirationDate = parseRelativeDate(expiration);
            expirationString = `\nThis boost is set to expire ${getDiscordRelativeTime(expirationDate)}`;
        }

        await setChannelMultiplier(channel.id, multiplier, expirationDate);

        return interaction.editReply({ content: `Successfully set **${multiplier}**x multiplier for all xp gain in <#${channel.id}>.${expirationString}`});
    } catch (error) {
        handleCommandError(interaction, error);
    }
}