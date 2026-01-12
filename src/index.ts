// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, RegisterBehavior, LogLevel, SapphireClient } from '@sapphire/framework';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';
import '@sapphire/plugin-api/register';
import * as colorette from 'colorette';
import { join } from 'path';
import { inspect } from 'util';
import { GatewayIntentBits } from 'discord.js';
import { getServerXpSettings } from './utils/database';
import { GuildId } from './constants/guilds';
import { setLocalFormula } from './utils/xp';

const { OAuth2Scopes } = require('discord.js');

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });

const api = process.env.BOT_CLIENT_ID && process.env.BOT_CLIENT_SECRET && process.env.BOT_REDIRECT_URI ?  {
	origin: process.env.NODE_ENV == 'development' ? 'http://localhost:3000' : 'https://vincetheprogrammer.github.io/lemonline',
	auth: {
		enabled: true,
		id: process.env.BOT_CLIENT_ID,
		secret: process.env.BOT_CLIENT_SECRET,
		scopes: [OAuth2Scopes.Identify],
		cookie: 'SAPPHIRE_AUTH',
		redirect: process.env.BOT_REDIRECT_URI,
		domainOverwrite: process.env.NODE_ENV == 'development' ? '127.0.0.1' : undefined
	}
} : undefined;

const client = new SapphireClient({
	logger: {
		level: LogLevel.Debug
	},
	intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
	api
});

if (api === undefined) client.logger.error("auth config not defined!");

const main = async () => {
	try {
		const formula = (await getServerXpSettings(GuildId.LemonlineStudios))?.levelFormula;
		setLocalFormula(formula || "");
		client.logger.info('Logging in');
		await client.login(process.env.BOT_TOKEN);
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();
