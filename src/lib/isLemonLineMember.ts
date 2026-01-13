import { Container } from '@sapphire/framework';
import type { Route } from '@sapphire/plugin-api';
import { GuildId } from '../constants/guilds';
import { isMember } from './isMember';

export async function isLemonLineMember(request: Route.Request, container: Container) {
    try {
        const guild = container.client.guilds.cache.get(GuildId.LemonlineStudios);
        if (!guild) return false;
        if (!await isMember(request, guild)) return false;
        return true;
    } catch {
        return false;
    }
}