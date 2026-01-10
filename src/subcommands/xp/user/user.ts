import { SlashCommandBuilder, type SlashCommandSubcommandsOnlyBuilder } from "discord.js"
import { scXpUserSet } from "./set.js";
import { scXpUserIncrease } from "./increase.js";
import { scXpUserDecrease } from "./decrease.js";

export function gXpUser(builder: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder) {
    return builder
    .addSubcommandGroup((group) => {
        group = group
        .setName('user')
        .setDescription('Manage the xp of users.');

        group = scXpUserSet(group);
        group = scXpUserIncrease(group);
        group = scXpUserDecrease(group);

        return group;
    })
}