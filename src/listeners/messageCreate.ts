import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { addXp, getChannelXpSettings, logMessage } from '../utils/database.js';
import { hasDatePassed } from '../utils/time.js';

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

            // fetch channel xp settings
            const settings = await getChannelXpSettings(message.channel.id);
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