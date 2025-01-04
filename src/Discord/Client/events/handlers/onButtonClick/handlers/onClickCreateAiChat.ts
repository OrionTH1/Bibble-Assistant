import {
  ChannelType,
  MessageFlags,
  NewsChannel,
  ThreadAutoArchiveDuration,
  type ButtonInteraction,
} from "discord.js";
import { chatHandler } from "../../../../../Class/Chat.js";

export async function onClickCreateAiChat(interaction: ButtonInteraction) {
  if (
    !interaction.channel ||
    !interaction.inCachedGuild() ||
    interaction.channel.isThread() ||
    interaction.channel.isVoiceBased() ||
    interaction.channel instanceof NewsChannel
  )
    return;

  const channel = interaction.channel;

  const threadChat = await channel.threads.create({
    name: `IA Chat | ${interaction.user.globalName}`,
    type: ChannelType.PrivateThread,
    reason: "IA Chat",
    invitable: false,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
  });

  const chat = await chatHandler.createChat(threadChat, interaction.user.id);

  chat.sendFirstMessage();

  await interaction.reply({
    content: `Chat iniciado!\n<#${chat.id}>`,
    flags: MessageFlags.Ephemeral,
  });
}
