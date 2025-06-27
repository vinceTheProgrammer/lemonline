import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { MessageFlags, type ModalSubmitInteraction } from 'discord.js';
import { CustomError, handleCommandError } from '../utils/errors.js';
import { verifyMember } from '../utils/roles.js';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { ErrorType } from '../constants/errors.js';
import { formatIntroModalSubmit } from '../utils/interactions.js';
import type { Prisma } from '@prisma/client';
import { syncIntroPost } from '../utils/intro.js';

export class ModalSubmitHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
    });
  }

  public async run(interaction: ModalSubmitInteraction): Promise<void> {
    try {
      await interaction.deferReply({flags: [MessageFlags.Ephemeral]})
      
      const username = interaction.fields.getTextInputValue('username');
      const description = interaction.fields.getTextInputValue('description');

      const interests = interaction.fields.getTextInputValue('interests');
      const social1 = interaction.fields.getTextInputValue('social1');
      const social2 = interaction.fields.getTextInputValue('social2');

      const introUpdateInput : Prisma.IntroUpdateInput = {
        username,
        description,
        interests
      }


      let member = interaction.member;
      if (!member || !isGuildMember(member)) throw new CustomError("Failed to process verify modal. interaction.member is null or is not a guild member.", ErrorType.Error, null);
      const guild = interaction.guild;
      if (!guild) throw new CustomError("Guild is null", ErrorType.Error);
      await formatIntroModalSubmit(interaction, introUpdateInput);
      await syncIntroPost(member, guild);
    } catch (error) {
      handleCommandError(interaction, error);
    }
  }

  public override async parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId === 'format-intro-modal') {
      return this.some(); // Indicates this handler is responsible for this interaction
    }
    return this.none(); // Skip if not the correct customId
  }
}