import { ButtonBuilder, ActionRowBuilder, ButtonStyle, type APIButtonComponentWithCustomId, type APISelectMenuComponent, type APIButtonComponent } from 'discord.js';
import { ErrorType } from '../constants/errors.js';
import { CustomError } from './custom-error.js';

export function parseComponents(rawComponents: string | undefined): ActionRowBuilder<ButtonBuilder>[] | undefined {
    if (!rawComponents) return undefined;

    try {
        const parsed = JSON.parse(rawComponents);
        const components = Array.isArray(parsed) ? parsed : [parsed];

        return components.map((component: APIButtonComponent | APISelectMenuComponent) => {
            if (component.type === 2) {
                // Handle buttons
                const button = new ButtonBuilder()
                    .setCustomId((component as APIButtonComponentWithCustomId).custom_id)
                    .setLabel((component as APIButtonComponentWithCustomId).label || 'Button')
                    .setStyle((component as APIButtonComponentWithCustomId).style || ButtonStyle.Primary);

                return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
            }

            throw new CustomError(`Unsupported component type: ${component.type}`, ErrorType.Error);
        });
    } catch (error) {
        let err = null;
        if (error instanceof Error) err = error;
        throw new CustomError('Invalid components JSON provided.', ErrorType.Error, err);
    }
}