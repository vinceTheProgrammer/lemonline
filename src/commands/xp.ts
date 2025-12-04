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
import { chatInputSetReal } from '../subcommands/xp/user/set.js';
import { chatInputChannelReal } from '../subcommands/xp/summary/channel.js';
import { chatInputBaseReal } from '../subcommands/xp/config/base.js';
import { chatInputBoostReal } from '../subcommands/xp/config/boost.js';
import { chatInputIncreaseReal } from '../subcommands/xp/user/increase.js';
import { chatInputDecreaseReal } from '../subcommands/xp/user/decrease.js';
import { chatInputLevelsReal } from '../subcommands/xp/summary/levels.js';
import { chatInputLevelRolesReal } from '../subcommands/xp/config/levelRoles.js';
import { chatInputServerCooldownReal } from '../subcommands/xp/config/serverCooldown.js';
import { chatInputServerFormulaReal } from '../subcommands/xp/config/serverFormula.js';
import { chatInputServerReal } from '../subcommands/xp/summary/server.js';
import { chatInputLevelReal } from '../subcommands/xp/summary/level.js';
import { chatInputChannelsReal } from '../subcommands/xp/summary/channels.js';

export class CreateMessageCommand extends Subcommand {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'xp',
            description: 'Manage various things related to xp.',
            preconditions: ['AdminOnly'],
            subcommands: [
                {
                    name: 'config',
                    type: 'group',
                    entries: [
                        { name: 'channel-base', chatInputRun: 'chatInputBaseMessage' },
                        { name: 'channel-boost', chatInputRun: 'chatInputBoost' },
                        { name: 'level-roles', chatInputRun: 'chatInputLevelRoles' },
                        { name: 'server-cooldown', chatInputRun: 'chatInputXpCooldown'},
                        { name: 'server-level-formula', chatInputRun: 'chatInputLevelFormula'},
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

    public async chatInputServerSummary(interaction: Command.ChatInputCommandInteraction) {
        await chatInputServerReal(interaction);
    }

    public async chatInputLevelSummary(interaction: Command.ChatInputCommandInteraction) {
        await chatInputLevelReal(interaction);
    }

    public async chatInputChannelsSummary(interaction: Command.ChatInputCommandInteraction) {
        await chatInputChannelsReal(interaction);
    }

    public async chatInputLevelFormula(interaction: Command.ChatInputCommandInteraction) {
        await chatInputServerFormulaReal(interaction);
    }

    public async chatInputXpCooldown(interaction: Command.ChatInputCommandInteraction) {
        await chatInputServerCooldownReal(interaction);
    }

    public async chatInputLevelRoles(interaction: Command.ChatInputCommandInteraction) {
        await chatInputLevelRolesReal(interaction);
    }

    public async chatInputChannelSummary(interaction: Command.ChatInputCommandInteraction) {
        await chatInputChannelReal(interaction);
    }

    public async chatInputBaseMessage(interaction: Command.ChatInputCommandInteraction) {
        await chatInputBaseReal(interaction);
    }

    public async chatInputBoost(interaction: Command.ChatInputCommandInteraction) {
        await chatInputBoostReal(interaction);
    }

    public async chatInputUserSet(interaction: Command.ChatInputCommandInteraction) {
        await chatInputSetReal(interaction);
    }

    public async chatInputUserIncrease(interaction: Command.ChatInputCommandInteraction) {
        await chatInputIncreaseReal(interaction);
    }

    public async chatInputUserDecrease(interaction: Command.ChatInputCommandInteraction) {
        await chatInputDecreaseReal(interaction);
    }

    public async chatInputLevelsSummary(interaction: Command.ChatInputCommandInteraction) {
        await chatInputLevelsReal(interaction);
    }
}