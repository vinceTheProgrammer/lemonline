import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags } from "discord.js";
import { handleCommandError } from "../../../utils/errors.js";
import { setLevelFormula } from "../../../services/xpConfig.js";

export function scXpConfigServerFormula(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('level-formula')
            .setDescription('Set the formula used to determine xp needed for each level.')
            .addStringOption((option) => 
                option.setName('formula').setDescription('Formula string. Javascript expression with "level" as an available parameter.').setRequired(true))
        )
}

export async function chatInputServerFormulaReal(interaction: Command.ChatInputCommandInteraction) {
    try {
            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});
    
            let formulaString = interaction.options.getString('formula', true);
    
            await setLevelFormula(formulaString);

            return interaction.editReply({ content: `Successfully set server level formula to ${formulaString}.`});
        } catch (error) {
            handleCommandError(interaction, error);
            return;
        }
}