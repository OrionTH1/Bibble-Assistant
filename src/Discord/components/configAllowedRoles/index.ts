import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  RoleSelectMenuBuilder,
  type ButtonInteraction,
  type EmbedBuilder,
  type RoleSelectMenuInteraction,
} from "discord.js";
import { responseEmbed } from "../response/index.js";
import { database } from "../../../Database/DatabaseClient.js";
import type { GuildConfig } from "../../types/types.js";

export class ConfigAllowedRolesComponent {
  private roleSelected?: string;
  private selectRow?: ActionRowBuilder<RoleSelectMenuBuilder>;
  private buttonsRow?: ActionRowBuilder<ButtonBuilder>;
  private embed?: EmbedBuilder;

  constructor(interaction: ButtonInteraction) {
    this.createAllowedRoleConfig(interaction);
  }

  public async createAllowedRoleConfig(interaction: ButtonInteraction) {
    const guild = interaction.guild;
    const guildConfig = await this.getGuildConfig(interaction);
    if (!guild || !guildConfig) return;

    const allowedRoles: string[] = JSON.parse(guildConfig.allowedRoles);
    const mentionRoles = allowedRoles.map((roles) => `<@&${roles}>`).join("\n");

    this.embed = responseEmbed(
      "Configurar quais cargos podem usar a Deborah",
      `**Caso nenhum cargo seja selecionado, a Deborah poderá ser usada por qualquer cargo**\n\nCargos permitidos: ${
        allowedRoles.length > 0 ? `\n${mentionRoles}` : "`Todos`"
      }`
    );
    const selectRole = new RoleSelectMenuBuilder()
      .setCustomId("select-role")
      .setPlaceholder("Selecione o cargo");

    const addRoleAllowed = new ButtonBuilder()
      .setLabel("Adicionar cargo permitido")
      .setCustomId("add-allowed-role-button")
      .setStyle(ButtonStyle.Success)
      .setEmoji("➕");

    const removeAllowedRole = new ButtonBuilder()
      .setLabel("Remover cargo da lista")
      .setCustomId("remove-role-from-list-button")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("➖");

    const backToHome = new ButtonBuilder()
      .setLabel("Voltar ao início")
      .setCustomId("back-to-home-button")
      .setStyle(ButtonStyle.Secondary);

    this.selectRow =
      new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(selectRole);

    this.buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      addRoleAllowed,
      removeAllowedRole,
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

  public async editAllowedRole(interaction: RoleSelectMenuInteraction) {
    this.roleSelected = interaction.values[0];
  }

  public async addAllowedRole(interaction: ButtonInteraction) {
    const guildConfig = await this.getGuildConfig(interaction);

    if (!this.roleSelected || !interaction.guild || !guildConfig) return;

    const allowedRoles: string[] = JSON.parse(guildConfig.allowedRoles);

    const isRoleAlreadyAdded = allowedRoles.includes(this.roleSelected);
    if (!isRoleAlreadyAdded) {
      allowedRoles.push(this.roleSelected);
    }

    const newGuildConfig: GuildConfig = {
      id: interaction.guild.id,
      allowedChannels: guildConfig.allowedChannels,
      allowedRoles: JSON.stringify(allowedRoles),
    };

    this.updateGuildConfig(newGuildConfig, interaction);
  }

  public async removeAllowedRole(interaction: ButtonInteraction) {
    const guildConfig = await this.getGuildConfig(interaction);

    if (!this.roleSelected || !interaction.guild || !guildConfig) return;

    const allowedRoles: string[] = JSON.parse(guildConfig.allowedRoles);

    const roleAllowedIndex = allowedRoles.findIndex(
      (element) => element === this.roleSelected
    );

    if (roleAllowedIndex !== -1) {
      allowedRoles.splice(roleAllowedIndex, 1);
    }

    const newGuildConfig: GuildConfig = {
      id: interaction.guild.id,
      allowedChannels: guildConfig.allowedChannels,
      allowedRoles: JSON.stringify(allowedRoles),
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

    const allowedRoles: string[] = JSON.parse(newGuildConfig.allowedRoles);

    const mentionRoles = allowedRoles.map((role) => `<@&${role}>`).join("\n");

    interaction.message.edit({
      embeds: [
        this.embed.setDescription(
          `**Caso nenhum cargo seja selecionado, a Deborah poderá ser usada por qualquer cargos**\n\nCargos permitidos: ${
            allowedRoles.length > 0 ? `\n${mentionRoles}` : "`Todos`"
          }`
        ),
      ],
      components: [this.selectRow, this.buttonsRow],
    });
  }
}
