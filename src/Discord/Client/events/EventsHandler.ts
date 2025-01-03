import { type Client, Events } from "discord.js";
import type { SlashCommandColletion } from "../../types/types.js";
import { onStart } from "./handlers/onStart/index.js";
import { onButtonClick } from "./handlers/onButtonClick/index.js";
import { verifyIfUserHasPermission } from "./middleware.js";
import { onMessageCreated } from "./handlers/onMessageCreated/index.js";
import { onPaginationButtonClick } from "./handlers/onPaginationButtonClick/index.js";

export class EventsHandler {
  private events: Array<(client: Client) => void>;
  constructor(private client: Client, private commands: SlashCommandColletion) {
    // Start Events
    this.client = client;
    this.events = [
      this.onSlashCommands,
      onStart,
      onMessageCreated,
      onPaginationButtonClick,
      onButtonClick,
    ];
  }

  public startEvents() {
    for (let i = 0; i < this.events.length; i++) {
      this.events[i].call(this, this.client);
    }
  }

  private onSlashCommands() {
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      verifyIfUserHasPermission(interaction, command, () => {
        try {
          const options = interaction.options;
          const question = options.getString("pergunta");
          if (question) {
            command.execute(interaction, question);
            return;
          }
          command.execute(interaction);
        } catch (err) {
          console.error(err);
        }
      });
    });
  }
}
