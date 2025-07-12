import { Command } from '@sapphire/framework';
import { ChannelType, ForumChannel, AttachmentBuilder, ChannelFlags, MessageFlags, SlashCommandBuilder, type SlashCommandSubcommandsOnlyBuilder, type SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { CustomError, handleCommandError } from '../utils/errors.js';
import { ErrorType } from '../constants/errors.js';
import { getChannelXpSettingsEmbed, parseEmbeds } from '../utils/embeds.js';
import { getAttachments } from '../utils/attachments.js';
import { parseComponents } from '../utils/components.js';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { addXp, getChannelXpSettings, removeXp, setChannelBaseMessageXp, setChannelBaseThreadXp, setChannelMultiplier, setXp } from '../utils/database.js';
import { parseRelativeDate } from '../utils/time.js';
import { getDiscordRelativeTime } from '../utils/format.js';
import { handlePrintLevelsInteraction } from '../utils/interactions.js';
import { gXpConfig } from '../subcommands/xp/config/config.js';
import { gXpSummary } from '../subcommands/xp/summary/summary.js';
import { gXpUser } from '../subcommands/xp/user/user.js';

export class CreateMessageCommand extends Subcommand {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'xp',
            description: 'Manage various things related to xp.',
            preconditions: ['StaffOnly'],
            subcommands: [
                {
                    name: 'config',
                    type: 'group',
                    entries: [
                        { name: 'channel-base', chatInputRun: 'chatInputBaseMessage' },
                        { name: 'channel-boost', chatInputRun: 'chatInputBoost' },
                        { name: 'level-roles', chatInputRun: 'chatInputBoost' },
                        { name: 'server-cooldown', chatInputRun: 'ciXpCooldown'},
                        { name: 'server-level-formula', chatInputRun: 'ciLevelFormula'},
                    ]
                },
                { 
                    name: 'summary',
                    type: 'group',
                    entries: [
                        { name: 'channel', chatInputRun: 'chatInputChannelSummary' },
                        { name: 'channels', chatInputRun: 'chatInputChannelsSummary' },
                        { name: 'level', chatInputRun: 'chatInputLevelSummary' },
                        { name: 'levels', chatInputRun: 'chatInputLevelsSummary' },
                        { name: 'server', chatInputRun: 'chatInputServerSummary' },
                    ]
                },
                {
                  name: 'user',
                  type: 'group',
                  entries: [
                    { name: 'set', chatInputRun: 'chatInputUserSet' },
                    { name: 'increase', chatInputRun: 'chatInputUserIncrease' },
                    { name: 'decrease', chatInputRun: 'chatInputUserDecrease' }
                  ]
                }
              ]
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) => {
            let finalBuilder : SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder = builder
                .setName(this.name)
                .setDescription(this.description)

            finalBuilder = gXpConfig(finalBuilder);
            finalBuilder = gXpSummary(finalBuilder);
            finalBuilder = gXpUser(finalBuilder);

            return finalBuilder;
        },
                //{ idHints: ['1377120476148662346'] }
        );
    }

    public async chatInputChannelSummary(interaction: Command.ChatInputCommandInteraction) {
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

    public async chatInputBaseMessage(interaction: Command.ChatInputCommandInteraction) {
        try {
            let channel = interaction.options.getChannel('channel');
            let amount = interaction.options.getInteger('amount', true);

            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            if (!channel) {
                const interactionChannel = interaction.channel;
                if (!interactionChannel) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not defined.", ErrorType.Error);
                if (!(interactionChannel.type == ChannelType.GuildText)) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not a guild text channel.", ErrorType.Error);
                channel = interactionChannel;
            }

            await setChannelBaseMessageXp(channel.id, amount);

            return interaction.editReply({ content: `Successfully set **${amount}** xp per message in <#${channel.id}>.`});
        } catch (error) {
            handleCommandError(interaction, error);
        }
    }

    public async chatInputBaseThread(interaction: Command.ChatInputCommandInteraction) {
        try {
            let channel = interaction.options.getChannel('channel');
            let amount = interaction.options.getInteger('amount', true);

            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            if (!channel) {
                const interactionChannel = interaction.channel;
                if (!interactionChannel) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not defined.", ErrorType.Error);
                if (!(interactionChannel.type == ChannelType.GuildText)) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not a guild text channel.", ErrorType.Error);
                channel = interactionChannel;
            }

            await setChannelBaseThreadXp(channel.id, amount);

            return interaction.editReply({ content: `Successfully set **${amount}** xp per post/thread in <#${channel.id}>.`});
        } catch (error) {
            handleCommandError(interaction, error);
        }
    }

    public async chatInputBoost(interaction: Command.ChatInputCommandInteraction) {
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

    public async chatInputUserSet(interaction: Command.ChatInputCommandInteraction) {
        try {
            const user = interaction.options.getUser('user', true);
            const amount = interaction.options.getInteger('amount', true);


            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            await setXp(user.id, amount);

            return interaction.editReply({ content: `Successfully set <@${user.id}>'s xp to ${amount}.`});
        } catch (error) {
            handleCommandError(interaction, error);
        }
    }

    public async chatInputUserIncrease(interaction: Command.ChatInputCommandInteraction) {
        try {
            const user = interaction.options.getUser('user', true);
            const amount = interaction.options.getInteger('amount', true);


            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            const result = await addXp(user.id, amount);

            return interaction.editReply({ content: `Successfully increased <@${user.id}>'s xp by ${amount}. They now have ${result.xp} xp.`});
        } catch (error) {
            handleCommandError(interaction, error);
        }
    }

    public async chatInputUserDecrease(interaction: Command.ChatInputCommandInteraction) {
        try {
            const user = interaction.options.getUser('user', true);
            const amount = interaction.options.getInteger('amount', true);


            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            const result = await removeXp(user.id, amount);

            return interaction.editReply({ content: `Successfully decreased <@${user.id}>'s xp by ${amount}. They now have ${result.xp} xp.`});
        } catch (error) {
            handleCommandError(interaction, error);
        }
    }

    public async chatInputLevelsSummary(interaction: Command.ChatInputCommandInteraction) {
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
}