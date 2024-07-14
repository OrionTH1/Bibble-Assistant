import {
	ChannelType,
	type ChatInputCommandInteraction,
	NewsChannel,
	SlashCommandBuilder,
	ThreadAutoArchiveDuration,
} from "discord.js";
import { chatHandler } from "../../Class/Chat.js";

const command = {
	data: new SlashCommandBuilder()
		.setName("chat")
		.setDescription("Inicie um chat com a IA")
		.setDMPermission(false),

	execute: async (interaction: ChatInputCommandInteraction) => {
		await interaction.deferReply({ ephemeral: true });

		if (
			interaction.channel &&
			interaction.inCachedGuild() &&
			!interaction.channel.isThread() &&
			!interaction.channel.isVoiceBased() &&
			!(interaction.channel instanceof NewsChannel)
		) {
			const channel = interaction.channel;

			const threadChat = await channel.threads.create({
				name: `IA Chat | ${interaction.user.globalName}`,
				type: ChannelType.PrivateThread,
				reason: "IA Chat",
				invitable: false,
				autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
			});

			// console.log(threadChat);
			const chat = await chatHandler.createChat(
				threadChat,
				interaction.user.id,
			);

			chat.sendFirstMessage();

			// await createFirstMessage(
			// 	interaction,
			// 	threadChat,
			// 	timeoutToAutoDeleteThread,
			// );

			// Messages Event Handler
			// createThreadMessagesHandler(
			// 	threadChat,
			// 	interaction,
			// 	timeoutToAutoDeleteThread,
			// );

			await interaction.editReply({
				content: `Chat iniciado!\n<#${chat.id}>`,
			});

			return;
		}

		if (!interaction.replied || interaction.deferred) {
			interaction.editReply("Esse comando não é suportado neste canal!");
		}
	},
};

export { command };
