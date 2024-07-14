import { EmbedBuilder } from "discord.js";

export const responseEmbed = (title: string | null, description: string) => {
  const embed = new EmbedBuilder()
    .setDescription(description)
    .setColor("#A1CEEA")
    .setImage("https://i.postimg.cc/SRvrJKns/banner.png");

  if (title) {
    if (title.length > 256) {
      const titleSplited = title.split("");
      titleSplited.splice(250, title.length);
      titleSplited.push("...");

      embed.setTitle(titleSplited.join(""));

      return embed;
    }

    embed.setTitle(title);
  }

  return embed;
};
