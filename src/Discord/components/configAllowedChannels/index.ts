import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ButtonInteraction,
  type EmbedBuilder,
  ChannelSelectMenuBuilder,
  type ChannelSelectMenuInteraction,
} from "discord.js";
import { responseEmbed } from "../response/index.js";
import { database } from "../../../Database/DatabaseClient.js";
import type { GuildConfig } from "../../types/types.js";

export class ConfigAllowedChannelsComponent {
  private channelSelected?: string;
  private selectRow?: ActionRowBuilder<ChannelSelectMenuBuilder>;
  private buttonsRow?: ActionRowBuilder<ButtonBuilder>;
  private embed?: EmbedBuilder;

  constructor(interaction: ButtonInteraction) {
    this.createAllowedConfigConfig(interaction);
  }

  public async createAllowedConfigConfig(interaction: ButtonInteraction) {
    const guild = interaction.guild;
    const guildConfig = await this.getGuildConfig(interaction);
    if (!guild || !guildConfig) return;

    const allowedChannels: string[] = JSON.parse(guildConfig.allowedChannels);
    const mentionChannels = allowedChannels
      .map((channel) => `<#${channel}>`)
      .join("\n");

    this.embed = responseEmbed(
      "Configurar quais a Deborah pode ser usada",
      `**Caso nenhum canal seja selecionado, a Deborah poderá ser usada em qualquer canal**\n\nCanais permitidos:${
        allowedChannels.length > 0 ? `\n${mentionChannels}` : "`Todos`"
      }`
    );
    const selectChannel = new ChannelSelectMenuBuilder()
      .setCustomId("select-channels")
      .setPlaceholder("Selecione o canal");
    const addAllowedChannel = new ButtonBuilder()
      .setLabel("Adicionar canal permitido")
      .setCustomId("add-allowed-channel-button")
      .setStyle(ButtonStyle.Success)
      .setEmoji("➕");
    const removeAllowedChannel = new ButtonBuilder()
      .setLabel("Remover canal da lista")
      .setCustomId("remove-channel-from-list-button")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("➖");
    const backToHome = new ButtonBuilder()
      .setLabel("Voltar ao início")
      .setCustomId("back-to-home-button")
      .setStyle(ButtonStyle.Secondary);

    this.selectRow =
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
        selectChannel
      );

    this.buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      addAllowedChannel,
      removeAllowedChannel,
      backToHome
    );

    await interaction.message.edit({
      embeds: [this.embed],
      components: [this.selectRow, this.buttonsRow],
    });
  }

  private async getGuildConfig(interaction: ButtonInteraction) {
    if (!interaction.guild) return;

    const guild = interaction.guild;

    let guildConfig = await database.getGuildConfig(guild.id);

    if (!guildConfig) {
      guildConfig = await database.createGuildConfig(
        guild.id,
        JSON.stringify([]),
        JSON.stringify([])
      );
    }

    return guildConfig;
  }

  public async editAllowedChannel(interaction: ChannelSelectMenuInteraction) {
    this.channelSelected = interaction.values[0];
  }

  public async addAllowedChannel(interaction: ButtonInteraction) {
    const guildConfig = await this.getGuildConfig(interaction);

    if (!this.channelSelected || !interaction.guild || !guildConfig) return;

    const allowedChannels: string[] = JSON.parse(guildConfig.allowedChannels);

    const isChannelAlreadyAdded = allowedChannels.includes(
      this.channelSelected
    );

    if (!isChannelAlreadyAdded) {
      allowedChannels.push(this.channelSelected);
    }

    const newGuildConfig: GuildConfig = {
      id: interaction.guild.id,
      allowedChannels: JSON.stringify(allowedChannels),
      allowedRoles: guildConfig.allowedRoles,
    };

    this.updateGuildConfig(newGuildConfig, interaction);
  }

  public async removeAllowedChannel(interaction: ButtonInteraction) {
    const guildConfig = await this.getGuildConfig(interaction);

    if (!this.channelSelected || !interaction.guild || !guildConfig) return;

    const allowedChannels: string[] = JSON.parse(guildConfig.allowedChannels);

    const allowedChannelIndex = allowedChannels.findIndex(
      (element) => element === this.channelSelected
    );
    if (allowedChannelIndex !== -1) {
      allowedChannels.splice(allowedChannelIndex, 1);
    }

    const newGuildConfig: GuildConfig = {
      id: interaction.guild.id,
      allowedChannels: JSON.stringify(allowedChannels),
      allowedRoles: guildConfig.allowedRoles,
    };

    this.updateGuildConfig(newGuildConfig, interaction);
  }

  private async updateGuildConfig(
    newGuildConfig: GuildConfig,
    interaction: ButtonInteraction
  ) {
    if (!this.embed || !this.buttonsRow || !this.selectRow) return;

    database.updateGuildConfig(
      newGuildConfig.id,
      newGuildConfig.allowedChannels,
      newGuildConfig.allowedRoles
    );

    const allowedChannels: string[] = JSON.parse(
      newGuildConfig.allowedChannels
    );

    const mentionChannels = allowedChannels
      .map((channel) => `<#${channel}>`)
      .join("\n");

    interaction.message.edit({
      embeds: [
        this.embed.setDescription(
          `**Caso nenhum cargo seja selecionado, a Deborah poderá ser usada por qualquer cargos**\n\nCargos permitidos: ${
            allowedChannels.length > 0 ? `\n${mentionChannels}` : "`Todos`"
          }`
        ),
      ],
      components: [this.selectRow, this.buttonsRow],
    });
  }
}
