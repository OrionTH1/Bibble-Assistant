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

      case "create-ai-chat": {
        onClickCreateAiChat(interaction);
        break;
      }
      default:
        break;
    }
  });
}
