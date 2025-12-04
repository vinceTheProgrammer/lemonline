import { container, type Command } from "@sapphire/framework";
import { getErrorEmbed, getVerboseErrorEmbed, getWarningEmbed } from "./embeds.js";
import { Prisma } from "@prisma/client";
import { ErrorType } from "../constants/errors.js";
import { ChannelType, DiscordAPIError, MessageFlags, type ButtonInteraction, type ModalSubmitInteraction } from "discord.js";
import { ChannelId } from "../constants/channels.js";

export class CustomError extends Error {
    originalError: Error | null;
    errorType: ErrorType;
    footer: string | undefined;

    constructor(message: string, errorType: ErrorType, originalError: Error | null = null, footer?: string) {
        super(message); // Set the custom message.
        this.name = "CustomLemonLineError"; // Optional: set a specific name.
        this.originalError = originalError;
        this.errorType = errorType;
        this.footer = footer;

        // Ensure the prototype chain is properly set.
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export async function handleGenericError(error: unknown) {

    const client = container.client;

    const logErrorToChannel = async (errorMessage: string) => {
        if (process.env.NODE_ENV == 'development') return;
        try {
            const errorChannel = await client.channels.fetch(ChannelId.ErrorLog);
            if (errorChannel?.isTextBased() && errorChannel.type == ChannelType.GuildText) {
                await errorChannel.send({
                    content: `Generic error encountered. Error message:\n${errorMessage}`,
                });
            } else {
                console.warn(`Channel ${ChannelId.ErrorLog} is not a text-based channel or was not found.`);
            }
        } catch (channelError) {
            console.error(`Failed to send error to log channel ${ChannelId.ErrorLog}:`, channelError);
        }
    };

    if (error instanceof CustomError) {
        switch (error.errorType) {
            case ErrorType.Error:
                await logErrorToChannel(`${error.name}: ${error.message}${error.originalError ? `\nOriginal Error: ${error.originalError.message}` : ''}`);
            case ErrorType.Warning:
                break;
            default:
                await logErrorToChannel(`${error.name}: ${error.message}`);
        }

    } else if (error instanceof DiscordAPIError) {
        const string = `${error.name}: ${error.message}`;
        await logErrorToChannel(string);
    } else {
        console.error('Unexpected Error:', error);
    }
}

export async function handleCommandError(
    interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction | ModalSubmitInteraction | ButtonInteraction,
    error: unknown
) {

    const logErrorToChannel = async (errorMessage: string) => {
        if (process.env.NODE_ENV == 'development') return;
        try {
            const errorChannel = await interaction.client.channels.fetch(ChannelId.ErrorLog);
            if (errorChannel?.isTextBased() && errorChannel.type == ChannelType.GuildText) {
                await errorChannel.send({
                    content: `Error in ${interaction.isCommand() ? interaction.commandName : 'interaction'} (User: ${interaction.user.tag}, ID: ${interaction.user.id}):\n${errorMessage}`,
                });
            } else {
                console.warn(`Channel ${ChannelId.ErrorLog} is not a text-based channel or was not found.`);
            }
        } catch (channelError) {
            console.error(`Failed to send error to log channel ${ChannelId.ErrorLog}:`, channelError);
        }
    };

    if (error instanceof CustomError) {
        switch (error.errorType) {
            case ErrorType.Error:
                await logErrorToChannel(`${error.name}: ${error.message}${error.originalError ? `\nOriginal Error: ${error.originalError.message}` : ''}`);
                if (!interaction.replied && !interaction.deferred) return interaction.reply({ content: '', embeds: [getVerboseErrorEmbed(error)], components: [], files: [], flags: [MessageFlags.Ephemeral]});
                return interaction.editReply({ content: '', embeds: [getVerboseErrorEmbed(error)], components: [], files: []});
            case ErrorType.Warning:
                if (!interaction.replied && !interaction.deferred) return interaction.reply({ content: '', embeds: [getWarningEmbed(error.message)], components: [], files: [], flags: [MessageFlags.Ephemeral]});
                return interaction.editReply({ content: '', embeds: [getWarningEmbed(error.message, error.footer)], components: [], files: [] });
            default:
                await logErrorToChannel(`${error.name}: ${error.message}`);
                if (!interaction.replied && !interaction.deferred) return interaction.reply({ content: '', embeds: [getErrorEmbed(error.message)], components: [], files: [], flags: [MessageFlags.Ephemeral]});
                return interaction.editReply({ content: '', embeds: [getErrorEmbed(error.message)], components: [], files: [] });
        }

    } else if (error instanceof DiscordAPIError) {
        const string = `${error.name}: ${error.message}`;
        await logErrorToChannel(string);
        if (!interaction.replied && !interaction.deferred) return interaction.reply({ content: '', embeds: [getErrorEmbed(string)], components: [], files: [], flags: [MessageFlags.Ephemeral]});
        return interaction.editReply({ content: '', embeds: [getErrorEmbed(string)], components: [], files: [] });
    } else {
        console.error('Unexpected Error:', error);
        if (!interaction.replied && !interaction.deferred) return interaction.reply({ content: 'An unexpected error occurred. Please tell vincetheanimator.', embeds: [], components: [], flags: [MessageFlags.Ephemeral] });
        return interaction.editReply({ content: 'An unexpected error occurred. Please tell vincetheanimator.', embeds: [], components: [] });
    }
}

export function handlePrismaError(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return new CustomError(`Prisma error! Error code: ${error.code}`, ErrorType.Error, error)
    }
    return new CustomError("Strange Prisma error!", ErrorType.Error);
}