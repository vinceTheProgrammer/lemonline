import { container, type Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags, ChannelType } from "discord.js";
import { ErrorType } from "../../../constants/errors.js";
import { getServerXpSettings, setChannelMultiplier } from "../../../utils/database.js";
import { CustomError, handleCommandError } from "../../../utils/errors.js";
import { getDiscordRelativeTime } from "../../../utils/format.js";
import { parseRelativeDate } from "../../../utils/time.js";
import { getServerXpSettingsEmbed } from "../../../utils/embeds.js";

export function scXpSummaryServer(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('server')
            .setDescription('Summary of server-wide settings.')
        )
}

export async function chatInputServerReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        const serverXpSettings = await getServerXpSettings('1376370662360481812'); // TODO?

        const embed = await getServerXpSettingsEmbed(serverXpSettings?.cooldownSeconds, serverXpSettings?.levelFormula);

        return interaction.editReply({ embeds: [embed]});
    } catch (error) {
        handleCommandError(interaction, error);
    }
}