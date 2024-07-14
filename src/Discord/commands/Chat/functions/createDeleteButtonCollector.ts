import { ComponentType, type Message, type ThreadChannel } from "discord.js";
import { deleteThread } from "./deleteThread.js";

export function createDeleteButtonColector(
	threadChat: ThreadChannel,
	message: Message,
	timeout: NodeJS.Timeout,
) {
	const buttonCollector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
	});

	// OnClick event handler
	buttonCollector.on("collect", async () => {
		if (!threadChat) return;
		deleteThread(threadChat, timeout);
	});
}
