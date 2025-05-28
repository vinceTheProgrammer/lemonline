import { EmbedBuilder, GuildMember, type APIEmbed } from 'discord.js';
import { Color } from '../constants/colors.js';
import { CustomError } from './errors.js';
import { ErrorType } from '../constants/errors.js';
import { findByDiscordId } from './database.js';
import { truncateString } from './format.js';

export function getErrorEmbed(error: string) {
    return new EmbedBuilder()
        .setTitle("😔 Error encountered.")
        .setDescription(`Error message: ${error}`)
        .setColor(Color.TotalRed)
}

export function getVerboseErrorEmbed(error: CustomError) {
    return new EmbedBuilder()
        .setTitle("😔 Error encountered.")
        .setDescription(`Error message: ${error.message}\nOriginal error: ${error.originalError}`)
        .setColor(Color.TotalRed)
}

export function getWarningEmbed(warning: string, footer?: string) {
    const embed = new EmbedBuilder()
        .setTitle("Notice")
        .setDescription(`${warning}`)
        .setColor(Color.TotalYellow)
  
    if (footer) embed.setFooter({text: footer});

    return embed;
}

export function parseEmbeds(rawEmbeds: string | undefined): APIEmbed[] | undefined {
    if (!rawEmbeds) return undefined;

    const convertHexToInt = (hex: string) => parseInt(hex.replace(/^#/, ''), 16);
    const isEpochTime = (value: number) => value.toString().length >= 10 && value.toString().length <= 13;

    try {
        const parsed = JSON.parse(rawEmbeds);
        const embedArray = Array.isArray(parsed) ? parsed : [parsed];

        return embedArray.map((embed: any) => {
            if (embed.color) {
                if (typeof embed.color === 'string' && embed.color.startsWith('#')) {
                    embed.color = convertHexToInt(embed.color);
                } else if (typeof embed.color !== 'number') {
                    throw new Error('Invalid color format. Use a hex string (e.g., #FF5733) or an integer.');
                }
            }

            if (embed.timestamp) {
                if (typeof embed.timestamp === 'number' && isEpochTime(embed.timestamp)) {
                    embed.timestamp = new Date(embed.timestamp).toISOString();
                } else if (typeof embed.timestamp === 'string') {
                    embed.timestamp = new Date(embed.timestamp).toISOString();
                } else {
                    throw new Error('Invalid timestamp format. Use a valid Epoch time or ISO8601 string.');
                }
            }

            return embed;
        });
    } catch (error) {
        let err = null;
        if (error instanceof Error) err = error;
        throw new CustomError(`Invalid embed JSON provided.`, ErrorType.Error, err);
    }
}

export async function getProfileEmbed(member: GuildMember) {

    const user = await findByDiscordId(member.id);

    if (!user) throw new CustomError("User not found in database.", ErrorType.Error, null);

    const fields = [
        {
            name: "Level",
            value: `${user.level}`,
            inline: false
        },
        {
            name: "XP",
            value: `${user.xp}`,
            inline: false
        },
        {
            name: `Message Count`,
            value: `${user.messageCount}`,
            inline: false
        }
    ]

    let embed = new EmbedBuilder()
        .setAuthor({
            name: truncateString(`@${member.user.username}`, 256),
        })
        .addFields(fields)
        .setThumbnail(member.displayAvatarURL() ?? member.avatarURL() ?? member.avatar)
        .setColor(member.user.accentColor ?? member.displayColor ?? 'Blurple')
        .setFooter({
            text: truncateString(`added to database on ${user.createdAt.toDateString()}`, 64),
        });

    if (member.nickname) embed.setTitle(truncateString(member.nickname, 256));

    return embed;
}
