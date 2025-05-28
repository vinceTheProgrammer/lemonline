import { Command } from '@sapphire/framework';
import { ChannelType, ForumChannel, AttachmentBuilder, ChannelFlags, MessageFlags } from 'discord.js';
import { CustomError, handleCommandError } from '../utils/errors.js';
import { ErrorType } from '../constants/errors.js';
import { parseEmbeds } from '../utils/embeds.js';
import { getAttachments } from '../utils/attachments.js';
import { parseComponents } from '../utils/components.js';

export class CreateMessageCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'create-message',
            description: 'Creates a message or post in a specified channel.',
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
                        .setDescription('The channel to send the message in or create a post at.')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildForum, ChannelType.PublicThread, ChannelType.PrivateThread)
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName('content').setDescription('The content of the message').setRequired(false)
                )
                .addStringOption((option) =>
                    option.setName('embeds').setDescription('JSON stringified embed(s) array').setRequired(false)
                )
                .addStringOption((option) =>
                    option
                        .setName('components')
                        .setDescription('Components for the message (e.g., buttons) in JSON format.')
                        .setRequired(false)
                )
                .addAttachmentOption((option) =>
                    option.setName('files').setDescription('Attach file(s) to the message').setRequired(false)
                )
                .addStringOption((option) =>
                    option
                        .setName('post-title')
                        .setDescription('The title for the forum post (only for forum channels)')
                        .setRequired(false)
                )
                .addStringOption((option) =>
                    option
                        .setName('post-tag')
                        .setDescription('The tag for the forum post (only for forum channels)')
                        .setRequired(false)
                ),
                { idHints: ['1377120476148662346'] }
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel('channel', true);
        const content = interaction.options.getString('content') ?? undefined;
        const rawEmbeds = interaction.options.getString('embeds');
        const rawComponents = interaction.options.getString('components') ?? undefined;
        const postTitle = interaction.options.getString('post-title');
        const tagName = interaction.options.getString('post-tag'); // Tag provided by the user
        const fileAttachment = interaction.options.getAttachment('files');

        const isForumChannel = channel.type === ChannelType.GuildForum;
        const isSendableChannel = channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread;

        try {
            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            const embeds = rawEmbeds ? parseEmbeds(rawEmbeds) : [];
            const components = parseComponents(rawComponents);
            const files = getAttachments(fileAttachment);

            if (isForumChannel) {
                if (!postTitle) throw new CustomError('A title is required for creating posts in forum channels.', ErrorType.Error);
                const forumChannel = channel as ForumChannel;

                // Check if tags are required in this forum channel
                const requiresTag = forumChannel.flags.has(ChannelFlags.RequireTag);

                // Find the tag provided by the user (if any)
                const selectedTag = forumChannel.availableTags.find((tag) => tag.name.toLowerCase() === tagName?.toLowerCase());

                // If tags are required and the user didn't provide a valid tag, send an error
                if (requiresTag && !selectedTag) {
                    const availableTags = forumChannel.availableTags.map((tag) => `\`${tag.name}\``).join(', ');
                    throw new CustomError(`This forum channel requires a tag to create a post. Please specify a valid tag from the following options: ${availableTags}`, ErrorType.Error);
                }

                await forumChannel.threads.create({
                    name: postTitle,
                    message: {
                        content,
                        embeds,
                        files,
                        components
                    },
                    appliedTags: selectedTag ? [selectedTag.id] : [],
                });

                return interaction.editReply({ content: `Post created in ${channel.name}.`});

            } else if (isSendableChannel) {
                // Cast channel to a sendable type
                const textChannel = channel as Extract<typeof channel,{ send: (options: any) => Promise<any> }>;
                await textChannel.send({ content, embeds, files, components });
                return interaction.editReply({ content: `Message sent to ${channel.name}.`});
            } else {
                throw new CustomError('Unhandled channel type.', ErrorType.Error);
            }
        } catch (error) {
            handleCommandError(interaction, error);
        }
    }
}