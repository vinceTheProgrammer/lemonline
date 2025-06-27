import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, ForumChannel, Message, MessagePayload, ModalBuilder, TextInputBuilder, TextInputStyle, ThreadChannel, WebhookClient, type APIEmbedField, type Guild, type GuildMember, type WebhookMessageCreateOptions, type WebhookMessageEditOptions } from "discord.js";
import { ChannelId } from "../constants/channels.js";
import { CustomError } from "./errors.js";
import { ErrorType } from "../constants/errors.js";
import { findByDiscordIdWithIntro, incrementIntroRepostCount, updateIntroByDiscordIdAndIntro } from "./database.js";
import type { Prisma } from "@prisma/client";
import { getIntroWebhookClient } from "./webhooks.js";
import { isMessageInstance, MessageBuilder } from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";
import { canEditMessage } from "./messages.js";

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

            await editIntroPost(member, guild, message, channel.id);
            return;

        } else {
            await createIntroPost(member, guild);
            return;
        }
        
    } catch (err) {
        throw err;
    }
}

async function repostIntroPost(member: GuildMember, guild: Guild, message: Message) {
    try {
        const threadChannel = message.channel;
        if (!threadChannel) throw new CustomError("No thread associated with the old intro message when trying to delete and repost intro.", ErrorType.Error);
        await threadChannel.delete();
        await incrementIntroRepostCount(member.id);
        await createIntroPost(member, guild);
    } catch (err) {
        throw err;
    }
}

async function editIntroPost(member: GuildMember, guild: Guild, message: Message, threadId: string) {
    try {
        const webhook: WebhookClient = await getIntroWebhookClient();

        const editable = canEditMessage(message.id);
        if (!editable) {
            await repostIntroPost(member, guild, message);
            return;
        }

        const prePayload : WebhookMessageCreateOptions = await getIntroMessagePayload(member, guild);

        let payloadConvert = prePayload;
        payloadConvert.threadId = threadId;
        delete payloadConvert['threadName'];

        const payload : WebhookMessageEditOptions = {
            threadId: threadId,
            content: prePayload.content,
            embeds: prePayload.embeds,
            components: prePayload.components
        };

        if (!message.inGuild()) throw new CustomError("Message attempting to be edited is not in guild.", ErrorType.Error);
        await webhook.editMessage(message, payload)
    } catch (err) {
        throw err;
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

export async function getSetIntroButton() : Promise<MessageBuilder> {

    const button = new ButtonBuilder()
        .setCustomId('format-intro')
        .setEmoji('✍')
        .setLabel("Set Your Public Introduction")
        .setStyle(ButtonStyle.Primary)

    const components = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([button])

    const message = new MessageBuilder()
        .setComponents([components])

    return message;
}

export async function getFormatIntroModal() : Promise<ModalBuilder> {
    const modal = new ModalBuilder()
        .setCustomId('format-intro-modal')
        .setTitle('Set Public Introduction');
    
    // Add a text input field
    const usernameInput = new TextInputBuilder()
        .setCustomId('username')
        .setLabel('Username')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20)
        .setRequired(true);

        // Add a text input field
    const descriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Briefly describe yourself')
        .setMaxLength(250)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const interestsInput = new TextInputBuilder()
        .setCustomId('interests')
        .setLabel('Briefly describe your interests/hobbies')
        .setMaxLength(250)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const socialsInput1 = new TextInputBuilder()
        .setCustomId('social1')
        .setLabel('Social 1')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    const socialsInput2 = new TextInputBuilder()
        .setCustomId('social2')
        .setLabel('Social 2')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);


    // Build action row for the input
    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(usernameInput);
    const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);
    const actionRow3 = new ActionRowBuilder<TextInputBuilder>().addComponents(interestsInput);
    const actionRow4 = new ActionRowBuilder<TextInputBuilder>().addComponents(socialsInput1);
    const actionRow5 = new ActionRowBuilder<TextInputBuilder>().addComponents(socialsInput2);




    // Add the action row to the modal
    modal.addComponents([actionRow, actionRow2, actionRow3, actionRow4, actionRow5]);

    return modal;
}