import { Route } from '@sapphire/plugin-api';
import { GuildId } from '../../constants/guilds';
import { ChannelNameIdType } from '../../types/xp';
import { ChannelType } from 'discord.js';

function getChannelTypeString(type: ChannelType) {
  switch (type) {
    case ChannelType.GuildText:
      return 'text'
    case ChannelType.GuildVoice:
      return 'voice'
    case ChannelType.GuildForum:
      return 'forum'
    case ChannelType.GuildAnnouncement:
      return 'announcement'
    case ChannelType.PublicThread:
      return 'thread_public'
    case ChannelType.PrivateThread:
      return 'thread_private'
    case ChannelType.AnnouncementThread:
      return 'thread_announcement'
    case ChannelType.GuildCategory:
      return 'category'
    case ChannelType.GuildMedia:
      return 'media'
    case ChannelType.GuildDirectory:
      return 'directory'
    case ChannelType.GuildStageVoice:
      return 'stage'
    case ChannelType.DM:
      return 'dm'
    case ChannelType.GroupDM:
      return 'dm_group'
    default:
      return 'unknown'
  }
}

export class ChannelsRoute extends Route {
  public async run(_request: Route.Request, response: Route.Response) {
    const channels : ChannelNameIdType[] = await this.container.client.guilds.cache.get(GuildId.LemonlineStudios)?.channels.cache.map(channel => {return {id: channel.id, name: channel.name, type: getChannelTypeString(channel.type)}}) || [];
    return response.ok(channels);
  }
}
