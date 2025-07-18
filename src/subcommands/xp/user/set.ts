import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags } from "discord.js";
import { setXp } from "../../../utils/database.js";
import { handleCommandError } from "../../../utils/errors.js";

export function scXpUserSet(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('set')
            .setDescription('Set the xp of a user.')
            .addUserOption((option) => 
                option.setName('user').setDescription('User to set the xp of.').setRequired(true))
            .addIntegerOption(option =>
                option.setName("amount")
                .setDescription("Amount of xp to set the user's xp to.")
                .setRequired(true)
            )
        )
}

export async function chatInputSetReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        const user = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);

        await setXp(user.id, amount);

        return interaction.editReply({ content: `Successfully set <@${user.id}>'s xp to ${amount}.`});
    } catch (error) {
        handleCommandError(interaction, error);
    }
}