import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags } from "discord.js";
import { addXp } from "../../../utils/database.js";
import { handleCommandError } from "../../../utils/errors.js";

export function scXpUserIncrease(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('channel-boost')
            .setDescription('Set xp gain multiplier for when any user event occurs in the specified channel.')
            .addNumberOption((option) => 
                option.setName('multiplier').setDescription('Number to multiply all xp gain by. Xp gain is rounded to nearest integer.').setRequired(true))
            .addChannelOption(option =>
                option.setName("channel")
                .setDescription("Channel to apply this xp multiplier to. Category channel will apply to all subchannels.")
                .setRequired(false)
            )
            .addStringOption(option =>
                option.setName("")
            )
        )
}

export async function chatInputIncreaseReal(interaction: Command.ChatInputCommandInteraction) {
    try {
                const user = interaction.options.getUser('user', true);
                const amount = interaction.options.getInteger('amount', true);
    
    
                await interaction.deferReply({flags: [MessageFlags.Ephemeral]});
    
                const result = await addXp(user.id, amount);
    
                return interaction.editReply({ content: `Successfully increased <@${user.id}>'s xp by ${amount}. They now have ${result.xp} xp.`});
            } catch (error) {
                handleCommandError(interaction, error);
            }
}