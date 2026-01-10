import { Command } from '@sapphire/framework';
import { ApplicationCommandType, MessageFlags } from 'discord.js';
import type { ContextMenuCommandType } from 'discord.js';
import { handleCommandError } from '../utils/errors.js';
import { handleLevelInteraction } from '../utils/interactions.js';

export class LevelCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('level')
        .setDescription('View someone\'s LemonLine level')
        .addUserOption(option => {
          return option
            .setName('discord-user')
            .setDescription("Some Discord user")
            .setRequired(false)
        }),
      //{ idHints: ['1377149578398273550'] }
    );

    registry.registerContextMenuCommand((builder) =>
      builder
        .setName('level')
        .setType(ApplicationCommandType.User as ContextMenuCommandType),
      //{ idHints: ['1377149580386238527'] }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    try {
        const discordUserParameter = interaction.options.getUser('discord-user');
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        if (discordUserParameter) {
            await handleLevelInteraction(interaction, discordUserParameter.id);
        } else {
            await handleLevelInteraction(interaction, interaction.user.id);
        }
    } catch (error) {
        handleCommandError(interaction, error);
    }
  }

  public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
    try {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        await handleLevelInteraction(interaction, interaction.targetId);
    } catch (error) {
        await handleCommandError(interaction, error);
    }
  }
}