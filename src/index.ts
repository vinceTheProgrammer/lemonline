import { ApplicationCommandRegistries, RegisterBehavior, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';

const client = new SapphireClient({
  intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
});

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

client.login(process.env.BOT_TOKEN);