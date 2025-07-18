import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags, ChannelType } from "discord.js";
import { ErrorType } from "../../../constants/errors.js";
import { addLevelRole, removeLevelRole, setChannelMultiplier } from "../../../utils/database.js";
import { CustomError, handleCommandError } from "../../../utils/errors.js";
import { getDiscordRelativeTime } from "../../../utils/format.js";
import { parseRelativeDate } from "../../../utils/time.js";

export function scXpConfigLevelRoles(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('level-roles')
            .setDescription('Set role(s) to be gained/lost at any arbitrary level.')
            .addIntegerOption((option) => 
                option.setName('level').setDescription('Level to set roles to be gained/lost at').setRequired(true))
            .addRoleOption(option =>
                option.setName("role")
                .setDescription("Role to add/remove at the specified level")
                .setRequired(true)
            )
            .addStringOption(option => 
                option.addChoices([
                {
                    name: "Insert Level Role",
                    value: "insert"
                },
                {
                    name: "Delete Level Role",
                    value: "delete"
                }
            ])
                .setName("command-context")
                .setDescription("Do you wish to insert a level-->role gain/loss or delete a level-->role gain/loss?")
                .setRequired(true))
            .addStringOption(option => 
                option.addChoices([
                {
                    name: "Reach Level --> Gain Role",
                    value: "gain"
                },
                {
                    name: "Reach Level --> Lose Role",
                    value: "lose"
                }
            ])
                .setName("level-result")
                .setDescription("Award this role at this level or revoke this role at this level?")
                .setRequired(true))
        )
}

export async function chatInputLevelRolesReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});


        let level = interaction.options.getInteger('level', true);
        let role = interaction.options.getRole('role', true);
        let context = interaction.options.getString('command-context', true);
        let result = interaction.options.getString('level-result', true);

        const gain = result == 'lose' ? false : true;
        const insert = context == 'delete' ? false : true;

        const gainString = gain ? 'awarded to' : 'revoked from'; 

        if (insert) {
            await addLevelRole(level, role.id, gain);
            return interaction.editReply({ content: `Successfully inserted new level role. <@&${role.id}> will be ${gainString} any user that reaches level ${level}.`});
        } else {
            await removeLevelRole(level, role.id);
            return interaction.editReply({ content: `Successfully deleted level role. <@&${role.id}> will no longer be awarded or revoked when a user reaches level ${level}.`});
        }
    } catch (error) {
        handleCommandError(interaction, error);
    }
}