/*
  Warnings:

  - You are about to drop the column `notAllowedChannels` on the `GuildConfigs` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildConfigs" (
    "id" TEXT NOT NULL,
    "allowedChannels" TEXT NOT NULL
);
INSERT INTO "new_GuildConfigs" ("allowedChannels", "id") SELECT "allowedChannels", "id" FROM "GuildConfigs";
DROP TABLE "GuildConfigs";
ALTER TABLE "new_GuildConfigs" RENAME TO "GuildConfigs";
CREATE UNIQUE INDEX "GuildConfigs_id_key" ON "GuildConfigs"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
