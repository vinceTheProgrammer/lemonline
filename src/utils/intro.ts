import { AttachmentBuilder, ChannelType, EmbedBuilder, ForumChannel, Message, MessagePayload, ThreadChannel, WebhookClient, type APIEmbedField, type Guild, type GuildMember, type WebhookMessageCreateOptions, type WebhookMessageEditOptions } from "discord.js";
import { ChannelId } from "../constants/channels.js";
import { CustomError } from "./errors.js";
import { ErrorType } from "../constants/errors.js";
import { findByDiscordIdWithIntro, updateIntroByDiscordIdAndIntro } from "./database.js";
import type { Prisma } from "@prisma/client";
import { getIntroWebhookClient } from "./webhooks.js";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";

export async function syncIntroPost(member: GuildMember, guild: Guild) {
    try {
        const user = await findByDiscordIdWithIntro(member.id);
        if (!user) throw new CustomError("User not found in database.", ErrorType.Error, null);

        const intro = user.intro;

        if (!intro) throw new CustomError("User intro data not found in database.", ErrorType.Error, null);

        if (intro.postMessageId && intro.postThreadId) {
            const channel = await container.client.channels.fetch(intro.postThreadId);
            if (!channel) throw new CustomError("Intro channel is null when fetched.", ErrorType.Error);
            if (!channel.isTextBased()) throw new CustomError("Intro thread is not text based", ErrorType.Error);
            const message = await channel.messages.fetch(intro.postMessageId);
            if (!message) {
                await createIntroPost(member, guild);
                return;
            }

            await editIntroPost(member, guild, message);
            return;

        } else {
            await createIntroPost(member, guild);
            return;
        }
        
    } catch (err) {
        throw err;
    }
}

async function editIntroPost(member: GuildMember, guild: Guild, message: Message) {
    try {
        const webhook: WebhookClient = await getIntroWebhookClient();

    

        const payload : WebhookMessageCreateOptions= await getIntroMessagePayload(member, guild);


        console.log(message);

        console.log("isMessageInstance --------> ", isMessageInstance(message))

        if (!message.inGuild()) throw new CustomError("Message attempting to be edited is not in guild.", ErrorType.Error);
        await webhook.editMessage(message, payload as WebhookMessageEditOptions)
    } catch (err) {
        console.error(err);
    }
}

async function createIntroPost(member: GuildMember, guild: Guild) {
    try {
        const webhook = await getIntroWebhookClient();

        const payload = await getIntroMessagePayload(member, guild);
            
        const apiMessage = await webhook.send(payload);

        const introId : Prisma.IntroUpdateInput = {
            postMessageId: apiMessage.id,
            postThreadId: apiMessage.channel_id
        }

        await updateIntroByDiscordIdAndIntro(member.id, introId);   
    } catch(err) {
        throw err;
    }
}

async function getIntroMessagePayload(member: GuildMember, guild: Guild) : Promise<WebhookMessageCreateOptions> {
    try {
        const avatar = member.user.displayAvatarURL();

        const user = await findByDiscordIdWithIntro(member.id);
        if (!user) throw new CustomError("User not found in database.", ErrorType.Error, null);
        const intro = user.intro;

        const socials = intro?.socials;

        let socialString = '';
        if (socials) {
            for (let i = 0; i < socials.length; i++) {
                socialString += i == 0 ? `- [${socials[i]?.platform}](${socials[i]?.url})` : `\n- [${socials[i]?.platform}](${socials[i]?.url})`;
            }
        }

        const fields : APIEmbedField[] = [
            {
                name: 'Bio',
                value: intro?.description ?? 'none'
            },
            {
                name: 'Interests',
                value: intro?.interests ?? 'none'
            }, 
        ]

        if (socialString.length > 0) {
            fields.push({
                name: 'Socials',
                value: socialString
            })
        }

        let repostCountString = '?';
        if (intro) {
            repostCountString = intro.repostCount == 0 ? `ORIGINAL POST` : `REPOST #${intro.repostCount}`
        }

        const embed = new EmbedBuilder()
            .setTitle(intro?.username ?? member.user.username)
            .setFields(fields)
            .setThumbnail(avatar)
            .setFooter({
                text: intro?.repostCount == 0 ? `ORIGINAL POST` : `REPOST #${intro?.repostCount}`
            })

        return {
            threadName: member.displayName,
            username: member.displayName,
            avatarURL: avatar,
            embeds: [embed],
            
        }
    } catch (err) {
        throw err;
    }
}