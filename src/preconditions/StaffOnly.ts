import { AllFlowsPrecondition } from '@sapphire/framework';
import { CommandInteraction, Message, type ContextMenuCommandInteraction, type Snowflake } from 'discord.js';
import { RoleId } from '../constants/roles.js';
import { isGuildMember, isMessageInstance } from '@sapphire/discord.js-utilities';

export class UserPrecondition extends AllFlowsPrecondition {
	#message = 'You must be a staff member to use this command.';
    #unableMessage = 'Unable to determine roles. Please try again later.';

	public override chatInputRun(interaction: CommandInteraction) {
		return this.doStaffCheck(interaction);
	}

	public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.doStaffCheck(interaction);
	}

	public override messageRun(message: Message) {
		return this.doStaffCheck(message);
	}

	private doStaffCheck(interactionOrMessage: CommandInteraction | Message) {

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

		return rolesCache.has(RoleId.Staff) ? this.ok() : this.error({ message: this.#message });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		StaffOnly: never;
	}
}