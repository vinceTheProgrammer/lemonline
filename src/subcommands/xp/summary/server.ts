import { type Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags } from "discord.js";
import { getServerXpSettings } from "../../../utils/database.js";
import { handleCommandError } from "../../../utils/errors.js";
import { getServerXpSettingsEmbed } from "../../../utils/embeds.js";
import { GuildId } from "../../../constants/guilds.js";

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

        const serverXpSettings = await getServerXpSettings(GuildId.LemonlineStudios);

        const embed = await getServerXpSettingsEmbed(serverXpSettings?.cooldownSeconds, serverXpSettings?.levelFormula);

        return interaction.editReply({ embeds: [embed]});
    } catch (error) {
        handleCommandError(interaction, error);
        return;
    }
}