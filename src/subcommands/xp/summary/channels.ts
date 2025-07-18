import type { Command } from "@sapphire/framework";
import { SlashCommandSubcommandGroupBuilder, MessageFlags, ChannelType } from "discord.js";
import { ErrorType } from "../../../constants/errors.js";
import { getAllChannelXpSettings, setChannelMultiplier } from "../../../utils/database.js";
import { CustomError, handleCommandError } from "../../../utils/errors.js";
import { getDiscordRelativeTime } from "../../../utils/format.js";
import { parseRelativeDate } from "../../../utils/time.js";

export function scXpSummaryChannels(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('channels')
            .setDescription('Summary of xp settings for all channels.')
        )
}

export async function chatInputChannelsReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        const xpSettings = await getAllChannelXpSettings();

        const header = `channel msgXp threadXp multiplier multiplierExpiration`;

        const xpSettingStrings = xpSettings.map(xpSetting => `<#${xpSetting.channelId}> ${xpSetting.baseMessageCreate} ${xpSetting.baseThreadCreate} ${xpSetting.multiplier} ${xpSetting.multiplierExpiration ? getDiscordRelativeTime(xpSetting.multiplierExpiration) : 'Perma'}`);

        const xpSettingsString = header + "\n- " + xpSettingStrings.join("\n- ");

        return interaction.editReply({ content: xpSettingsString});
    } catch (error) {
        handleCommandError(interaction, error);
    }
}