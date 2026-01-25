import { Listener } from '@sapphire/framework';
import { type ThreadChannel } from 'discord.js';
import { addXp, getChannelXpSettings } from '../utils/database.js';
import { hasDatePassed } from '../utils/time.js';

export class ThreadCreate extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: 'threadCreate'
        });
    }

    override async run(thread: ThreadChannel, _: any) {
        if (thread.parent && thread.guild) {
            const starterMsg = await thread.fetchStarterMessage();
            if (!starterMsg || starterMsg.author.bot) return;

            // fetch channel xp settings
            const settings = await getChannelXpSettings(thread.parent.id);
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

            console.log("hmm")

            await addXp(starterMsg.author.id, amount, thread.guild);
        }
    }
}