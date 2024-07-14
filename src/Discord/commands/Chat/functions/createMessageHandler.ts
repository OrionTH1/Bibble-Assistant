import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type ThreadChannel,
} from "discord.js";
import { AIClient } from "../../../../Api/AIClient.js";
import { deleteThread } from "./deleteThread.js";

// export function createThreadMessagesHandler(
// 	threadChat: ThreadChannel,
// 	interaction: ChatInputCommandInteraction,
// 	timeout: NodeJS.Timeout,
// ) {
// 	if (!threadChat) return;
// 	const messagesCollector = threadChat.createMessageCollector({
// 		filter: (message) =>
// 			threadChat !== null &&
// 			message.channel.id === threadChat.id &&
// 			message.author.id === interaction.user.id &&
// 			!message.author.bot,
// 	});

// 	let isAlreadyAsked = false;
// 	// const chatAI = new ChatAI();

// 	messagesCollector.on("collect", async (threadMessage) => {
// 		if (!threadChat) return;
// 		if (messagesCollector.ended) return;
// 		if (threadMessage.content === "!encerrar") {
// 			deleteThread(threadChat, timeout);
// 			return;
// 		}
// 		if (isAlreadyAsked) return;

// 		// isAlreadyAsked = true;

// 		await threadChat.sendTyping();
// 		// console.log(messages);

// 		let response: string | string[];
// 		try {
// 			response = await chatAI.sendMessage(threadMessage.content);
// 			console.log("Mensagems:");
// 			console.log(response.length);
// 		} catch (err) {
// 			console.log(err);
// 			const embed = new EmbedBuilder()
// 				.setDescription(
// 					"Desculpe, mas a sua pergunta é inaprópriada e não posso responde-la. :pensive: \nCaso você ache que a sua pergunta não é inaprópriada, ou que isso pode ser um erro, chame um administrador para ver o que pode ser feito :smiling_face_with_3_hearts:\n\n Deus te abençoe! Jesus te ama 🙏 ❤",
// 				)
// 				.setColor("#A1CEEA")
// 				.setImage("https://i.postimg.cc/SRvrJKns/banner.png");

// 			if (!threadChat) return;
// 			threadChat.send({ content: "", embeds: [embed] });

// 			isAlreadyAsked = false;
// 			return;
// 		}

// 		if (!threadChat) return;
// 		if (typeof response === "string") {
// 			const embed = new EmbedBuilder()
// 				.setDescription(response)
// 				.setColor("#A1CEEA")
// 				.setImage("https://i.postimg.cc/SRvrJKns/banner.png");

// 			threadChat.send({ content: "", embeds: [embed] });
// 		} else {
// 			const pages = [];
// 			for (let i = 0; i < response.length; i++) {
// 				pages.push(
// 					new EmbedBuilder()
// 						.setDescription(response[i])
// 						.setColor("#A1CEEA")
// 						.setImage("https://i.postimg.cc/SRvrJKns/banner.png")
// 						.setFooter({
// 							text: `Página ${i + 1}/${response.length}`,
// 						}),
// 				);
// 			}
// 			console.log("jasdijwaidjwai");
// 			console.log(pages.length);
// 			createEmbedWithPagination(threadChat, pages, threadMessage.author.id);
// 		}
// 		isAlreadyAsked = false;
// 	});
// 	return messagesCollector;
// }
