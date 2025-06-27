import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ModalSubmitInteraction, MessageFlags } from 'discord.js';
import type { ButtonInteraction } from 'discord.js';
import { handleCommandError } from '../utils/errors.js';
import { createOnboardingPages } from '../utils/onboarding.js';
import { getFormatIntroModal } from '../utils/intro.js';

export class ButtonHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction): Promise<void> {
    try {
      switch (interaction.customId) {
        case 'begin-onboarding':
          await interaction.deferReply({flags: [MessageFlags.Ephemeral]})
          await createOnboardingPages(interaction);
          break;
        case 'format-intro':
          const modal = await getFormatIntroModal();

          await interaction.showModal(modal);
          break;
      }
    } catch (error) {
      handleCommandError(interaction, error);
    }
  }

  public override async parse(interaction: ButtonInteraction) {
    if (interaction.customId === 'begin-onboarding' || 'format-intro') {
      return this.some(); // Indicates this handler is responsible for this interaction
    }
    return this.none(); // Skip if not the correct customId
  }
}