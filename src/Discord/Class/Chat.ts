import type { BaseChatMessageHistory } from "@langchain/core/chat_history.js";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type Client,
  type DiscordAPIError,
  type Message,
  type ThreadChannel,
} from "discord.js";
import { ChatMessageHistory } from "langchain/memory";
import { AIClient } from "../../Api/AIClient.js";
import { database } from "../../Database/DatabaseClient.js";
import { EmbedWithPagination } from "../components/pagination/index.js";
import { responseEmbed } from "../components/response/index.js";
import type { ChatMessage } from "../types/types.js";

export class ChatHandler {
  private chats: Chat[] = [];

  /**
   * @returns If the chat with the specified chatId is found in the chats array, the
   * function will return the chat object. If the chat is not found, the function
   * will return null.
   */
  public async getOldsChats(client: Client) {
    const chats = await database.getChats();

    for (const chat of chats) {
      try {
        const discordThread = await client.channels.fetch(chat.id);

        if (discordThread) {
          if (discordThread.isThread() && discordThread.invitable === false) {
            const chatAlreadyExits = this.chats.find(
              (chat) => chat.id === discordThread.id
            );

            if (!chatAlreadyExits) {
              const messagesHistory = chat.history;

              const thread = new Chat(
                discordThread,
                chat.author,
                messagesHistory
              );
              this.chats.push(thread);
            }
          }
        }
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } catch (err: any) {
        // If find an unknown Channel, remove it from the database
        if (err.code === 10003) {
          const threadId = err.url.split("/")[6];
          await database.deleteChat(threadId);
          this.getOldsChats(client);

          return;
        }
        console.error(err);
      }
    }
  }

  public getChat(chatId: string) {
    const chatFound = this.chats.find((chat) => chat.id === chatId);

    if (chatFound) {
      return chatFound;
    }

    return null;
  }

  public async createChat(threadChat: ThreadChannel, authorId: string) {
    const chat = new Chat(threadChat, authorId);

    this.chats.push(chat);

    await database.createChat(threadChat.id, authorId, "");

    return chat;
  }
}

export const chatHandler = new ChatHandler();

class Chat {
  public id: string;
  public authorId: string;
  public threadChat: ThreadChannel;
  public timeoutToAutoDeleteThread: NodeJS.Timeout;
  private isUserAlreadyAsked = false;
  private AiChat: AIClient;

  constructor(
    threadChat: ThreadChannel,
    authorId: string,
    messagesHistory?: string
  ) {
    this.threadChat = threadChat;
    this.id = this.threadChat.id;
    this.authorId = authorId;

    this.AiChat = new AIClient(this.id, messagesHistory);

    this.timeoutToAutoDeleteThread = this.createAutoDelete();

    console.log(`[💫] New Chat created by ${authorId} user`);
  }

  public sendFirstMessage() {
    const messageEmbed = responseEmbed(
      null,
      "- Encerre o chat depois que acabar de utilizar\n- Nesse chat a Deborah tem memória, então você pode fazer perguntas relacionadas às mensagens anteriores\n- O chat é encerrado e todo o histórico é apagado automaticamente depois de 1 hora após ser criado\n- O Chat também pode ser encerrado escrevendo !encerrar"
    )
      .setTimestamp()
      .setImage("https://i.postimg.cc/SRvrJKns/banner.png")
      .setFooter({
        text: "As respostas são geradas por IA e podem conter erros!",
      });

    const buttonContainer = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Encerrar chat")
        .setCustomId("delete-chat-button")
        .setStyle(ButtonStyle.Danger)
    );

    this.threadChat.send({
      content: `<@${this.authorId}>`,
      embeds: [messageEmbed],
      components: [buttonContainer],
    });
  }

  public async createMessage(message: Message) {
    if (this.isUserAlreadyAsked) return;
    const messageResponse = await message.reply({
      embeds: [
        responseEmbed(
          null,
          `:magic_wand: Pensando...\n
					Estou pensando em uma resposta para sua pergunta, isso pode demorar um pouco... :blush: :sweat_smile:\n
					A demora da resposta depende da complexida da pergunta e da minha resposta :heart:\n`
        ),
      ],
    });

    this.isUserAlreadyAsked = true;
    try {
      const response = await this.AiChat.sendMessage(
        message.content,
        message.id,
        messageResponse.id
      );

      if (response.length === 1) {
        const embed = responseEmbed(null, response[0]);

        messageResponse.edit({ embeds: [embed] });
      } else if (response.length > 1) {
        const embedWithPagination = new EmbedWithPagination(response, 0);

        messageResponse.edit({ ...embedWithPagination.embed });
      }

      console.log(
        `[➕] New /chat message created at ${this.id} Thread, with ${response.length} characters`
      );
    } catch (err) {
      console.error(
        `Ocorreu um erro em um Chat IA, nome: ${this.threadChat.name}, id: ${this.id} Error:\n
						${err}`
      );
      const embedResponse = responseEmbed(
        null,
        "Desculpe, mas algum problema ocorreu. :pensive: \nChame um administrador para ver o que pode ser feito :smiling_face_with_3_hearts:\n\n Deus te abençoe! Jesus te ama 🙏 ❤"
      );

      messageResponse.edit({ content: "", embeds: [embedResponse] });
    }

    this.isUserAlreadyAsked = false;
  }

  public delete() {
    clearTimeout(this.timeoutToAutoDeleteThread);
    this.threadChat.delete("User deleted Chat AI");
    database.deleteChat(this.id);
  }

  private createAutoDelete() {
    return setTimeout(() => {
      this.threadChat.delete("Auto deleted Chat AI after a hour");
      database.deleteChat(this.id);
    }, 1 * (60 * (60 * 1000)));
  }
}
