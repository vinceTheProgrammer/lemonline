import type { SlashCommandSubcommandGroupBuilder } from "discord.js";

export function scXpConfigBase(builder: SlashCommandSubcommandGroupBuilder) {
    return builder.addSubcommand((command) =>
        command
            .setName('channel-base')
            .setDescription('Set base xp gained when specified user event occurs in the specified channel.')
            .addIntegerOption((option) => 
                option.setName('amount').setDescription('Amount to set the user\'s xp to.').setRequired(true))
            .addStringOption(option => 
                option.addChoices([
                {
                    name: "Message Create",
                    value: "messageCreate"
                },
                {
                    name: "Thread/Post Create",
                    value: "threadCreate"
                }
            ])
                .setName("event")
                .setDescription("The event to award xp upon emission.")
                .setRequired(false))
            .addChannelOption(option =>
                option.setName("channel")
                .setDescription("Channel to apply this base xp setting to. Category channel will apply to all subchannels.")
                .setRequired(false)
            )
        )
}

export async function chatInputBaseReal(interaction: Command.ChatInputCommandInteraction) {
    try {
        let channel = interaction.options.getChannel('channel');
        let multiplier = interaction.options.getNumber('multiplier', true);
        let expiration = interaction.options.getString('expiration');

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        if (!channel) {
            const interactionChannel = interaction.channel;
            if (!interactionChannel) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not defined.", ErrorType.Error);
            if (!(interactionChannel.type == ChannelType.GuildText)) throw new CustomError("Channel argument not supplied and the channel related to this interaction is not a guild text channel.", ErrorType.Error);
            channel = interactionChannel;
        }

        let expirationString = '';
        let expirationDate = undefined;
        if (expiration) {
            expirationDate = parseRelativeDate(expiration);
            expirationString = `\nThis boost is set to expire ${getDiscordRelativeTime(expirationDate)}`;
        }

        await setChannelMultiplier(channel.id, multiplier, expirationDate);

        return interaction.editReply({ content: `Successfully set **${multiplier}**x multiplier for all xp gain in <#${channel.id}>.${expirationString}`});
    } catch (error) {
        handleCommandError(interaction, error);
    }
}