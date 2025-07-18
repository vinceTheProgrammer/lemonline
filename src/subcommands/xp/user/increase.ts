import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags } from "discord.js";
import { addXp } from "../../../utils/database.js";
import { handleCommandError } from "../../../utils/errors.js";

export function scXpUserIncrease(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('increase')
            .setDescription('Increase the xp of a user by a specified amount.')
            .addUserOption((option) => 
                option.setName('user').setDescription('User to increase the xp of.').setRequired(true))
            .addIntegerOption(option =>
                option.setName("amount")
                .setDescription("Amount of xp to increase the user's xp by.")
                .setRequired(true)
            )
        )
}

export async function chatInputIncreaseReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        const user = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);

        const result = await addXp(user.id, amount);

        return interaction.editReply({ content: `Successfully increased <@${user.id}>'s xp by ${amount}. They now have ${result.xp} xp.`});
    } catch (error) {
        handleCommandError(interaction, error);
    }
}