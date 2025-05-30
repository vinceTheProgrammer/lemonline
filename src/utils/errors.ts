import type { Command } from "@sapphire/framework";
import { getErrorEmbed, getVerboseErrorEmbed, getWarningEmbed } from "./embeds.js";
import { Prisma } from "@prisma/client";
import { ErrorType } from "../constants/errors.js";
import { DiscordAPIError, MessageFlags, type ButtonInteraction, type ModalSubmitInteraction } from "discord.js";

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

export function handleCommandError(
    interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction | ModalSubmitInteraction | ButtonInteraction,
    error: unknown
) {
    if (error instanceof CustomError) {
        switch (error.errorType) {
            case ErrorType.Error:
                if (!interaction.replied && !interaction.deferred) return interaction.reply({ content: '', embeds: [getVerboseErrorEmbed(error)], components: [], files: [], flags: [MessageFlags.Ephemeral]});
                return interaction.editReply({ content: '', embeds: [getVerboseErrorEmbed(error)], components: [], files: []});
            case ErrorType.Warning:
                if (!interaction.replied && !interaction.deferred) return interaction.reply({ content: '', embeds: [getWarningEmbed(error.message)], components: [], files: [], flags: [MessageFlags.Ephemeral]});
                return interaction.editReply({ content: '', embeds: [getWarningEmbed(error.message, error.footer)], components: [], files: [] });
            default:
                if (!interaction.replied && !interaction.deferred) return interaction.reply({ content: '', embeds: [getErrorEmbed(error.message)], components: [], files: [], flags: [MessageFlags.Ephemeral]});
                return interaction.editReply({ content: '', embeds: [getErrorEmbed(error.message)], components: [], files: [] });
        }

    } else if (error instanceof DiscordAPIError) {
        const string = `${error.name}: ${error.message}`;
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