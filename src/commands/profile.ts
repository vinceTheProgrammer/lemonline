import { Command } from '@sapphire/framework';
import { ApplicationCommandType, MessageFlags } from 'discord.js';
import type { ContextMenuCommandType } from 'discord.js';
import { handleCommandError } from '../utils/errors.js';
import { handleProfileInteraction } from '../utils/interactions.js';

export class ProfileCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('profile')
        .setDescription('View someone\'s LemonLine profile')
        .addUserOption(option => {
          return option
            .setName('discord-user')
            .setDescription("Some Discord user")
            .setRequired(false)
        }),
      { idHints: ['1377149578398273550'] }
    );

    registry.registerContextMenuCommand((builder) =>
      builder
        .setName('profile')
        .setType(ApplicationCommandType.User as ContextMenuCommandType),
      { idHints: ['1377149580386238527'] }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    try {
        const discordUserParameter = interaction.options.getUser('discord-user');
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        if (discordUserParameter) {
            await handleProfileInteraction(interaction, discordUserParameter.id);
        } else {
            await handleProfileInteraction(interaction, interaction.user.id);
        }
    } catch (error) {
        handleCommandError(interaction, error);
    }
  }

  public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
    try {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        await handleProfileInteraction(interaction, interaction.targetId);
    } catch (error) {
        await handleCommandError(interaction, error);
    }
  }
}