import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { GenerateContentAI } from "../../../Api/AIClient.js";
import { responseEmbed } from "../../components/response/index.js";

interface UsersInTimeoutType {
	userId: string;
	timeout: number;
}
const usersInTimeout: UsersInTimeoutType[] = [];

const command = {
	data: new SlashCommandBuilder()
		.setName("ask")
		.setDescription("Faça uma pergunta para uma IA")
		.setDMPermission(false)
		.addStringOption((option) =>
			option
				.setName("pergunta")
				.setDescription("Sua pergunta")
				.setRequired(true),
		),
	execute: async (
		interaction: ChatInputCommandInteraction,
		question: string,
	) => {
		const timeout = usersInTimeout.find(
			(user) => user.userId === interaction.user.id,
		);

		if (timeout && !((Date.now() - timeout.timeout) / 1000 > 30)) {
			return interaction.reply({
				content: `Você deve aguardar ${30 - Math.round((Date.now() - timeout.timeout) / 1000)} segundos para usar esse comando de novo :blush:`,
				ephemeral: true,
			});
		}

		const index = usersInTimeout.findIndex(
			(userId) => userId.userId === interaction.user.id,
		);

		if (index !== -1) usersInTimeout.splice(index, 1);

		usersInTimeout.push({ userId: interaction.user.id, timeout: Date.now() });

		try {
			//

			if (!interaction.deferred && !interaction.replied) {
				await interaction.deferReply();
			}

			const aiClient = new GenerateContentAI();
			const response = await aiClient.generateContent(question);

			const embed = responseEmbed(question, response)
				// .setTitle(`${question}`)
				.setDescription(`‎\n${response}`)
				.setImage(null)
				.setTimestamp()
				.setFooter({
					text: "Essa é uma resposta gerada por IA e pode conter erros!",
					iconURL: interaction.client.user.avatarURL() as string,
				});

			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			console.error(err);
		}
	},
};

export { command };
