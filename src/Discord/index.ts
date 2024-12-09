import dotenv from "dotenv";
import { DiscordClient } from "./Client/Client.js";
dotenv.config();

export const client = new DiscordClient();

client.start();
