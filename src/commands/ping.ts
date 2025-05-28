import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { MessageFlags } from 'discord.js';

export class PingCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName('ping').setDescription('Ping bot to see if it is alive'),
      {idHints: ['1377111091963756656']}
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const response = await interaction.reply({ content: `Ping?`, withResponse: true, flags: [MessageFlags.Ephemeral] });

    if (response.resource && response.resource.message && isMessageInstance(response.resource?.message)) {
      const diff = response.resource.message.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
    }

    return interaction.editReply('Failed to retrieve ping :(');
  }
}