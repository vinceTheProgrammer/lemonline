import { AllFlowsPrecondition } from '@sapphire/framework';
import { CommandInteraction, Message, type ContextMenuCommandInteraction, type Snowflake } from 'discord.js';
import { RoleId } from '../constants/roles.js';
import { isGuildMember, isMessageInstance } from '@sapphire/discord.js-utilities';
import { UserId } from '../constants/users.js';

export class UserPrecondition extends AllFlowsPrecondition {
	#message = 'You must be an admin to use this command.';
    #unableMessage = 'There was a problem while resolving your member info. Please try again later.';

	public override chatInputRun(interaction: CommandInteraction) {
		return this.doAdminCheck(interaction);
	}

	public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.doAdminCheck(interaction);
	}

	public override messageRun(message: Message) {
		return this.doAdminCheck(message);
	}

	private doAdminCheck(interactionOrMessage: CommandInteraction | Message) {

        let rolesCache = null;
        let member = undefined;

        if (interactionOrMessage instanceof CommandInteraction) {
            let member_ = interactionOrMessage.member;
            if (!member_ || !isGuildMember(member_)) return this.error({ message: this.#unableMessage });
            member = member_;
        } else if (interactionOrMessage instanceof Message && isMessageInstance(interactionOrMessage)) {
            let member_ = interactionOrMessage.member;
            if (!member) return this.error({ message: this.#unableMessage });
            member = member_;
        }

        if (!member) return this.error({ message: this.#unableMessage });
        rolesCache = member.roles.cache;

		if (!rolesCache) {
			return this.error({ message: this.#unableMessage });
		}

		return rolesCache.has(RoleId.Owner) || rolesCache.has(RoleId.Admin) || member.id === UserId.lemon || member.id === UserId.vince ? this.ok() : this.error({ message: this.#message });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		AdminOnly: never;
	}
}