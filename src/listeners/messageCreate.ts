import { Listener } from '@sapphire/framework';
import { ForumChannel, MediaChannel, NewsChannel, PartialDMChannel, PartialGroupDMChannel, PrivateThreadChannel, PublicThreadChannel, StageChannel, TextChannel, VoiceChannel, type DMChannel, type Message } from 'discord.js';
import { addXp, getChannelXpSettings, logMessage } from '../utils/database.js';
import { hasDatePassed } from '../utils/time.js';
import { isThreadChannel } from '@sapphire/discord.js-utilities';

export class MessageCreate extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: 'messageCreate'
        });
    }

    override async run(message: Message) {
        if (!message.author.bot && message.guild) {
            logMessage(message.author.id);

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