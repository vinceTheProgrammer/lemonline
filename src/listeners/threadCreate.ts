import { Listener } from '@sapphire/framework';
import { ChannelType, type Message, type ThreadChannel } from 'discord.js';
import { addXp, getChannelXpSettings, logMessage } from '../utils/database.js';
import { postXpChannels } from '../constants/xp.js';
import { hasDatePassed } from '../utils/time.js';

export class ThreadCreate extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: 'threadCreate'
        });
    }

    override async run(thread: ThreadChannel, _: any) {
        if (thread.parent) {
            const starterMsg = await thread.fetchStarterMessage();
            if (!starterMsg || starterMsg.author.bot) return;


            // fetch channel xp settings
            const settings = await getChannelXpSettings(starterMsg.channel.id);
            if (!settings) return;

            // use those settings to increment xp
            let amount = settings.baseThreadCreate;
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

            await addXp(starterMsg.author.id, amount);
            console.log(`Added ${amount} xp to ${starterMsg.author.username}`);
        }
    }
}