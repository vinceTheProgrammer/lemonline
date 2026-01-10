import { Command } from '@sapphire/framework';
import { parseMessageLink } from '../utils/messages.js';
import { AttachmentBuilder, ChannelType, MessageFlags } from 'discord.js';
import { handleCommandError } from '../utils/errors.js';
import { ErrorType } from '../constants/errors.js';
import { CustomError } from '../utils/custom-error.js';

export class GetEmbedsCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'get-embeds',
            description: 'Fetches the embeds of a Discord message given its link.',
            preconditions: ['AdminOnly']
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption((option) =>
                    option
                        .setName('message-link')
                        .setDescription('The link to the Discord message.')
                        .setRequired(true)
                ),
                { idHints: ['1377120480431177841'] }
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const link = interaction.options.getString('message-link', true);

        try {
            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            const parsedLink = parseMessageLink(link);

            if (!parsedLink) throw new CustomError('Invalid message link provided. Please ensure it is a valid Discord message link.', ErrorType.Error);

            const { guildId, channelId, messageId } = parsedLink;

            // Ensure the bot has access to the guild and channel
            const guild = await this.container.client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelId);

            if (!channel) throw new CustomError('The channel in the message link is not accessible or is not a text channel.', ErrorType.Error);

            const isSendableChannel = channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread;

            if (!isSendableChannel) throw new CustomError('The channel in the message link is not accessible or is not a text channel.', ErrorType.Error);

            const message = await channel.messages.fetch(messageId);

            if (!message) throw new CustomError('The message could not be found. Please check the link and try again.', ErrorType.Error);

            const embeds = message.embeds.map((embed) => embed.toJSON());

            if (embeds.length === 0) throw new CustomError('No embeds were found in the specified message.', ErrorType.Error);

            const jsonString = JSON.stringify(embeds, null, 2);

            // If the JSON is too large for a Discord message
            if (jsonString.length > 2000) {
                const attachment = new AttachmentBuilder(Buffer.from(jsonString, 'utf-8')).setName('embeds.json');
                return interaction.editReply({
                    content: 'The embeds are too large to display here. Please find them attached as a file.',
                    files: [attachment],
                });
            }

            // Otherwise, send the JSON as a string
            return interaction.editReply({
                content: `\`\`\`json\n${jsonString}\n\`\`\``
            });
        } catch (error) {
            handleCommandError(interaction, error);
            return;
        }
    }
}