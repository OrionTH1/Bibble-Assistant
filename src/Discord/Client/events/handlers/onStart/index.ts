import { Events, type Client } from "discord.js";
import { chatHandler } from "../../../../Class/Chat.js";

export function onStart(client: Client) {
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready, Logged in as ${readyClient.user.tag}`);
    chatHandler.getOldsChats(readyClient);
  });
}
