import {
  type ChatInputCommandInteraction,
  type Client,
  Events,
} from "discord.js";
import { database } from "../../Database/DatabaseClient.js";
import { EmbedWithPagination } from "../components/pagination/index.js";
import type {
  ChatMessage,
  SlashCommandColletion,
  SlashCommandObject,
} from "../types/types";
import { chatHandler } from "./Chat.js";

export class EventsHandler {
  private events: Array<() => void>;
  constructor(private client: Client, private commands: SlashCommandColletion) {
    // Start Events
    this.client = client;
    this.events = [
      this.onStart,
      this.slashCommandsHandler,
      this.messageCreated,
      this.onPaginationButtonClick,
      this.onDeleteThreadButtonClick,
    ];
  }

  public startEvents() {
    for (let i = 0; i < this.events.length; i++) {
      this.events[i].call(this);
    }
  }

  private onStart() {
    this.client.once(Events.ClientReady, (readyClient) => {
      console.log(`Ready, Logged in as ${readyClient.user.tag}`);
      chatHandler.getOldsChats(readyClient);
    });
  }

  private onPaginationButtonClick() {
    this.client.on("interactionCreate", async (interaction) => {
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
            Number(interaction.message.embeds[0].footer?.text.split(" ")[1]) -
            1;

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

  private onDeleteThreadButtonClick() {
    this.client.on("interactionCreate", async (interaction) => {
      if (
        interaction.isButton() &&
        interaction.customId === "delete-chat-button" &&
        interaction.channel
      ) {
        const chat = chatHandler.getChat(interaction.channel.id);
        if (chat) {
          interaction.deferUpdate();
          chat.delete();
        }
      }
    });
  }

  private messageCreated() {
    this.client.on("messageCreate", async (message) => {
      if (message.author.bot) return;

      if (message.channel.isThread() && message.channel.invitable === false) {
        const chat = chatHandler.getChat(message.channel.id);

        if (!chat) return;
        if (message.author.id !== chat.authorId) return;

        if (message.content === "!encerrar") {
          return chat.delete();
        }

        chat.createMessage(message);
      }
    });
  }

  private slashCommandsHandler() {
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      middleware(interaction, command, () => {
        try {
          const options = interaction.options;
          const question = options.getString("pergunta");
          if (question) {
            command.execute(interaction, question);
            return;
          }
          command.execute(interaction);
        } catch (err) {
          console.error(err);
        }
      });
    });
  }
}

function middleware(
  interaction: ChatInputCommandInteraction,
  command: SlashCommandObject,
  next: (
    interaction: ChatInputCommandInteraction,
    command: SlashCommandObject
  ) => void
) {
  if (interaction.channelId === "1253331359972331540") {
    return next(interaction, command);
  }

  interaction.reply({
    ephemeral: true,
    content: "Esse comando não é permitido nesse Chat!",
  });
}
