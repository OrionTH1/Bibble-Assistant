import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  type ChannelSelectMenuInteraction,
  ChannelType,
  type EmbedBuilder,
} from "discord.js";
import { responseEmbed } from "../response/index.js";

export class CreatePannelComponent {
  private channelSelected?: string;
  private selectRow?: ActionRowBuilder<ChannelSelectMenuBuilder>;
  private buttonRow?: ActionRowBuilder<ButtonBuilder>;
  private embed?: EmbedBuilder;

  constructor(interaction: ButtonInteraction) {
    this.init(interaction);
  }

  async init(interaction: ButtonInteraction) {
    this.embed = responseEmbed(
      "Configuração de IA Chats",
      "Selecione o canal onde as IA Chats serão criadas\n\nCanal selecionado: `Não selecionado`"
    );

    const selectChannel = new ChannelSelectMenuBuilder()
      .setCustomId("select-channels")
      .setPlaceholder("Selecione o canal")
      .setChannelTypes(ChannelType.GuildText);
    const addChannelButton = new ButtonBuilder()
      .setLabel("Adicionar canal")
      .setCustomId("add-channel-allowed-button")
      .setStyle(ButtonStyle.Success);

    const backToHome = new ButtonBuilder()
      .setLabel("Voltar ao início")
      .setCustomId("back-to-home-button")
      .setStyle(ButtonStyle.Secondary);
    this.selectRow =
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
        selectChannel
      );

    this.buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      addChannelButton,
      backToHome
    );

    await interaction.message.edit({
      embeds: [this.embed],
      components: [this.selectRow, this.buttonRow],
    });
  }

  async editChannelSelected(interaction: ChannelSelectMenuInteraction) {
    if (!this.embed || !this.selectRow || !this.buttonRow) return;

    this.channelSelected = interaction.values[0];

    await interaction.message.edit({
      embeds: [
        this.embed.setDescription(
          `Selecione o canal aonde os IA Chats serão criados\n\nCanal selecionado: <#${this.channelSelected}>`
        ),
      ],
      components: [this.selectRow, this.buttonRow],
    });
  }

  async createPannel(interaction: ButtonInteraction) {
    if (!this.channelSelected) return;

    const channel = interaction.client.channels.cache.get(this.channelSelected);

    if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

    const pannel = responseEmbed(
      "Inicie seu Chat com a Deborah",
      `
      Para iniciar seu chat com a Deborah, clique no botão abaixo
      Informações sobre o Chat:
      - Encerre o chat depois que acabar de utilizar
      \n- Nesse chat a Deborah tem memória, então você pode fazer perguntas relacionadas às mensagens anteriores
      \n- Nesse Chat a Deborah dará respostas mais completas e aprofundadas, para respostas mais simples, use o /ask
      \n- O chat é encerrado e todo o histórico é apagado automaticamente depois de 1 dia após ser criado
      \n- O Chat também pode ser encerrado escrevendo !encerrar
      \nO Chat IA com a Deborah é visível somente para você e para os administradores.
      `
    );

    const createChannel = new ButtonBuilder()
      .setLabel("Iniciar chat")
      .setCustomId("create-ai-chat")
      .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      createChannel
    );

    channel.send({ embeds: [pannel], components: [buttonRow] });
  }
}
