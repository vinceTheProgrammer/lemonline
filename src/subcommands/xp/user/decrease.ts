import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags } from "discord.js";
import { removeXp } from "../../../utils/database.js";
import { handleCommandError } from "../../../utils/errors.js";

export function scXpUserDecrease(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('decrease')
            .setDescription('Decrease the xp of a user by a specified amount.')
            .addUserOption((option) => 
                option.setName('user').setDescription('User to decrease the xp of.').setRequired(true))
            .addIntegerOption(option =>
                option.setName("amount")
                .setDescription("Amount of xp to decrease the user's xp by.")
                .setRequired(true)
            )
        )
}

export async function chatInputDecreaseReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        const user = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);

        const result = await removeXp(user.id, amount);

        return interaction.editReply({ content: `Successfully decreased <@${user.id}>'s xp by ${amount}. They now have ${result.xp} xp.`});
    } catch (error) {
        handleCommandError(interaction, error);
    }
}