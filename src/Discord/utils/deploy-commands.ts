import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import type { SlashCommandObject } from "../types/types.js";
import { getAllCommands } from "./getAllCommands.js";
dotenv.config();

const token = process.env.BOT_TOKEN as string;
const clientId = process.env.BOT_ID as string;

const rest = new REST().setToken(token);

(async () => {
  const slashCommands: SlashCommandObject[] = await getAllCommands();

  const commandsToDeploy = slashCommands.map((command) =>
    command.data.toJSON()
  );
  try {
    console.log(
      `Started refreshing ${slashCommands.length} application (/) commands.`
    );

    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commandsToDeploy,
    });

    console.log("Local Slash commands:");
    console.log(commandsToDeploy);
    console.log("\n////\n");
    console.log("Slash commands deployed:");
    console.log(data);

    console.log("Successfully reloaded application (/) commands.");
  } catch (err) {
    console.error(err);
  }
})();
