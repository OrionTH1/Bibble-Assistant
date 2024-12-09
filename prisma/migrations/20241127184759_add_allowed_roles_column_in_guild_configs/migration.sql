/*
  Warnings:

  - Added the required column `allowedRoles` to the `GuildConfigs` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildConfigs" (
    "id" TEXT NOT NULL,
    "allowedChannels" TEXT NOT NULL,
    "allowedRoles" TEXT NOT NULL
);
INSERT INTO "new_GuildConfigs" ("allowedChannels", "id") SELECT "allowedChannels", "id" FROM "GuildConfigs";
DROP TABLE "GuildConfigs";
ALTER TABLE "new_GuildConfigs" RENAME TO "GuildConfigs";
CREATE UNIQUE INDEX "GuildConfigs_id_key" ON "GuildConfigs"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
