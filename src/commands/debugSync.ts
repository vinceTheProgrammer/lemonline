import { Command } from '@sapphire/framework';
import { CustomError, handleCommandError } from '../utils/errors.js';
import { syncIntroPost } from '../utils/intro.js';
import { ErrorType } from '../constants/errors.js';
import { isGuildMember } from '@sapphire/discord.js-utilities';
export class DebugIntroSyncCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'debug-sync',
            description: 'Debugs introduction syncing',
            preconditions: ['StaffOnly']
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description),
                //{ idHints: ['1377120476148662346'] }
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        try {
            const member = interaction.member;
            if (!member || !isGuildMember(member)) throw new CustomError("Member is null or is an APIInteractionGuildMember (not what we need)", ErrorType.Error);
            const guild = interaction.guild;
            if (!guild) throw new CustomError("Guild is null", ErrorType.Error);
            await syncIntroPost(member, guild);
        } catch (error) {
            handleCommandError(interaction, error);
        }
    }
}