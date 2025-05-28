import { Command } from '@sapphire/framework';
import { ChannelType, type TextBasedChannel, AttachmentBuilder, MessageFlags } from 'discord.js';
import { CustomError, handleCommandError } from '../utils/errors.js';
import { getAttachments } from '../utils/attachments.js';
import { parseEmbeds } from '../utils/embeds.js';
import { ErrorType } from '../constants/errors.js';
import { validateMessage } from '../utils/messages.js';
import { parseComponents } from '../utils/components.js';

export class EditMessageCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'edit-message',
            description: 'Edits an existing message.',
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
                        .setDescription('The channel containing the message to edit.')
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName('message-id')
                        .setDescription('The ID of the message to edit.')
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName('content')
                        .setDescription('The new content for the message.')
                        .setRequired(false)
                )
                .addStringOption((option) =>
                    option
                        .setName('embeds')
                        .setDescription('The new embeds for the message in JSON format.')
                        .setRequired(false)
                )
                .addStringOption((option) =>
                    option
                        .setName('components')
                        .setDescription('Components for the message (e.g., buttons) in JSON format.')
                        .setRequired(false)
                )
                .addAttachmentOption((option) =>
                    option
                        .setName('files')
                        .setDescription('New file(s) to attach to the message.')
                        .setRequired(false)
                ),
                { idHints: ['1377120478182903890'] }
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel('channel', true);
        const messageId = interaction.options.getString('message-id', true); // Message ID to edit
        const content = interaction.options.getString('content') ?? undefined;
        const rawEmbeds = interaction.options.getString('embeds');
        const rawComponents = interaction.options.getString('components') ?? undefined;
        const fileAttachment = interaction.options.getAttachment('files');
        const isDestructive = interaction.options.getBoolean('is-destructive') ?? false;

        const isSendableChannel = channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread;


        try {
            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            const embeds = rawEmbeds ? parseEmbeds(rawEmbeds) : [];
            const components = parseComponents(rawComponents);
            const files = getAttachments(fileAttachment);

            if (!isSendableChannel) throw new CustomError('The provided channel is not a text-based channel.', ErrorType.Error);

            // Fetch the message to edit
            const targetChannel = channel as TextBasedChannel;
            const message = await validateMessage(targetChannel, messageId);

            if (!message) throw new CustomError('Message not found. Please provide a valid message ID.', ErrorType.Error);
    
            if (!message.editable) throw new CustomError('This message cannot be edited.', ErrorType.Error);
    
            if (isDestructive) {
                // Replace entire message payload
                await message.edit({
                    content: content ?? null, // If no content provided, clear it
                    embeds: embeds ?? [], // Replace embeds if provided
                    files: files ?? [],
                    components: components ?? [],   // Replace files if provided
                });
            } else {
                // Patch specific fields
                const updatedContent = content ?? message.content;

                const updatedEmbeds = embeds
                    ? message.embeds.map((existingEmbed, index) => {
                        const updatedEmbedData = embeds[index] ?? {};
                        return {
                            ...existingEmbed.toJSON(), // Convert existing embed to JSON for modification
                            ...updatedEmbedData,      // Overwrite fields with provided values
                        };
                    })
                    : message.embeds.map(embed => embed.toJSON());

                await message.edit({
                    content: updatedContent,
                    embeds: updatedEmbeds,
                    files: files ?? undefined,
                    components: components ?? undefined 
                });
            }
            
            return interaction.editReply({content: `Message successfully ${isDestructive ? 'replaced' : 'updated'} in ${channel.name}.`});
            
        } catch (error) {
            handleCommandError(interaction, error);
        }
    }

}