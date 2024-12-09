import type { Client } from "discord.js";
import { chatHandler } from "../../../../Class/Chat.js";

export function onMessageCreated(client: Client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.channel.isThread() && message.channel.invitable === false) {
      const chat = chatHandler.getChat(message.channel.id);

      if (!chat) return;

      if (message.content === "!stop") {
        if (!(message.author.id === "253195593130835968")) return;
        chat.stopChat();

        message.reply("Chat pausado!");
        return;
      }

      if (message.content === "!start") {
        if (!(message.author.id === "253195593130835968")) return;
        chat.startChat();

        message.reply("Chat retornado!");
        return;
      }

      if (message.author.id !== chat.authorId) return;

      if (message.content === "!encerrar") {
        return chat.delete();
      }

      chat.createMessage(message);
    }
  });
}
