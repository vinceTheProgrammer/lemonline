import { isAnyInteractableInteraction, MessageBuilder, PaginatedMessage } from "@sapphire/discord.js-utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type Interaction } from "discord.js";



export async function createOnboardingPages(interaction: Interaction) : Promise<void> {

    if (!isAnyInteractableInteraction(interaction)) return;

    const message = new PaginatedMessage();

    const page1 = new EmbedBuilder()
        .setTitle("Page 1")
        .setImage("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Lemon_-_whole_and_split.jpg/1920px-Lemon_-_whole_and_split.jpg")
        .setDescription("Epic page content goes here")

    const page2 = new EmbedBuilder()
        .setTitle("Page 2")
        .setDescription("even epicer content goes here")

    const page3 = new EmbedBuilder()
        .setTitle("Page 3")
        .setDescription("etc")

    
    const button = new ButtonBuilder()
        .setCustomId('format-intro')
        .setEmoji('✍')
        .setLabel("Get formatted text for post")
        .setStyle(ButtonStyle.Primary)
    const components = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([button])
    
    
    const page4Embed = new EmbedBuilder()
        .setTitle("Page 4")
        .setDescription("Please click the button below and fill out the requested fields to gain access to the rest of the server.")
    const page4 = new MessageBuilder()
        .setEmbeds([page4Embed])
        .setComponents([components])



    message.addPageEmbed(page1);
    message.addPageEmbed(page2);
    message.addPageEmbed(page3);
    message.addPage(page4);

    message.run(interaction);
}