import { Events, Listener, type MessageCommandDeniedPayload, type UserError } from '@sapphire/framework';

export class MessageCommandDenied extends Listener<typeof Events.MessageCommandDenied> {
  public run(error: UserError, { message }: MessageCommandDeniedPayload) {
    if (message.channel.isDMBased()) return;
    return message.channel.send(error.message);
  }
}