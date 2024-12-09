import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  ComponentType,
  Events,
  NewsChannel,
  RoleSelectMenuBuilder,
  ThreadAutoArchiveDuration,
  type Client,
} from "discord.js";
import { database } from "../../../../../Database/DatabaseClient.js";
import { responseEmbed } from "../../../../components/response/index.js";
import { onClickDeleteChatButton } from "./handlers/onClickDeleteChatButton.js";
import { onClickCreateAiChat } from "./handlers/onClickCreateAiChat.js";

export function onButtonClick(client: Client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton() || !interaction.channel) {
      return;
    }

    switch (interaction.customId) {
      case "delete-chat-button": {
        onClickDeleteChatButton(interaction);
        break;
      }
      case "allowed-channels-config-button": {
        interaction.deferUpdate();
        if (!interaction.guild) return;

        let guildConfig = await database.getGuildConfig(interaction.guild.id);

        if (!guildConfig) {
          guildConfig = await database.createGuildConfig(
            interaction.guild.id,
            JSON.stringify([]),
            JSON.stringify([])
          );
        }

        const allowedChannels: string[] = JSON.parse(
          guildConfig.allowedChannels
        );
        let mentionChannels = allowedChannels
          .map((channel) => `<#${channel}>`)
          .join("\n");

        const embed = responseEmbed(
          "Configurar quais a Deborah pode ser usada",
          `**Caso nenhum canal seja selecionado, a Deborah poderá ser usada em qualquer canal**\n\nCanais permitidos:${
            guildConfig.allowedChannels.length
              ? `\n${mentionChannels}`
              : "`Todos`"
          }`
        );
        const selectChannel = new ChannelSelectMenuBuilder()
          .setCustomId("select-channels")
          .setPlaceholder("Selecione o canal");
        const addChannelAllowed = new ButtonBuilder()
          .setLabel("Adicionar canal permitido")
          .setCustomId("add-allowed-channel-button")
          .setStyle(ButtonStyle.Success);
        const removeAllowedChannel = new ButtonBuilder()
          .setLabel("Remover canal da lista")
          .setCustomId("remove-channel-from-list-button")
          .setStyle(ButtonStyle.Danger);
        const selectRow =
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            selectChannel
          );
        const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          addChannelAllowed,
          removeAllowedChannel
        );
        const message = await interaction.message.edit({
          embeds: [embed],
          components: [selectRow, buttonsRow],
        });
        const selectCollector = message.createMessageComponentCollector({
          componentType: ComponentType.ChannelSelect,
        });
        const buttonCollect = message.createMessageComponentCollector({
          componentType: ComponentType.Button,
        });
        let channelSelected: string;
        selectCollector.on("collect", async (interaction) => {
          interaction.deferUpdate();
          channelSelected = interaction.values[0];
          const channel =
            interaction.client.channels.cache.get(channelSelected);
          if (channel && channel.type === ChannelType.GuildCategory) {
            for (const parent of channel.children.cache) {
              console.log(parent[1].name);
            }
          }
        });
        buttonCollect.on("collect", (interaction) => {
          if (!channelSelected || !channelSelected.length) return;
          const channel =
            interaction.client.channels.cache.get(channelSelected);
          if (!channel || channel.isDMBased()) return;
          interaction.deferUpdate();
          switch (interaction.customId) {
            case "add-allowed-channel-button": {
              const isChatAlreadyAdded = allowedChannels.includes(channel.id);
              if (isChatAlreadyAdded) break;

              allowedChannels.push(channel.id);
              break;
            }
            case "remove-channel-from-list-button": {
              const channelAllowedIndex = allowedChannels.findIndex(
                (element) => element === channel.id
              );
              if (channelAllowedIndex !== -1) {
                allowedChannels.splice(channelAllowedIndex, 1);
                break;
              }
              break;
            }
          }
          database.updateGuildConfig(
            channel.guildId,
            JSON.stringify(allowedChannels),
            guildConfig.allowedRoles
          );
          mentionChannels = allowedChannels
            .map((channel) => `<#${channel}>`)
            .join("\n");
          message.edit({
            embeds: [
              embed.setDescription(
                `**Caso nenhum canal seja selecionado, a Deborah poderá ser usada em qualquer canal**\n\nCanais permitidos:${
                  guildConfig.allowedChannels.length
                    ? `\n${mentionChannels}`
                    : "`Todos`"
                }`
              ),
            ],
            components: [selectRow, buttonsRow],
          });
        });
        break;
      }

      case "allowed-roles-config-button": {
        interaction.deferUpdate();
        const guild = interaction.guild;
        if (!guild) return;

        let guildConfig = await database.getGuildConfig(guild.id);

        if (!guildConfig) {
          guildConfig = await database.createGuildConfig(
            guild.id,
            JSON.stringify([]),
            JSON.stringify([])
          );
        }

        const allowedRoles: string[] = JSON.parse(guildConfig.allowedRoles);
        let mentionChannels = allowedRoles
          .map((channel) => `<@&${channel}>`)
          .join("\n");

        const embed = responseEmbed(
          "Configurar quais cargos podem usar a Deborah",
          `**Caso nenhum cargo seja selecionado, a Deborah poderá ser usada por qualquer cargos**\n\nCargos permitidos: ${
            allowedRoles.length > 0 ? `\n${mentionChannels}` : "`Todos`"
          }`
        );
        const selectRole = new RoleSelectMenuBuilder()
          .setCustomId("select-role")
          .setPlaceholder("Selecione o cargo");
        const addRoleAllowed = new ButtonBuilder()
          .setLabel("Adicionar cargo permitido")
          .setCustomId("add-allowed-role-button")
          .setStyle(ButtonStyle.Success);
        const removeAllowedRole = new ButtonBuilder()
          .setLabel("Remover cargo da lista")
          .setCustomId("remove-role-from-list-button")
          .setStyle(ButtonStyle.Danger);
        const selectRow =
          new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
            selectRole
          );
        const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          addRoleAllowed,
          removeAllowedRole
        );
        const message = await interaction.message.edit({
          embeds: [embed],
          components: [selectRow, buttonsRow],
        });
        const selectCollector = message.createMessageComponentCollector({
          componentType: ComponentType.RoleSelect,
        });
        const buttonCollect = message.createMessageComponentCollector({
          componentType: ComponentType.Button,
        });
        let roleSelected: string;
        selectCollector.on("collect", async (interaction) => {
          interaction.deferUpdate();
          roleSelected = interaction.values[0];
        });

        buttonCollect.on("collect", (interaction) => {
          if (!roleSelected || !roleSelected.length) return;
          const role = guild.roles.cache.get(roleSelected);
          if (!role) return;

          interaction.deferUpdate();
          switch (interaction.customId) {
            case "add-allowed-role-button": {
              const isRoleAlreadyAdded = allowedRoles.includes(role.id);
              if (isRoleAlreadyAdded) break;

              allowedRoles.push(role.id);
              break;
            }
            case "remove-role-from-list-button": {
              const roleAllowedIndex = allowedRoles.findIndex(
                (element) => element === role.id
              );
              if (roleAllowedIndex !== -1) {
                allowedRoles.splice(roleAllowedIndex, 1);
                break;
              }
              break;
            }
          }
          database.updateGuildConfig(
            guild.id,
            guildConfig.allowedChannels,
            JSON.stringify(allowedRoles)
          );

          mentionChannels = allowedRoles
            .map((channel) => `<@&${channel}>`)
            .join("\n");
          message.edit({
            embeds: [
              embed.setDescription(
                `**Caso nenhum canal seja selecionado, a Deborah poderá ser usada em qualquer canal**\n\nCanais permitidos:${
                  allowedRoles.length > 0 ? `\n${mentionChannels}` : "`Todos`"
                }`
              ),
            ],
            components: [selectRow, buttonsRow],
          });
        });

        break;
      }

      case "create-chat-pannel-config-button": {
        interaction.deferUpdate();
        let channelSelected: string[] = [];
        const embed = responseEmbed(
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

        const selectRow =
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            selectChannel
          );

        const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          addChannelButton
        );

        const message = await interaction.message.edit({
          embeds: [embed],
          components: [selectRow, buttonsRow],
        });

        const selectCollector = message.createMessageComponentCollector({
          componentType: ComponentType.ChannelSelect,
        });

        selectCollector.on("collect", async (interaction) => {
          interaction.deferUpdate();

          channelSelected = interaction.values;

          await message.edit({
            embeds: [
              embed.setDescription(
                `Selecione o canal aonde os IA Chats serão criados\n\nCanal selecionado: <#${channelSelected[0]}>`
              ),
            ],
            components: [selectRow, buttonsRow],
          });
        });

        const buttonCollect = message.createMessageComponentCollector({
          componentType: ComponentType.Button,
        });

        buttonCollect.on("collect", (interaction) => {
          if (!channelSelected.length) return;

          interaction.deferUpdate();
          const channel = interaction.client.channels.cache.get(
            channelSelected[0]
          );

          if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

          const pannel = responseEmbed(
            "Inicie seu Chat com a Deborah",
            "Para iniciar seu chat com a Deborah, clique no botão abaixo"
          );
          const createChannel = new ButtonBuilder()
            .setLabel("Iniciar chat")
            .setCustomId("create-ai-chat")
            .setStyle(ButtonStyle.Primary);

          const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            createChannel
          );

          channel.send({ embeds: [pannel], components: [buttonRow] });
        });
        break;
      }

      case "create-ai-chat": {
        onClickCreateAiChat(interaction);
        break;
      }
      default:
        break;
    }
  });
}
