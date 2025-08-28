/*
  Warnings:

  - Made the column `hours` on table `project_activity` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalActivityHours` on table `users_up` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `data` JSON NULL,
    ADD COLUMN `event_post_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `project_activity` MODIFY `hours` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users_up` MODIFY `totalActivityHours` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `notifications_event_post_id_idx` ON `notifications`(`event_post_id`);

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_event_post_id_fkey` FOREIGN KEY (`event_post_id`) REFERENCES `event_posts`(`post_id`) ON DELETE SET NULL ON UPDATE CASCADE;
