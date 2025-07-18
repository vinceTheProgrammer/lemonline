import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags, ChannelType } from "discord.js";
import { ErrorType } from "../../../constants/errors.js";
import { setChannelMultiplier, setServerLevelFormula } from "../../../utils/database.js";
import { CustomError, handleCommandError } from "../../../utils/errors.js";
import { getDiscordRelativeTime } from "../../../utils/format.js";
import { parseRelativeDate } from "../../../utils/time.js";

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
    
            await setServerLevelFormula('1376370662360481812', formulaString);
    
            return interaction.editReply({ content: `Successfully set server level formula to ${formulaString}.`});
        } catch (error) {
            handleCommandError(interaction, error);
        }
}