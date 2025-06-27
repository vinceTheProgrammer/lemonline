import { Listener } from '@sapphire/framework';
import { ChannelType, type Message, type ThreadChannel } from 'discord.js';
import { addXp, logMessage } from '../utils/database.js';
import { postXpChannels } from '../constants/xp.js';

export class ThreadCreate extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: 'threadCreate'
        });
    }

    override async run(thread: ThreadChannel, _: any) {
        if (thread.parent && thread.parent.type == ChannelType.GuildForum && postXpChannels.includes(thread.parent.id)) {
            const starterMsg = await thread.fetchStarterMessage();
            if (!starterMsg || starterMsg.author.bot) return;
            addXp(starterMsg.author.id, 100);
        }
    }
}