import { Client, GatewayIntentBits, Message, Partials } from "discord.js";
import { EventsHandler } from "./EventsHandler.js";
import { SlashCommand } from "./SlashCommands.js";

export class DiscordClient extends Client {
	private slashCommands = new SlashCommand();
	private events = new EventsHandler(this, this.slashCommands.commands);

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
			partials: [Partials.Message, Partials.Channel],
		});
	}

	public async start() {
		this.events.startEvents();
		this.login(process.env.BOT_TOKEN);

		// const channel = await this.channels.fetch("1258080568101568653", {
		// 	allowUnknownGuild: true,
		// 	cache: true,
		// 	// force: true,
		// });
		// console.log("message:", channel);
		// if (channel?.isTextBased() && channel.isThread()) {
		// 	const message = await channel.messages.fetch({
		// 		around: "1258081071547944970",
		// 		limit: 1,
		// 		cache: true,
		// 	});

		// 	if (message.first()) {
		// 		biome-ignore lint/complexity/noForEach: <explanation>
		// 		message.forEach((actualMessage) => {
		// 			biome-ignore lint/complexity/noForEach: <explanation>
		// 			actualMessage.embeds.forEach((embed) => {
		// 				console.log(actualMessage);
		// 				const myEmbed = embed;
		// 				if (myEmbed.footer) {
		// 					myEmbed.footer.text = "Página 1/10";
		// 				}
		// 				console.log(this.channels);
		// 				.edit({ embeds: [myEmbed] });
		// 			});
		// 		});
		// 	}

		// 	console.log("embed:", message.embeds.ke());
		// }
	}
}
