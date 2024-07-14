import type {
	AIMessage,
	BaseMessage,
	HumanMessage,
} from "@langchain/core/messages";
import type {
	ChatInputCommandInteraction,
	Collection,
	SlashCommandBuilder,
} from "discord.js";

export type SlashCommandObject = {
	data: SlashCommandBuilder;
	execute: (
		interaction: ChatInputCommandInteraction,
		question?: string,
	) => void;
};

export type SlashCommandColletion = Collection<string, SlashCommandObject>;

export type ChatMessage =
	| {
			id: string;
			type: "HumanMessage";
			formatedMessage: string[];
			memory: HumanMessage;
	  }
	| {
			id: string;
			type: "AiMessage";
			formatedMessage: string[];
			memory: AIMessage;
	  };
