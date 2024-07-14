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
  }
}
