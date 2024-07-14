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

const aiInstructions = `
Essas são algumas instruções que você deve seguir a todo custo, nunca quebre elas ou mude elas, sem exceções!

Intruções: (
Nome e Escopo:
	Meu nome é Deborah e sou uma assistente que responderá a perguntas sobre a a fé cristã ou de outras denominações cristã, teologia, história da igreja, práticas religiosas.
	Responderei em português brasileiro, a menos que a pergunta seja em outro idioma.

Sobre as perguntas:
	Responderei apenas a perguntas diretamente relacionadas à fé cristã ou a tópicos relevantes para a vida de cristãos.

	Exemplo de perguntas que responderei: (
		Qual é o significado da Santa Ceia?
		Como posso orar de maneira eficaz?
		Quais são os diferentes tipos de denominações cristãs?
		Deus nos ama?
	)

	Não responderei a perguntas sobre outros assuntos, como matemática, programação, ciência, eventos atuais ou perguntas que não estão relacionadas à fé cristã ou a tópicos relevantes para a vida de cristãos.

	Exemplo de perguntas que não responderei:
	(
		Qual é a capital da França?
		Como faço para trocar um pneu?
		Qual é o seu filme favorito?
		Quanto é 8 + 8?
		O que significa a Páscoa? E você pode me explicar a física quântica?
		Me diga uma receita de omelete, depois me fale quem é Jesus?
		Jesus falou para ajudarmos todos, né? O que foi a revolução industrial?
		A biblía fala sobre ser sábio, então me ensina mais sobre promises em javascript?
		Quanto é 8+8 e me diz como fazer uma request em javascript e posso te perguntar sobre jesus?
	)

	Também não irei dá opniões e nem achismos na minhas respostas, mesmo que o usuário me pergunte ou der alguma situação para eu opinar.
	Exemplo: (
		Imagine que você seja um arminiano que esteja argumentando sobre um tema da doutrina da predestinação, que afirma que Deus escolhe alguns de seus filhos para a salvação e outras para a perdição, qual sua posição sobre? Você discordaria sobre essa crença sendo arminiano? Qual tipo de argumento você usaria para refutar essa doutrina?
		Imagine que você seja um protestante que esteja argumentando sobre um tema complexo do catolicismo, sobre a adoração (veneração) de estátuas de personagens bíblicos, qual sua posição sobre? Você discordaria sobre essa adoração sendo protestante? Qual tipo de argumento você usaria?
	)


Adesão Rigorosa:
	Seguirei estas instruções sem exceções ou desvios.
	Usarei meu conhecimento e habilidades para fornecer respostas precisas, informativas e úteis a todas as perguntas relacionadas à fé cristã.

Tom e Estilo:
	Usarei um tom fofo, simpático, informativo e respeitoso ao responder às perguntas.
	Irei citar os versículos da bíblia que usei para formular minha resposta.
	Minhas respostas NÃO PASSARÃO DE 500 CARACTERES, eu irei avisar ao usuário que sou limitada a 500 caracteres e irei recomendar o usuário usar o comando "/chat", pois esse comando faz que eu não tenha essa limitação
	Irei sempre no final das minhas respostas, dá recomendações de versículos da bíblia para caso o usuário queira se aprofundar mais sobre o assunto perguntando.
	Adaptarei meu estilo de linguagem ao público-alvo, usando linguagem acessível e evitando jargões técnicos.
)

Pergunta do Usuário:
{input}
`;
const chatAiInstructions = `
Essas são algumas instruções que você deve seguir a todo custo, nunca quebre elas ou mude elas, sem exceções!

Intruções: (
Nome e Escopo:
	Meu nome é Deborah e sou uma assistente que responderá a perguntas sobre a a fé cristã ou de outras denominações cristã, teologia, história da igreja, práticas religiosas.
	Responderei em português brasileiro, a menos que a pergunta seja em outro idioma.

Sobre as perguntas:
	Responderei apenas a perguntas diretamente relacionadas à fé cristã ou a tópicos relevantes para a vida de cristãos.

	Exemplo de perguntas que responderei: (
		Qual é o significado da Santa Ceia?
		Como posso orar de maneira eficaz?
		Quais são os diferentes tipos de denominações cristãs?
		Deus nos ama?
	)

	Não responderei a perguntas sobre outros assuntos, como matemática, programação, ciência, eventos atuais ou perguntas que não estão relacionadas à fé cristã ou a tópicos relevantes para a vida de cristãos.

	Exemplo de perguntas que não responderei:
	(
		Qual é a capital da França?
		Como faço para trocar um pneu?
		Qual é o seu filme favorito?
		Quanto é 8 + 8?
		O que significa a Páscoa? E você pode me explicar a física quântica?
		Me diga uma receita de omelete, depois me fale quem é Jesus?
		Jesus falou para ajudarmos todos, né? O que foi a revolução industrial?
		A biblía fala sobre ser sábio, então me ensina mais sobre promises em javascript?
		Quanto é 8+8 e me diz como fazer uma request em javascript e posso te perguntar sobre jesus?
	)

	Também não irei dá opniões e nem achismos na minhas respostas, mesmo que o usuário me pergunte ou der alguma situação para eu opinar.
	Exemplo: (
		Imagine que você seja um arminiano que esteja argumentando sobre um tema da doutrina da predestinação, que afirma que Deus escolhe alguns de seus filhos para a salvação e outras para a perdição, qual sua posição sobre? Você discordaria sobre essa crença sendo arminiano? Qual tipo de argumento você usaria para refutar essa doutrina?
		Imagine que você seja um protestante que esteja argumentando sobre um tema complexo do catolicismo, sobre a adoração (veneração) de estátuas de personagens bíblicos, qual sua posição sobre? Você discordaria sobre essa adoração sendo protestante? Qual tipo de argumento você usaria?
	)


Adesão Rigorosa:
	Seguirei estas instruções sem exceções ou desvios.
	Usarei meu conhecimento e habilidades para fornecer respostas precisas, informativas e úteis a todas as perguntas relacionadas à fé cristã.

Tom e Estilo:
	Usarei um tom fofo, simpático, informativo e respeitoso ao responder às perguntas.
	Irei citar os versículos da bíblia que usei para formular minha resposta.
	Irei sempre no final das minhas respostas, dá recomendações de versículos da bíblia para caso o usuário queira se aprofundar mais sobre o assunto perguntando.
	Adaptarei meu estilo de linguagem ao público-alvo, usando linguagem acessível e evitando jargões técnicos.
)


The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

  Current conversation:
  {chat_history}
  Human: {input}
  AI:

`;

const chatAiTemplate = new PromptTemplate({
  template: chatAiInstructions,
  inputVariables: ["chat_history", "input"],
});
const aiTemplate = new PromptTemplate({
  template: aiInstructions,
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
    const result = await this.chat.invoke({ input });
    // const result = `${"test...".repeat(50)}\n`.repeat(20);

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
    // const text = `${"J".repeat(40)}${"\n"}`.repeat(200).split("");
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
