import { Command } from '@sapphire/framework';
import { MessageFlags } from 'discord.js';
import { handleCommandError } from '../utils/errors.js';
import { handlePrintLevelsInteraction } from '../utils/interactions.js';

export class PrintLevelCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('print-levels')
        .setDescription('Print level table based on current leveling.')
        .addNumberOption(option => {
          return option
            .setName('level')
            .setDescription("The level to print the level table to.")
            .setRequired(false)
        })
      //{ idHints: ['1377149578398273550'] }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    try {
      const level = interaction.options.getNumber('level');

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        if (level)
            await handlePrintLevelsInteraction(interaction, level);
        else
          await handlePrintLevelsInteraction(interaction, 100);
    } catch (error) {
        handleCommandError(interaction, error);
    }
  }
}