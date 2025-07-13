import type { Command } from "@sapphire/framework";
import { ChannelType, MessageFlags, type SlashCommandSubcommandGroupBuilder } from "discord.js";
import { CustomError, handleCommandError } from "../../../utils/errors.js";
import { setChannelBaseMessageXp, setChannelBaseThreadXp } from "../../../utils/database.js";
import { ErrorType } from "../../../constants/errors.js";

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
            let channel = interaction.options.getChannel('channel');
            let amount = interaction.options.getInteger('amount', true);
            let event = interaction.options.getString('event');

            if (!channel) {
                const interactionChannel = interaction.channel;
                if (!interactionChannel) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not defined.", ErrorType.Error);
                if (!(interactionChannel.type == ChannelType.GuildText)) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not a guild text channel.", ErrorType.Error);
                channel = interactionChannel;
            }
        
            if (!event) {
                if (channel.type == ChannelType.GuildForum) {
                    event = "threadCreate";
                } else {
                    event = "messageCreate";
                }
            }

            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            switch (event) {
                case "messageCreate":
                    await setChannelBaseMessageXp(channel.id, amount);
                    break;
                case "threadCreate":
                    await setChannelBaseThreadXp(channel.id, amount);
                    break;
                default:
                    await setChannelBaseMessageXp(channel.id, amount);    
            }
            
            return interaction.editReply({ content: `Successfully set **${amount}** xp per message in <#${channel.id}>.`});
        } catch (error) {
            handleCommandError(interaction, error);
        }
}
