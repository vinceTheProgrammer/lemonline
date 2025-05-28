import type { Message, TextBasedChannel } from "discord.js";

export async function validateMessage(channel: TextBasedChannel, messageId: string): Promise<Message> {
    const message = await channel.messages.fetch(messageId);

    if (!message) {
        throw new Error('Message not found. Please provide a valid message ID.');
    }

    if (!message.editable) {
        throw new Error('This message cannot be edited.');
    }

    return message;
}

export function parseMessageLink(link: string): { guildId: string; channelId: string; messageId: string } | null {
    const regex = /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
    const match = link.match(regex);

    if (!match) return null;

    const [, guildId, channelId, messageId] = match;

    if (!guildId || !channelId || !messageId) return null;

    return { guildId, channelId, messageId };
}