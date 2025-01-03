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
    // return interaction.reply({
    //   content: "Você não tem permissão para usar este comando",
    //   ephemeral: true,
    // });
  }

  return false;
}
