import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type CacheType,
  type ChannelSelectMenuInteraction,
  type ChatInputCommandInteraction,
  ComponentType,
  type InteractionCollector,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
  type RoleSelectMenuInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { responseEmbed } from "../../components/response/index.js";
import { CreatePannelComponent } from "../../components/createPannelChat/index.js";
import { ConfigAllowedChannelsComponent } from "../../components/configAllowedChannels/index.js";
import { ConfigAllowedRolesComponent } from "../../components/configAllowedRoles/index.js";
import { verifyIfMemberHasAdmPermission } from "../../utils/verifyIfMemberHasAdmPermission.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure a Deborah")
    .setContexts(0),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const permission = verifyIfMemberHasAdmPermission(interaction);
    if (!permission) {
      return interaction.reply({
        content: "Você não tem permissão para usar este comando",
        flags: MessageFlags.Ephemeral,
      });
    }
    const response = responseEmbed(
      "Configure a Deborah",
      "Selecione a opção que deseja configurar"
    );

    const channelsAllowedButton = new ButtonBuilder()
      .setCustomId("config-allowed-channels-button")
      .setLabel("Configurar canais permitidos")
      .setStyle(ButtonStyle.Primary);

    const rolesAllowedButton = new ButtonBuilder()
      .setCustomId("config-allowed-roles-button")
      .setLabel("Configurar cargos permitidos")
      .setStyle(ButtonStyle.Primary);

    const createChatPannelButton = new ButtonBuilder()
      .setCustomId("create-chat-pannel-button")
      .setLabel("Criar painel de Chat")
      .setStyle(ButtonStyle.Primary);

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      channelsAllowedButton,
      rolesAllowedButton,
      createChatPannelButton
    );

    const message = await interaction.reply({
      embeds: [response],
      components: [buttons],
    });

    const buttonCollector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: verifyIfMemberHasAdmPermission,
    });

    let configAllowedButtonCollector: InteractionCollector<ButtonInteraction>;
    let selectChannelCollector: InteractionCollector<ChannelSelectMenuInteraction>;
    let selectRoleCollector: InteractionCollector<RoleSelectMenuInteraction>;

    buttonCollector.on("collect", async (interaction) => {
      switch (interaction.customId) {
        case "create-chat-pannel-button": {
          interaction.deferUpdate();
          const createPannelComponent = new CreatePannelComponent(interaction);

          configAllowedButtonCollector =
            message.createMessageComponentCollector({
              componentType: ComponentType.Button,
              filter: verifyIfMemberHasAdmPermission,
            });

          selectChannelCollector =
            interaction.message.createMessageComponentCollector({
              componentType: ComponentType.ChannelSelect,
              filter: verifyIfMemberHasAdmPermission,
            });

          selectChannelCollector.on("collect", async (interaction) => {
            interaction.deferUpdate();

            createPannelComponent.editChannelSelected(interaction);
          });

          configAllowedButtonCollector.on("collect", (interaction) => {
            if (
              interaction.customId === "back-to-home-button" ||
              interaction.customId !== "add-channel-allowed-button"
            )
              return;

            interaction.deferUpdate();

            createPannelComponent.createPannel(interaction);
          });
          break;
        }

        case "config-allowed-roles-button": {
          interaction.deferUpdate();
          const configAllowedRoles = new ConfigAllowedRolesComponent(
            interaction
          );

          configAllowedButtonCollector =
            interaction.message.createMessageComponentCollector({
              componentType: ComponentType.Button,
              filter: verifyIfMemberHasAdmPermission,
            });

          selectRoleCollector =
            interaction.message.createMessageComponentCollector({
              componentType: ComponentType.RoleSelect,
              filter: verifyIfMemberHasAdmPermission,
            });

          selectRoleCollector.on("collect", async (interaction) => {
            interaction.deferUpdate();
            configAllowedRoles.editAllowedRole(interaction);
          });

          configAllowedButtonCollector.on("collect", (interaction) => {
            switch (interaction.customId) {
              case "add-allowed-role-button":
                configAllowedRoles.addAllowedRole(interaction);
                interaction.deferUpdate();
                break;
              case "remove-role-from-list-button":
                configAllowedRoles.removeAllowedRole(interaction);
                interaction.deferUpdate();
                break;
            }
          });

          break;
        }

        case "config-allowed-channels-button": {
          if (!interaction.guild) return;
          interaction.deferUpdate();

          const configAllowedChannels = new ConfigAllowedChannelsComponent(
            interaction
          );

          configAllowedButtonCollector =
            interaction.message.createMessageComponentCollector({
              componentType: ComponentType.Button,
              filter: verifyIfMemberHasAdmPermission,
            });

          selectChannelCollector =
            interaction.message.createMessageComponentCollector({
              componentType: ComponentType.ChannelSelect,
              filter: verifyIfMemberHasAdmPermission,
            });

          selectChannelCollector.on("collect", (interaction) => {
            interaction.deferUpdate();
            configAllowedChannels.editAllowedChannel(interaction);
          });

          configAllowedButtonCollector.on("collect", (interaction) => {
            switch (interaction.customId) {
              case "add-allowed-channel-button":
                interaction.deferUpdate();
                configAllowedChannels.addAllowedChannel(interaction);
                break;
              case "remove-channel-from-list-button":
                configAllowedChannels.removeAllowedChannel(interaction);
                interaction.deferUpdate();
                break;
            }
          });

          break;
        }

        case "back-to-home-button":
          // Stop old collectors
          if (selectRoleCollector) {
            selectRoleCollector.stop();
          }

          if (selectChannelCollector) {
            selectChannelCollector.stop();
          }

          configAllowedButtonCollector.stop();

          interaction.deferUpdate();

          interaction.message.edit({
            embeds: [response],
            components: [buttons],
          });
      }
    });
  },
};

export { command };
