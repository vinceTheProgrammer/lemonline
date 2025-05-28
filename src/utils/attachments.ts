import { AttachmentBuilder, type Attachment } from "discord.js";

export function getAttachments(fileAttachment: Attachment | null): AttachmentBuilder[] | undefined {
    return fileAttachment ? [new AttachmentBuilder(fileAttachment.url)] : undefined;
}