import type { Command } from "@sapphire/framework";
import { CategoryChannel, ChannelType, MessageFlags, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { CustomError, handleCommandError } from "../../../utils/errors.js";
import { getDiscordRelativeTime } from "../../../utils/format.js";
import { parseRelativeDate } from "../../../utils/time.js";
import { setChannelMultiplier } from "../../../utils/database.js";
import { ErrorType } from "../../../constants/errors.js";

export function scXpConfigBoost(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command.setName('channel-boost').setDescription('Set an xp gain multiplier within the specified channel.')
            .addNumberOption((option) =>
                option.setName('multiplier').setDescription('Number to multiply all xp gain by. Xp gain is rounded to nearest integer.').setRequired(true)
            )
            .addChannelOption((option) =>
                option.setName('channel').setDescription('Channel to apply this base xp setting to. Category channel will apply to all subchannels.').setRequired(false)
                )
            .addStringOption((option) => 
            option.setName('expiration').setDescription("How long this multiplier will last before resetting to 1x.").setRequired(false)
        ))
}

export async function chatInputBoostReal(interaction: Command.ChatInputCommandInteraction) {
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
        let expirationDate = null;
        if (expiration) {
            expirationDate = parseRelativeDate(expiration);
            expirationString = `\nset to expire ${getDiscordRelativeTime(expirationDate)} `;
        }

        const multipleChannels: string | any[] = [];
        const promises : Promise<void>[] = [];

        if (channel.type == ChannelType.GuildCategory) {
            (channel as CategoryChannel).children.cache.forEach(child => {
                promises.push(
                    new Promise(async res => {
                        if (child.type == ChannelType.GuildText || child.type == ChannelType.GuildForum) {
                            await setChannelMultiplier(child.id, multiplier, expirationDate);
                            multipleChannels.push(child.id);
                        }
                        res();
                    })
                )
            })
        } else {
            await setChannelMultiplier(channel.id, multiplier, expirationDate);
        }

        await Promise.all(promises);

        if (multipleChannels.length > 0) {
            let channelsString = '';
            for (let i = 0; i < multipleChannels.length; i++) {
                channelsString += `- <#${multipleChannels[i]}>` + '\n';
            }
            return interaction.editReply({ content: `Successfully set **${multiplier}**x multiplier for all xp gain ${expirationString}in the following channels:\n${channelsString}`});
        } else {
            return interaction.editReply({ content: `Successfully set **${multiplier}**x multiplier for all xp gain in <#${channel.id}>.${expirationString}`});
        }
    } catch (error) {
        handleCommandError(interaction, error);
    }
}