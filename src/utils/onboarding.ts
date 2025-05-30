import { isAnyInteractableInteraction, MessageBuilder, PaginatedMessage } from "@sapphire/discord.js-utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentBuilder, createComponentBuilder, EmbedBuilder, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle, type Interaction, type MessagePayload } from "discord.js";

export async function getOnboardingButton() : Promise<MessageBuilder> {

    const button = new ButtonBuilder()
        .setCustomId('begin-onboarding')
        .setEmoji('👋')
        .setLabel("Begin onboarding")
        .setStyle(ButtonStyle.Primary)

    const components = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([button])

    const message = new MessageBuilder()
        .setComponents([components])

    return message;
}

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

export async function getFormatIntroModal() : Promise<ModalBuilder> {
    const modal = new ModalBuilder()
        .setCustomId('format-intro-modal')
        .setTitle('Onboarding');
    
    // Add a text input field
    const usernameInput = new TextInputBuilder()
        .setCustomId('username')
        .setLabel('Username')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20)
        .setRequired(true);

        // Add a text input field
    const descriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Briefly describe yourself')
        .setMaxLength(250)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const interestsInput = new TextInputBuilder()
        .setCustomId('interests')
        .setLabel('Briefly describe your interests/hobbies')
        .setMaxLength(250)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const socialsInput1 = new TextInputBuilder()
        .setCustomId('socials1')
        .setLabel('Social 1')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    const socialsInput2 = new TextInputBuilder()
        .setCustomId('socials2')
        .setLabel('Social 2')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

        const socialsInput3 = new TextInputBuilder()
        .setCustomId('socials3')
        .setLabel('Social 3')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);


    // Build action row for the input
    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(usernameInput);
    const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);
    const actionRow3 = new ActionRowBuilder<TextInputBuilder>().addComponents(interestsInput);
    const actionRow5 = new ActionRowBuilder<TextInputBuilder>().addComponents(socialsInput1);
    const actionRow6 = new ActionRowBuilder<TextInputBuilder>().addComponents(socialsInput2);
    const actionRow7 = new ActionRowBuilder<TextInputBuilder>().addComponents(socialsInput3);




    // Add the action row to the modal
    modal.addComponents([actionRow, actionRow2, actionRow3, actionRow5, actionRow6]);

    return modal;
}