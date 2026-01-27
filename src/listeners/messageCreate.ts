import { Listener } from '@sapphire/framework';
import { ForumChannel, MediaChannel, NewsChannel, PartialDMChannel, PartialGroupDMChannel, PrivateThreadChannel, PublicThreadChannel, StageChannel, TextChannel, VoiceChannel, type DMChannel, type Message } from 'discord.js';
import { addXp, getChannelXpSettings, getLatestMessageDate, getServerXpSettings, logMessage } from '../utils/database.js';
import { hasDatePassed } from '../utils/time.js';
import { isThreadChannel } from '@sapphire/discord.js-utilities';
import { GuildId } from '../constants/guilds.js';

export class MessageCreate extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: 'messageCreate'
        });
    }

    override async run(message: Message) {
        if (!message.author.bot && message.guild) {
            // fetch server xp settings
            const serverSettings = await getServerXpSettings(GuildId.LemonlineStudios);
            if (!serverSettings) return;
            const cooldownSeconds = serverSettings.cooldownSeconds;
            const cooldownMilliseconds = cooldownSeconds * 1000;

            // TODO delineate between logging messages that granted xp and messages that did not
            // return if seconds elapsed since last message is less than cooldown
            const latestMessageDate = await getLatestMessageDate(message.author.id);
            logMessage(message.author.id);

            if (latestMessageDate) {
                const cooldownNotElapsed = new Date().getTime() <= latestMessageDate.getTime() + cooldownMilliseconds;
                if (cooldownNotElapsed) return;
            }

            let channel: DMChannel | PartialDMChannel | PartialGroupDMChannel | NewsChannel | StageChannel | TextChannel | PublicThreadChannel | PrivateThreadChannel | VoiceChannel | ForumChannel | MediaChannel | null = message.channel;
            if (isThreadChannel(channel)) {
                const starterMsg = await channel.fetchStarterMessage();
                if (!starterMsg || starterMsg.id === message.id) return;
                channel = channel.parent;
            }

            if (channel === null) return;

            // fetch channel xp settings
            const settings = await getChannelXpSettings(channel.id);
            if (!settings) return;

            // use those settings to increment xp
            let amount = settings.baseMessageCreate;
            const expiration = settings.multiplierExpiration;

            if (expiration) {
                if (hasDatePassed(expiration)) {
                    amount *= 1;
                } else {
                    amount *= settings.multiplier;
                }
            } else {
                amount *= settings.multiplier;
            }

            amount = Math.round(amount);

            await addXp(message.author.id, amount, message.guild);
        };
    }
}