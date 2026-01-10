import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags } from "discord.js";
import { handleCommandError } from "../../../utils/errors.js";
import { setServerCooldown } from "../../../services/xpConfig.js";

export function scXpConfigServerCooldown(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('server-cooldown')
            .setDescription('Set xp gain cooldown.')
            .addIntegerOption((option) => 
                option.setName('cooldown-seconds').setDescription('Length of xp gain cooldown in seconds.').setRequired(true))
        )
}

export async function chatInputServerCooldownReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        let cooldownSeconds = interaction.options.getInteger('cooldown-seconds', true);

        await setServerCooldown(cooldownSeconds);

        return interaction.editReply({ content: `Successfully set xp gain cooldown to ${cooldownSeconds} seconds.`});
    } catch (error) {
        handleCommandError(interaction, error);
        return;
    }
}