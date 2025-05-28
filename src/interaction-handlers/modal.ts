import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ModalSubmitInteraction } from 'discord.js';
import { CustomError, handleCommandError } from '../utils/errors.js';
import { verifyMember } from '../utils/roles.js';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { ErrorType } from '../constants/errors.js';
import { verifyModalSubmit } from '../utils/interactions.js';

export class ModalSubmitHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
    });
  }

  public async run(interaction: ModalSubmitInteraction): Promise<void> {
    try {
      // Get the username input from the modal
      const lemon = interaction.fields.getTextInputValue('temp-field-1');

      // Call initLink with the interaction and username
      let member = interaction.member;
      if (!member || !isGuildMember(member)) throw new CustomError("Failed to process verify modal. interaction.member is null or is not a guild member.", ErrorType.Error, null);
      await verifyModalSubmit(interaction, member);
    } catch (error) {
      handleCommandError(interaction, error);
    }
  }

  public override async parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId === 'verify-modal') {
      return this.some(); // Indicates this handler is responsible for this interaction
    }
    return this.none(); // Skip if not the correct customId
  }
}