import { EmbedBuilder, GuildMember, type APIEmbed } from 'discord.js';
import { Color } from '../constants/colors.js';
import { CustomError } from './errors.js';
import { ErrorType } from '../constants/errors.js';
import { findByDiscordId, getXp, initUser } from './database.js';
import { getDiscordRelativeTime, getSign, truncateString } from './format.js';
import { getDeltaXp, getLevelFromXp, getRelativeXp } from './xp.js';
import type { ChannelXpSettings } from '@prisma/client';
import { hasDatePassed } from './time.js';

export function getErrorEmbed(error: string) {
    return new EmbedBuilder()
        .setTitle("😔 Error encountered.")
        .setDescription(`Error message: ${error}`)
        .setColor(Color.TotalRed)
}

export function getVerboseErrorEmbed(error: CustomError) {
    let desc = `Error message: ${error.message}`;
    if (error.originalError) desc += `\nOriginal error: ${error.originalError}`;

    return new EmbedBuilder()
        .setTitle("😔 Error encountered.")
        .setDescription(desc)
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

export async function getLevelEmbed(member: GuildMember) {

    let user = await findByDiscordId(member.id);

    if (!user) user = await initUser(member.id);

    if (!user) throw new CustomError("User not found in database.", ErrorType.Error, null);

    const level = getLevelFromXp(user.xp);

    const relativeXp = getRelativeXp(user.xp, level);

    const neededXp = getDeltaXp(level);

    const fields = [
        {
            name: "Level",
            value: `${level}`,
            inline: false
        },
        {
            name: `Level XP`,
            value: `${relativeXp} / ${neededXp}`,
            inline: false
        },
        {
            name: "Total XP",
            value: `${user.xp}`,
            inline: false
        },
    ]

    let embed = new EmbedBuilder()
        // .setAuthor({
        //     name: truncateString(`@${member.user.username}`, 256),
        // })
        .addFields(fields)
        .setThumbnail(member.displayAvatarURL() ?? member.avatarURL() ?? member.avatar)
        .setColor(member.user.accentColor ?? member.displayColor ?? 'Blurple')
        // .setFooter({
        //     text: truncateString(`added to database on ${user.createdAt.toDateString()}`, 64),
        // });

    if (member.nickname) embed.setTitle(truncateString(member.nickname, 256));
    else embed.setTitle(truncateString(member.user.username, 256))

    return embed;
}

export async function getChannelXpSettingsEmbed(channelXpSettings: ChannelXpSettings | null) {
    if (channelXpSettings == null) {
        return new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("No xp settings are set for the provided channel.");
    }

    const msgCreateXp = channelXpSettings.baseMessageCreate;
    const threadCreateXp = channelXpSettings.baseThreadCreate;
    let mult = channelXpSettings.multiplier;
    const multExp = channelXpSettings.multiplierExpiration;

    const fields = [
        {
            name: "On message create",
            value: `${getSign(msgCreateXp)}${Math.abs(msgCreateXp)} xp`,
            inline: true
        },
        {
            name: `On post/thread create`,
            value: `${getSign(threadCreateXp)}${Math.abs(threadCreateXp)} xp`,
            inline: true
        },
        {
            name: '\u200b',
            value: '\u200b',
            inline: false
        }
    ]

    if (multExp) {
        if (hasDatePassed(multExp)) {
            fields.push({
                name: `Xp gain multiplier`,
                value: `~~x${mult}~~ x1`,
                inline: true
            },
            {
                name: "Boost expiration",
                value: `${getDiscordRelativeTime(multExp)} (EXPIRED)`,
                inline: true
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: false
            })
            mult = 1;
        } else {
            fields.push({
                name: `Xp gain multiplier`,
                value: `x${mult}`,
                inline: true
            },
            {
                name: "Boost expiration",
                value: `${getDiscordRelativeTime(multExp)}`,
                inline: true
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: false
            })
        }
    } else {
        fields.push({
            name: `Xp gain multiplier`,
            value: `x${mult}`,
            inline: true
        },
        {
            name: "Boost expiration",
            value: `Permanent`,
            inline: true
        },
        {
            name: '\u200b',
            value: '\u200b',
            inline: false
        })
    }

    const finalMsgCreateXp = Math.round(msgCreateXp * mult);
    const finalThreadCreateXp = Math.round(threadCreateXp * mult);

    fields.push({
        name: `Message xp gain after multiplier`,
        value: `${getSign(finalMsgCreateXp)}${Math.abs(finalMsgCreateXp)} xp`,
        inline: true
    },
    {
        name: `Post/thread xp gain after multiplier`,
        value: `${getSign(finalThreadCreateXp)}${Math.abs(finalThreadCreateXp)} xp`,
        inline: true
    });

    let embed = new EmbedBuilder()
        .setDescription(`<#${channelXpSettings.channelId}>`)
        .addFields(fields)
        .setColor("#6600ff");

    embed.setTitle("XP Settings Summary");

    return embed;
}