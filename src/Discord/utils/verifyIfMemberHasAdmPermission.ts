import {
  PermissionFlagsBits,
  PermissionsBitField,
  type Interaction,
} from "discord.js";

export function verifyIfMemberHasAdmPermission(interaction: Interaction) {
  if (
    interaction.inGuild() &&
    interaction.member.permissions instanceof PermissionsBitField &&
    interaction.member.permissions.has(PermissionFlagsBits.Administrator)
  ) {
    return true;
  }

  return false;
}
