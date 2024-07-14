import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class Database {
	public async createChat(chatId: string, author: string, chatHistory: string) {
		await prisma.chat.create({
			data: { id: chatId, author, history: chatHistory },
		});
	}
	public async getChat(chatId: string) {
		const chat = await prisma.chat.findFirst({ where: { id: chatId } });

		return chat;
	}

	public async getChats() {
		const chats = await prisma.chat.findMany();

		return chats;
	}

	public async deleteChat(chatId: string) {
		const chat = await prisma.chat.findFirst({ where: { id: chatId } });
		console.log(chat);
		if (chat) {
			await prisma.chat.delete({ where: { id: chatId } });
		}
	}

	public async updateHistory(chatId: string, history: string) {
		// console.log(history);
		await prisma.chat.update({ where: { id: chatId }, data: { history } });
		console.log("Histórico atualizado");
	}
}

export const database = new Database();