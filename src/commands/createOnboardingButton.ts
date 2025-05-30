import { Command } from '@sapphire/framework';
import { ChannelType, ForumChannel, AttachmentBuilder, ChannelFlags, MessageFlags } from 'discord.js';
import { CustomError, handleCommandError } from '../utils/errors.js';
import { ErrorType } from '../constants/errors.js';
import { parseEmbeds } from '../utils/embeds.js';
import { getAttachments } from '../utils/attachments.js';
import { parseComponents } from '../utils/components.js';
import { getOnboardingButton } from '../utils/onboarding.js';

export class CreateOnboardingCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'create-onboarding-button',
            description: 'Creates an instance of the onboarding button.',
            preconditions: ['StaffOnly']
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('The channel to create the onboarding button in.')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread)
                        .setRequired(true)
                ),
                { idHints: ['1377769318326075392'] }
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel('channel', true);

        const isSendableChannel = channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread;

        try {
            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            if (isSendableChannel) {
                // Cast channel to a sendable type
                const textChannel = channel as Extract<typeof channel,{ send: (options: any) => Promise<any> }>;
                const messageBuilder = await getOnboardingButton();
                await textChannel.send(messageBuilder);
                return interaction.editReply({ content: `Onboarding button created in ${channel.name}.`});
            } else {
                throw new CustomError('Unhandled channel type.', ErrorType.Error);
            }
        } catch (error) {
            handleCommandError(interaction, error);
        }
    }
}