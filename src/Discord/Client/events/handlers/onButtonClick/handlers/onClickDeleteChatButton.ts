import type { ButtonInteraction } from "discord.js";
import { chatHandler } from "../../../../../Class/Chat.js";

export function onClickDeleteChatButton(interaction: ButtonInteraction) {
  if (!interaction || !interaction.channel) return;

  const chat = chatHandler.getChat(interaction.channel.id);
  if (chat) {
    interaction.deferUpdate();
    chat.delete();
  }
}
