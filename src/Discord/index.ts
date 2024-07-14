import dotenv from "dotenv";
import { DiscordClient } from "./Class/Client.js";
dotenv.config();

export const client = new DiscordClient();

client.start();
