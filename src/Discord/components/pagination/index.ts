import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type EmbedBuilder,
} from "discord.js";
import { responseEmbed } from "../response/index.js";

export class EmbedWithPagination {
	public embed: {
		embeds: EmbedBuilder[];
		components: ActionRowBuilder<ButtonBuilder>[];
	};

	constructor(
		private pages: string[],
		private index: number,
	) {
		this.embed = this.createEmbed();
	}

	public next() {
		if (this.index < this.pages.length - 1) this.index++;

		this.embed = this.createEmbed();
	}

	public prev() {
		this.index--;

		this.embed = this.createEmbed();
	}

	private createEmbed() {
		const prevButton = new ButtonBuilder()
			.setLabel("Voltar")
			.setCustomId("prev")
			.setEmoji("⬅️")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(true);

		const nextButton = new ButtonBuilder()
			.setLabel("Próximo")
			.setCustomId("next")
			.setEmoji("➡️")
			.setStyle(ButtonStyle.Primary);

		const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents([
			prevButton,
			nextButton,
		]);

		if (this.index === 0) {
			prevButton.setDisabled(true);
			nextButton.setDisabled(false);
		} else if (this.index === this.pages.length - 1) {
			prevButton.setDisabled(false);
			nextButton.setDisabled(true);
		} else {
			prevButton.setDisabled(false);
			nextButton.setDisabled(false);
		}

		const message = responseEmbed(null, this.pages[this.index]).setFooter({
			text: `Página ${this.index + 1} de ${this.pages.length}`,
		});

		return { embeds: [message], components: [buttons] };
	}
}
