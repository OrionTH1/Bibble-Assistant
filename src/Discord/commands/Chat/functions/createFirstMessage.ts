import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type ThreadChannel,
} from "discord.js";
import { createDeleteButtonColector } from "./createDeleteButtonCollector.js";

export async function createFirstMessage(
	interaction: ChatInputCommandInteraction,
	threadChat: ThreadChannel,
	timeoutToAutoDelete: NodeJS.Timeout,
) {
	const messageEmbed = new EmbedBuilder()
		.setDescription(`
					- Encerre o chat depois que acabar de utilizar\n- Nesse chat a Deborah tem memória, então você pode fazer perguntas relacionadas às mensagens anteriores\n- O chat é encerrado e todo o histórico é apagado automaticamente depois de 1 hora após ser criado\n- O Chat também pode ser encerrado escrevendo !encerrar
				`)
		.setColor("#A1CEEA")
		.setTimestamp()
		.setImage("https://i.postimg.cc/SRvrJKns/banner.png")
		.setFooter({
			text: "As respostas são geradas por IA e podem conter erros!",
			iconURL: interaction.client.user.avatarURL() as string,
		});

	const buttonContainer = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setLabel("Encerrar chat")
			.setCustomId("delete-chat-button")
			.setStyle(ButtonStyle.Danger),
	);

	const message = await threadChat.send({
		content: `<@${interaction.user.id}>`,
		embeds: [messageEmbed],
		components: [buttonContainer],
	});
	createDeleteButtonColector(threadChat, message, timeoutToAutoDelete);

	return { message };
}
