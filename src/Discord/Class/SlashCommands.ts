import { Collection } from "discord.js";
import type { SlashCommandColletion } from "../types/types";
import { getAllCommands } from "../utils/getAllCommands.js";

export class SlashCommand {
	public commands: SlashCommandColletion;
	constructor() {
		this.commands = new Collection();
		this.setSlashCommands();
	}

	private async setSlashCommands() {
		const slashCommands = await getAllCommands();

		for (const command of slashCommands) {
			this.commands.set(command.data.name, command);
		}
	}
}
