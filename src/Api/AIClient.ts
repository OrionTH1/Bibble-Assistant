import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogle } from "@langchain/google-webauth";
import dotenv from "dotenv";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { database } from "../Database/DatabaseClient.js";
import type { ChatMessage } from "../Discord/types/types.js";
import { askAiInstruction, chatAiInstruction } from "./aiInstructions.js";
dotenv.config();

const model = new ChatGoogle({
  apiKey: process.env.API_KEY,
  modelName: "gemini-1.5-flash",
  // maxOutputTokens: 200,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

const chatAiTemplate = new PromptTemplate({
  template: chatAiInstruction,
  inputVariables: ["chat_history", "input"],
});
const aiTemplate = new PromptTemplate({
  template: askAiInstruction,
  inputVariables: ["input"],
});

export class AIClient {
  private memory: BufferMemory;
  private chat: ConversationChain;
  private chatId: string;

  constructor(chatId: string, chatMessages?: string) {
    this.memory = this.generateMemory(chatMessages);

    this.chat = new ConversationChain({
      llm: model,
      memory: this.memory,
      outputParser: new StringOutputParser(),
      prompt: chatAiTemplate,
    });
    this.chatId = chatId;
  }

  private generateMemory(chatMessages?: string) {
    const memory = new BufferMemory({
      memoryKey: "chat_history",
    });
    if (!chatMessages) return memory;

    const messages = JSON.parse(chatMessages);

    for (const message of messages) {
      if (message.type === "HumanMessage") {
        memory.chatHistory.addMessage(
          new HumanMessage({ content: message.memory.kwargs.content })
        );
      } else if (message.type === "AiMessage") {
        memory.chatHistory.addMessage(
          new AIMessage({ content: message.memory.kwargs.content })
        );
      }
    }

    return memory;
  }

  public async sendMessage(
    input: string,
    questionMessageId: string,
    responseMessageId: string
  ) {
    console.log("test");
    console.log(this.memory.chatHistory.getMessages());
    const result = await this.chat.invoke({ input });
    console.log(result);

    const chat = await database.getChat(this.chatId);
    if (!chat) throw new Error("Chat not found in AiClient.sendMessage()");

    const messages = await this.memory.chatHistory.getMessages();
    const responseFormated = this.splitMessage(result.response as string);
    const newHistory: ChatMessage[] = !chat?.history
      ? []
      : JSON.parse(chat.history);

    newHistory.push(
      {
        id: questionMessageId,
        type: "HumanMessage",
        formatedMessage: [input],
        memory: messages[messages.length - 2],
      },
      {
        id: responseMessageId,
        type: "AiMessage",
        formatedMessage: responseFormated,
        memory: messages[messages.length - 1],
      }
    );

    database.updateHistory(this.chatId, JSON.stringify(newHistory));

    return responseFormated;
  }

  private splitMessage(message: string) {
    if (message.length < 3000) return [message];

    const text = message.split("");
    const whereToSlice = text
      .slice(0, 3000)
      .findLastIndex((value) => value === "\n");

    const textSplited: string[] = [];
    textSplited.push(
      `${text
        .splice(0, whereToSlice + 1)
        .join(
          ""
        )}\n\nSua resposta ultrapossou de 3000 caracteres, então ela foi dividida em páginas, use os botões abaixo para navegar entre as páginas`
    );

    while (text.length > 0) {
      const whereToSlice = text
        .slice(0, 3000)
        .findLastIndex((value) => value === "\n");

      if (whereToSlice === -1) {
        textSplited.push(text.splice(0).join(""));
        break;
      }

      textSplited.push(text.splice(0, whereToSlice + 1).join(""));
    }

    return textSplited;
  }
}

export class GenerateContentAI {
  public async generateContent(input: string) {
    const outputParser = new StringOutputParser();
    const chain = aiTemplate.pipe(model).pipe(outputParser);

    const response = await chain.invoke({ input });

    return response;
  }
}
