import { WebhookClient } from "discord.js";
import { ErrorType } from "../constants/errors.js";
import { CustomError } from "./custom-error.js";

const webhook = new WebhookClient({
    id: process.env.WEBHOOK_ID ?? '',
    token: process.env.WEBHOOK_TOKEN ?? '',
});

export async function getIntroWebhookClient() {
    if (!webhook) throw new CustomError('Webhook client not initialized', ErrorType.Error);
    return webhook;
}