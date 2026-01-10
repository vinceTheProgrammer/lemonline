import { SlashCommandBuilder, type SlashCommandSubcommandsOnlyBuilder } from "discord.js"
import { scXpSummaryChannel } from "./channel.js";
import { scXpSummaryChannels } from "./channels.js";
import { scXpSummaryLevel } from "./level.js";
import { scXpSummaryLevels } from "./levels.js";
import { scXpSummaryServer } from "./server.js";

export function gXpSummary(builder: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder) {
    return builder
    .addSubcommandGroup((group) => {
        group = group
        .setName('summary')
        .setDescription('View xp summary for various things.');

        group = scXpSummaryChannel(group);
        group = scXpSummaryChannels(group);
        group = scXpSummaryLevel(group);
        group = scXpSummaryLevels(group);
        group = scXpSummaryServer(group);

        return group;
    })
}