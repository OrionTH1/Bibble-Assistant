-- CreateTable
CREATE TABLE "GuildConfigs" (
    "id" TEXT NOT NULL,
    "allowedChannels" TEXT NOT NULL,
    "notAllowedChannels" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildConfigs_id_key" ON "GuildConfigs"("id");
