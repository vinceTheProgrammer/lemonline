import { SlashCommandBuilder, type SlashCommandOptionsOnlyBuilder, type SlashCommandSubcommandsOnlyBuilder } from "discord.js"
import { scXpConfigBase } from "./base.js";
import { scXpConfigBoost } from "./boost.js";
import { scXpConfigLevelRoles } from "./levelRoles.js";
import { scXpConfigServerCooldown } from "./serverCooldown.js";
import { scXpConfigServerFormula } from "./serverFormula.js";

export function gXpConfig(builder: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder) {
    return builder
    .addSubcommandGroup((group) => {
        group = group
        .setName('config')
        .setDescription('Manage various xp settings.');

        group = scXpConfigBase(group);
        group = scXpConfigBoost(group);
        group = scXpConfigLevelRoles(group);
        group = scXpConfigServerCooldown(group);
        group = scXpConfigServerFormula(group);

        return group;
    })
}

