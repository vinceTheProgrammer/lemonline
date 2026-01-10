import { Command } from '@sapphire/framework';
import { ChannelType, MessageFlags } from 'discord.js';
import { handleCommandError } from '../utils/errors.js';
import { ErrorType } from '../constants/errors.js';
import { getSetIntroButton } from '../utils/intro.js';
import { CustomError } from '../utils/custom-error.js';

export class CreateSetIntroButtonCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'create-set-intro-button',
            description: 'Creates an instance of the set intro button.',
            preconditions: ['AdminOnly']
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
                        .setDescription('The channel to create the set intro button in.')
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
                const messageBuilder = await getSetIntroButton();
                await textChannel.send(messageBuilder);
                return interaction.editReply({ content: `Set intro button created in ${channel.name}.`});
            } else {
                throw new CustomError('Unhandled channel type.', ErrorType.Error);
            }
        } catch (error) {
            handleCommandError(interaction, error);
            return;
        }
    }
}