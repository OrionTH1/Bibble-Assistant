import {
  ChannelType,
  type ChatInputCommandInteraction,
  GuildMemberRoleManager,
  PermissionsBitField,
} from "discord.js";
import type { SlashCommandObject } from "../../types/types";
import { database } from "../../../Database/DatabaseClient.js";

export async function verifyIfUserHasPermission(
  interaction: ChatInputCommandInteraction,
  command: SlashCommandObject,
  next: (
    interaction: ChatInputCommandInteraction,
    command: SlashCommandObject
  ) => void
) {
  if (
    !interaction.guild ||
    !interaction.channel ||
    !interaction.member ||
    !(interaction.member.roles instanceof GuildMemberRoleManager) ||
    !(interaction.member.permissions instanceof PermissionsBitField)
  )
    return;

  const guildConfig = await database.getGuildConfig(interaction.guild.id);

  if (
    guildConfig
    // !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
  ) {
    const allowedRoles = JSON.parse(guildConfig.allowedRoles) as string[];
    const allowedChannels = JSON.parse(guildConfig.allowedChannels) as string[];

    if (allowedRoles.length > 0) {
      let pass = false;
      for (const role of interaction.member.roles.cache) {
        if (allowedRoles.includes(role[1].id)) {
          pass = true;
          break;
        }
      }

      if (!pass) {
        return interaction.reply({
          content: "Você não tem permissão para usar este comando",
          ephemeral: true,
        });
      }
    }

    if (allowedChannels.length > 0) {
      for (const channel of allowedChannels) {
        const discordChannel = interaction.client.channels.cache.get(channel);
        if (!discordChannel) continue;
        if (discordChannel.type === ChannelType.GuildCategory) {
          for (const children of discordChannel.children.cache) {
            if (children[1].id === interaction.channel.id) {
              return next(interaction, command);
            }
          }
        }

        if (channel === interaction.channel.id) {
          return next(interaction, command);
        }
      }

      return interaction.reply({
        content: "Esse comando não é permitido neste canal",
        ephemeral: true,
      });
    }
  }

  return next(interaction, command);
}
