import type { Client } from "discord.js";
import { database } from "../../../../../Database/DatabaseClient.js";
import type { ChatMessage } from "../../../../types/types.js";
import { EmbedWithPagination } from "../../../../components/pagination/index.js";

export function onPaginationButtonClick(client: Client) {
  client.on("interactionCreate", async (interaction) => {
    if (
      interaction.isButton() &&
      (interaction.customId === "next" || interaction.customId === "prev") &&
      interaction.channel
    ) {
      interaction.deferUpdate();
      const chat = await database.getChat(interaction.channel.id);

      if (chat) {
        const filter = interaction.user.id === chat.author;
        if (!filter) return;

        const messages: ChatMessage[] = JSON.parse(chat.history);
        const formatedMessage = messages.find(
          (message) => message.id === interaction.message.id
        )?.formatedMessage || [
          "Desculpe, mas algum problema ocorreu. :pensive: \nChame um administrador para ver o que pode ser feito :smiling_face_with_3_hearts:\n\n Deus te abençoe! Jesus te ama 🙏 ❤",
        ];
        const actualIndex =
          Number(interaction.message.embeds[0].footer?.text.split(" ")[1]) - 1;

        const embed = new EmbedWithPagination(formatedMessage, actualIndex);

        switch (interaction.customId) {
          case "next":
            embed.next();
            break;

          case "prev":
            embed.prev();
            break;
        }

        interaction.message.edit({ ...embed.embed });
      }
    }
  });
}
