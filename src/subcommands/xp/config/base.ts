import type { Command } from "@sapphire/framework";
import { CategoryChannel, ChannelType, MessageFlags, type SlashCommandSubcommandGroupBuilder } from "discord.js";
import { handleCommandError } from "../../../utils/errors.js";
import { ErrorType } from "../../../constants/errors.js";
import { setChannelBaseXp } from "../../../services/xpConfig.js";
import { CustomError } from "../../../utils/custom-error.js";

export function scXpConfigBase(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('channel-base')
            .setDescription('Set base xp gained when specified user event occurs in the specified channel.')
            .addIntegerOption((option) => 
                option.setName('amount').setDescription('Amount of xp to award when the specified event occurs.').setRequired(true))
            .addStringOption(option => 
                option.addChoices([
                {
                    name: "Message Create",
                    value: "messageCreate"
                },
                {
                    name: "Thread/Post Create",
                    value: "threadCreate"
                }
            ])
                .setName("event")
                .setDescription("The event to award xp upon.")
                .setRequired(false))
            .addChannelOption(option =>
                option.setName("channel")
                .setDescription("Channel to apply this base xp setting to. Category channel will apply to all subchannels.")
                .setRequired(false)
            )
        )
}

export async function chatInputBaseReal(interaction: Command.ChatInputCommandInteraction) {
    try {
            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            let channel = interaction.options.getChannel('channel');
            let amount = interaction.options.getInteger('amount', true);
            let event = interaction.options.getString('event');

            if (!channel) {
                const interactionChannel = interaction.channel;
                if (!interactionChannel) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not defined.", ErrorType.Error);
                if (!(interactionChannel.type == ChannelType.GuildText)) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not a guild text channel.", ErrorType.Error);
                channel = interactionChannel;
            }

            const multipleChannels: string[] = [];
        
            if (!event || event == null) {
                if (channel.type == ChannelType.GuildForum) {
                    event = "threadCreate";
                } else if (channel.type == ChannelType.GuildCategory) {
                    (channel as CategoryChannel).children.cache.forEach(async child => {
                        if (child.type == ChannelType.GuildForum) {
                            multipleChannels.push(child.id);
                            await applyEvent(child.id, amount, "threadCreate");
                        } else if (child.type == ChannelType.GuildText) {
                            multipleChannels.push(child.id);
                            await applyEvent(child.id, amount, "messageCreate");
                        }                    })
                } else if (channel.type == ChannelType.GuildText){
                    event = "messageCreate";
                    await applyEvent(channel.id, amount, event);
                }
            } else {
                if (channel.type == ChannelType.GuildCategory) {
                    (channel as CategoryChannel).children.cache.forEach(async child => {
                        multipleChannels.push(child.id);
                        await applyEvent(child.id, amount, event ?? "messageCreate");
                    })
                } else {
                    await applyEvent(channel.id, amount, event);
                }
            }
            
            if (multipleChannels.length > 0) {
                let channelsString = '';
                for (let i = 0; i < multipleChannels.length; i++) {
                    channelsString += `- <#${multipleChannels[i]}>` + '\n';
                }
                if (!event) {
                    return interaction.editReply({ content: `Successfully set **${amount}** xp per default event for the following channels:\n${channelsString}`});
                } else {
                    return interaction.editReply({ content: `Successfully set **${amount}** xp per ${event} event for the following channels:\n${channelsString}`});
                }
            } else {
                return interaction.editReply({ content: `Successfully set **${amount}** xp per ${event} in <#${channel.id}>.`});
            }
        } catch (error) {
            handleCommandError(interaction, error);
            return;
        }
}

async function applyEvent(channelId: string, amount: number, event: string) {
    try {
        const typeGuardedEvent = event == 'messageCreate' || event == 'threadCreate' ? event : 'messageCreate';
        await setChannelBaseXp({channelId, event: typeGuardedEvent, amount});
    } catch (error) {
        throw error
    }
}
