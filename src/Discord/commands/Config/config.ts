import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { responseEmbed } from "../../components/response/index.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure a Deborah")
    .setContexts(0),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (
      interaction.inGuild() &&
      interaction.member.permissions instanceof PermissionsBitField &&
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      console.log(interaction.member.permissions);
      console.log("test");
      return interaction.reply({
        content: "Você não tem permissão para usar este comando",
        ephemeral: true,
      });
    }
    const response = responseEmbed(
      "Configure a Deborah",
      "Selecione a opção que deseja configurar"
    );

    const channelsAllowedButton = new ButtonBuilder()
      .setCustomId("allowed-channels-config-button")
      .setLabel("Configurar canais permitidos")
      .setStyle(ButtonStyle.Primary);

    const rolesAllowedButton = new ButtonBuilder()
      .setCustomId("allowed-roles-config-button")
      .setLabel("Configurar cargos permitidos")
      .setStyle(ButtonStyle.Primary);

    const createChatPannelButton = new ButtonBuilder()
      .setCustomId("create-chat-pannel-config-button")
      .setLabel("Criar painel de Chat")
      .setStyle(ButtonStyle.Primary);

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      channelsAllowedButton,
      rolesAllowedButton,
      createChatPannelButton
    );

    await interaction.reply({
      embeds: [response],
      components: [buttons],
    });
  },
};

export { command };
