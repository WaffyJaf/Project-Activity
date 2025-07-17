/*
  Warnings:

  - A unique constraint covering the columns `[ms_id,token]` on the table `device_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `device_tokens_ms_id_token_key` ON `device_tokens`(`ms_id`, `token`);
