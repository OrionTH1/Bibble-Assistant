import type { ThreadChannel } from "discord.js";

export async function deleteThread(
	threadChat: ThreadChannel,
	timeoutToAutoDeleteThread: NodeJS.Timeout,
) {
	if (timeoutToAutoDeleteThread) {
		// Stop the automatic delete Thread
		clearTimeout(timeoutToAutoDeleteThread);
	}
	if (!threadChat) return;

	await threadChat.delete("User deleted Chat AI");
	console.log(threadChat);
}
