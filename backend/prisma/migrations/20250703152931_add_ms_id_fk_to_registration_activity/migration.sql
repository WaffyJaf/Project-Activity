/*
  Warnings:

  - You are about to drop the column `student_id` on the `registration_activity` table. All the data in the column will be lost.
  - Added the required column `ms_id` to the `registration_activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `registration_activity` DROP COLUMN `student_id`,
    ADD COLUMN `ms_id` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX `ms_id` ON `registration_activity`(`ms_id`);

-- AddForeignKey
ALTER TABLE `registration_activity` ADD CONSTRAINT `registration_activity_ibfk_3` FOREIGN KEY (`ms_id`) REFERENCES `users_up`(`ms_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
