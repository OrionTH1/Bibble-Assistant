import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

export async function getAllCommands() {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const foldersPath = path.join(__dirname, "..", "commands");
	const commandFolder = fs.readdirSync(foldersPath);
	const commandsColletion = [];

	for (const folder of commandFolder) {
		const commandPath = path.join(foldersPath, folder);
		const commandFiles = fs
			.readdirSync(commandPath)
			.filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

		for (const file of commandFiles) {
			const filePath = path.join(commandPath, file);
			const fileUrl = pathToFileURL(filePath);
			// The error is here, i'm using require in a ESModules
			const { command } = await import(fileUrl.href);

			if ("data" in command && "execute" in command) {
				commandsColletion.push({
					data: command.data,
					execute: command.execute,
				});
				continue;
			}

			console.warn(
				`[WARNING] The command ${filePath} is missing a required "data" or "execute" property`,
			);
		}
	}

	return commandsColletion;
}
