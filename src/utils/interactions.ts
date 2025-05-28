import { MessageFlags, type GuildMember, type ModalSubmitInteraction } from "discord.js";
import { verifyMember } from "./roles.js";
import type { Command } from "@sapphire/framework";
import { CustomError } from "./errors.js";
import { ErrorMessage, ErrorType } from "../constants/errors.js";
import { getProfileEmbed } from "./embeds.js";

export async function verifyModalSubmit(interaction: ModalSubmitInteraction, member: GuildMember) {
    try {
        await interaction.reply({ content: `Processing...`, flags: [MessageFlags.Ephemeral] });

        await verifyMember(member);

        await interaction.editReply({content: 'Sucessfully verified you. :)'});
    } catch (error) {
        throw error;
    }
}

export async function handleProfileInteraction(interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction, userId: string) {
    try {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const guild = interaction.guild;

        if (!guild) throw new CustomError(ErrorMessage.GuildNotDefined, ErrorType.Error, null);

        const member = guild.members.cache.get(userId);

        if (!member) throw new CustomError(ErrorMessage.MemberNotDefined, ErrorType.Error, null);

        const embed = await getProfileEmbed(member);

        await interaction.editReply({embeds: [embed]});
    } catch (error) {
        throw error;
    }
}